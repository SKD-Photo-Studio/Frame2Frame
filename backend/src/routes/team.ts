import { Router } from "express";
import { TeamController } from "../controllers/TeamController";

const router = Router();

router.get("/", TeamController.getAll);
router.get("/:id", TeamController.getById);
router.post("/", TeamController.create);
router.put("/:id", TeamController.update);
router.delete("/:id", TeamController.delete);

export default router;
