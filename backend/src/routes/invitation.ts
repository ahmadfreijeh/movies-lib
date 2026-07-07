import { Router } from "express";
import { createInvitation, listInvitations, revokeInvitation } from "../controllers/invitationController";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { validateBody } from "../utils/validation";
import { createInvitationSchema } from "../schemas/invitation.schema";

const router = Router();

router.use(requireAuth, requireRole("SUPER_ADMIN", "ADMIN"));

router.post("/", validateBody(createInvitationSchema), createInvitation);
router.get("/", listInvitations);
router.delete("/:id", revokeInvitation);

export default router;
