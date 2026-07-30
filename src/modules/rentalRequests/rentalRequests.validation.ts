import { z } from "zod";
import { RentalStatus } from "../../../generated/prisma/enums";

const createRentalRequestValidationSchema = z.object({
  body: z
    .object({
      propertyId: z.string().uuid("Invalid property id"),
      moveInDate: z.coerce.date("Invalid move-in date"),
      moveOutDate: z.coerce.date().optional(),
      message: z
        .string()
        .trim()
        .min(5, "Message must be at least 5 characters")
        .optional(),
    })
});

const updateRentalRequestStatusValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rental request id"),
  }),
  body: z.object({
    status: z.enum(RentalStatus),
  }),
});

const rentalRequestIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid rental request id"),
  }),
});

export const rentalRequestValidation = {
  createRentalRequestValidationSchema,
  updateRentalRequestStatusValidationSchema,
  rentalRequestIdParamValidationSchema,
};
