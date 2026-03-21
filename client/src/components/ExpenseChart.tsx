import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartConfig = {
  amount: {
    label: "Amount",
    color: "#2563eb",
  }
} satisfies ChartConfig

interface ChartElement {
    [key: string]: string | number;
    labelKey: string;
}

export function ExpenseChart({ chartData, labelKey } : { chartData : ChartElement[], labelKey: string }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <ChartTooltip content={<ChartTooltipContent />} cursor={true} contentStyle={{backgroundColor: "#000"}}/>
        <XAxis
            dataKey={labelKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 30)}
        />
        <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
