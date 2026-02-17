/**
 * Vendor Risk Distribution Chart
 * Displays vendor risk score distribution
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface VendorRiskChartProps {
  data: Array<{
    riskRange: string;
    count: number;
  }>;
  className?: string;
}

export function VendorRiskChart({ data, className = '' }: VendorRiskChartProps) {
  const chartConfig = {
    count: {
      label: 'Vendors',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Vendor Risk Distribution</CardTitle>
        <CardDescription>Risk score distribution across vendors</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="riskRange" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill={chartConfig.count.color} name="Vendor Count" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

