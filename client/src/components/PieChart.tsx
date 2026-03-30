import { PieChart as RechartsPie, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface PieChartItem {
  category: string;
  color: string;
  amount: number;
  percentage?: number;
}

export function PieChart({ data }: { data: PieChartItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>  {/* ✅ PieChart wrapper — no data prop here */}
          <Pie
            data={data}  // {/* ✅ data goes on <Pie>, not on <RechartsPie> */}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ category, percentage }) => `${category}: ${percentage ?? 0}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
            formatter={(value: any) => `₹${value?.toFixed(2) ?? "0.00"}`}
            labelStyle={{ color: "#fff" }}
          />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}