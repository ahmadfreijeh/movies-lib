import { Router } from "express";
import {
  acceptInvitation,
  login,
  me,
  refresh,
  signup,
  updateProfile,
} from "../controllers/authController";
import { getInvitationByToken } from "../controllers/invitationController";
import { requireAuth } from "../middleware/auth";
import { authRateLimiter } from "../middleware/rateLimit";
import { validateBody } from "../utils/validation";
import { loginSchema, refreshSchema, signupSchema } from "../schemas/auth.schema";
import { acceptInvitationSchema } from "../schemas/invitation.schema";
import { updateProfileSchema } from "../schemas/user.schema";

const router = Router();

router.post("/signup", authRateLimiter, validateBody(signupSchema), signup);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/refresh", authRateLimiter, validateBody(refreshSchema), refresh);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validateBody(updateProfileSchema), updateProfile);
router.get("/invitations/:token", getInvitationByToken);
router.post(
  "/invitations/:token/accept",
  authRateLimiter,
  validateBody(acceptInvitationSchema),
  acceptInvitation,
);

export default router;
