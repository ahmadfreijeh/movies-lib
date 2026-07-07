import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/UserService";
import { PaginationInput } from "../schemas/pagination.schema";
import { UnauthorizedError } from "../utils/errors";
import { sendSuccess } from "../utils/response";

const userService = new UserService();

export async function listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const result = await userService.list(req.user.organizationId, req.query as unknown as PaginationInput);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await userService.updateRole(req.params.id, req.user.organizationId, req.body);
    sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function listUserPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const permissions = await userService.listPermissions(req.params.id, req.user.organizationId);
    sendSuccess(res, permissions);
  } catch (error) {
    next(error);
  }
}

export async function grantUserPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const permission = await userService.grantPermission(req.params.id, req.user.organizationId, req.body);
    sendSuccess(res, permission, 201);
  } catch (error) {
    next(error);
  }
}

export async function revokeUserPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    await userService.revokePermission(req.params.id, req.user.organizationId, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
