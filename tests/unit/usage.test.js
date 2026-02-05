/**
 * Unit tests for usage analytics tools
 */

// Mock the database pool
jest.mock("../../config/db", () => ({
    query: jest.fn()
}));

const pool = require("../../config/db");
const usage = require("../../src/analytics/usage");

describe("Usage Analytics", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUsageVsChurn", () => {
        it("should return usage comparison for churned vs retained users", async () => {
            const mockData = {
                rows: [
                    { status: "retained", usage_count: "5000" },
                    { status: "churned", usage_count: "1500" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await usage.getUsageVsChurn();

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("status");
            expect(result[0]).toHaveProperty("usage_count");
        });
    });

    describe("getTopEngagedUsers", () => {
        it("should return top 10 engaged users by default", async () => {
            const mockData = {
                rows: Array(10).fill(null).map((_, i) => ({
                    user_id: `user-${i}`,
                    usage_count: String(1000 - i * 50)
                }))
            };
            pool.query.mockResolvedValue(mockData);

            const result = await usage.getTopEngagedUsers();

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [10]);
            expect(result).toHaveLength(10);
        });

        it("should accept custom limit parameter", async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await usage.getTopEngagedUsers(5);

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [5]);
        });
    });

    describe("getAverageUsageChurnedUsers", () => {
        it("should return average usage per user by status", async () => {
            const mockData = {
                rows: [
                    { user_status: "retained", user_count: "800", avg_usage_per_user: "45.50" },
                    { user_status: "churned", user_count: "200", avg_usage_per_user: "12.30" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await usage.getAverageUsageChurnedUsers();

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("avg_usage_per_user");
            expect(result[0]).toHaveProperty("user_count");
        });
    });

    describe("getTopUsageUsersWithPlans", () => {
        it("should return top users with their plan information", async () => {
            const mockData = {
                rows: [
                    { user_id: "user-1", plan_name: "Enterprise", monthly_fee: "199.00", usage_count: "500", status: "retained" },
                    { user_id: "user-2", plan_name: "Pro", monthly_fee: "99.00", usage_count: "450", status: "retained" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await usage.getTopUsageUsersWithPlans();

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [10]);
            expect(result[0]).toHaveProperty("plan_name");
            expect(result[0]).toHaveProperty("monthly_fee");
            expect(result[0]).toHaveProperty("usage_count");
        });

        it("should accept custom limit parameter", async () => {
            pool.query.mockResolvedValue({ rows: [] });

            await usage.getTopUsageUsersWithPlans(20);

            expect(pool.query).toHaveBeenCalledWith(expect.any(String), [20]);
        });
    });
});
