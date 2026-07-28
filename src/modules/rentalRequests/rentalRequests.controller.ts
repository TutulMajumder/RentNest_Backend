import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalRequestService } from "./rentalRequests.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;
    const result = await rentalRequestService.createRentalRequestIntoDB(
      tenantId as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental Request Submitted Successfully",
      data: result,
    });
  },
);
const getMyRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const query = req.query;
    const result = await rentalRequestService.getMyRentalRequestFromDB(
      tenantId as string,
      query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "My Rental Requests Retrieved Successfully",
      data: result,
    });
  },
);
const getRentalRequestById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const requestId = req.params.id;
    const tenantId = req.user?.id;
    const result = await rentalRequestService.getRentalRequestByIdFromDB(
      tenantId as string,
      requestId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental Request Retrieved Successfully",
      data: result,
    });
  },
);
const getPropertiesRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id;
    const query = req.query;
    const result = await rentalRequestService.getPropertiesRentalRequestFromDB(
      landlordId as string,
      query,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Landlord Properties Rental Requests Retrieved Successfully",
      data: result,
    });
  },
);
const updateRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user!.id;
    const rentalRequestId = req.params.id;
    const payload = req.body;
    const result = await rentalRequestService.updateRentalRequest(
      rentalRequestId as string,
      landlordId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Rental Request ${result.status} Successfully`,
      data: result,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
  getMyRentalRequest,
  getRentalRequestById,
  getPropertiesRentalRequest,
  updateRentalRequest,
};
