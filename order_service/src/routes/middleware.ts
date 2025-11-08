import { Request, Response, NextFunction } from "express";
import { ValidateUser } from "../utils/broker";

export const RequestAuthorizer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.headers.authorization)
      return res.status(401).json({ error: "Unauthorized" });
    const data = await ValidateUser(req.headers.authorization as string);
    req.user = data;
    next();
  } catch (error) {
    return res.status(401).json({ error });
  }
};
