import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver, MessagesAnnotation, StateGraph, type LangGraphRunnableConfig } from "@langchain/langgraph";
import { initDB } from "./db.ts";
import { initTools } from "./tools.ts";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import type { AIMessage, ToolMessage } from "langchain";
import type { StreamMessage } from "./types.js";

/**
 * Initalize DB
 */
const database = initDB("./expenses.db");

/**
 * Init tools
 */
const tools = initTools(database);

/**
 * Initialize LLM
 */
const llm = new ChatOpenAI({
    model: "gpt-5-mini"
});

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
            Call add_expense tool to add expense into database.
            Call get_expenses tool to get the expenses for a given date range.
            Call generate_expense_chart tool only when user needs to visualize expenses.
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
    if(message.type === "chart") {
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

    export const agent = graph.compile({ checkpointer: new MemorySaver() });

    // async function main() {
    //     const response = await agent.invoke({
    //         messages: [
    //             {
    //                 role: "user",
    //                 content: "Visualize my expenses this year group by date"
    //                 // content: "Bought a Carrier AC worth 30000 on Jan 20 this year"
    //             }
    //         ]
    //     }, { configurable: { thread_id: "1" }});

    //     console.log("Response: ", response)
    // }

    // main()