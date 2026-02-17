/**
 * Fiscal Year Component
 * Manages fiscal years and periods
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { formatCurrency } from '@/lib/utils';

interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "open" | "closed" | "locked";
  periods: FiscalPeriod[];
  totalRevenue?: number;
  totalExpenses?: number;
  netIncome?: number;
  isCurrent: boolean;
}

interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "open" | "closed" | "locked";
  revenue?: number;
  expenses?: number;
  netIncome?: number;
  isCurrent: boolean;
}

export function FiscalYearOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<FiscalYear | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Load fiscal years
  // TODO: Replace with actual API call when backend endpoint is available
  const loadFiscalYears = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      // Mock data for now - replace with API call
      // const response = await accountingService.getFiscalYears();
      // if (response.success && response.data) {
      //   setFiscalYears(response.data);
      // }

  // Mock data
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const mockYears: FiscalYear[] = [
      {
        id: "1",
          name: `FY ${currentYear}`,
          startDate: `${currentYear}-01-01`,
          endDate: `${currentYear}-12-31`,
        status: "open",
        isCurrent: true,
        totalRevenue: 1250000,
        totalExpenses: 850000,
        netIncome: 400000,
        periods: [
          {
            id: "1-1",
              name: `Q1 ${currentYear}`,
              startDate: `${currentYear}-01-01`,
              endDate: `${currentYear}-03-31`,
            status: "closed",
            isCurrent: false,
            revenue: 300000,
            expenses: 200000,
              netIncome: 100000,
          },
          {
            id: "1-2",
              name: `Q2 ${currentYear}`,
              startDate: `${currentYear}-04-01`,
              endDate: `${currentYear}-06-30`,
            status: "closed",
            isCurrent: false,
              revenue: 320000,
              expenses: 210000,
              netIncome: 110000,
          },
          {
            id: "1-3",
              name: `Q3 ${currentYear}`,
              startDate: `${currentYear}-07-01`,
              endDate: `${currentYear}-09-30`,
            status: "open",
            isCurrent: true,
              revenue: 310000,
              expenses: 220000,
              netIncome: 90000,
          },
          {
            id: "1-4",
              name: `Q4 ${currentYear}`,
              startDate: `${currentYear}-10-01`,
              endDate: `${currentYear}-12-31`,
            status: "open",
            isCurrent: false,
              revenue: 320000,
              expenses: 220000,
              netIncome: 100000,
            },
          ],
      },
      {
        id: "2",
          name: `FY ${currentYear - 1}`,
          startDate: `${currentYear - 1}-01-01`,
          endDate: `${currentYear - 1}-12-31`,
        status: "closed",
        isCurrent: false,
          totalRevenue: 1100000,
          totalExpenses: 750000,
          netIncome: 350000,
          periods: [],
        },
      ];
      setFiscalYears(mockYears);
      if (mockYears.length > 0 && !selectedYear) {
        setSelectedYear(mockYears.find(y => y.isCurrent) || mockYears[0]);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadFiscalYears();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Open</Badge>;
      case "closed":
        return <Badge className="rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">Closed</Badge>;
      case "locked":
        return <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Locked</Badge>;
      default:
        return <Badge className="rounded-full">Unknown</Badge>;
    }
  };

  const currentYear = fiscalYears.find(y => y.isCurrent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiscal Year Management</h1>
          <p className="text-muted-foreground">
            Manage fiscal years, periods, and year-end closing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={loadFiscalYears}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Fiscal Year
          </Button>
        </div>
      </div>

      {/* Current Year Summary */}
          {currentYear && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(currentYear.totalRevenue || 0)}</div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
              <p className="text-xs text-muted-foreground mt-2">Year-to-date</p>
            </CardContent>
          </Card>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{formatCurrency(currentYear.totalExpenses || 0)}</div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
              <p className="text-xs text-muted-foreground mt-2">Year-to-date</p>
            </CardContent>
          </Card>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className={`text-2xl font-bold ${
                  (currentYear.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(currentYear.netIncome || 0)}
                    </div>
                <div className={`p-3 rounded-2xl ${
                  (currentYear.netIncome || 0) >= 0 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  <DollarSign className={`w-6 h-6 ${
                    (currentYear.netIncome || 0) >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Year-to-date</p>
              </CardContent>
            </Card>
        </div>
      )}

      {/* Fiscal Years List */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                <CardHeader>
          <CardTitle>Fiscal Years</CardTitle>
          <CardDescription>View and manage all fiscal years</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
          ) : fiscalYears.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No fiscal years found</p>
                        <Button 
                          variant="outline" 
                className="mt-4 rounded-full"
                onClick={() => setIsCreateOpen(true)}
                        >
                <Plus className="w-4 h-4 mr-2" />
                Create First Fiscal Year
                        </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fiscalYears.map((year) => (
                <Card 
                  key={year.id} 
                  className={`rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    year.isCurrent ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedYear(year)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{year.name}</h3>
                          {year.isCurrent && (
                            <Badge className="rounded-full bg-primary text-primary-foreground">Current</Badge>
                          )}
                          {getStatusBadge(year.status)}
                    </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                            <span className="text-muted-foreground">Start:</span>
                            <span className="ml-2 font-medium">
                              {new Date(year.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                            <span className="text-muted-foreground">End:</span>
                            <span className="ml-2 font-medium">
                              {new Date(year.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                        {year.totalRevenue !== undefined && (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="ml-2 font-medium text-green-600">
                                {formatCurrency(year.totalRevenue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Expenses:</span>
                              <span className="ml-2 font-medium text-red-600">
                                {formatCurrency(year.totalExpenses || 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Net Income:</span>
                              <span className={`ml-2 font-medium ${
                                (year.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatCurrency(year.netIncome || 0)}
                              </span>
                            </div>
                          </div>
                        )}

                        {year.periods && year.periods.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-muted-foreground mb-2">Periods: {year.periods.length}</p>
                            <div className="flex flex-wrap gap-2">
                              {year.periods.map((period) => (
                                <Badge 
                                  key={period.id}
                                  variant="outline"
                                  className="rounded-full text-xs"
                                >
                                  {period.name} {period.isCurrent && '(Current)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        </div>
                      
                        <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="rounded-xl">
                          <Eye className="w-4 h-4" />
                              </Button>
                        {year.status === "open" && (
                          <Button variant="ghost" size="sm" className="rounded-xl">
                            <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        {year.status === "open" && (
                          <Button variant="ghost" size="sm" className="rounded-xl text-orange-600 hover:text-orange-700">
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
            </CardContent>
          </Card>

      {/* Period Details for Selected Year */}
      {selectedYear && selectedYear.periods && selectedYear.periods.length > 0 && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
            <CardTitle>{selectedYear.name} - Periods</CardTitle>
            <CardDescription>Quarterly periods for {selectedYear.name}</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Period</TableHead>
                    <TableHead className="font-semibold">Start Date</TableHead>
                    <TableHead className="font-semibold">End Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Revenue</TableHead>
                    <TableHead className="font-semibold text-right">Expenses</TableHead>
                    <TableHead className="font-semibold text-right">Net Income</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedYear.periods.map((period) => (
                    <TableRow key={period.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {period.name}
                        {period.isCurrent && (
                          <Badge className="ml-2 rounded-full bg-primary text-primary-foreground text-xs">
                            Current
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(period.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(period.endDate).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(period.status)}</TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        {formatCurrency(period.revenue || 0)}
                      </TableCell>
                      <TableCell className="text-right text-red-600 font-medium">
                        {formatCurrency(period.expenses || 0)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        (period.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(period.netIncome || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Eye className="w-4 h-4" />
                </Button>
                          {period.status === "open" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Lock className="w-4 h-4" />
                </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
