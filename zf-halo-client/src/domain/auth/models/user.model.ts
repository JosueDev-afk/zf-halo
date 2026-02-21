// Local definition to avoid build complexity with shared monorepo components outside src
export const Role = {
  USER: "USER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  AUDITOR: "AUDITOR",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Permission = {
  // Loans
  LOAN_VIEW_OWN: "loan:view:own",
  LOAN_VIEW_DEPT: "loan:view:dept",
  LOAN_VIEW_ALL: "loan:view:all",
  LOAN_REQUEST: "loan:request",
  LOAN_EDIT: "loan:edit",
  LOAN_APPROVE: "loan:approve",
  LOAN_REJECT: "loan:reject",

  // Assets
  ASSET_VIEW: "asset:view",
  ASSET_MANAGE: "asset:manage",

  // Accounts & Users
  ACCOUNT_MANAGE: "account:manage",

  // Audit
  REPORT_EXPORT: "report:export",
  ANALYTICS_VIEW: "analytics:view",
  AUDIT_LOG_READ: "audit:log:read",

  // Other
  QR_GENERATE: "qr:generate",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  company?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
