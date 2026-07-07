import { NextFunction, Request, Response } from "express";
import { MovieService } from "../services/MovieService";
import { PaginationInput } from "../schemas/pagination.schema";
import { UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/response";

const movieService = new MovieService();

export async function listMovies(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const result = await movieService.list(
      req.query as unknown as PaginationInput,
    );
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const movie = await movieService.getByIdWithMedia(req.params.id);
    sendSuccess(res, movie);
  } catch (error) {
    next(error);
  }
}

export async function createMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const files = (req.files as Express.Multer.File[]) ?? [];
    const movie = await movieService.create(req.user.userId, req.body, files);
    sendSuccess(res, movie, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const files = (req.files as Express.Multer.File[]) ?? [];
    const movie = await movieService.update(
      req.params.id,
      req.user.userId,
      req.body,
      files,
    );
    sendSuccess(res, movie);
  } catch (error) {
    next(error);
  }
}

export async function archiveMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const movie = await movieService.archive(req.params.id, req.user.userId);
    sendSuccess(res, movie);
  } catch (error) {
    next(error);
  }
}

export async function reactivateMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const movie = await movieService.reactivate(req.params.id, req.user.userId);
    sendSuccess(res, movie);
  } catch (error) {
    next(error);
  }
}

export async function deleteMovie(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await movieService.delete(req.params.id);
    sendSuccess(res);
  } catch (error) {
    next(error);
  }
}
