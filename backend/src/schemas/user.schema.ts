import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
});

export const permissionSchema = z.object({
  resource: z.enum(["ALL", "MOVIE", "MEDIA"]),
  action: z.enum(["ALL", "CREATE", "EDIT", "DELETE"]),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
