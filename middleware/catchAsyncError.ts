import { NextFunction, Response, Request } from "express";

export const CatchAsyncError = (thefuc: any) => ( req:Request, res:Response, next:NextFunction) => {
    Promise.resolve(thefuc(req, res, next)).catch(next);
};