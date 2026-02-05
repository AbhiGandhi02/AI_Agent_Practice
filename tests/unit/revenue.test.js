/**
 * Unit tests for revenue analytics tools
 */

// Mock the database pool
jest.mock("../../config/db", () => ({
    query: jest.fn()
}));

const pool = require("../../config/db");
const revenue = require("../../src/analytics/revenue");

describe("Revenue Analytics", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getRevenueByPlan", () => {
        it("should return revenue breakdown by plan", async () => {
            const mockData = {
                rows: [
                    { plan_name: "Enterprise", total_revenue: "50000.00" },
                    { plan_name: "Pro", total_revenue: "30000.00" },
                    { plan_name: "Basic", total_revenue: "10000.00" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await revenue.getRevenueByPlan();

            expect(pool.query).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockData.rows);
            expect(result).toHaveLength(3);
            expect(result[0].plan_name).toBe("Enterprise");
        });

        it("should return empty array when no data", async () => {
            pool.query.mockResolvedValue({ rows: [] });

            const result = await revenue.getRevenueByPlan();

            expect(result).toEqual([]);
        });
    });

    describe("getMonthlyRevenueTrend", () => {
        it("should return monthly revenue trends", async () => {
            const mockData = {
                rows: [
                    { month: "2025-01-01", revenue: "10000.00" },
                    { month: "2025-02-01", revenue: "12000.00" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await revenue.getMonthlyRevenueTrend();

            expect(result).toEqual(mockData.rows);
            expect(result).toHaveLength(2);
        });
    });

    describe("getRevenueBySegment", () => {
        it("should return revenue by user tenure segment", async () => {
            const mockData = {
                rows: [
                    { segment: "established (12+ months)", user_count: "100", total_revenue: "80000.00" },
                    { segment: "growing (6-12 months)", user_count: "50", total_revenue: "30000.00" },
                    { segment: "new (0-6 months)", user_count: "30", total_revenue: "10000.00" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await revenue.getRevenueBySegment();

            expect(result).toHaveLength(3);
            expect(result[0].segment).toContain("established");
        });
    });

    describe("getLifetimeValueByPlan", () => {
        it("should return LTV by plan with retention rates", async () => {
            const mockData = {
                rows: [
                    { plan_name: "Enterprise", monthly_fee: "199.00", avg_ltv: "5000.00", retention_rate: "95.00" },
                    { plan_name: "Pro", monthly_fee: "99.00", avg_ltv: "2000.00", retention_rate: "85.00" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await revenue.getLifetimeValueByPlan();

            expect(result).toHaveLength(2);
            expect(result[0]).toHaveProperty("avg_ltv");
            expect(result[0]).toHaveProperty("retention_rate");
        });
    });

    describe("getRevenueSummary", () => {
        it("should return overall revenue summary", async () => {
            const mockData = {
                rows: [{
                    total_payments: "500",
                    total_revenue: "100000.00",
                    avg_payment_amount: "200.00",
                    paying_users: "150",
                    revenue_per_user: "666.67"
                }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await revenue.getRevenueSummary();

            expect(result).toHaveProperty("total_revenue");
            expect(result).toHaveProperty("revenue_per_user");
        });
    });
});
