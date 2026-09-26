import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";

// Creates and configures the Express application.
const app = express();

// Parses JSON bodies sent to API endpoints.
app.use(express.json());

// All API routes begin with /api.
app.use("/api", healthRoutes);

// These must be registered after all routes.
app.use(notFound);
app.use(errorHandler);

export default app;
