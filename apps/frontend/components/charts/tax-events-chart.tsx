/**
 * Tax Events Chart Component
 * Displays tax events by type and timeline
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TaxEventsChartProps {
  data: Array<{
    eventType: string;
    amount: number;
    count: number;
  }>;
  className?: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function TaxEventsChart({ data, className = '' }: TaxEventsChartProps) {
  const chartConfig = {
    amount: {
      label: 'Amount',
      color: 'hsl(var(--chart-1))',
    },
    count: {
      label: 'Count',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>Tax Events by Type</CardTitle>
          <CardDescription>Amount distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="eventType" 
                tickFormatter={(value) => value.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="amount" fill={chartConfig.amount.color} name="Amount ($)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Distribution</CardTitle>
          <CardDescription>By event count</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="eventType"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => entry.eventType.replace('_', ' ')}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

