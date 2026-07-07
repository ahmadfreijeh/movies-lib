import { prisma } from "../db/prisma";
import { Media, MediaType } from "../types";

export class MediaRepository {
  async findById(id: string, organizationId?: string): Promise<Media | null> {
    return prisma.media.findFirst({
      where: { id, ...(organizationId ? { organizationId } : {}) },
    });
  }

  async findAll(
    movieId?: string,
    unattached?: boolean,
    organizationId?: string,
  ): Promise<Media[]> {
    return prisma.media.findMany({
      where: {
        ...(organizationId ? { organizationId } : {}),
        ...(unattached ? { movieId: null } : movieId ? { movieId } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findByIds(ids: string[]): Promise<Media[]> {
    if (!ids.length) return [];
    return prisma.media.findMany({ where: { id: { in: ids } } });
  }

  async upload(
    userId: string,
    organizationId: string,
    data: { type: MediaType; url: string; movieId?: string },
  ): Promise<Media> {
    return prisma.media.create({
      data: { ...data, organizationId, uploadedById: userId, updatedById: userId },
    });
  }

  async updateMovieId(
    id: string,
    userId: string,
    movieId: string | null,
    organizationId: string,
  ): Promise<Media | null> {
    const existing = await prisma.media.findFirst({ where: { id, organizationId } });
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
