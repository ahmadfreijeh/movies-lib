import { prisma } from "./seeders/shared";
import { seedGenres } from "./seeders/genres";
import { seedMovies } from "./seeders/movies";

const DEFAULT_MOVIE_COUNT = 500;

const [seeder, ...args] = process.argv.slice(2);

async function main() {
  switch (seeder) {
    case "genres":
      await seedGenres();
      break;
    case "movies": {
      const movieCount = Number(args[0] ?? DEFAULT_MOVIE_COUNT);
      await seedMovies(movieCount);
      break;
    }
    case undefined: {
      const movieCount = Number(args[0] ?? DEFAULT_MOVIE_COUNT);
      await seedMovies(movieCount);
      break;
    }
    default:
      throw new Error(
        `Unknown seeder "${seeder}". Available seeders: genres, movies.`,
      );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
