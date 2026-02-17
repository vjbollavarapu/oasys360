/**
 * FX Rates Chart Component
 * Displays exchange rate trends over time
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface FxRatesChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  currencies: string[];
  className?: string;
}

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function FxRatesChart({ data, currencies, className = '' }: FxRatesChartProps) {
  const chartConfig = currencies.reduce((acc, currency, index) => {
    acc[currency] = {
      label: currency,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Exchange Rate Trends</CardTitle>
        <CardDescription>Historical exchange rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            {currencies.map((currency, index) => (
              <Line 
                key={currency}
                type="monotone" 
                dataKey={currency} 
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={2}
                name={currency}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

