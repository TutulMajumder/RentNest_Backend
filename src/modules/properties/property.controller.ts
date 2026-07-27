import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;
    const result = await propertyService.createPropertyToDB(
      id as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Property Created Successfully",
      data: result,
    });
  },
);

const findAllProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await propertyService.findAllPropertyFromDB(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Properties Retrieved Successfully",
      data: result,
    });
  },
);
const findPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const result = await propertyService.findPropertyByIdFromDB(
      propertyId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property Retrieved Successfully",
      data: result,
    });
  },
);

const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const payload = req.body;
    const landlordId = req.user?.id;
    const result = await propertyService.updateProperty(
      propertyId as string,
      payload,
      landlordId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property Updated Successfully",
      data: result,
    });
  },
);

const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params.id;
    const landlordId = req.user?.id;
    const result = await propertyService.deleteProperty(
      propertyId as string,
      landlordId as string,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property Deleted Successfully",
      data: result,
    });
  },
);

export const propertyController = {
  createProperty,
  findAllProperty,
  findPropertyById,
  updateProperty,
  deleteProperty,
};
