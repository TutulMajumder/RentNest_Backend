import { z } from "zod";
import { ActiveStatus } from "../../../generated/prisma/enums";

const updateUserStatusValidationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user id"),
  }),
  body: z.object({
    status: z.enum(ActiveStatus),
  }),
});

export const adminValidation = {
  updateUserStatusValidationSchema,
};
