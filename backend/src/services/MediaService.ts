import { MediaRepository } from "../repositories/MediaRepository";
import { UploadMediaInput } from "../schemas/media.schema";
import { Media } from "../types";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { deleteFromR2, uploadToR2 } from "../utils/r2";

export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export class MediaService {
  private readonly mediaRepository: MediaRepository;

  constructor() {
    this.mediaRepository = new MediaRepository();
  }

  async list(movieId?: string, unattached?: boolean): Promise<Media[]> {
    return this.mediaRepository.findAll(movieId, unattached);
  }

  async hasCoverAmong(ids: string[]): Promise<boolean> {
    const media = await this.mediaRepository.findByIds(ids);
    return media.some((m) => m.type === "COVER");
  }

  async upload(
    userId: string,
    input: UploadMediaInput,
    file?: UploadFile,
  ): Promise<Media> {
    if (!file) {
      throw new BadRequestError("A file is required");
    }

    const url = await uploadToR2(file);
    return this.mediaRepository.upload(userId, { ...input, url });
  }

  async attach(
    userId: string,
    id: string,
    movieId: string | null,
  ): Promise<Media> {
    const media = await this.mediaRepository.updateMovieId(id, userId, movieId);
    if (!media) {
      throw new NotFoundError("Media not found");
    }
    return media;
  }

  async delete(id: string): Promise<void> {
    const media = await this.mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundError("Media not found");
    }
    await this.mediaRepository.deleteById(id);
    await deleteFromR2(media.url);
  }
}
