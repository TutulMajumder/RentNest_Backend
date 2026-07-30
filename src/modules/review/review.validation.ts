import { z } from "zod";

const createReviewValidationSchema = z.object({
  body: z.object({
    rentalRequestId: z.string().uuid("Invalid rental request id"),
    rating: z
      .number()
      .int("Rating must be a whole number")
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    comment: z
      .string()
      .trim()
      .min(5, "Comment must be at least 5 characters")
      .optional(),
  }),
});

export const reviewValidation = {
  createReviewValidationSchema,
};
