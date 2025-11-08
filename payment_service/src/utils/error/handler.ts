import { Request, Response, NextFunction } from "express";
import { AuthorizeError, NotFoundError, ValidationError } from "./errors";
import { logger } from "../logger";

export const HandleErrorWithLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let reportError = true;
  let status = 500;
  let data = error.message;

  //   skip common / known errors
  [AuthorizeError, NotFoundError, ValidationError].forEach((errClass) => {
    if (error instanceof errClass) {
      reportError = false;
      status = error.status;
      data = error.message;
    }
  });

  if (reportError) {
    // error reporting tools implementation eg: Sentry, Datadog, NewRelic
    logger.error(error);
  } else {
    logger.warn(error); // ignore common errors caused by users
  }
  res.status(status).json({error:data});
};

export const HandleUnCaughtException = (error: Error) => {
  logger.error(error);
  process.exit(1);
};
