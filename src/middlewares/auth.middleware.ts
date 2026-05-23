import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "../utils/interfaces.js";
import { sendUnauthorized, sendForbidden } from "../utils/response.utils.js";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── CHECK: is user logged in? ────────────────────────────
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"];

  if (!token) {
    sendUnauthorized(res, "Access denied. No token provided.", "Authorization header missing");
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env["JWT_SECRET"] as string
    ) as JwtPayload;

    req.user = decoded;
    next();
  } catch {
    sendUnauthorized(res, "Invalid or expired token.", "Token verification failed");
  }
};

// ─── CHECK: is user a maintainer? ─────────────────────────
export const authorizeMaintainer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "maintainer") {
    sendForbidden(res, "Access denied. Maintainer role required.", "Insufficient permissions");
    return;
  }
  next();
};