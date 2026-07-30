import { z } from "zod";

const createPaymentSessionValidationSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request id"),
  }),
});

const paymentIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid payment id"),
  }),
});

export const paymentValidation = {
  createPaymentSessionValidationSchema,
  paymentIdParamValidationSchema,
};
