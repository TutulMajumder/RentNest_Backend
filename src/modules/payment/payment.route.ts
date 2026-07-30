import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";
import { validate } from "../../middlewares/validate";
import { paymentValidation } from "./payment.validation";

const router = Router();

router.post(
  "/create",
  auth(Role.TENANT),
  validate(paymentValidation.createPaymentSessionValidationSchema),
  paymentController.createPaymentSession,
);

router.post("/confirm", paymentController.handleWebhook);

router.get("/", auth(Role.TENANT), paymentController.getMyPayments);
router.get(
  "/:id",
  auth(Role.TENANT),
  validate(paymentValidation.paymentIdParamValidationSchema),
  paymentController.getPaymentById,
);

export const paymentRoutes = router;
