import { TrendAreaChart, type TrendSeriesPoint } from "./TrendAreaChart";

type BalanceTrendChartProps = {
  points: TrendSeriesPoint[];
  expenseLed?: boolean;
  className?: string;
};

export function BalanceTrendChart({
  points,
  expenseLed = false,
  className = "w-full",
}: BalanceTrendChartProps) {
  return (
    <TrendAreaChart
      points={points}
      expenseLed={expenseLed}
      signed
      height={168}
      className={className}
    />
  );
}
