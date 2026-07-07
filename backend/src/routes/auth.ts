import { Router } from "express";
import { acceptInvitation, login, me, refresh, signup } from "../controllers/authController";
import { getInvitationByToken } from "../controllers/invitationController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../utils/validation";
import { loginSchema, refreshSchema, signupSchema } from "../schemas/auth.schema";
import { acceptInvitationSchema } from "../schemas/invitation.schema";

const router = Router();

router.post("/signup", validateBody(signupSchema), signup);
router.post("/login", validateBody(loginSchema), login);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", requireAuth, me);
router.get("/invitations/:token", getInvitationByToken);
router.post("/invitations/:token/accept", validateBody(acceptInvitationSchema), acceptInvitation);

export default router;
