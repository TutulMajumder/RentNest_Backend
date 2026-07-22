import { NextFunction, RequestHandler } from "express"

export const catchAsync=(fn:RequestHandler)=>{
    async(req:Request,res:Response,next:NextFunction)=>{
        try {
            
        } catch (error) {
            next(error);
        }
    }
}