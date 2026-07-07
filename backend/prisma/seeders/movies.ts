import { MovieType, MediaType } from "@prisma/client";
import { slugify } from "../../src/utils/helper";
import { ensureOrganization, ensureSeedUser, prisma, randomItem } from "./shared";
import { GENRES, seedGenres } from "./genres";

const COVER_URLS = [
  "https://i.pinimg.com/originals/92/5d/e8/925de870f00d0f1f83502772bbc6c84c.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEzLXDN3M_KoVIl6cDpD_mSmocLp2vyWwc_Zsebx8Dbhi3q8-veDnZ1AJ2&s=10",
  "https://m.media-amazon.com/images/M/MV5BNjQ5ZTJjZTEtZWRiOC00NGM3LTg5NGItMTkxZmJmZjg5NzA3XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
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

function randomGenres(): string[] {
  const count = 1 + Math.floor(Math.random() * 3);
  const shuffled = [...GENRES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function seedMovies(movieCount: number): Promise<void> {
  const organization = await ensureOrganization();
  await seedGenres();
  const seedUser = await ensureSeedUser(organization.id);

  for (let i = 1; i <= movieCount; i++) {
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
            organizationId: organization.id,
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
            organizationId: organization.id,
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
          organizationId: organization.id,
          uploadedById: seedUser.id,
          updatedById: seedUser.id,
        },
      });
    }

    if (i % 50 === 0) {
      console.log(`Seeded ${i}/${movieCount} movies`);
    }
  }

  console.log(`Done. Seeded ${movieCount} movies with covers.`);
}
