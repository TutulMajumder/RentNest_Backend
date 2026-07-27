import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { propertyController } from "./property.controller";

const router = Router();

// router.get("/");
// router.get("/:id");
router.post(
  "/landlord/properties",
  auth(Role.LANDLORD),
  propertyController.createProperty,
);
// router.put("/landlord/properties/:id");
// router.delete("/landlord/properties/:id");

export const propertyRoutes = router;
