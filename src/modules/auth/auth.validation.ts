import { z } from "zod";

const registerUserValidationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    role: z.enum(["TENANT", "LANDLORD"]),
  }),
});

const loginUserValidationSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

const updateProfileValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 digits")
      .optional(),
    oldPassword: z.string().min(1, "Old password cannot be empty").optional(),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .optional(),
  }),
});

export const authValidation = {
  registerUserValidationSchema,
  loginUserValidationSchema,
  updateProfileValidationSchema,
};
