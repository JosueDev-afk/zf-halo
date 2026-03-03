// E2E Test setup file for zf-halo-core
// Sets environment variables and test configuration

// Set test environment variables BEFORE imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    'postgresql://user_zf:password_zf@localhost:5432/zf_halo?schema=public';

// DATABASE_URL is set above for local testing
// In CI, this will be overridden by the workflow environment

// Increase timeout for database operations
jest.setTimeout(30000);
