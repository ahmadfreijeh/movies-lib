import { z } from "zod";

export const createInvitationSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "USER"]),
});

export const acceptInvitationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
