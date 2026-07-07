import { z } from "zod";

export const uploadMediaSchema = z.object({
  type: z.enum(["VIDEO", "COVER", "TRAILER", "SUBTITLE"]),
  movieId: z.string().uuid("Invalid movie id").optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;

export const attachMediaSchema = z.object({
  movieId: z.string().uuid("Invalid movie id").nullable(),
});

export type AttachMediaInput = z.infer<typeof attachMediaSchema>;
