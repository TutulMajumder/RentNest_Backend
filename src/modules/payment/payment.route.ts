import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.post(
  "/create",
  auth(Role.TENANT),
  paymentController.createPaymentSession,
);

router.post("/confirm", paymentController.handleWebhook);

router.get("/", auth(Role.TENANT), paymentController.getMyPayments);
router.get("/:id", auth(Role.TENANT), paymentController.getPaymentById);

export const paymentRoutes = router;
