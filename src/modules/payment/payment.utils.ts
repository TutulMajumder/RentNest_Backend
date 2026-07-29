import httpStatus from "http-status";
import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";

const confirmPaymentBySessionId = async (session: Stripe.Checkout.Session) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
  }

  if (payment.status === "COMPLETED") {
    return payment; 
  }

  return prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string,
      },
    });

    const rentalRequest = await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "ACTIVE" },
    });

    await tx.property.update({
      where: { id: rentalRequest.propertyId },
      data: { availabilityStatus: "RENTED" },
    });

    return updatedPayment;
  });
};

const handleFailedPayment = async (session: Stripe.Checkout.Session) => {
  const payment = await prisma.payment.findUnique({
    where: { stripeCheckoutSessionId: session.id },
  });

  if (!payment || payment.status === "COMPLETED") {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    const rentalRequest = await tx.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: "CANCELLED" },
    });

    await tx.property.update({
      where: { id: rentalRequest.propertyId },
      data: { availabilityStatus: "AVAILABLE" },
    });
  });
};

export const paymentUtils = {
  confirmPaymentBySessionId,
  handleFailedPayment,
};