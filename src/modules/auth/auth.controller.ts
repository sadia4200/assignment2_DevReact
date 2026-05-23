import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import pool from "../../config/db.js";
import { findUserByEmail } from "../../utils/db.utils.js";
import type { SignupBody, LoginBody } from "../../utils/interfaces.js";
import {
  sendSuccess,
  sendBadRequest,
  sendUnauthorized,
  sendServerError,
} from "../../utils/response.utils.js";

// ─── SIGNUP ───────────────────────────────────────────────
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as SignupBody;

  // Validate required fields
  if (!name || !email || !password) {
    sendBadRequest(res, "Validation failed", "name, email, and password are required");
    return;
  }

  // Validate role value
  if (role && !["contributor", "maintainer"].includes(role)) {
    sendBadRequest(res, "Validation failed", "role must be contributor or maintainer");
    return;
  }

  try {
    // Check for duplicate email
    const existing = await findUserByEmail(email);
    if (existing) {
      sendBadRequest(res, "Email already registered", "Duplicate email");
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const userRole = role ?? "contributor";

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [name, email, hashed, userRole]
    );

    sendSuccess(res, StatusCodes.CREATED, "User registered successfully", result.rows[0]);
  } catch (error) {
    sendServerError(res, error);
  }
};

// ─── LOGIN ────────────────────────────────────────────────
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    sendBadRequest(res, "Validation failed", "email and password are required");
    return;
  }

  try {
    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      sendUnauthorized(res, "Invalid credentials", "Email or password is incorrect");
      return;
    }

    // Compare password with stored hash
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      sendUnauthorized(res, "Invalid credentials", "Email or password is incorrect");
      return;
    }

    // Sign JWT — include id, name, role in payload
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env["JWT_SECRET"] as string,
      { expiresIn: "7d" }
    );

    sendSuccess(res, StatusCodes.OK, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    sendServerError(res, error);
  }
};