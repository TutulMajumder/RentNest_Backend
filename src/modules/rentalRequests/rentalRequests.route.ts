import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { rentalRequestController } from "./rentalRequests.controller";

const router = Router();

router.post(
  "/rentals",
  auth(Role.TENANT),
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
  rentalRequestController.updateRentalRequest,
);

export const rentalRequestsRoutes = router;
