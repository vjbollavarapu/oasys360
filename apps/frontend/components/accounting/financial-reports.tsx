/**
 * Financial Reports Component
 * Generates and displays financial reports
 */

"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCw,
  AlertCircle,
  Eye,
  Printer
} from 'lucide-react';
import { accountingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const reportSchema = z.object({
  reportType: z.string().min(1, 'Report type is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  format: z.string().default('pdf'),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportData {
  title: string;
  period: string;
  generatedAt: string;
  data: any;
}

interface FinancialReportsProps {
  className?: string;
}

export function FinancialReports({ className = '' }: FinancialReportsProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string>('trial-balance');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: 'trial-balance',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      format: 'pdf',
    },
  });

  // Report types
  const reportTypes = [
    { value: 'trial-balance', label: 'Trial Balance', icon: BarChart3 },
    { value: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp },
    { value: 'balance-sheet', label: 'Balance Sheet', icon: PieChart },
    { value: 'cash-flow', label: 'Cash Flow', icon: DollarSign },
  ];

  // Generate report
  const generateReport = async (data: ReportFormData) => {
    setLoading(true);
    
    try {
      let response;
      switch (data.reportType) {
        case 'trial-balance':
          response = await accountingService.getTrialBalance({
            startDate: data.startDate,
            endDate: data.endDate,
          });
          break;
        case 'profit-loss':
          response = await accountingService.getProfitLoss({
            startDate: data.startDate,
            endDate: data.endDate,
          });
          break;
        case 'balance-sheet':
          response = await accountingService.getBalanceSheet({
            asOfDate: data.endDate,
          });
          break;
        case 'cash-flow':
          response = await accountingService.getCashFlow({
            startDate: data.startDate,
            endDate: data.endDate,
          });
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      if (response.success && response.data) {
        setReportData({
          title: reportTypes.find(r => r.value === data.reportType)?.label || 'Report',
          period: `${data.startDate} to ${data.endDate}`,
          generatedAt: new Date().toISOString(),
          data: response.data,
        });
        setActiveReport(data.reportType);
      } else {
        handleError(new Error(response.message || 'Failed to generate report'));
      }
    } catch (error) {
      handleError(error, {
        component: 'FinancialReports',
        action: 'generateReport',
      });
    } finally {
      setLoading(false);
    }
  };

  // Export report
  const exportReport = async (format: string) => {
    if (!reportData) return;
    
    try {
      const response = await accountingService.exportReport({
        reportType: activeReport,
        format,
        startDate: watch('startDate'),
        endDate: watch('endDate'),
      });
      
      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: `application/${format}` });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportData.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      handleError(error, {
        component: 'FinancialReports',
        action: 'exportReport',
      });
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render Trial Balance
  const renderTrialBalance = (data: any) => {
    if (!data.accounts) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(data.totalDebits)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(data.totalCredits)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Difference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(data.difference)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.accounts.map((account: any) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell className="text-right">
                      {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Profit & Loss
  const renderProfitLoss = (data: any) => {
    if (!data.sections) return null;
    
    return (
      <div className="space-y-4">
        {data.sections.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.accounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(account.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell>Total {section.title}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(section.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Net Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netIncome)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Balance Sheet
  const renderBalanceSheet = (data: any) => {
    if (!data.sections) return null;
    
    return (
      <div className="space-y-4">
        {data.sections.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.accounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(account.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell>Total {section.title}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(section.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Total Assets = Total Liabilities + Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Assets</div>
                <div className="text-2xl font-bold">{formatCurrency(data.totalAssets)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Liabilities + Equity</div>
                <div className="text-2xl font-bold">{formatCurrency(data.totalLiabilitiesEquity)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render Cash Flow
  const renderCashFlow = (data: any) => {
    if (!data.sections) return null;
    
    return (
      <div className="space-y-4">
        {data.sections.map((section: any, index: number) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.items.map((item: any, itemIndex: number) => (
                    <TableRow key={itemIndex}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell>Net {section.title}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(section.total)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Net Change in Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${data.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netChange)}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render report content
  const renderReportContent = () => {
    if (!reportData) return null;
    
    switch (activeReport) {
      case 'trial-balance':
        return renderTrialBalance(reportData.data);
      case 'profit-loss':
        return renderProfitLoss(reportData.data);
      case 'balance-sheet':
        return renderBalanceSheet(reportData.data);
      case 'cash-flow':
        return renderCashFlow(reportData.data);
      default:
        return null;
    }
  };

  if (!hasPermission(PERMISSIONS.VIEW_FINANCIAL_REPORTS)) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view financial reports.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Financial Reports</h2>
          <p className="text-muted-foreground">
            Generate and view financial reports
          </p>
        </div>
      </div>

      <Tabs value={activeReport} onValueChange={setActiveReport} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {reportTypes.map((report) => (
            <TabsTrigger key={report.value} value={report.value} className="flex items-center gap-2">
              <report.icon className="w-4 h-4" />
              {report.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTypes.map((report) => (
          <TabsContent key={report.value} value={report.value} className="space-y-6">
            {/* Report Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <report.icon className="w-5 h-5" />
                  {report.label} Report
                </CardTitle>
                <CardDescription>
                  Configure report parameters and generate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(generateReport)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate')}
                        className={errors.startDate ? 'border-destructive' : ''}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                        className={errors.endDate ? 'border-destructive' : ''}
                      />
                      {errors.endDate && (
                        <p className="text-sm text-destructive">{errors.endDate.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="format">Export Format</Label>
                      <Select value={watch('format')} onValueChange={(value) => setValue('format', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Report
                        </>
                      )}
                    </Button>
                    
                    {reportData && (
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => exportReport('pdf')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => exportReport('excel')}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Excel
                        </Button>
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Report Results */}
            {reportData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{reportData.title}</CardTitle>
                      <CardDescription>
                        Period: {reportData.period} | Generated: {new Date(reportData.generatedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {renderReportContent()}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default FinancialReports;
