import { z } from "zod";

const genresParam = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    const raw = Array.isArray(value) ? value : value.split(",");
    const genres = raw.map((genre) => genre.trim()).filter(Boolean);
    return genres.length ? genres : undefined;
  });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(255).optional(),
  genres: genresParam,
  sortBy: z
    .enum(["title", "releaseYear", "rating", "createdAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["active", "archived", "all"]).default("active"),
  releaseYearFrom: z.coerce.number().int().optional(),
  releaseYearTo: z.coerce.number().int().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export const groupedMoviesQuerySchema = z.object({
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["active", "archived", "all"]).default("active"),
});

export type GroupedMoviesQueryInput = z.infer<typeof groupedMoviesQuerySchema>;
