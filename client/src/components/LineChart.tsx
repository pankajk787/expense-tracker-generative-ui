import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Line, LineChart as RechartsLineChart, CartesianGrid, XAxis, YAxis } from "recharts"

interface LineChartItem {
  week?: string;
  month?: string;
  date?: string;
  total_spent?: number;
  amount?: number;
  expense_count?: number;
  [key: string]: string | number | undefined;
}

const chartConfig = {
  total_spent: {
    label: "Total Spent",
    color: "#3b82f6",
  },
  amount: {
    label: "Amount",
    color: "#3b82f6",
  }
} satisfies ChartConfig

export function LineChart({ data, metric }: { data: LineChartItem[], metric?: string }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Determine which data key to use based on metric or data structure
  const dataKey = data[0]?.total_spent !== undefined ? "total_spent" : "amount";
  const timeKey = data[0]?.week ? "week" : data[0]?.month ? "month" : "date";

  return (
    <ChartContainer config={chartConfig} className="w-full h-[300px] sm:h-[350px] md:h-[400px]">
      <RechartsLineChart accessibilityLayer data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid vertical={false} />
        <ChartTooltip
          content={<ChartTooltipContent />}
          cursor={true}
          contentStyle={{ backgroundColor: "#000" }}
        />
        <XAxis
          dataKey={timeKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => {
            if (typeof value === "string") {
              return value.slice(0, 15);
            }
            return String(value);
          }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="var(--color-total_spent)"
          strokeWidth={2}
          dot={{ fill: "var(--color-total_spent)", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </RechartsLineChart>
    </ChartContainer>
  );
}
