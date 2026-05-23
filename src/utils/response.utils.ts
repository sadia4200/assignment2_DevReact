import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

// ─── Success response helper ──────────────────────────────
export const sendSuccess = (
  res: Response,
  statusCode: number,
  message: string,
  data?: unknown
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// ─── Error response helper ────────────────────────────────
export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

// ─── Common error shortcuts ───────────────────────────────

export const sendBadRequest = (
  res: Response,
  message: string,
  errors?: unknown
): void => sendError(res, StatusCodes.BAD_REQUEST, message, errors);

export const sendUnauthorized = (
  res: Response,
  message: string,
  errors?: unknown
): void => sendError(res, StatusCodes.UNAUTHORIZED, message, errors);

export const sendForbidden = (
  res: Response,
  message: string,
  errors?: unknown
): void => sendError(res, StatusCodes.FORBIDDEN, message, errors);

export const sendNotFound = (
  res: Response,
  message: string,
  errors?: unknown
): void => sendError(res, StatusCodes.NOT_FOUND, message, errors);

export const sendConflict = (
  res: Response,
  message: string,
  errors?: unknown
): void => sendError(res, StatusCodes.CONFLICT, message, errors);

export const sendServerError = (
  res: Response,
  error: unknown
): void =>
  sendError(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "Internal server error",
    String(error)
  );