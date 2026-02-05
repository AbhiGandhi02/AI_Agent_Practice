/**
 * Unit tests for churn analytics tools
 */

// Mock the database pool
jest.mock("../../config/db", () => ({
    query: jest.fn()
}));

const pool = require("../../config/db");
const churn = require("../../src/analytics/churn");

describe("Churn Analytics", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getChurnRateByPlan", () => {
        it("should return churn rate for each plan", async () => {
            const mockData = {
                rows: [
                    { plan_name: "Basic", churn_rate: 0.15 },
                    { plan_name: "Pro", churn_rate: 0.08 },
                    { plan_name: "Enterprise", churn_rate: 0.03 }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getChurnRateByPlan();

            expect(result).toHaveLength(3);
            expect(result[0]).toHaveProperty("churn_rate");
        });
    });

    describe("getOverallChurnRate", () => {
        it("should return overall churn rate", async () => {
            const mockData = {
                rows: [{ churn_rate: 0.12 }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getOverallChurnRate();

            expect(result).toHaveProperty("churn_rate");
            expect(result.churn_rate).toBe(0.12);
        });
    });

    describe("getEarlyChurnRate", () => {
        it("should return early churn rate for users within 6 months", async () => {
            const mockData = {
                rows: [{
                    early_churned_users: "50",
                    total_early_users: "200",
                    early_churn_rate_percent: "25.00"
                }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getEarlyChurnRate();

            expect(result).toHaveProperty("early_churn_rate_percent");
            expect(result.early_churned_users).toBe("50");
        });
    });

    describe("getChurnVsPrice", () => {
        it("should return churn rates by plan price", async () => {
            const mockData = {
                rows: [
                    { plan_name: "Basic", monthly_fee: "29.00", churn_rate_percent: "20.00", price_tier: "low price" },
                    { plan_name: "Pro", monthly_fee: "99.00", churn_rate_percent: "10.00", price_tier: "medium price" },
                    { plan_name: "Enterprise", monthly_fee: "199.00", churn_rate_percent: "5.00", price_tier: "high price" }
                ]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getChurnVsPrice();

            expect(result).toHaveLength(3);
            expect(result[0]).toHaveProperty("price_tier");
            expect(result[0]).toHaveProperty("churn_rate_percent");
        });
    });

    describe("getAverageTenureChurnedUsers", () => {
        it("should return average tenure of churned vs retained users", async () => {
            const mockData = {
                rows: [{
                    avg_tenure_churned: "5.5",
                    avg_tenure_retained: "18.2",
                    min_tenure: "1",
                    max_tenure: "12"
                }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getAverageTenureChurnedUsers();

            expect(result).toHaveProperty("avg_tenure_churned");
            expect(result).toHaveProperty("avg_tenure_retained");
        });
    });

    describe("getChurnSummary", () => {
        it("should return overall churn summary", async () => {
            const mockData = {
                rows: [{
                    total_churned: "150",
                    total_users: "1000",
                    overall_churn_rate: "15.00",
                    top_churn_reason: "Price too high",
                    avg_tenure_churned_users: "6.5"
                }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getChurnSummary();

            expect(result).toHaveProperty("total_churned");
            expect(result).toHaveProperty("top_churn_reason");
        });
    });

    describe("getEarlyChurnContribution", () => {
        it("should return early churn contribution to total", async () => {
            const mockData = {
                rows: [{
                    early_churned: "75",
                    total_churned: "150",
                    early_churn_contribution_percent: "50.00"
                }]
            };
            pool.query.mockResolvedValue(mockData);

            const result = await churn.getEarlyChurnContribution();

            expect(result).toHaveProperty("early_churn_contribution_percent");
            expect(result.early_churned).toBe("75");
        });
    });
});
