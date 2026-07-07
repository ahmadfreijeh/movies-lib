import { Router } from "express";
import { listGenres } from "../controllers/genreController";

const router = Router();

router.get("/", listGenres);

export default router;
