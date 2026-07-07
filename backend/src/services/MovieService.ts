import { MovieRepository } from "../repositories/MovieRepository";
import { MediaService, UploadFile } from "./MediaService";
import { CreateMovieInput, UpdateMovieInput } from "../schemas/movie.schema";
import { PaginationInput } from "../schemas/pagination.schema";
import { Genre, Media, MediaType, Movie, PaginatedResult } from "../types";
import { NotFoundError, ValidationError } from "../utils/errors";

export class MovieService {
  private readonly movieRepository: MovieRepository;
  private readonly mediaService: MediaService;

  constructor() {
    this.movieRepository = new MovieRepository();
    this.mediaService = new MediaService();
  }

  async list(
    params: PaginationInput,
  ): Promise<PaginatedResult<Movie & { media: Media[]; genres: Genre[] }>> {
    return this.movieRepository.findAll(params);
  }

  async getById(id: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id);
    if (!movie) {
      throw new NotFoundError("Movie not found");
    }
    return movie;
  }

  async getByIdWithMedia(id: string) {
    const movie = await this.movieRepository.findByIdWithMedia(id);
    if (!movie) {
      throw new NotFoundError("Movie not found");
    }
    return movie;
  }

  async create(
    userId: string,
    input: CreateMovieInput,
    files: UploadFile[] = [],
  ) {
    const { existingMediaIds, mediaTypes, ...movieInput } = input;
    await this.ensureCoverImage(files, mediaTypes, existingMediaIds);
    const movie = await this.movieRepository.create(userId, movieInput);
    await this.syncMedia(userId, movie.id, {
      files,
      mediaTypes,
      existingMediaIds,
    });
    return this.getByIdWithMedia(movie.id);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateMovieInput,
    files: UploadFile[] = [],
  ) {
    await this.getById(id);
    const { existingMediaIds, mediaTypes, removedMediaIds, ...movieInput } =
      input;
    await this.ensureCoverImage(files, mediaTypes, existingMediaIds);
    const updated = await this.movieRepository.update(id, userId, movieInput);
    if (!updated) {
      throw new NotFoundError("Movie not found");
    }
    await this.syncMedia(userId, id, {
      files,
      mediaTypes,
      existingMediaIds,
      removedMediaIds,
    });
    return this.getByIdWithMedia(id);
  }

  private async ensureCoverImage(
    files: UploadFile[],
    mediaTypes: MediaType[] = [],
    existingMediaIds: string[] = [],
  ): Promise<void> {
    const hasNewCover = files.some((_, index) => mediaTypes[index] === "COVER");
    if (hasNewCover) return;
    const hasExistingCover =
      await this.mediaService.hasCoverAmong(existingMediaIds);
    if (hasExistingCover) return;
    throw new ValidationError([
      { field: "media", message: "A cover image is required" },
    ]);
  }

  private async syncMedia(
    userId: string,
    movieId: string,
    options: {
      files: UploadFile[];
      mediaTypes?: MediaType[];
      existingMediaIds?: string[];
      removedMediaIds?: string[];
    },
  ): Promise<void> {
    const {
      files,
      mediaTypes = [],
      existingMediaIds = [],
      removedMediaIds = [],
    } = options;

    await Promise.all([
      ...files.map((file, index) =>
        this.mediaService.upload(
          userId,
          { type: mediaTypes[index] ?? "COVER", movieId },
          file,
        ),
      ),
      ...existingMediaIds.map((mediaId) =>
        this.mediaService.attach(userId, mediaId, movieId),
      ),
      ...removedMediaIds.map((mediaId) =>
        this.mediaService.attach(userId, mediaId, null),
      ),
    ]);
  }

  async archive(id: string, userId: string): Promise<Movie> {
    await this.getById(id);
    return this.movieRepository.archive(id, userId);
  }

  async reactivate(id: string, userId: string): Promise<Movie> {
    await this.getById(id);
    return this.movieRepository.reactivate(id, userId);
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.movieRepository.delete(id);
  }
}
