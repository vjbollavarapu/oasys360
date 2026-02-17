/**
 * AI Forecasting Engine Component
 * Provides AI-powered financial forecasting and predictions
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  BarChart3, 
  PieChart,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  Settings,
  Calendar,
  DollarSign,
  Target,
  Zap,
  Activity,
  LineChart,
  ArrowUp,
  ArrowDown,
  Minus,
  Play,
  Pause,
  Square,
  Filter,
  Search
} from 'lucide-react';
import { aiProcessingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const forecastConfigSchema = z.object({
  name: z.string().min(1, 'Forecast name is required'),
  type: z.string().min(1, 'Forecast type is required'),
  period: z.string().min(1, 'Period is required'),
  confidence: z.number().min(0).max(100).default(85),
  includeSeasonality: z.boolean().default(true),
  includeTrend: z.boolean().default(true),
  includeExternalFactors: z.boolean().default(false),
  description: z.string().optional(),
});

type ForecastConfigFormData = z.infer<typeof forecastConfigSchema>;

interface Forecast {
  id: string;
  name: string;
  type: string;
  period: string;
  confidence: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  results: {
    predictions: {
      date: string;
      value: number;
      confidence: number;
      trend: 'up' | 'down' | 'stable';
    }[];
    accuracy: number;
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    insights: string[];
    recommendations: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface ForecastMetric {
  name: string;
  current: number;
  predicted: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
}

interface AIForecastingProps {
  className?: string;
}

export function AIForecasting({ className = '' }: AIForecastingProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [metrics, setMetrics] = useState<ForecastMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ForecastConfigFormData>({
    resolver: zodResolver(forecastConfigSchema),
    defaultValues: {
      name: '',
      type: '',
      period: '',
      confidence: 85,
      includeSeasonality: true,
      includeTrend: true,
      includeExternalFactors: false,
      description: '',
    },
  });

  // Forecast types
  const forecastTypes = [
    { value: 'revenue', label: 'Revenue Forecast', icon: TrendingUp },
    { value: 'expenses', label: 'Expense Forecast', icon: TrendingDown },
    { value: 'cash_flow', label: 'Cash Flow Forecast', icon: Activity },
    { value: 'profit', label: 'Profit Forecast', icon: DollarSign },
    { value: 'customer_growth', label: 'Customer Growth', icon: Target },
    { value: 'inventory', label: 'Inventory Forecast', icon: BarChart3 },
  ];

  // Forecast periods
  const forecastPeriods = [
    { value: '1_month', label: '1 Month' },
    { value: '3_months', label: '3 Months' },
    { value: '6_months', label: '6 Months' },
    { value: '1_year', label: '1 Year' },
    { value: '2_years', label: '2 Years' },
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load available forecasting models
      const modelsResponse = await aiProcessingService.getForecastingModels();
      if (modelsResponse.success && modelsResponse.data) {
        // Store models for use in forecast generation
        // Note: Backend doesn't have a forecasts list endpoint, so forecasts array stays empty
      }
      
      // Note: Backend doesn't have forecast list/metrics endpoints yet
      // These will be implemented when backend adds forecast storage
      setForecasts([]);
      setMetrics({});
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle forecast generation
  const handleGenerateForecast = async (data: ForecastConfigFormData) => {
    setIsGenerating(true);
    
    try {
      // Transform form data to match backend API
      const forecastPayload = {
        forecast_type: data.type,
        time_series_data: [], // User should provide this or fetch from transactions
        periods: parseInt(data.period) || 12,
        frequency: 'monthly', // Could be derived from period selection
        model_name: data.name,
      };

      const response = await aiProcessingService.forecastFinancials(forecastPayload);
      
      if (response.success) {
        // Display results in a dialog
        setSelectedForecast({
          id: 'new',
          name: data.name,
          type: data.type,
          period: data.period,
          confidence: data.confidence,
          status: 'completed',
          results: response.data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: { id: 'current', name: 'Current User' },
        });
        setShowResultsDialog(true);
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to generate forecast'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AIForecasting',
        action: 'generateForecast',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle view results
  const handleViewResults = (forecast: Forecast) => {
    setSelectedForecast(forecast);
    setShowResultsDialog(true);
  };

  // Handle export forecast
  const handleExportForecast = async (forecast: Forecast) => {
    try {
      const response = await aiProcessingService.exportForecast(forecast.id);
      
      if (response.success && response.data) {
        // Create download link
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `forecast-${forecast.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      handleError(error, {
        component: 'AIForecasting',
        action: 'exportForecast',
      });
    }
  };

  // Filter forecasts
  const filteredForecasts = forecasts.filter(forecast => {
    const matchesSearch = !searchTerm || 
      forecast.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || forecast.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return ArrowUp;
      case 'down':
        return ArrowDown;
      default:
        return Minus;
    }
  };

  // Get trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin" />
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
          <h2 className="text-2xl font-bold">AI Forecasting Engine</h2>
          <p className="text-muted-foreground">
            Generate AI-powered financial forecasts and predictions
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="GENERATE_FORECAST">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Forecast
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Generate AI Forecast</DialogTitle>
                  <DialogDescription>
                    Create a new AI-powered financial forecast
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleGenerateForecast)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Forecast Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="e.g., Q1 2024 Revenue Forecast"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Forecast Type *</Label>
                      <Select onValueChange={(value) => setValue('type', value)}>
                        <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select forecast type" />
                        </SelectTrigger>
                        <SelectContent>
                          {forecastTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center space-x-2">
                                <type.icon className="w-4 h-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-destructive">{errors.type.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="period">Forecast Period *</Label>
                      <Select onValueChange={(value) => setValue('period', value)}>
                        <SelectTrigger className={errors.period ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {forecastPeriods.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.period && (
                        <p className="text-sm text-destructive">{errors.period.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confidence">Confidence Level</Label>
                    <Input
                      id="confidence"
                      type="number"
                      min="0"
                      max="100"
                      {...register('confidence', { valueAsNumber: true })}
                      className={errors.confidence ? 'border-destructive' : ''}
                    />
                    {errors.confidence && (
                      <p className="text-sm text-destructive">{errors.confidence.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Forecast description and notes"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Generate Forecast
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {React.createElement(getTrendIcon(metric.trend), { 
                className: `h-4 w-4 ${getTrendColor(metric.trend)}` 
              })}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metric.current)}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span>Predicted: {formatCurrency(metric.predicted)}</span>
                <span className={getTrendColor(metric.trend)}>
                  {formatPercentage(metric.changePercent)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search forecasts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {forecastTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="forecasts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="space-y-6">
          {/* Forecasts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Forecast Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForecasts.map((forecast) => (
                    <TableRow key={forecast.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{forecast.name}</div>
                          {forecast.description && (
                            <div className="text-sm text-muted-foreground">{forecast.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {forecastTypes.find(t => t.value === forecast.type)?.label || forecast.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {forecastPeriods.find(p => p.value === forecast.period)?.label || forecast.period}
                        </span>
                      </TableCell>
                      <TableCell>
                        {forecast.status === 'completed' ? (
                          <Badge variant="default">
                            {forecast.results.accuracy.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(forecast.status)}>
                          {forecast.status.charAt(0).toUpperCase() + forecast.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(forecast.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {forecast.status === 'completed' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewResults(forecast)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleExportForecast(forecast)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  AI-generated insights from your financial data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Revenue Growth Trend</div>
                      <div className="text-sm text-muted-foreground">
                        Your revenue is showing a positive growth trend of 12% month-over-month.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Expense Alert</div>
                      <div className="text-sm text-muted-foreground">
                        Operating expenses have increased by 8% this quarter. Consider reviewing cost optimization opportunities.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Target className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Cash Flow Prediction</div>
                      <div className="text-sm text-muted-foreground">
                        Based on current trends, you should maintain positive cash flow for the next 6 months.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  AI-powered recommendations for your business
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Optimize Inventory</div>
                      <div className="text-sm text-muted-foreground">
                        Consider reducing inventory levels by 15% to improve cash flow.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Expand Marketing</div>
                      <div className="text-sm text-muted-foreground">
                        Increase marketing budget by 20% to capitalize on growth opportunities.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Diversify Revenue</div>
                      <div className="text-sm text-muted-foreground">
                        Explore new revenue streams to reduce dependency on current sources.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Dialog */}
      {selectedForecast && (
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Forecast Results: {selectedForecast.name}</DialogTitle>
              <DialogDescription>
                AI-generated forecast analysis and predictions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Forecast Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedForecast.results.accuracy.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">MAPE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedForecast.results.mape.toFixed(1)}%</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">RMSE</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(selectedForecast.results.rmse)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Predictions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Forecast Predictions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Predicted Value</TableHead>
                        <TableHead>Confidence</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedForecast.results.predictions.map((prediction, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(prediction.date)}</TableCell>
                          <TableCell className="font-mono">{formatCurrency(prediction.value)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {prediction.confidence.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {React.createElement(getTrendIcon(prediction.trend), { 
                                className: `w-4 h-4 ${getTrendColor(prediction.trend)}` 
                              })}
                              <span className="capitalize">{prediction.trend}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Insights and Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedForecast.results.insights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedForecast.results.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                          <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span className="text-sm">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AIForecasting;
