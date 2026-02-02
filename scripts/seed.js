const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const pool = require("../config/db");
const { faker } = require("@faker-js/faker");
const { v4: uuidv4 } = require("uuid");

const CSV_PATH = path.join(__dirname, "../data/telco_churn.csv");
const BATCH_SIZE = 100; // Process records in batches (limit to avoid PostgreSQL param count)

async function ensurePlans() {
    await pool.query(`
    INSERT INTO plans (plan_name, monthly_fee, contract_type)
    VALUES
      ('Basic', 20, 'Month-to-month'),
      ('Pro', 70, 'One year'),
      ('Enterprise', 100, 'Two year')
    ON CONFLICT (plan_name) DO NOTHING;
  `);
}

async function getPlans() {
    const res = await pool.query("SELECT * FROM plans");
    const map = {};
    res.rows.forEach(p => (map[p.plan_name] = p));
    return map;
}

function mapPlan(contract, plans) {
    if (!contract) throw new Error("Missing contract value");

    if (contract.trim() === "Month-to-month") return plans.Basic;
    if (contract.trim() === "One year") return plans.Pro;
    if (contract.trim() === "Two year") return plans.Enterprise;

    throw new Error(`Unknown contract type: ${contract}`);
}

// Helper function to build bulk insert query
function buildBulkInsert(tableName, columns, valueRows) {
    if (valueRows.length === 0) return null;

    const placeholders = valueRows.map((_, idx) => {
        const offset = idx * columns.length;
        const rowPlaceholders = columns.map((_, colIdx) => `$${offset + colIdx + 1}`).join(', ');
        return `(${rowPlaceholders})`;
    }).join(',\n');

    const values = valueRows.flat();
    const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;

    return { query, values };
}

async function processBatch(batch, plans) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Prepare batch data
        const userRows = [];
        const subscriptionRows = [];
        const paymentRows = [];
        const usageRows = [];
        const churnRows = [];
        const userIdToSubscriptionIdx = new Map();

        // First pass: prepare all users and subscriptions
        batch.forEach((row, idx) => {
            const userId = uuidv4();
            const tenure = parseInt(row.tenure);
            const churned = row.Churn === "Yes";

            const signupDate = new Date();
            signupDate.setMonth(signupDate.getMonth() - tenure);

            // Users
            userRows.push([
                userId,
                signupDate,
                row.gender,
                row.SeniorCitizen === "1",
                faker.location.country(),
                tenure
            ]);

            // Subscriptions
            const plan = mapPlan(row.Contract, plans);
            subscriptionRows.push([
                userId,
                plan.plan_id,
                signupDate,
                churned ? faker.date.recent({ days: 30 }) : null,
                churned ? "CANCELLED" : "ACTIVE"
            ]);

            userIdToSubscriptionIdx.set(idx, {
                userId,
                subscriptionIdx: idx,
                tenure,
                churned,
                signupDate,
                plan,
                paymentMethod: row.PaymentMethod
            });
        });

        // Bulk insert users
        if (userRows.length > 0) {
            const userInsert = buildBulkInsert(
                'users',
                ['user_id', 'signup_date', 'gender', 'seniority_level', 'country', 'tenure_months'],
                userRows
            );
            await client.query(userInsert.query, userInsert.values);
        }

        // Bulk insert subscriptions and get IDs
        if (subscriptionRows.length > 0) {
            const subInsert = buildBulkInsert(
                'subscriptions',
                ['user_id', 'plan_id', 'start_date', 'end_date', 'status'],
                subscriptionRows
            );
            const subResult = await client.query(
                `${subInsert.query} RETURNING subscription_id, user_id`,
                subInsert.values
            );

            // Map subscription IDs back to user indices
            const subscriptionIdMap = new Map();
            subResult.rows.forEach(row => {
                subscriptionIdMap.set(row.user_id, row.subscription_id);
            });

            // Second pass: prepare payments, usage events, and churn events
            userIdToSubscriptionIdx.forEach((data) => {
                const subscriptionId = subscriptionIdMap.get(data.userId);

                // Payments
                for (let i = 0; i < data.tenure; i++) {
                    paymentRows.push([
                        subscriptionId,
                        data.plan.monthly_fee,
                        faker.date.between({ from: data.signupDate, to: new Date() }),
                        data.paymentMethod
                    ]);
                }

                // Usage events
                let usageCount = 0;
                if (data.tenure < 6) usageCount = data.churned ? 3 : 10;
                else if (data.tenure < 24) usageCount = 30;
                else usageCount = 80;

                for (let i = 0; i < usageCount; i++) {
                    usageRows.push([
                        data.userId,
                        faker.helpers.arrayElement([
                            "LOGIN",
                            "DASHBOARD_VIEW",
                            "FEATURE_USE",
                            "EXPORT_DATA"
                        ]),
                        faker.date.between({ from: data.signupDate, to: new Date() })
                    ]);
                }

                // Churn events
                if (data.churned) {
                    churnRows.push([
                        data.userId,
                        faker.date.recent({ days: 30 }),
                        data.tenure < 6 ? "Low usage" : "High cost"
                    ]);
                }
            });
        }

        // Bulk insert payments
        if (paymentRows.length > 0) {
            const paymentInsert = buildBulkInsert(
                'payments',
                ['subscription_id', 'amount', 'payment_date', 'payment_method'],
                paymentRows
            );
            await client.query(paymentInsert.query, paymentInsert.values);
        }

        // Bulk insert usage events
        if (usageRows.length > 0) {
            const usageInsert = buildBulkInsert(
                'usage_events',
                ['user_id', 'event_type', 'event_date'],
                usageRows
            );
            await client.query(usageInsert.query, usageInsert.values);
        }

        // Bulk insert churn events
        if (churnRows.length > 0) {
            const churnInsert = buildBulkInsert(
                'churn_events',
                ['user_id', 'churn_date', 'churn_reason'],
                churnRows
            );
            await client.query(churnInsert.query, churnInsert.values);
        }

        await client.query('COMMIT');
        console.log(`✓ Processed batch of ${batch.length} records`);

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function seedFromCSV() {
    console.log("Starting optimized CSV-based seeding...");
    const startTime = Date.now();

    await ensurePlans();
    const plans = await getPlans();

    if (!plans.Basic || !plans.Pro || !plans.Enterprise) {
        throw new Error("Plans not loaded correctly");
    }

    const stream = fs.createReadStream(CSV_PATH).pipe(csv());

    let batch = [];
    let totalProcessed = 0;

    for await (const row of stream) {
        batch.push(row);

        if (batch.length >= BATCH_SIZE) {
            await processBatch(batch, plans);
            totalProcessed += batch.length;
            console.log(`Total processed: ${totalProcessed} records`);
            batch = [];
        }
    }

    // Process remaining records
    if (batch.length > 0) {
        await processBatch(batch, plans);
        totalProcessed += batch.length;
        console.log(`Total processed: ${totalProcessed} records`);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ CSV-based seeding completed successfully!`);
    console.log(`📊 Total records: ${totalProcessed}`);
    console.log(`⏱️  Time taken: ${duration} seconds`);

    process.exit(0);
}

seedFromCSV().catch(err => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
