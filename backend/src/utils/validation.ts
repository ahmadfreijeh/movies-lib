import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ValidationError } from "./errors";

function toValidationError(error: ZodError): ValidationError {
  return new ValidationError(
    error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
  );
}

export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(toValidationError(error));
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(toValidationError(error));
        return;
      }
      next(error);
    }
  };
}
