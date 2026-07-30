import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";
import { validate } from "../../middlewares/validate";
import { propertyValidation } from "./property.validation";

const router = Router();

router.get("/properties", propertyController.findAllProperty);
router.get(
  "/properties/:id",
  validate(propertyValidation.propertyIdParamValidationSchema),
  propertyController.findPropertyById,
);
router.post(
  "/landlord/properties",
  auth(Role.LANDLORD),
  validate(propertyValidation.createPropertyValidationSchema),
  propertyController.createProperty,
);
router.put(
  "/landlord/properties/:id",
  auth(Role.LANDLORD),
  validate(propertyValidation.updatePropertyValidationSchema),
  propertyController.updateProperty,
);
router.delete(
  "/landlord/properties/:id",
  auth(Role.LANDLORD),
  validate(propertyValidation.propertyIdParamValidationSchema),
  propertyController.deleteProperty,
);

export const propertyRoutes = router;
