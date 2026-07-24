import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await authService.registerUserIntoDb(payload);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User Registered Successfully",
      data: result,
    });
  },
);

const loginUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const { accessToken, refreshToken } = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    });
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged in Successfully",
      data: { accessToken, refreshToken },
    });
  },
);

const refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  const { accessToken } = await authService.refreshToken(refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Token Refreshed Successfully",
    data: {
      accessToken,
    },
  });
});

const getMe = catchAsync(async (req, res, next) => {
  const id = req.user?.id;
  const result = await authService.getMe(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: " Current user retrieved successfully",
    data: result,
  });
});
export const authController = {
  registerUser,
  loginUser,
  refreshToken,
  getMe,
};
