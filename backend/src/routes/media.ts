import { Router } from "express";
import { mediaUpload } from "../utils/upload";
import {
  attachMedia,
  deleteMedia,
  listMedia,
  uploadMedia,
} from "../controllers/mediaController";
import { requireAuth } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { validateBody } from "../utils/validation";
import { attachMediaSchema, uploadMediaSchema } from "../schemas/media.schema";

const router = Router();

router.get("/", requireAuth, listMedia);
router.post(
  "/",
  requireAuth,
  requirePermission("MEDIA", "CREATE"),
  mediaUpload.single("file"),
  validateBody(uploadMediaSchema),
  uploadMedia,
);
router.patch(
  "/:id",
  requireAuth,
  requirePermission("MEDIA", "EDIT"),
  validateBody(attachMediaSchema),
  attachMedia,
);
router.delete(
  "/:id",
  requireAuth,
  requirePermission("MEDIA", "DELETE"),
  deleteMedia,
);

export default router;
