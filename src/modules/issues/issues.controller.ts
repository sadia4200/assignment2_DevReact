import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import pool from "../../config/db.js";
import { findIssueById, attachReporters } from "../../utils/db.utils.js";
import type { CreateIssueBody, UpdateIssueBody } from "../../utils/interfaces.js";
import {
  sendSuccess,
  sendBadRequest,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendServerError,
} from "../../utils/response.utils.js";

// ─── Validation helpers ───────────────────────────────────
const VALID_TYPES = ["bug", "feature_request"] as const;

const validateIssueFields = (
  title?: string,
  description?: string,
  type?: string
): string | null => {
  if (title !== undefined && title.length > 150)
    return "title must not exceed 150 characters";
  if (description !== undefined && description.length < 20)
    return "description must be at least 20 characters";
  if (type !== undefined && !VALID_TYPES.includes(type as typeof VALID_TYPES[number]))
    return "type must be bug or feature_request";
  return null; // null means no error
};

// ─── API 3: POST /api/issues ──────────────────────────────
export const createIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, description, type } = req.body as CreateIssueBody;
  const reporter_id = req.user!.id;

  // Check all required fields present
  if (!title || !description || !type) {
    sendBadRequest(res, "Validation failed", "title, description, and type are required");
    return;
  }

  // Validate field constraints
  const validationError = validateIssueFields(title, description, type);
  if (validationError) {
    sendBadRequest(res, "Validation failed", validationError);
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, type, reporter_id]
    );

    sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", result.rows[0]);
  } catch (error) {
    sendServerError(res, error);
  }
};

// ─── API 4: GET /api/issues ───────────────────────────────
export const getAllIssues = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sort = "newest", type, status } = req.query as {
    sort?: string;
    type?: string;
    status?: string;
  };

  // Dynamically build WHERE clause based on provided filters
  const conditions: string[] = [];
  const values: string[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const where = conditions.length > 0
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const order = sort === "oldest"
    ? "ORDER BY created_at ASC"
    : "ORDER BY created_at DESC";

  try {
    const result = await pool.query(
      `SELECT * FROM issues ${where} ${order}`,
      values
    );

    // Attach reporter details without JOIN
    const data = await attachReporters(result.rows);

    sendSuccess(res, StatusCodes.OK, "Issues retrieved successfully", data);
  } catch (error) {
    sendServerError(res, error);
  }
};

// ─── API 5: GET /api/issues/:id ───────────────────────────
export const getSingleIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const issue = await findIssueById(id);

    if (!issue) {
      sendNotFound(res, "Issue not found", `No issue with id ${id}`);
      return;
    }

    const [issueWithReporter] = await attachReporters([issue]);

    sendSuccess(res, StatusCodes.OK, "Issue retrieved successfully", issueWithReporter);
  } catch (error) {
    sendServerError(res, error);
  }
};

// ─── API 6: PATCH /api/issues/:id ────────────────────────
export const updateIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };
  const { title, description, type } = req.body as UpdateIssueBody;
  const { id: userId, role } = req.user!;

  try {
    const issue = await findIssueById(id);

    if (!issue) {
      sendNotFound(res, "Issue not found", `No issue with id ${id}`);
      return;
    }

    // Contributor permission checks
    if (role === "contributor") {
      if (issue.reporter_id !== userId) {
        sendForbidden(res, "You can only update your own issues", "Insufficient permissions");
        return;
      }
      if (issue.status !== "open") {
        sendConflict(res, "Contributors can only update open issues", "Issue is not in open status");
        return;
      }
    }

    // Validate only the fields that were provided
    const validationError = validateIssueFields(title, description, type);
    if (validationError) {
      sendBadRequest(res, "Validation failed", validationError);
      return;
    }

    // Fall back to existing values for fields not provided
    const newTitle       = title       ?? issue.title;
    const newDescription = description ?? issue.description;
    const newType        = type        ?? issue.type;

    const updated = await pool.query(
      `UPDATE issues
       SET title = $1, description = $2, type = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [newTitle, newDescription, newType, id]
    );

    sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updated.rows[0]);
  } catch (error) {
    sendServerError(res, error);
  }
};

// ─── API 7: DELETE /api/issues/:id ───────────────────────
export const deleteIssue = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params as { id: string };

  try {
    const issue = await findIssueById(id);

    if (!issue) {
      sendNotFound(res, "Issue not found", `No issue with id ${id}`);
      return;
    }

    await pool.query("DELETE FROM issues WHERE id = $1", [id]);

    sendSuccess(res, StatusCodes.OK, "Issue deleted successfully", undefined);
  } catch (error) {
    sendServerError(res, error);
  }
};