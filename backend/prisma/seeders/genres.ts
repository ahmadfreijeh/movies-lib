import { slugify } from "../../src/utils/helper";
import { prisma } from "./shared";

export const GENRES = [
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

export async function seedGenres(): Promise<void> {
  for (const name of GENRES) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
  }

  console.log(`Done. Seeded ${GENRES.length} genres.`);
}
