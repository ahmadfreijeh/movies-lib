import { NextFunction, Request, Response } from "express";
import { MediaService } from "../services/MediaService";
import { UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/response";

const mediaService = new MediaService();

export async function listMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const movieId = typeof req.query.movieId === "string" ? req.query.movieId : undefined;
    const unattached = req.query.unattached === "true";
    const result = await mediaService.list(movieId, unattached, req.user?.organizationId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const media = await mediaService.upload(
      req.user.userId,
      req.user.organizationId,
      req.body,
      req.file,
    );
    sendSuccess(res, media, 201);
  } catch (error) {
    next(error);
  }
}

export async function attachMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const media = await mediaService.attach(
      req.user.userId,
      req.params.id,
      req.body.movieId,
      req.user.organizationId,
    );
    sendSuccess(res, media);
  } catch (error) {
    next(error);
  }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    await mediaService.delete(req.params.id, req.user.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
