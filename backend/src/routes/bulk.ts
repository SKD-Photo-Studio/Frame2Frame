import { Router } from "express";
import multer from "multer";
import { BulkController } from "../controllers/BulkController";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/template", BulkController.getTemplate);
router.get("/export", BulkController.exportAll);
router.post("/upload", upload.single("file"), BulkController.upload);

export default router;
