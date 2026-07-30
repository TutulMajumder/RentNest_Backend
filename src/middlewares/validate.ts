// middlewares/validate.ts
import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";

export const validate = (schema: ZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.body = result.body ?? req.body;
    next();
  });
};
