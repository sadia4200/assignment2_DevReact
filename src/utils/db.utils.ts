import pool from "../config/db.js";
import type { Issue, PublicUser, IssueWithReporter } from "./interfaces.js";

// ─── Find user by email ───────────────────────────────────
export const findUserByEmail = async (email: string) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0] as import("./interfaces.js").User | undefined;
};

// ─── Find user by id ──────────────────────────────────────
export const findUserById = async (id: number) => {
  const result = await pool.query(
    "SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] as import("./interfaces.js").SafeUser | undefined;
};

// ─── Find issue by id ─────────────────────────────────────
export const findIssueById = async (id: string) => {
  const result = await pool.query(
    "SELECT * FROM issues WHERE id = $1",
    [id]
  );
  return result.rows[0] as Issue | undefined;
};

// ─── Attach reporter info to issues (no JOIN) ─────────────
// Fetches all reporters in one batch query using WHERE id = ANY(...)
export const attachReporters = async (
  issues: Issue[]
): Promise<IssueWithReporter[]> => {
  if (issues.length === 0) return [];

  // Get unique reporter ids from all issues
  const reporterIds = [...new Set(issues.map((i) => i.reporter_id))];

  const result = await pool.query(
    "SELECT id, name, role FROM users WHERE id = ANY($1::int[])",
    [reporterIds]
  );

  // Build lookup map for O(1) access
  const reporterMap: Record<number, PublicUser> = {};
  for (const u of result.rows as PublicUser[]) {
    reporterMap[u.id] = u;
  }

  // Replace reporter_id with full reporter object
  return issues.map(({ reporter_id, ...rest }) => ({
    ...rest,
    reporter: reporterMap[reporter_id] ?? { id: reporter_id, name: "Unknown", role: "contributor" },
  })) as IssueWithReporter[];
};