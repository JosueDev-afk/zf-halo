// E2E Test setup file for zf-halo-core
// Sets environment variables and test configuration

// Set test environment variables BEFORE imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-e2e-testing-minimum-32-chars';
process.env.JWT_EXPIRES_IN = '1h';

// Use the same DATABASE_URL from .env for E2E tests
// In CI, this will be overridden by the workflow environment

// Increase timeout for database operations
jest.setTimeout(30000);
