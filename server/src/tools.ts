import { tool } from "langchain";
import type { DatabaseSync } from "node:sqlite";
import * as z from "zod";


export function initTools(database: DatabaseSync, userId: number) {
    /**
     * Add Expense Tool
     */
    const addExpense = tool((input) => {
        const { title, amount, date = new Date().toISOString() } = input;

        // Validate inputs
        if (!title || typeof title !== "string" || title.trim() === "") {
            return JSON.stringify({ status: "failure", error: "Title must be a non-empty string" });
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return JSON.stringify({ status: "failure", error: "Amount must be a positive number" });
        }


        const dtString = date.split("T")[0];
        try{
            const stmt = database.prepare(`
                    INSERT INTO expenses (title, amount, date, user_id) VALUES (?, ?, ?, ?)
                `);
                
            stmt.run(title, amount, dtString, userId);
    
            return JSON.stringify({ status: "success" })
        } catch(e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            return JSON.stringify({ status: "failure", error: errorMessage })
        }
    }, {
        name: "add_expense",
        description: "Add the given expense to database",
        schema: z.object({
            title: z.string().describe("The expense title."),
            amount: z.number().describe("The expense amount."),
            date: z.string().optional().describe("Date in ISO string format (e.g. 2026-02-21T13:22:30.146Z) which represents the date on which expenditure happened. If this is not specified current date will be taken")
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
        // strftime('%Y-%m', date) => 2026-02-26 -> 2025-11
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
            const result = rows.map((item) => ({ [groupBy] : item.period, amount: item.total }))
            return JSON.stringify({ type: "chart", data: result , labelKey: groupBy });
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

    return [ addExpense, getExpense, generateExpenseChart ] ;
}
