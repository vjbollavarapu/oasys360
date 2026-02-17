/**
 * FX Conversion Component
 * Real-time currency conversion and rate monitoring
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeftRight, 
  RefreshCw, 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
} from 'lucide-react';
import { fxConversionService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface FxConverterProps {
  className?: string;
}

export function FxConverter({ className = '' }: FxConverterProps) {
  const { withErrorHandling } = useErrorHandler();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1');
  const [rate, setRate] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCurrencies = async () => {
    await withErrorHandling(async () => {
      const response = await fxConversionService.getSupportedCurrencies();
      if (response.success) {
        setCurrencies(response.data.currencies || ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'BTC', 'ETH', 'USDC']);
      }
    });
  };

  const loadRate = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await fxConversionService.getExchangeRate(fromCurrency, toCurrency);
      if (response.success) {
        setRate(response.data);
      }
      setLoading(false);
    });
  };

  const convertCurrency = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await fxConversionService.convertCurrency({
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });
      if (response.success) {
        setResult(response.data);
      }
      setLoading(false);
    });
  };

  const loadRates = async () => {
    await withErrorHandling(async () => {
      const response = await fxConversionService.getRates({
        baseCurrency: fromCurrency,
      });
      if (response.success) {
        setRates(response.data.rates || []);
      }
    });
  };

  useEffect(() => {
    loadCurrencies();
    loadRate();
    loadRates();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (rate) {
      convertCurrency();
    }
  }, [amount, rate]);

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FX Conversion</h1>
          <p className="text-muted-foreground">
            Real-time currency conversion and exchange rates
          </p>
        </div>
        <Button variant="outline" className="rounded-full" onClick={loadRate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Rates
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Converter */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <CardTitle>Currency Converter</CardTitle>
            <CardDescription>Convert between currencies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>From</Label>
              <div className="flex gap-2 mt-2">
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
            </div>

            <div>
              <Label>To</Label>
              <div className="flex gap-2 mt-2">
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={result?.convertedAmount || ''}
                  readOnly
                  className="font-bold"
                />
              </div>
            </div>

            {rate && (
              <div className="p-4 bg-muted rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Exchange Rate</span>
                  <span className="text-sm font-mono font-bold">
                    1 {fromCurrency} = {rate.rate} {toCurrency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last updated: {new Date(rate.lastUpdated).toLocaleTimeString()}</span>
                  <span>{rate.provider}</span>
                </div>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <p className="text-sm text-muted-foreground mb-1">Converted Amount</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {result.convertedAmount} {toCurrency}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rates Table */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <CardTitle>Exchange Rates</CardTitle>
            <CardDescription>Current rates for {fromCurrency}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.slice(0, 10).map((rateItem: any) => (
                  <TableRow key={rateItem.currency}>
                    <TableCell className="font-medium">{rateItem.currency}</TableCell>
                    <TableCell>{rateItem.rate.toFixed(4)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {rateItem.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={rateItem.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {rateItem.change24h >= 0 ? '+' : ''}{rateItem.change24h.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

