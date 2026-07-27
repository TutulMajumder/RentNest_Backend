import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

const router = Router();
router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.get("/", categoryController.findAllCategory);
router.get("/:id", categoryController.findSingleCategory);
router.patch("/:id", auth(Role.ADMIN), categoryController.updateCategory);
router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);
export const categoryRoutes = router;
