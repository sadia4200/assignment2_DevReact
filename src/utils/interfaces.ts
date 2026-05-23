// ─── User interfaces ──────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

export interface SafeUser {
  id: number;
  name: string;
  email: string;
  role: "contributor" | "maintainer";
  created_at: Date;
  updated_at: Date;
}

// ─── Issue interfaces ─────────────────────────────────────

export interface Issue {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter: PublicUser;
  created_at: Date;
  updated_at: Date;
}

// ─── Request body interfaces ──────────────────────────────

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateIssueBody {
  title: string;
  description: string;
  type: "bug" | "feature_request";
}

export interface UpdateIssueBody {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
}

// ─── JWT payload interface ────────────────────────────────

export interface JwtPayload {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}