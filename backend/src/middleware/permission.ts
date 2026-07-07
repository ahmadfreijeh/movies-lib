import { NextFunction, Request, Response } from "express";
import { PermissionRepository } from "../repositories/PermissionRepository";
import { PermissionAction, PermissionResource } from "../types";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

const permissionRepository = new PermissionRepository();

export function requirePermission(
  resource: PermissionResource,
  action: PermissionAction,
) {
  return async function (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }

    if (req.user.role === "SUPER_ADMIN") {
      next();
      return;
    }

    try {
      const allowed = await permissionRepository.hasPermission(
        req.user.userId,
        resource,
        action,
      );
      if (!allowed) {
        next(
          new ForbiddenError(
            "You do not have permission to perform this action",
          ),
        );
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
