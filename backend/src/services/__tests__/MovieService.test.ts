import { beforeEach, describe, expect, it, vi } from "vitest";

const findAll = vi.fn();
const findById = vi.fn();
const findByIdWithMedia = vi.fn();
const archive = vi.fn();
const reactivate = vi.fn();
const deleteMovie = vi.fn();

vi.mock("../../repositories/MovieRepository", () => ({
  MovieRepository: vi.fn().mockImplementation(function () {
    return {
      findAll,
      findById,
      findByIdWithMedia,
      archive,
      reactivate,
      delete: deleteMovie,
    };
  }),
}));

vi.mock("../MediaService", () => ({
  MediaService: vi.fn().mockImplementation(function () {
    return {
      hasCoverAmong: vi.fn().mockResolvedValue(true),
    };
  }),
}));

import { MovieService } from "../MovieService";
import { NotFoundError } from "../../utils/errors";
import { MovieType } from "../../types";

const orgAMovie = {
  id: "movie-1",
  title: "Org A Movie",
  organizationId: "org-a",
  slug: "org-a-movie",
  description: "desc",
  type: MovieType.MOVIE,
  releaseYear: 2020,
  director: "Someone",
  rating: 8,
  archivedAt: null,
  createdById: "user-1",
  updatedById: "user-1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("MovieService", () => {
  let movieService: MovieService;

  beforeEach(() => {
    vi.clearAllMocks();
    movieService = new MovieService();
  });

  describe("list", () => {
    it("scopes the query to the caller's organization", async () => {
      findAll.mockResolvedValue({
        items: [orgAMovie],
        total: 1,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });

      const params = {
        page: 1,
        pageSize: 20,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
        status: "all" as const,
      };

      await movieService.list("org-a", params);

      expect(findAll).toHaveBeenCalledWith("org-a", params);
    });

    it("passes through an undefined organization for public browsing", async () => {
      findAll.mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      });

      const params = {
        page: 1,
        pageSize: 20,
        sortBy: "createdAt" as const,
        sortOrder: "desc" as const,
        status: "all" as const,
      };

      await movieService.list(undefined, params);

      expect(findAll).toHaveBeenCalledWith(undefined, params);
    });
  });

  describe("getById", () => {
    it("returns the movie when found within the organization", async () => {
      findById.mockResolvedValue(orgAMovie);

      const result = await movieService.getById("movie-1", "org-a");

      expect(result).toEqual(orgAMovie);
      expect(findById).toHaveBeenCalledWith("movie-1", "org-a");
    });

    it("throws NotFoundError when the movie does not belong to the organization", async () => {
      findById.mockResolvedValue(null);

      await expect(
        movieService.getById("movie-1", "org-b"),
      ).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe("archive", () => {
    it("archives a movie that belongs to the caller's organization", async () => {
      findById.mockResolvedValue(orgAMovie);
      archive.mockResolvedValue({ ...orgAMovie, archivedAt: new Date() });

      const result = await movieService.archive("movie-1", "user-1", "org-a");

      expect(findById).toHaveBeenCalledWith("movie-1", "org-a");
      expect(archive).toHaveBeenCalledWith("movie-1", "user-1");
      expect(result.archivedAt).not.toBeNull();
    });

    it("refuses to archive a movie belonging to a different organization", async () => {
      findById.mockResolvedValue(null);

      await expect(
        movieService.archive("movie-1", "user-1", "org-b"),
      ).rejects.toBeInstanceOf(NotFoundError);

      expect(archive).not.toHaveBeenCalled();
    });
  });
});
