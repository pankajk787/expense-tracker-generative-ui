import { useState } from "react";
import type { Message } from "../main.types";
import { ExpenseChart } from "./ExpenseChart";
import { BudgetStatus } from "./BudgetStatus";
import { PieChart } from "./PieChart";
import { LineChart } from "./LineChart";


const ChatMessage = ({ message }: { message: Message}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isUser = message.type === 'user';
  const isToolCall = message.type === 'toolCall:start';
  const isTool = message.type === 'tool';

  if (isToolCall) {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg rounded-bl-none w-full border border-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <p className="text-sm font-medium">Tool Call Started</p>
          </div>
          {message.payload && Object.keys(message.payload).length > 0 && (
            <p className="text-xs text-slate-300 mt-2">
              {JSON.stringify(message.payload, null, 2)}
            </p>
          )}
        </div>
      </div>
    );
  }

  
  if (isTool) {
    console.log("Message:", message)
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-start mb-4">
          <div className="bg-emerald-700 text-emerald-50 px-4 py-3 rounded-lg rounded-bl-none w-full border border-emerald-600">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full hover:opacity-80 transition"
            >
              <span className="text-sm font-medium">
                ✓ Tool Result: <span className="font-semibold">{message.payload.name}</span>
              </span>
              <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && message.payload.result && (
              <div className="mt-3">
                <p className="text-xs text-emerald-100 bg-black/30 p-2 rounded overflow-x-auto">
                  <pre>{JSON.stringify(message.payload.result, null, 2)}</pre>
                </p>
              </div>
            )}
          </div>
        </div>
        {
          message.payload.name === "generate_expense_chart" && 
          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-full p-4 border-slate-700 border rounded-lg bg-slate-800/40">
              {message.payload.result.data && message.payload.result.data.length > 0 ? (
                <ExpenseChart 
                  chartData={message.payload.result.data } 
                  labelKey={message.payload.result.labelKey} 
                />
              ) : (
                <div className="flex items-center justify-center py-12">
                  <p className="text-slate-400 text-center">
                    {(() => {
                      const args = message.payload.result.args || {};
                      const groupBy = args.groupBy || "expense";
                      const from = args.from ? new Date(args.from).toLocaleDateString() : "the selected period";
                      const to = args.to ? new Date(args.to).toLocaleDateString() : "now";
                      
                      return `No ${groupBy} expense data found between ${from} and ${to}`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        }
        {
          message.payload.name === "get_budget_status" && 
          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-full border-slate-700 border rounded-lg bg-slate-800/40">
              {message.payload.result.data && message.payload.result.data.length > 0 ? (
                <BudgetStatus data={message.payload.result.data} period={message.payload.result.period} />
              ) : (
                <div className="flex items-center justify-center py-12 px-4">
                  <p className="text-slate-400 text-center">
                    No budgets set yet. Use the chat to set a budget for a category.
                  </p>
                </div>
              )}
            </div>
          </div>
        }
        {
          message.payload.name === "get_spending_insights" && 
          <div className="mt-4 w-full overflow-x-auto">
            <div className="min-w-full p-4 border-slate-700 border rounded-lg bg-slate-800/40">
              {message.payload.result.data && message.payload.result.data.length > 0 ? (
                <>
                  <h3 className="text-sm font-semibold text-slate-200 mb-4">
                    {message.payload.result.metric === "highest-spending" && "Top Spending Categories"}
                    {message.payload.result.metric === "category-breakdown" && "Spending Breakdown by Category"}
                    {message.payload.result.metric === "trends" && "Weekly Spending Trends"}
                  </h3>
                  {message.payload.result.metric === "category-breakdown" ? (
                    <PieChart data={message.payload.result.data} />
                  ) : message.payload.result.metric === "trends" ? (
                    <LineChart data={message.payload.result.data} metric={message.payload.result.metric} />
                  ) : (
                    <div className="space-y-2">
                      {message.payload.result.data.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: item.color || "#6b7280" }}
                            />
                            <span className="text-sm font-medium text-white">{item.category}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-200">₹{item.total_spent?.toFixed(2) || "0.00"}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-12 px-4">
                  <p className="text-slate-400 text-center">
                    No spending data available for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        }
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none w-[80%] ml-auto shadow-lg'
            : 'bg-slate-700 text-slate-100 rounded-bl-none w-full'
        }`}
      >
        {
          message.payload.text && 
          <div>
            <p className="text-xs text-slate-300 mb-2">{isUser ? "You": "Assisstant"}</p>
            <p className="text-sm">{message.payload.text}</p>
          </div>
        }
        {/* {message.payload.text && <p className="text-sm">{message.payload.text}</p>} */}
        {/* <p className="text-sm">{message.payload.}</p> */}
      </div>
    </div>
  );
};

export default ChatMessage
