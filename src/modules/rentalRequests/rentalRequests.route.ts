import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { rentalRequestController } from "./rentalRequests.controller";
import { validate } from "../../middlewares/validate";
import { rentalRequestValidation } from "./rentalRequests.validation";

const router = Router();

router.post(
  "/rentals",
  auth(Role.TENANT),
  validate(rentalRequestValidation.createRentalRequestValidationSchema),
  rentalRequestController.createRentalRequest,
);
router.get(
  "/rentals",
  auth(Role.TENANT),
  rentalRequestController.getMyRentalRequest,
);
router.get(
  "/rentals/:id",
  auth(Role.TENANT),
  validate(rentalRequestValidation.rentalRequestIdParamValidationSchema),
  rentalRequestController.getRentalRequestById,
);
router.get(
  "/landlord/requests",
  auth(Role.LANDLORD),
  rentalRequestController.getPropertiesRentalRequest,
);
router.patch(
  "/landlord/requests/:id",
  auth(Role.LANDLORD),
  validate(rentalRequestValidation.updateRentalRequestStatusValidationSchema),
  rentalRequestController.updateRentalRequest,
);

export const rentalRequestsRoutes = router;
