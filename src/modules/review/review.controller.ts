import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

const createReview = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;
    const result = await reviewService.createReviewIntoDB(
      tenantId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review Submitted Successfully",
      data: result,
    });
  },
);

const getLandlordReviews = catchAsync(async (req: Request, res: Response) => {
  const landlordId = req.user?.id;
  const result = await reviewService.getLandlordReviewsFromDB(
    landlordId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Properties Reviews Retrieved Successfully",
    data: result,
  });
});

export const reviewController = {
  createReview,
  getLandlordReviews,
};
