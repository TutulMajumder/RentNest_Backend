import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";
import { validate } from "../../middlewares/validate";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch(
  "/users/:id",
  auth(Role.ADMIN),
  validate(adminValidation.updateUserStatusValidationSchema),
  adminController.updateUserStatus,
);
router.get("/properties", auth(Role.ADMIN), adminController.getAllProperties);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentalRequests);

export const adminRoutes = router;
