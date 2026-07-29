import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { ICreateReview } from "./review.interface";
import httpStatus from "http-status";

const createReviewIntoDB = async (tenantId: string, payload: ICreateReview) => {
  const { rentalRequestId, rating, comment } = payload;

  if (rating < 1 || rating > 5) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Rating must be between 1 and 5",
    );
  }

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { review: true },
  });

  if (!rentalRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to review this rental",
    );
  }

  if (rentalRequest.status !== "COMPLETED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You can only review a completed rental",
    );
  }

  if (rentalRequest.review) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this rental",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      tenantId,
      propertyId: rentalRequest.propertyId,
      rentalRequestId,
    },
    include: {
      property: true,
      rentalRequest: {
        include: {
          payment: true,
        },
      },
    },
  });

  return review;
};

const getLandlordReviewsFromDB = async (landlordId: string) => {
  return prisma.review.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: {
        omit: {
          password: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};
export const reviewService = {
  createReviewIntoDB,
  getLandlordReviewsFromDB,
};
