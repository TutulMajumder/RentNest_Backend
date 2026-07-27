import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";

const router = Router();

router.get("/properties", propertyController.findAllProperty);
router.get("/properties/:id", propertyController.findPropertyById);
router.post(
  "/landlord/properties",
  auth(Role.LANDLORD),
  propertyController.createProperty,
);
router.put(
  "/landlord/properties/:id",
  auth(Role.LANDLORD),
  propertyController.updateProperty,
);
router.delete(
  "/landlord/properties/:id",
  auth(Role.LANDLORD),
  propertyController.deleteProperty,
);

export const propertyRoutes = router;
