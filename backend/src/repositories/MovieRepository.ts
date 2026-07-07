import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { Movie, Media, Genre, PaginatedResult } from "../types";
import { CreateMovieInput, UpdateMovieInput } from "../schemas/movie.schema";
import { PaginationInput } from "../schemas/pagination.schema";
import { slugify } from "../utils/slug";

type MovieWithRelations = Movie & { media: Media[]; genres: Genre[] };

const MOVIE_INCLUDE = { media: true, genres: true } as const;

function genresConnectOrCreate(genres?: string[]) {
  if (!genres) return undefined;
  return genres.map((name) => ({
    where: { name },
    create: { name, slug: slugify(name) },
  }));
}

async function generateUniqueMovieSlug(
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (
    await prisma.movie.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export class MovieRepository {
  async findById(id: string): Promise<Movie | null> {
    return prisma.movie.findUnique({ where: { id } });
  }

  async findByIdWithMedia(id: string) {
    return prisma.movie.findUnique({
      where: { id },
      include: MOVIE_INCLUDE,
    });
  }

  async findAll(
    params: PaginationInput,
  ): Promise<PaginatedResult<MovieWithRelations>> {
    const { page, pageSize, search, genres, sortBy, sortOrder, status } = params;

    const where: Prisma.MovieWhereInput = {
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(genres ? { genres: { some: { name: { in: genres } } } } : {}),
      ...(status === "active"
        ? { archivedAt: null }
        : status === "archived"
          ? { archivedAt: { not: null } }
          : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.movie.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: MOVIE_INCLUDE,
      }),
      prisma.movie.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(userId: string, data: CreateMovieInput): Promise<Movie> {
    const { genres, ...rest } = data;
    const slug = await generateUniqueMovieSlug(data.title);
    return prisma.movie.create({
      data: {
        ...rest,
        slug,
        createdById: userId,
        updatedById: userId,
        genres: genres ? { connectOrCreate: genresConnectOrCreate(genres) } : undefined,
      },
    });
  }

  async update(id: string, userId: string, data: UpdateMovieInput): Promise<Movie | null> {
    const { genres, ...rest } = data;
    const slug = data.title
      ? await generateUniqueMovieSlug(data.title, id)
      : undefined;
    return prisma.movie.update({
      where: { id },
      data: {
        ...rest,
        ...(slug ? { slug } : {}),
        updatedById: userId,
        genres: genres
          ? { set: [], connectOrCreate: genresConnectOrCreate(genres) }
          : undefined,
      },
    });
  }

  async archive(id: string, userId: string): Promise<Movie> {
    return prisma.movie.update({
      where: { id },
      data: { archivedAt: new Date(), updatedById: userId },
    });
  }

  async reactivate(id: string, userId: string): Promise<Movie> {
    return prisma.movie.update({
      where: { id },
      data: { archivedAt: null, updatedById: userId },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.movie.delete({ where: { id } });
  }
}
