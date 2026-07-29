import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPaymentSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id;
    const payload = req.body;
    const result = await paymentService.createPaymentSession(
      tenantId as string,
      payload,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment session created successfully",
      data: result,
    });
  },
);

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"];
    await paymentService.handlePayment(event, signature as string);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Webhook triggered successfully",
      data: null,
    });
  },
);
const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const result = await paymentService.getMyPayments(tenantId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user!.id;
  const paymentId = req.params.id;
  const result = await paymentService.getPaymentById(
    paymentId as string,
    tenantId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment retrieved successfully",
    data: result,
  });
});
export const paymentController = {
  createPaymentSession,
  handleWebhook,
  getMyPayments,
  getPaymentById,
};
