import { Response } from "express";
import { ApiResponse } from "../types";

export function sendSuccess<T>(
  res: Response,
  data?: T,
  statusCode = 200,
): void {
  const body: ApiResponse<T> = {
    success: true,
    ...(data !== undefined ? { data } : {}),
  };
  res.status(statusCode).json(body);
}
