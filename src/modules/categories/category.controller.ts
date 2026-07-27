import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const result = await categoryService.createCategoryToDB(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category Created Successfully",
      data: result,
    });
  },
);

const findAllCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await categoryService.findAllCategoryFromDB(query);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories Retrieved Successfully",
      data: result,
    });
  },
);

const findSingleCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await categoryService.findSingleCategoryFromDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category Retrieved Successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await categoryService.updateCategoryToDB(
      id as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category Updated Successfully",
      data: result,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await categoryService.deleteCategoryFromDB(id as string);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category Deleted Successfully",
      data: result,
    });
  },
);

export const categoryController = {
  createCategory,
  findAllCategory,
  findSingleCategory,
  updateCategory,
  deleteCategory,
};
