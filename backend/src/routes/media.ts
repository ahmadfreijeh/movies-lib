import { Router } from "express";
import multer from "multer";
import { attachMedia, deleteMedia, listMedia, uploadMedia } from "../controllers/mediaController";
import { requireAuth } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { validateBody } from "../utils/validation";
import { attachMediaSchema, uploadMediaSchema } from "../schemas/media.schema";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

const router = Router();

router.get("/", listMedia);
router.post(
  "/",
  requireAuth,
  requirePermission("MEDIA", "CREATE"),
  upload.single("file"),
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
router.delete("/:id", requireAuth, requirePermission("MEDIA", "DELETE"), deleteMedia);

export default router;
