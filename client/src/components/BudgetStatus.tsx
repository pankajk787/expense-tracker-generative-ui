interface BudgetItem {
  category: string;
  color: string;
  budgeted: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  period_start?: string;
  period_end?: string;
}

export function BudgetStatus({ data, period }: { data: BudgetItem[], period?: string }) {
  return (
    <div className="w-full space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Budget Status</h3>
        {period && (
          <span className="text-xs bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full">
            📅 {period}
          </span>
        )}
      </div>
      {data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: item.color || "#6b7280" }}
                  />
                  <span className="font-semibold text-sm">{item.category}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(item.percentUsed)}% used
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `₹{Math.min(item.percentUsed, 100)}%`,
                    backgroundColor:
                      item.percentUsed > 100
                        ? "#ef4444"
                        : item.percentUsed > 75
                          ? "#f59e0b"
                          : "#10b981",
                  }}
                />
              </div>

              {/* Budget details */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Budgeted:</span>
                  <div className="font-semibold">₹{item.budgeted?.toFixed(2) || "0.00"}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Spent:</span>
                  <div className="font-semibold">₹{item.spent?.toFixed(2) || "0.00"}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Remaining:</span>
                  <div
                    className={`font-semibold ${
                      item.remaining < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ₹{item.remaining?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No budgets set. Use the chat to set a budget for a category.</p>
      )}
    </div>
  );
}
