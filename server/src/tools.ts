import { tool } from "@langchain/core/tools";
import type { DatabaseSync } from "node:sqlite";
import * as z from "zod";


export function initTools(database: DatabaseSync, userId: number) {
    /**
     * Helper: Map category name to ID
     */
    function getCategoryId(categoryName: string): number | null {
        if (!categoryName) return null;
        const stmt = database.prepare(`SELECT id FROM categories WHERE name = ?`);
        const result = stmt.get(categoryName) as any;
        return result?.id || null;
    }

    /**
     * Helper function to get current month boundaries (using local dates, not UTC)
     */
    function getCurrentMonthBoundaries() {
        const now = new Date();
        const year = now.getFullYear();
        const monthNum = now.getMonth() + 1; // 1-12
        const month = String(monthNum).padStart(2, '0');

        // Get last day of month
        const endDayNum = new Date(year, monthNum, 0).getDate();
        const endDay = String(endDayNum).padStart(2, '0');

        return {
            start: `${year}-${month}-01`,
            end: `${year}-${month}-${endDay}`
        };
    } // <-- Bug 1 fixed: closing brace was missing, causing setBudget/getBudgetStatus/getSpendingInsights to be nested inside this function

    /**
     * Add Expense Tool
     */
    const addExpense = tool((input) => {
        const { title, amount, category, date = new Date().toISOString() } = input;

        // Validate inputs
        if (!title || typeof title !== "string" || title.trim() === "") {
            return JSON.stringify({ status: "failure", error: "Title must be a non-empty string" });
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return JSON.stringify({ status: "failure", error: "Amount must be a positive number" });
        }

        const dtString = date.split("T")[0];

        // Get category ID if provided
        let categoryId = null;
        if (category) {
            categoryId = getCategoryId(category);
            if (!categoryId) {
                // List available categories
                const allCats = database.prepare(`SELECT name FROM categories`).all() as any[];
                const catNames = allCats.map(c => c.name).join(", ");
                return JSON.stringify({
                    status: "failure",
                    error: `Category '${category}' not found. Available: ${catNames}`
                });
            }
        }

        try {
            const stmt = database.prepare(`
                INSERT INTO expenses (title, amount, date, user_id, category_id) 
                VALUES (?, ?, ?, ?, ?)
            `);

            console.log("💾 Adding expense:", { title, amount, categoryId, date: dtString });
            stmt.run(title, amount, dtString, userId, categoryId);

            return JSON.stringify({
                status: "success",
                expense: { title, amount, category: category || "Uncategorized", date: dtString }
            });
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("❌ addExpense error:", errorMessage);
            return JSON.stringify({ status: "failure", error: errorMessage });
        }
    }, {
        name: "add_expense",
        description: "Add an expense to the database with optional category",
        schema: z.object({
            title: z.string().describe("The expense title/description (e.g., 'iPhone', 'Groceries', 'Dinner at restaurant')."),
            amount: z.number().describe("The expense amount as a positive number."),
            category: z.string().optional().describe("The category: Groceries, Dining, Transportation, Utilities, Entertainment, Healthcare, Shopping, or Other. If not specified, will be uncategorized."),
            date: z.string().optional().describe("Date in ISO string format (e.g. 2026-02-21T13:22:30.146Z). If not specified, today's date will be used.")
        })
    })

    /**
     * Get Expense Tool
     */
    const getExpense = tool((input) => {
        const { from, to } = input;

        try{
            const stmt = database.prepare(`
                    SELECT * from expenses WHERE user_id = ? AND date between ? AND ?
                `);
            const rows = stmt.all(userId, from, to);

            return JSON.stringify(rows);
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ status: "failure", error: errorMessage })
        }
    }, {
        name: "get_expenses",
        description: "Get the expense from database for given date time range",
        schema: z.object({
            from: z.string().describe("Start date in YYYY-MM-DD format."),
            to: z.string().describe("End date in YYYY-MM-DD format.")
        })
    })

    /**
     * Generate Expense Chart Tool
     */
    const generateExpenseChart = tool((input) => {
        const { from, to, groupBy } = input;

        console.log("Input:::", input)
        let groupBySql;
        switch(groupBy) {
            case "month":
                groupBySql = "strftime('%Y-%m', date)";
                break;
            case "week":
                groupBySql = "strftime('%Y-W%W', date)";
                break;
            case "date":
                groupBySql = "date";
                break;
            default:
                groupBySql = "strftime('%Y-%m', date)";
        }
        try{
            const query = `
            SELECT ${groupBySql} as period, SUM(amount) as total FROM expenses
            WHERE user_id = ? AND date BETWEEN ? AND ?
            GROUP BY period
            ORDER BY period
            `
            const stmt = database.prepare(query);
            const rows = stmt.all(userId, from, to);

            console.log("Rows: ", rows);
            const result = rows.map((item) => ({ [groupBy] : (item as any).period, amount: (item as any).total }))
            return JSON.stringify({ type: "chart", data: result, labelKey: groupBy });
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ type: "chart", status: "failure", error: errorMessage })
        }
    }, {
        name: "generate_expense_chart",
        description: "Generate charts by querying the database and grouping expenses by months, weeks or dates",
        schema: z.object({
            from: z.string().describe("Start date in YYYY-MM-DD format."),
            to: z.string().describe("End date in YYYY-MM-DD format."),
            groupBy: z.enum(["month", "week", "date"]).describe("How to group the data: by month, week or date.")
        })
    })

    /**
     * Set Budget Tool
     */
    const setBudget = tool((input) => {
        const { category, amount } = input;

        // Validate inputs
        if (!category || typeof category !== "string" || category.trim() === "") {
            return JSON.stringify({ status: "failure", error: "Category must be a non-empty string" });
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return JSON.stringify({ status: "failure", error: "Amount must be a positive number" });
        }

        try {
            console.log("🔵 setBudget called:", { category, amount, userId });

            // Get category ID by name
            const getCategoryStmt = database.prepare(`SELECT id FROM categories WHERE name = ?`);
            console.log("📝 Query: SELECT id FROM categories WHERE name = ?", { category });

            const categoryRow = getCategoryStmt.get(category) as any;
            console.log("📊 Category lookup result:", categoryRow);

            if (!categoryRow || !categoryRow.id) {
                // Debug: check what categories exist
                const allCategoriesStmt = database.prepare(`SELECT id, name FROM categories`);
                const allCategories = allCategoriesStmt.all();
                console.error(`❌ Category '${category}' not found. Available categories:`, allCategories);
                return JSON.stringify({ status: "failure", error: `Category '${category}' not found. Available: ${Array.isArray(allCategories) ? allCategories.map(c => (c as any).name).join(", ") : "none"}` });
            }

            const categoryId = categoryRow.id as number;
            console.log("✅ Category found:", { categoryId, name: category });

            const monthBoundaries = getCurrentMonthBoundaries();
            console.log("📅 Month boundaries:", monthBoundaries);

            // Verify user exists (simple check)
            const userCheckStmt = database.prepare(`SELECT id FROM users WHERE id = ?`);
            console.log("👤 Query: SELECT id FROM users WHERE id = ?", { userId });

            const userExists = userCheckStmt.get(userId);
            console.log("👤 User lookup result:", userExists);

            if (!userExists) {
                console.error(`❌ User not found. ID: ${userId}`);
                return JSON.stringify({ status: "failure", error: `User not found (ID: ${userId})` });
            }
            console.log("✅ User verified");

            // Insert or update budget with monthly frequency
            const stmt = database.prepare(`
                INSERT INTO budgets (user_id, category_id, amount, frequency, start_date, end_date) 
                VALUES (?, ?, ?, 'monthly', ?, ?)
                ON CONFLICT(user_id, category_id) DO UPDATE SET 
                    amount = ?, 
                    frequency = 'monthly',
                    start_date = ?,
                    end_date = ?,
                    updated_at = CURRENT_TIMESTAMP
            `);

            console.log("💾 Executing INSERT/UPDATE budget query:", {
                userId,
                categoryId,
                amount,
                start_date: monthBoundaries.start,
                end_date: monthBoundaries.end
            });

            stmt.run(
                userId,
                categoryId,
                amount,
                monthBoundaries.start,
                monthBoundaries.end,
                amount,
                monthBoundaries.start,
                monthBoundaries.end
            );

            console.log("✅ Budget inserted/updated successfully");

            return JSON.stringify({
                status: "success",
                budgetSet: {
                    category,
                    amount,
                    period: `${monthBoundaries.start} to ${monthBoundaries.end}`,
                    frequency: "monthly"
                }
            });
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("❌ setBudget ERROR:", {
                error: errorMessage,
                category,
                amount,
                userId,
                stack: e instanceof Error ? e.stack : "no stack"
            });
            return JSON.stringify({ status: "failure", error: errorMessage });
        }
    }, {
        name: "set_budget",
        description: "Set or update a monthly budget for a specific category. Budget resets automatically each month.",
        schema: z.object({
            category: z.string().describe("The category name (e.g., 'Groceries', 'Dining', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other')."),
            amount: z.number().describe("The monthly budget amount as a positive number.")
        })
    });

    /**
     * Get Budget Status Tool
     */
    const getBudgetStatus = tool((input) => {
        const { category } = input;
        const monthBoundaries = getCurrentMonthBoundaries();

        try {
            // Handle empty string category as null
            const categoryFilter = category && category.trim() ? category.trim() : null;

            let query;
            let params: any[];

            if (categoryFilter) {
                // Get budget status for specific category (current month only)
                // Bug 3 fixed: CAST(expr, 0) is invalid SQLite — replaced with ROUND(expr)
                query = `
                    SELECT 
                        c.name as category,
                        c.color,
                        b.amount as budgeted,
                        COALESCE(SUM(e.amount), 0) as spent,
                        COALESCE(b.amount - SUM(e.amount), b.amount) as remaining,
                        ROUND(COALESCE(SUM(e.amount), 0) * 100.0 / b.amount) as percentUsed,
                        b.start_date as period_start,
                        b.end_date as period_end
                    FROM categories c
                    LEFT JOIN budgets b ON c.id = b.category_id AND b.user_id = ?
                    LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? AND e.date BETWEEN ? AND ?
                    WHERE c.name = ?
                    GROUP BY c.id
                `;
                params = [userId, userId, monthBoundaries.start, monthBoundaries.end, categoryFilter];
            } else {
                // Get budget status for all categories with budgets (current month only)
                // Bug 3 fixed: CAST(expr, 0) is invalid SQLite — replaced with ROUND(expr)
                query = `
                    SELECT 
                        c.name as category,
                        c.color,
                        b.amount as budgeted,
                        COALESCE(SUM(e.amount), 0) as spent,
                        COALESCE(b.amount - SUM(e.amount), b.amount) as remaining,
                        ROUND(COALESCE(SUM(e.amount), 0) * 100.0 / b.amount) as percentUsed,
                        b.start_date as period_start,
                        b.end_date as period_end
                    FROM budgets b
                    JOIN categories c ON b.category_id = c.id
                    LEFT JOIN expenses e ON c.id = e.category_id AND e.user_id = ? AND e.date BETWEEN ? AND ?
                    WHERE b.user_id = ?
                    GROUP BY c.id
                    ORDER BY percentUsed DESC
                `;
                params = [userId, monthBoundaries.start, monthBoundaries.end, userId];
            }

            const stmt = database.prepare(query);
            // Bug 5 fixed: node:sqlite's .all() accepts spread args correctly, but params
            // must be spread from the array — this was already correct but made explicit
            const rows = stmt.all(...params);

            return JSON.stringify({
                type: "budget-status",
                data: rows,
                period: `${monthBoundaries.start} to ${monthBoundaries.end}`
            });
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ type: "budget-status", status: "failure", error: errorMessage });
        }
    }, {
        name: "get_budget_status",
        description: "Get current month budget status showing budgeted vs spent amount for categories. Automatically filters for the current month.",
        schema: z.object({
            category: z.string().optional().describe("The category name. If not specified, returns status for all categories with budgets.")
        })
    });

    /**
     * Get Spending Insights Tool
     */
    const getSpendingInsights = tool((input) => {
        const { from, to, metric } = input;

        try {
            let result: any = { type: "insights", metric };

            if (metric === "highest-spending") {
                // Get top spending categories (include uncategorized)
                const query = `
                    SELECT 
                        COALESCE(c.name, 'Uncategorized') as category,
                        COALESCE(c.color, '#6b7280') as color,
                        SUM(e.amount) as total_spent,
                        COUNT(e.id) as expense_count
                    FROM expenses e
                    LEFT JOIN categories c ON e.category_id = c.id
                    WHERE e.user_id = ? AND e.date BETWEEN ? AND ?
                    GROUP BY e.category_id
                    ORDER BY total_spent DESC
                    LIMIT 5
                `;
                const stmt = database.prepare(query);
                const rows = stmt.all(userId, from, to);
                result.data = rows;
                console.log("📊 Highest spending result:", rows);
            } else if (metric === "category-breakdown") {
                // Get percentage breakdown by category (include uncategorized)
                const query = `
                    SELECT 
                        COALESCE(c.name, 'Uncategorized') as category,
                        COALESCE(c.color, '#6b7280') as color,
                        SUM(e.amount) as amount,
                        CAST(SUM(e.amount) * 100.0 / (SELECT SUM(amount) FROM expenses WHERE user_id = ? AND date BETWEEN ? AND ?) AS INT) as percentage
                    FROM expenses e
                    LEFT JOIN categories c ON e.category_id = c.id
                    WHERE e.user_id = ? AND e.date BETWEEN ? AND ?
                    GROUP BY e.category_id
                    ORDER BY amount DESC
                `;
                const stmt = database.prepare(query);
                const rows = stmt.all(userId, from, to, userId, from, to);
                result.data = rows;
                console.log("📊 Category breakdown result:", rows);
            } else if (metric === "trends") {
                // Get spending trends over weeks
                const query = `
                    SELECT 
                        strftime('%Y-W%W', date) as week,
                        SUM(amount) as total_spent,
                        COUNT(id) as expense_count
                    FROM expenses
                    WHERE user_id = ? AND date BETWEEN ? AND ?
                    GROUP BY week
                    ORDER BY week
                `;
                const stmt = database.prepare(query);
                const rows = stmt.all(userId, from, to);
                result.data = rows;
                console.log("📊 Trends result:", rows);
            }

            return JSON.stringify(result);
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.error("❌ getSpendingInsights error:", errorMessage);
            return JSON.stringify({ type: "insights", status: "failure", error: errorMessage });
        }
    }, {
        name: "get_spending_insights",
        description: "Get insights about spending patterns including highest spending categories, category breakdown, and trends",
        schema: z.object({
            from: z.string().describe("Start date in YYYY-MM-DD format."),
            to: z.string().describe("End date in YYYY-MM-DD format."),
            metric: z.enum(["highest-spending", "category-breakdown", "trends"]).describe("Type of insight: highest-spending (top 5 categories), category-breakdown (percentage by category), or trends (weekly spending)")
        })
    });

    return [ addExpense, getExpense, generateExpenseChart, setBudget, getBudgetStatus, getSpendingInsights ];
}