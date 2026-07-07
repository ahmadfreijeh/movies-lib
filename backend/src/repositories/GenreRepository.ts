import { prisma } from "../db/prisma";
import { Genre } from "../types";

export class GenreRepository {
  async findAll(): Promise<Genre[]> {
    return prisma.genre.findMany({ orderBy: { name: "asc" } });
  }
}
