import { Router } from "express";
import authRoutes from "./auth";
import movieRoutes from "./movie";
import mediaRoutes from "./media";
import userRoutes from "./user";
import invitationRoutes from "./invitation";
import genreRoutes from "./genre";

const router = Router();

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/media", mediaRoutes);
router.use("/users", userRoutes);
router.use("/invitations", invitationRoutes);
router.use("/genres", genreRoutes);

export default router;
