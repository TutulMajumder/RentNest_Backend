import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";
import { validate } from "../../middlewares/validate";
import { categoryValidation } from "./category.validation";

const router = Router();
router.post(
  "/",
  auth(Role.ADMIN),
  validate(categoryValidation.createCategoryValidationSchema),
  categoryController.createCategory,
);
router.get("/", categoryController.findAllCategory);
router.get(
  "/:id",
  validate(categoryValidation.categoryIdParamValidationSchema),
  categoryController.findSingleCategory,
);
router.patch(
  "/:id",
  auth(Role.ADMIN),
  validate(categoryValidation.updateCategoryValidationSchema),
  categoryController.updateCategory,
);
router.delete(
  "/:id",
  auth(Role.ADMIN),
  validate(categoryValidation.categoryIdParamValidationSchema),
  categoryController.deleteCategory,
);
export const categoryRoutes = router;
