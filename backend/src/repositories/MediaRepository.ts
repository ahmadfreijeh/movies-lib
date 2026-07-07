import { prisma } from "../db/prisma";
import { Media, MediaType } from "../types";

export class MediaRepository {
  async findById(id: string): Promise<Media | null> {
    return prisma.media.findUnique({ where: { id } });
  }

  async findAll(movieId?: string, unattached?: boolean): Promise<Media[]> {
    return prisma.media.findMany({
      where: unattached ? { movieId: null } : movieId ? { movieId } : undefined,
      orderBy: { createdAt: "asc" },
    });
  }

  async findByIds(ids: string[]): Promise<Media[]> {
    if (!ids.length) return [];
    return prisma.media.findMany({ where: { id: { in: ids } } });
  }

  async upload(
    userId: string,
    data: { type: MediaType; url: string; movieId?: string },
  ): Promise<Media> {
    return prisma.media.create({
      data: { ...data, uploadedById: userId, updatedById: userId },
    });
  }

  async updateMovieId(
    id: string,
    userId: string,
    movieId: string | null,
  ): Promise<Media | null> {
    const existing = await prisma.media.findUnique({ where: { id } });
    if (!existing) return null;
    return prisma.media.update({
      where: { id },
      data: { movieId, updatedById: userId },
    });
  }

  async deleteById(id: string): Promise<void> {
    await prisma.media.delete({ where: { id } });
  }
}
