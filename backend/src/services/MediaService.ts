import { MediaRepository } from "../repositories/MediaRepository";
import { UploadMediaInput } from "../schemas/media.schema";
import { Media, MediaType, UploadFile } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { deleteFromR2, uploadToR2 } from "../utils/r2";

export class MediaService {
  private readonly mediaRepository: MediaRepository;

  constructor() {
    this.mediaRepository = new MediaRepository();
  }

  async list(
    movieId?: string,
    unattached?: boolean,
    organizationId?: string,
  ): Promise<Media[]> {
    return this.mediaRepository.findAll(movieId, unattached, organizationId);
  }

  async hasCoverAmong(ids: string[]): Promise<boolean> {
    const media = await this.mediaRepository.findByIds(ids);
    return media.some((m) => m.type === MediaType.COVER);
  }

  async upload(
    userId: string,
    organizationId: string,
    input: UploadMediaInput,
    file?: UploadFile,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestError("A file is required");
    }

    const url = await uploadToR2(file);
    return this.mediaRepository.upload(userId, organizationId, {
      ...input,
      url,
    });
  }

  async attach(
    userId: string,
    id: string,
    movieId: string | null,
    organizationId: string,
  ): Promise<Media> {
    const media = await this.mediaRepository.updateMovieId(
      id,
      userId,
      movieId,
      organizationId,
    );
    if (!media) {
      throw new NotFoundError("Media not found");
    }
    return media;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const media = await this.mediaRepository.findById(id, organizationId);
    if (!media) {
      throw new NotFoundError("Media not found");
    }
    await this.mediaRepository.deleteById(id);
    await deleteFromR2(media.url);
  }
}
