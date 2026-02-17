/**
 * Unified Treasury Dashboard Component
 * Aggregates fiat and crypto balances in one view
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { treasuryService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface TreasuryDashboardProps {
  className?: string;
}

export function TreasuryDashboard({ className = '' }: TreasuryDashboardProps) {
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [balances, setBalances] = useState<any>(null);
  const [historical, setHistorical] = useState<any>(null);
  const [runway, setRunway] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      const [balancesResponse, historicalResponse, runwayResponse] = await Promise.all([
        treasuryService.getUnifiedBalances(),
        treasuryService.getHistoricalBalances({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          interval: 'day',
        }),
        treasuryService.getRunway(),
      ]);
      
      if (balancesResponse.success) {
        setBalances(balancesResponse.data);
      }
      if (historicalResponse.success) {
        setHistorical(historicalResponse.data);
      }
      if (runwayResponse.success) {
        setRunway(runwayResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treasury Dashboard</h1>
          <p className="text-muted-foreground">
            Unified view of fiat and crypto assets
          </p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
          <CardDescription>Combined fiat and crypto assets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-6">
            {formatCurrency(balances?.total_usd_value || 0)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-muted-foreground">Fiat Assets</p>
              </div>
              <p className="text-xl font-semibold">{formatCurrency(balances?.fiat_total || 0)}</p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                  <Coins className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-sm text-muted-foreground">Crypto Assets</p>
              </div>
              <p className="text-xl font-semibold">{formatCurrency(balances?.crypto_total_usd || 0)}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  {(balances?.net_change_30d || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Net Change (30d)</p>
              </div>
              <p className={`text-xl font-semibold ${(balances?.net_change_30d || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(balances?.net_change_30d || 0) >= 0 ? '+' : ''}{formatCurrency(balances?.net_change_30d || 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-sm text-muted-foreground">Runway</p>
              </div>
              <p className="text-xl font-semibold">
                {runway?.months || 0} months
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Assets</TabsTrigger>
          <TabsTrigger value="crypto">Crypto Assets</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Asset Breakdown */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Asset Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {balances?.assets?.map((asset: any) => (
                    <div key={asset.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full">{asset.type}</Badge>
                        <div>
                          <p className="text-sm font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.network || asset.currency}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{formatCurrency(asset.usd_value, 'USD')}</p>
                        <p className="text-xs text-muted-foreground">
                          {asset.balance} {asset.symbol}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Network Breakdown */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                    <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Network Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {balances?.networks?.map((network: any) => (
                    <div key={network.name} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center gap-3">
                        <Badge className="rounded-full">{network.name}</Badge>
                        <div>
                          <p className="text-sm font-medium">{network.total_usd_value}</p>
                          <p className="text-xs text-muted-foreground">{network.asset_count} assets</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fiat">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Fiat Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances?.fiat_balances?.map((balance: any) => (
                  <div key={balance.currency} className="flex items-center justify-between p-4 border rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">{balance.currency}</p>
                        <p className="text-sm text-muted-foreground">{balance.account_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(balance.balance, balance.currency)}</p>
                      <p className="text-sm text-muted-foreground">USD: {formatCurrency(balance.usd_value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="crypto">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Crypto Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances?.crypto_balances?.map((balance: any) => (
                  <div key={balance.id} className="flex items-center justify-between p-4 border rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                        <Coins className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">{balance.symbol}</p>
                        <p className="text-sm text-muted-foreground">{balance.network}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(balance.usd_value)}</p>
                      <p className="text-sm text-muted-foreground">
                        {balance.balance} {balance.symbol}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historical">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Historical Balance</CardTitle>
              <CardDescription>Balance trends over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Historical chart will be displayed here
                {/* TODO: Add chart component */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

