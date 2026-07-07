import { Router } from "express";
import {
  grantUserPermission,
  listUserPermissions,
  listUsers,
  revokeUserPermission,
  updateUserRole,
} from "../controllers/userController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validateBody, validateQuery } from "../utils/validation";
import { paginationSchema } from "../schemas/pagination.schema";
import { permissionSchema, updateRoleSchema } from "../schemas/user.schema";

const router = Router();

router.use(requireAuth, requireRole("SUPER_ADMIN"));

router.get("/", validateQuery(paginationSchema), listUsers);
router.patch("/:id/role", validateBody(updateRoleSchema), updateUserRole);
router.get("/:id/permissions", listUserPermissions);
router.post("/:id/permissions", validateBody(permissionSchema), grantUserPermission);
router.delete("/:id/permissions", validateBody(permissionSchema), revokeUserPermission);

export default router;
