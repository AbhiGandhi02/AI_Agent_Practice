// Jest setup file
// This runs before each test file

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

// Increase timeout for async operations
jest.setTimeout(10000);

// Global afterAll to close any open connections
afterAll(async () => {
    // Close database pool if needed
    try {
        const pool = require("../config/db");
        await pool.end();
    } catch (e) {
        // Pool might not be initialized in all tests
    }
});
