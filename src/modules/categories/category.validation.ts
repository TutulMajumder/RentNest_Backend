import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Category name must be at least 2 characters"),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category id"),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(5, "Description must be at least 5 characters")
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

const categoryIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid category id"),
  }),
});

export const categoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
  categoryIdParamValidationSchema,
};
