import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewController } from "./review.controller";

const router = Router();
router.post("/reviews", auth(Role.TENANT), reviewController.createReview);
router.get(
  "/landlord/reviews",
  auth(Role.LANDLORD),
  reviewController.getLandlordReviews,
);
export const reviewsRoutes = router;
