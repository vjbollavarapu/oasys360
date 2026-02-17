/**
 * Balance History Chart Component
 * Displays historical balance trends over time
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

interface BalanceHistoryChartProps {
  data: Array<{
    date: string;
    fiat: number;
    crypto: number;
    total: number;
  }>;
  className?: string;
}

export function BalanceHistoryChart({ data, className = '' }: BalanceHistoryChartProps) {
  const chartConfig = {
    fiat: {
      label: 'Fiat Assets',
      color: 'hsl(var(--chart-1))',
    },
    crypto: {
      label: 'Crypto Assets',
      color: 'hsl(var(--chart-2))',
    },
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Balance History</CardTitle>
        <CardDescription>30-day balance trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="fiat" 
              stroke={chartConfig.fiat.color}
              strokeWidth={2}
              name={chartConfig.fiat.label}
            />
            <Line 
              type="monotone" 
              dataKey="crypto" 
              stroke={chartConfig.crypto.color}
              strokeWidth={2}
              name={chartConfig.crypto.label}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke={chartConfig.total.color}
              strokeWidth={3}
              name={chartConfig.total.label}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

