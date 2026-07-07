import multer from "multer";
import { BadRequestError } from "./errors";

const ALLOWED_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "text/vtt",
  "application/x-subrip",
]);

export const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new BadRequestError(`Unsupported file type: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});
