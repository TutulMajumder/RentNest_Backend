import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { AppError } from "../../utils/appError";
import { ICreatePaymentSession } from "./payment.interface";
import httpStatus from "http-status";
import { paymentUtils } from "./payment.utils";

const createPaymentSession = async (
  tenantId: string,
  payload: ICreatePaymentSession,
) => {
  const { rentalRequestId } = payload;
  const isRentalRequestExist = await prisma.rentalRequest.findUnique({
    where: {
      id: rentalRequestId,
    },
    include: { property: true, payment: true },
  });

  if (!isRentalRequestExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental Request is not found ");
  }
  if (isRentalRequestExist.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to pay for this rental request",
    );
  }
  if (isRentalRequestExist.status !== "APPROVED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This rental request has not been approved yet",
    );
  }

  if (isRentalRequestExist.payment) {
    throw new AppError(
      httpStatus.CONFLICT,
      "A payment already exists for this rental request",
    );
  }

  const amount = Number(isRentalRequestExist.property.price);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: isRentalRequestExist.property.title,
            description: `Rent payment for ${isRentalRequestExist.property.address}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    payment_method_types: ["card"],
    success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.app_url}/payment/cancel`,
    metadata: {
      rentalRequestId,
      tenantId,
    },
  });
  const payment = await prisma.payment.create({
    data: {
      rentalRequestId,
      amount,
      status: "PENDING",
      stripeCheckoutSessionId: session.id,
    },
  });

  return {
    checkoutUrl: session.url,
    payment,
  };
};

const handlePayment = async (payload: Buffer, signature: string) => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe_webhook_secret,
    );
  } catch (err) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Webhook signature verification failed: ${(err as Error).message}`,
    );
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    await paymentUtils.confirmPaymentBySessionId(session);
  }

  if (event.type === "checkout.session.expired") {
    await paymentUtils.handleFailedPayment(session);
  }
};

const getMyPayments = async (tenantId: string) => {
  return prisma.payment.findMany({
    where: { rentalRequest: { tenantId } },
    include: { rentalRequest: { include: { property: true } } },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (paymentId: string, tenantId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalRequest: { include: { property: true } } },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.rentalRequest.tenantId !== tenantId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this payment",
    );
  }

  return payment;
};
export const paymentService = {
  createPaymentSession,
  handlePayment,
  getMyPayments,
  getPaymentById,
};
