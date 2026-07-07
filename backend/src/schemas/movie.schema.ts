import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(255),
  description: z.string().min(1, "Description is required").max(2000),
  type: z.enum(["MOVIE", "SERIES"]),
  releaseYear: z.number().int().min(1888).max(2100).optional(),
  genres: z.array(z.string().min(1).max(100)).min(1, "At least one genre is required"),
  director: z.string().min(1, "Director is required").max(255),
  rating: z.number().min(0).max(10).optional(),
  existingMediaIds: z.array(z.string().uuid()).optional(),
  mediaTypes: z.array(z.enum(["VIDEO", "COVER", "TRAILER", "SUBTITLE"])).optional(),
});

export const updateMovieSchema = createMovieSchema.partial().extend({
  removedMediaIds: z.array(z.string().uuid()).optional(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
