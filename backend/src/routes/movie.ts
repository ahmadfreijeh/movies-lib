import { NextFunction, Request, Response, Router } from "express";
import { mediaUpload } from "../utils/upload";
import {
  archiveMovie,
  createMovie,
  deleteMovie,
  getMovie,
  listMovies,
  listMoviesGroupedByGenre,
  reactivateMovie,
  updateMovie,
} from "../controllers/movieController";
import { requireAuth } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { validateBody, validateQuery } from "../utils/validation";
import { createMovieSchema, updateMovieSchema } from "../schemas/movie.schema";
import {
  groupedMoviesQuerySchema,
  paginationSchema,
} from "../schemas/pagination.schema";

const JSON_ARRAY_FIELDS = ["genres", "existingMediaIds", "removedMediaIds", "mediaTypes"] as const;

function parseMovieForm(req: Request, _res: Response, next: NextFunction): void {
  const body: Record<string, unknown> = { ...req.body };

  if (body.releaseYear !== undefined) body.releaseYear = Number(body.releaseYear);
  if (body.rating !== undefined) body.rating = Number(body.rating);

  for (const field of JSON_ARRAY_FIELDS) {
    const value = body[field];
    if (typeof value === "string") {
      try {
        body[field] = JSON.parse(value);
      } catch {
        body[field] = [];
      }
    }
  }

  req.body = body;
  next();
}

const router = Router();

router.get("/", validateQuery(paginationSchema), listMovies);
router.get(
  "/grouped-by-genre",
  validateQuery(groupedMoviesQuerySchema),
  listMoviesGroupedByGenre,
);
router.get("/:id", getMovie);
router.post(
  "/",
  requireAuth,
  requirePermission("MOVIE", "CREATE"),
  mediaUpload.array("media"),
  parseMovieForm,
  validateBody(createMovieSchema),
  createMovie,
);
router.put(
  "/:id",
  requireAuth,
  requirePermission("MOVIE", "EDIT"),
  mediaUpload.array("media"),
  parseMovieForm,
  validateBody(updateMovieSchema),
  updateMovie,
);
router.patch(
  "/:id/archive",
  requireAuth,
  requirePermission("MOVIE", "DELETE"),
  archiveMovie,
);
router.patch(
  "/:id/reactivate",
  requireAuth,
  requirePermission("MOVIE", "DELETE"),
  reactivateMovie,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("MOVIE", "DELETE"),
  deleteMovie,
);

export default router;
