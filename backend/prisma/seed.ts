import { PrismaClient, MovieType, MediaType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { slugify } from "../src/utils/slug";

const prisma = new PrismaClient();

const COVER_URLS = [
  "https://i.pinimg.com/originals/92/5d/e8/925de870f00d0f1f83502772bbc6c84c.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEzLXDN3M_KoVIl6cDpD_mSmocLp2vyWwc_Zsebx8Dbhi3q8-veDnZ1AJ2&s=10",
  "https://m.media-amazon.com/images/M/MV5BNjQ5ZTJjZTEtZWRiOC00NGM3LTg5NGItMTkxZmJmZjg5NzA3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
];

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Thriller",
  "Documentary",
  "Animation",
  "Fantasy",
];

const DIRECTORS = [
  "Steven Spielberg",
  "Christopher Nolan",
  "Martin Scorsese",
  "Quentin Tarantino",
  "Greta Gerwig",
  "Denis Villeneuve",
  "Bong Joon-ho",
  "Sofia Coppola",
];

const TITLE_WORDS = [
  "Shadow",
  "Silent",
  "Broken",
  "Eternal",
  "Midnight",
  "Golden",
  "Last",
  "Hidden",
  "Distant",
  "Crimson",
  "City",
  "Dream",
  "Journey",
  "Legacy",
  "Horizon",
  "Echo",
  "Storm",
  "Fire",
  "Ocean",
  "Empire",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Deterministic per-index PRNG so re-running the seeder produces the same
// titles and updates existing movies instead of creating duplicates.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function deterministicTitle(index: number): string {
  const rand = seededRandom(index);
  const first = TITLE_WORDS[Math.floor(rand() * TITLE_WORDS.length)];
  const second = TITLE_WORDS[Math.floor(rand() * TITLE_WORDS.length)];
  return `${first} ${second} ${index}`;
}

const MOVIE_COUNT = 500;

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000000" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      name: "Seed Organization",
    },
  });

  for (const name of GENRES) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const seedUser = await prisma.user.upsert({
    where: { email: "seeder@movie-library.local" },
    update: {},
    create: {
      name: "Seed User",
      email: "seeder@movie-library.local",
      passwordHash,
      role: "ADMIN",
      organizationId: organization.id,
    },
  });

  function randomGenres(): string[] {
    const count = 1 + Math.floor(Math.random() * 3);
    const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  for (let i = 1; i <= MOVIE_COUNT; i++) {
    const title = deterministicTitle(i);
    const slug = slugify(title);
    const genres = randomGenres().map((name) => ({
      where: { name },
      create: { name, slug: slugify(name) },
    }));

    const existingMovie = await prisma.movie.findFirst({ where: { title } });

    const movie = existingMovie
      ? await prisma.movie.update({
          where: { id: existingMovie.id },
          data: {
            slug,
            description: `Auto-generated seed movie #${i} for testing purposes.`,
            type: Math.random() < 0.8 ? MovieType.MOVIE : MovieType.SERIES,
            releaseYear: 1970 + Math.floor(Math.random() * 55),
            director: randomItem(DIRECTORS),
            rating: Math.round((Math.random() * 9 + 1) * 10) / 10,
            updatedById: seedUser.id,
            genres: { set: [], connectOrCreate: genres },
          },
        })
      : await prisma.movie.create({
          data: {
            title,
            slug,
            description: `Auto-generated seed movie #${i} for testing purposes.`,
            type: Math.random() < 0.8 ? MovieType.MOVIE : MovieType.SERIES,
            releaseYear: 1970 + Math.floor(Math.random() * 55),
            director: randomItem(DIRECTORS),
            rating: Math.round((Math.random() * 9 + 1) * 10) / 10,
            createdById: seedUser.id,
            updatedById: seedUser.id,
            genres: { connectOrCreate: genres },
          },
        });

    const existingCover = await prisma.media.findFirst({
      where: { movieId: movie.id, type: MediaType.COVER },
    });

    if (!existingCover) {
      await prisma.media.create({
        data: {
          type: MediaType.COVER,
          url: randomItem(COVER_URLS),
          movieId: movie.id,
          uploadedById: seedUser.id,
          updatedById: seedUser.id,
        },
      });
    }

    if (i % 50 === 0) {
      console.log(`Seeded ${i}/${MOVIE_COUNT} movies`);
    }
  }

  console.log(`Done. Seeded ${MOVIE_COUNT} movies with covers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
