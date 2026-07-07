import { Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";
import { Movie, Media, Genre, PaginatedResult } from "../types";
import { CreateMovieInput, UpdateMovieInput } from "../schemas/movie.schema";
import { PaginationInput } from "../schemas/pagination.schema";
import { slugify } from "../utils/helper";

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
  organizationId: string,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (
    await prisma.movie.findFirst({
      where: {
        slug,
        organizationId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
  return slug;
}

export class MovieRepository {
  async findById(id: string, organizationId?: string): Promise<Movie | null> {
    return prisma.movie.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
    });
  }

  async findByIdWithMedia(id: string, organizationId?: string) {
    return prisma.movie.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
      include: MOVIE_INCLUDE,
    });
  }

  async findAll(
    organizationId: string | undefined,
    params: PaginationInput,
  ): Promise<PaginatedResult<MovieWithRelations>> {
    const {
      page,
      pageSize,
      search,
      genres,
      sortBy,
      sortOrder,
      status,
      releaseYearFrom,
      releaseYearTo,
    } = params;

    const where: Prisma.MovieWhereInput = {
      ...(organizationId ? { organizationId } : {}),
      ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      ...(genres ? { genres: { some: { name: { in: genres } } } } : {}),
      ...(status === "active"
        ? { archivedAt: null }
        : status === "archived"
          ? { archivedAt: { not: null } }
          : {}),
      ...(releaseYearFrom !== undefined || releaseYearTo !== undefined
        ? {
            releaseYear: {
              ...(releaseYearFrom !== undefined ? { gte: releaseYearFrom } : {}),
              ...(releaseYearTo !== undefined ? { lte: releaseYearTo } : {}),
            },
          }
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

  async findGroupedByGenre(
    organizationId: string | undefined,
    params: { pageSize: number; status: PaginationInput["status"] },
  ): Promise<{ genre: Genre; movies: PaginatedResult<MovieWithRelations> }[]> {
    const { pageSize, status } = params;

    const genres = await prisma.genre.findMany({
      where: {
        movies: {
          some: {
            ...(organizationId ? { organizationId } : {}),
            ...(status === "active"
              ? { archivedAt: null }
              : status === "archived"
                ? { archivedAt: { not: null } }
                : {}),
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const grouped = await Promise.all(
      genres.map(async (genre) => ({
        genre,
        movies: await this.findAll(organizationId, {
          page: 1,
          pageSize,
          genres: [genre.name],
          sortBy: "createdAt",
          sortOrder: "desc",
          status,
        }),
      })),
    );

    return grouped;
  }

  async create(
    userId: string,
    organizationId: string,
    data: CreateMovieInput,
  ): Promise<Movie> {
    const { genres, ...rest } = data;
    const slug = await generateUniqueMovieSlug(organizationId, data.title);
    return prisma.movie.create({
      data: {
        ...rest,
        slug,
        organizationId,
        createdById: userId,
        updatedById: userId,
        genres: genres ? { connectOrCreate: genresConnectOrCreate(genres) } : undefined,
      },
    });
  }

  async update(
    id: string,
    userId: string,
    organizationId: string,
    data: UpdateMovieInput,
  ): Promise<Movie | null> {
    const { genres, ...rest } = data;
    const slug = data.title
      ? await generateUniqueMovieSlug(organizationId, data.title, id)
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
