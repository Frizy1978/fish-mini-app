import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { ApiError } from "../lib/http.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      message: "Ошибка валидации запроса",
      issues: error.flatten()
    });
  }

  if (error instanceof ApiError) {
    return response.status(error.statusCode).json({
      message: error.message
    });
  }

  logger.error("Unhandled error", error);

  return response.status(500).json({
    message: "Внутренняя ошибка сервера"
  });
}
