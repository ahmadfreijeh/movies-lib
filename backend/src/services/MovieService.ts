import { MovieRepository } from "../repositories/MovieRepository";
import { MediaService } from "./MediaService";
import { CreateMovieInput, UpdateMovieInput } from "../schemas/movie.schema";
import {
  GroupedMoviesQueryInput,
  PaginationInput,
} from "../schemas/pagination.schema";
import {
  Genre,
  Media,
  MediaType,
  Movie,
  PaginatedResult,
  UploadFile,
} from "../types";
import { NotFoundError, ValidationError } from "../utils/errors";

export class MovieService {
  private readonly movieRepository: MovieRepository;
  private readonly mediaService: MediaService;

  constructor() {
    this.movieRepository = new MovieRepository();
    this.mediaService = new MediaService();
  }

  async list(
    organizationId: string | undefined,
    params: PaginationInput,
  ): Promise<PaginatedResult<Movie & { media: Media[]; genres: Genre[] }>> {
    return this.movieRepository.findAll(organizationId, params);
  }

  async listGroupedByGenre(
    organizationId: string | undefined,
    params: GroupedMoviesQueryInput,
  ) {
    return this.movieRepository.findGroupedByGenre(organizationId, params);
  }

  async getById(id: string, organizationId?: string): Promise<Movie> {
    const movie = await this.movieRepository.findById(id, organizationId);
    if (!movie) {
      throw new NotFoundError("Movie not found");
    }
    return movie;
  }

  async getByIdWithMedia(id: string, organizationId?: string) {
    const movie = await this.movieRepository.findByIdWithMedia(
      id,
      organizationId,
    );
    if (!movie) {
      throw new NotFoundError("Movie not found");
    }
    return movie;
  }

  async create(
    userId: string,
    organizationId: string,
    input: CreateMovieInput,
    files: UploadFile[] = [],
  ) {
    const { existingMediaIds, mediaTypes, ...movieInput } = input;
    await this.ensureCoverImage(files, mediaTypes, existingMediaIds);
    const movie = await this.movieRepository.create(
      userId,
      organizationId,
      movieInput,
    );
    await this.syncMedia(userId, organizationId, movie.id, {
      files,
      mediaTypes,
      existingMediaIds,
    });
    return this.getByIdWithMedia(movie.id, organizationId);
  }

  async update(
    id: string,
    userId: string,
    organizationId: string,
    input: UpdateMovieInput,
    files: UploadFile[] = [],
  ) {
    await this.getById(id, organizationId);
    const { existingMediaIds, mediaTypes, removedMediaIds, ...movieInput } =
      input;
    await this.ensureCoverImage(files, mediaTypes, existingMediaIds);
    const updated = await this.movieRepository.update(
      id,
      userId,
      organizationId,
      movieInput,
    );
    if (!updated) {
      throw new NotFoundError("Movie not found");
    }
    await this.syncMedia(userId, organizationId, id, {
      files,
      mediaTypes,
      existingMediaIds,
      removedMediaIds,
    });
    return this.getByIdWithMedia(id, organizationId);
  }

  private async ensureCoverImage(
    files: UploadFile[],
    mediaTypes: MediaType[] = [],
    existingMediaIds: string[] = [],
  ): Promise<void> {
    const hasNewCover = files.some(
      (_, index) => mediaTypes[index] === MediaType.COVER,
    );
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
    organizationId: string,
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
          organizationId,
          { type: mediaTypes[index] ?? MediaType.COVER, movieId },
          file,
        ),
      ),
      ...existingMediaIds.map((mediaId) =>
        this.mediaService.attach(userId, mediaId, movieId, organizationId),
      ),
      ...removedMediaIds.map((mediaId) =>
        this.mediaService.attach(userId, mediaId, null, organizationId),
      ),
    ]);
  }

  async archive(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<Movie> {
    await this.getById(id, organizationId);
    return this.movieRepository.archive(id, userId);
  }

  async reactivate(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<Movie> {
    await this.getById(id, organizationId);
    return this.movieRepository.reactivate(id, userId);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await this.getById(id, organizationId);
    await this.movieRepository.delete(id);
  }
}
