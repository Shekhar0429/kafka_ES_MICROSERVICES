import { pinoHttp } from "pino-http";
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    serviceName: "order-service",
  },
  serializers: pino.stdSerializers,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: {
    target: "pino-pretty", // for prduction we can use sentry
    level: "error",
  },
});

export const httpLogger = pinoHttp({
  level: "error",
  logger,
});
