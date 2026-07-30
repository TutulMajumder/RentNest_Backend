import { z } from "zod";
import { AvailabilityStatus } from "../../../generated/prisma/enums";

const createPropertyValidationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3, "Title must be at least 3 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be a positive number"),
    bedrooms: z.number().int().min(0, "Bedrooms cannot be negative"),
    bathrooms: z.number().int().min(0, "Bathrooms cannot be negative"),
    sizeSqft: z
      .number()
      .int()
      .positive("Size must be a positive number")
      .optional(),
    address: z.string().trim().min(5, "Address must be at least 5 characters"),
    city: z.string().trim().min(2, "City must be at least 2 characters"),
    division: z
      .string()
      .trim()
      .min(2, "Division must be at least 2 characters"),
    country: z
      .string()
      .trim()
      .min(4, "Country must be at least 4 characters")
      .optional(),
    amenities: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    availabilityStatus: z.enum(AvailabilityStatus).optional(),
    categoryId: z.string().uuid("Invalid category id"),
  }),
});

const updatePropertyValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid property id"),
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    price: z.number().positive("Price must be a positive number").optional(),
    bedrooms: z
      .number()
      .int()
      .min(0, "Bedrooms cannot be negative")
      .optional(),
    bathrooms: z
      .number()
      .int()
      .min(0, "Bathrooms cannot be negative")
      .optional(),
    sizeSqft: z
      .number()
      .int()
      .positive("Size must be a positive number")
      .optional(),
    address: z
      .string()
      .trim()
      .min(5, "Address must be at least 5 characters")
      .optional(),
    city: z
      .string()
      .trim()
      .min(2, "City must be at least 2 characters")
      .optional(),
    division: z
      .string()
      .trim()
      .min(2, "Division must be at least 2 characters")
      .optional(),
    country: z
      .string()
      .trim()
      .min(4, "Country must be at least 4 characters")
      .optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    availabilityStatus: z.enum(AvailabilityStatus).optional(),
    categoryId: z.string().uuid("Invalid category id").optional(),
  }),
});

const propertyIdParamValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid property id"),
  }),
});

export const propertyValidation = {
  createPropertyValidationSchema,
  updatePropertyValidationSchema,
  propertyIdParamValidationSchema,
};
