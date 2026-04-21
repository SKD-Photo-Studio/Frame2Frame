import { Router } from "express";
import { EventsController } from "../controllers/EventsController";

const router = Router();

// Основные маршруты
router.get("/", EventsController.getAll);
router.get("/meta", EventsController.getMeta);
router.get("/:id", EventsController.getById);
router.post("/", EventsController.create);
router.put("/:id", EventsController.update);
router.delete("/:id", EventsController.delete);

// Sub-routes for Dates, Payments, and Expenses
router.post("/:id/payments", EventsController.addPayment);
router.post("/:id/artist-expenses", EventsController.addArtistExpense);
router.post("/:id/output-expenses", EventsController.addOutputExpense);
router.post("/:id/dates", EventsController.addDate);

export default router;
