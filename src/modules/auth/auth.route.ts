import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validate } from "../../middlewares/validate";
import { authValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validate(authValidation.registerUserValidationSchema),
  authController.registerUser,
);
router.post(
  "/login",
  validate(authValidation.loginUserValidationSchema),
  authController.loginUser,
);
router.post("/refresh-token", authController.refreshToken);
router.get(
  "/me",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  authController.getMe,
);
router.patch(
  "/manage-profiles",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  validate(authValidation.updateProfileValidationSchema),
  authController.updateProfile,
);

export const authRoutes = router;
