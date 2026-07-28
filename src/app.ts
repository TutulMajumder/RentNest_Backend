import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import cookieParser from "cookie-parser";
import { categoryRoutes } from "./modules/categories/category.route";
import { propertyRoutes } from "./modules/properties/property.route";
import { rentalRequestsRoutes } from "./modules/rentalRequests/rentalRequests.route";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World");
});

app.use("/api/auth", authRoutes);
app.use("/api", propertyRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api", rentalRequestsRoutes);
app.use(notFound);
app.use(globalErrorHandler);

export default app;
