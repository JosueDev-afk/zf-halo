/**
 * Granular permissions for ZF-HALO system.
 * Follows the format: resource:action[:scope]
 */
export enum Permission {
  // Loans
  LOAN_VIEW_OWN = 'loan:view:own',
  LOAN_VIEW_DEPT = 'loan:view:dept',
  LOAN_VIEW_ALL = 'loan:view:all',
  LOAN_REQUEST = 'loan:request',
  LOAN_EDIT = 'loan:edit',
  LOAN_APPROVE = 'loan:approve',
  LOAN_REJECT = 'loan:reject',

  // Assets
  ASSET_VIEW = 'asset:view',
  ASSET_MANAGE = 'asset:manage', // Create, Edit, Delete assets

  // Accounts & Users
  ACCOUNT_MANAGE = 'account:manage', // Approve registrations, manage users

  // Audit & Analytics
  REPORT_EXPORT = 'report:export',
  ANALYTICS_VIEW = 'analytics:view',
  AUDIT_LOG_READ = 'audit:log:read',

  // Other
  QR_GENERATE = 'qr:generate',
}
