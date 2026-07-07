import { NextFunction, Request, Response } from "express";
import { GenreService } from "../services/GenreService";
import { sendSuccess } from "../utils/response";

const genreService = new GenreService();

export async function listGenres(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const genres = await genreService.list();
    sendSuccess(res, genres);
  } catch (error) {
    next(error);
  }
}
