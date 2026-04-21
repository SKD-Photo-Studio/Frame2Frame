import express from "express";
import cors from "cors";
import clientRoutes from "./routes/clients";
import eventRoutes from "./routes/events";
import teamRoutes from "./routes/team";
import dashboardRoutes from "./routes/dashboard";
import searchRoutes from "./routes/search";
import tenantRoutes from "./routes/tenant";
import bulkRoutes from "./routes/bulk";
import { authMiddleware } from "./utils/auth";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Protect all routes below this point
app.use("/api", authMiddleware);

app.use("/api/clients", clientRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/bulk", bulkRoutes);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
);

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

export default app;
