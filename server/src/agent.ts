import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver, MessagesAnnotation, StateGraph, type LangGraphRunnableConfig } from "@langchain/langgraph";
import { initDB } from "./db.ts";
import { initTools } from "./tools.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage, ToolMessage } from "langchain";
import type { StreamMessage } from "./types.js";

/**
 * Initalize DB - Use same database as server.ts
 */
const database = initDB("expense_tracker.db");

/**
 * Initialize LLM
 */
const llm = new ChatOpenAI({
    model: "gpt-5.4-mini"
});

/**
 * Create agent for a specific user
 */
export function createUserAgent(userId: number) {
    /**
     * Init tools for this user
     */
    const tools = initTools(database, userId);

    /**
     * Tool node
     */
    const toolnode = new ToolNode(tools);

    async function callModel(state: typeof MessagesAnnotation.State) {
        const llmWithTools = llm.bindTools(tools);

        const response = await llmWithTools.invoke([
            {
                role: "system",
                content: `You are a helpful expense tracking assistant. Current datetime: ${new Date().toISOString()}.
                
TOOLS AVAILABLE:
1. add_expense: Add a new expense with OPTIONAL category
   - ALWAYS infer and assign the best category when adding expenses
   - Examples: iPhone/Electronics → "Shopping" | Grocery/Food → "Groceries" | Restaurant/Lunch → "Dining" | Gas/Uber → "Transportation" | Movie/Book → "Entertainment" | Doctor/Medicine → "Healthcare" | Electricity/Internet → "Utilities" | Unclear → "Other"
   
2. get_expenses: Retrieve expenses for a date range

3. generate_expense_chart: Visualize expenses by month, week, or date

4. set_budget: Set a MONTHLY budget for a category. Budgets automatically reset at the start of each month.

5. get_budget_status: Show current month's budget vs spent for categories.

6. get_spending_insights: Analyze spending patterns with options: "highest-spending", "category-breakdown", "trends"

BUDGET BEHAVIOR (IMPORTANT):
- Budgets are MONTHLY and reset automatically on the 1st of each month
- Only current month expenses count toward budget calculations
- Each month starts fresh at 0% budget usage

CATEGORY MAPPING (when adding expenses):
- "iPhone", "Laptop", "Phone", "Electronics", "Gadgets" → Shopping
- "Grocery", "Food", "Milk", "Bread", "Vegetables", "Shopping" → Groceries  
- "Restaurant", "Lunch", "Dinner", "Café", "Coffee", "Pizza", "Burger" → Dining
- "Gas", "Bus", "Uber", "Taxi", "Train", "Fuel", "Parking" → Transportation
- "Electricity", "Water", "Internet", "Phone Bill", "Gas Bill" → Utilities
- "Movie", "Concert", "Game", "Book", "Theater" → Entertainment
- "Doctor", "Medicine", "Hospital", "Pharmacy", "Health" → Healthcare
- Unclear/Other → Other

EXAMPLES:
- User: "I bought an iPhone for 75k" → Call add_expense(title="iPhone", amount=75000, category="Shopping")
- User: "Set $500 budget for groceries" → Call set_budget(category="Groceries", amount=500)
- User: "Show budget status" → Call get_budget_status()
- User: "Analyze my spending" → Call get_spending_insights(from="2026-03-01", to="2026-03-31", metric="category-breakdown")
                `
            },
            ...state.messages
        ]);

        return { messages: [response] }
    }


    function shouldContinue(state: typeof MessagesAnnotation.State, config: LangGraphRunnableConfig) {
        const messages = state.messages;
        const lastMessage = messages.at(-1) as AIMessage;

        if(lastMessage.tool_calls?.length){
            // send custom event
            const customMessage: StreamMessage = {
                type: "toolCall:start",
                payload: {
                    name: lastMessage.tool_calls[0]!.name,
                    args: lastMessage.tool_calls[0]!.args
                }
            }
            config.writer!(customMessage)
            return "tools";
        }
        return "__end__";
    }
    function shouldCallModel(state: typeof MessagesAnnotation.State) {
        const lastMessage = state.messages[state.messages.length - 1] as ToolMessage;

        const message = JSON.parse(lastMessage.content as string);
        // Terminal response types that should end the chain
        const terminalTypes = ["chart", "budget-status", "insights"];
        if(terminalTypes.includes(message.type)) {
            return "__end__"
        }
        return "callModel"
    }

    /**
     * Graph
     */

    const graph = new StateGraph(MessagesAnnotation)
        .addNode('callModel', callModel)
        .addNode('tools', toolnode)
        .addEdge("__start__", 'callModel')
        .addConditionalEdges("callModel", shouldContinue, {
            "__end__": "__end__",
            "tools": "tools"
        })
        .addConditionalEdges("tools", shouldCallModel, {
            "callModel": "callModel",
            "__end__": "__end__"
        });

    return graph.compile({ checkpointer: new MemorySaver() });
}
