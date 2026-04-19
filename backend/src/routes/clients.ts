import { Router } from "express";
import { ClientsController } from "../controllers/ClientsController";

const router = Router();

router.get("/", ClientsController.getAll);
router.get("/:id", ClientsController.getById);
router.post("/", ClientsController.create);
router.put("/:id", ClientsController.update);
router.delete("/:id", ClientsController.delete);

export default router;
