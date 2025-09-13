/**
 * AI Fraud Detection Component
 * Monitors and detects fraudulent activities using AI
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Flag,
  RefreshCw,
  Settings,
  Bell,
  Lock,
  Unlock,
  Search,
  Filter,
  Calendar,
  DollarSign,
  User,
  MapPin,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Brain,
  AlertCircle,
  FileText,
  CreditCard,
  Building2
} from 'lucide-react';
import { aiProcessingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const fraudRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  conditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.string().min(1, 'Operator is required'),
    value: z.string().min(1, 'Value is required'),
  })).min(1, 'At least one condition is required'),
  action: z.enum(['alert', 'block', 'review', 'log']),
  isActive: z.boolean().default(true),
  notificationEnabled: z.boolean().default(true),
});

type FraudRuleFormData = z.infer<typeof fraudRuleSchema>;

interface FraudAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  riskScore: number;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  transaction?: {
    id: string;
    amount: number;
    description: string;
    date: string;
    account: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  location?: {
    ip: string;
    country: string;
    city: string;
  };
  evidence: string[];
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
  };
}

interface FraudRule {
  id: string;
  name: string;
  description?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  action: 'alert' | 'block' | 'review' | 'log';
  isActive: boolean;
  notificationEnabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface FraudMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  averageRiskScore: number;
  topRiskFactors: {
    factor: string;
    count: number;
    percentage: number;
  }[];
}

interface AIFraudDetectionProps {
  className?: string;
}

export function AIFraudDetection({ className = '' }: AIFraudDetectionProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [metrics, setMetrics] = useState<FraudMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [showCreateRuleDialog, setShowCreateRuleDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FraudRuleFormData>({
    resolver: zodResolver(fraudRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      riskLevel: 'medium',
      conditions: [{ field: 'amount', operator: 'greater_than', value: '' }],
      action: 'alert',
      isActive: true,
      notificationEnabled: true,
    },
  });

  // Available fields for conditions
  const conditionFields = [
    { value: 'amount', label: 'Transaction Amount' },
    { value: 'frequency', label: 'Transaction Frequency' },
    { value: 'location', label: 'Location' },
    { value: 'time', label: 'Time of Day' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'device', label: 'Device' },
    { value: 'ip_address', label: 'IP Address' },
  ];

  // Available operators
  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_equals', label: 'Not equals' },
    { value: 'in_range', label: 'In range' },
    { value: 'regex', label: 'Regex match' },
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load fraud alerts
      const alertsResponse = await aiProcessingService.getFraudAlerts();
      if (alertsResponse.success && alertsResponse.data) {
        setAlerts(alertsResponse.data);
      }
      
      // Load fraud rules
      const rulesResponse = await aiProcessingService.getFraudRules();
      if (rulesResponse.success && rulesResponse.data) {
        setRules(rulesResponse.data);
      }
      
      // Load fraud metrics
      const metricsResponse = await aiProcessingService.getFraudMetrics();
      if (metricsResponse.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle rule creation
  const handleCreateRule = async (data: FraudRuleFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await aiProcessingService.createFraudRule(data);
      
      if (response.success) {
        await loadData();
        setShowCreateRuleDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create fraud rule'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AIFraudDetection',
        action: 'createFraudRule',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle alert resolution
  const handleResolveAlert = async (alertId: string, status: string, notes?: string) => {
    try {
      const response = await aiProcessingService.resolveFraudAlert(alertId, status, notes);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to resolve alert'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AIFraudDetection',
        action: 'resolveFraudAlert',
      });
    }
  };

  // Handle view alert
  const handleViewAlert = (alert: FraudAlert) => {
    setSelectedAlert(alert);
    setShowAlertDialog(true);
  };

  // Add condition
  const addCondition = () => {
    const currentConditions = watch('conditions');
    setValue('conditions', [...currentConditions, { field: 'amount', operator: 'greater_than', value: '' }]);
  };

  // Remove condition
  const removeCondition = (index: number) => {
    const currentConditions = watch('conditions');
    if (currentConditions.length > 1) {
      setValue('conditions', currentConditions.filter((_, i) => i !== index));
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = !searchTerm || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Get severity badge variant
  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'investigating':
        return 'secondary';
      case 'new':
        return 'outline';
      case 'false_positive':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get risk score color
  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <h2 className="text-2xl font-bold">AI Fraud Detection</h2>
          <p className="text-muted-foreground">
            Monitor and detect fraudulent activities using AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_FRAUD_RULE">
            <Dialog open={showCreateRuleDialog} onOpenChange={setShowCreateRuleDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Fraud Detection Rule</DialogTitle>
                  <DialogDescription>
                    Create a new AI-powered fraud detection rule
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateRule)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Rule Name *</Label>
                      <Input
                        id="name"
                        {...register('name')}
                        placeholder="e.g., High Amount Transaction Alert"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="riskLevel">Risk Level *</Label>
                      <Select onValueChange={(value) => setValue('riskLevel', value as any)}>
                        <SelectTrigger className={errors.riskLevel ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.riskLevel && (
                        <p className="text-sm text-destructive">{errors.riskLevel.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Rule description"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Conditions</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addCondition}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Condition
                      </Button>
                    </div>
                    
                    {watch('conditions').map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <Select
                          value={condition.field}
                          onValueChange={(value) => {
                            const conditions = watch('conditions');
                            conditions[index].field = value;
                            setValue('conditions', conditions);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditionFields.map((field) => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={condition.operator}
                          onValueChange={(value) => {
                            const conditions = watch('conditions');
                            conditions[index].operator = value;
                            setValue('conditions', conditions);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {operators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          value={condition.value}
                          onChange={(e) => {
                            const conditions = watch('conditions');
                            conditions[index].value = e.target.value;
                            setValue('conditions', conditions);
                          }}
                          placeholder="Value"
                          className="flex-1"
                        />
                        
                        {watch('conditions').length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCondition(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="action">Action *</Label>
                      <Select onValueChange={(value) => setValue('action', value as any)}>
                        <SelectTrigger className={errors.action ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alert">Alert</SelectItem>
                          <SelectItem value="block">Block</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="log">Log Only</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.action && (
                        <p className="text-sm text-destructive">{errors.action.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={watch('isActive')}
                        onCheckedChange={(checked) => setValue('isActive', checked)}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notificationEnabled"
                        checked={watch('notificationEnabled')}
                        onCheckedChange={(checked) => setValue('notificationEnabled', checked)}
                      />
                      <Label htmlFor="notificationEnabled">Enable Notifications</Label>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateRuleDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-2" />
                          Create Rule
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

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Need immediate attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.resolvedAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Successfully resolved
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Positives</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.falsePositives}</div>
              <p className="text-xs text-muted-foreground">
                Incorrect alerts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Fraud Alerts</TabsTrigger>
          <TabsTrigger value="rules">Detection Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alerts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{alert.title}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className={`font-mono font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                          {alert.riskScore}/100
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.transaction ? (
                          <div>
                            <div className="font-mono text-sm">{formatCurrency(alert.transaction.amount)}</div>
                            <div className="text-xs text-muted-foreground">{alert.transaction.description}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(alert.status)}>
                          {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(alert.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewAlert(alert)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          {/* Rules Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Triggered</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          {rule.description && (
                            <div className="text-sm text-muted-foreground">{rule.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityBadgeVariant(rule.riskLevel)}>
                          {rule.riskLevel.charAt(0).toUpperCase() + rule.riskLevel.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.action.charAt(0).toUpperCase() + rule.action.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{rule.triggerCount}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.lastTriggered ? (
                          <div className="text-sm text-muted-foreground">
                            {formatDate(rule.lastTriggered)}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Risk Factors
                </CardTitle>
                <CardDescription>
                  Most common fraud risk factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.topRiskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{factor.factor}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{factor.count}</span>
                        <span className="text-xs text-muted-foreground">({factor.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Detection Performance
                </CardTitle>
                <CardDescription>
                  AI fraud detection performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average Risk Score</span>
                    <span className="text-sm font-bold">{metrics?.averageRiskScore.toFixed(1)}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Detection Rate</span>
                    <span className="text-sm font-bold text-green-600">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">False Positive Rate</span>
                    <span className="text-sm font-bold text-orange-600">5.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Response Time</span>
                    <span className="text-sm font-bold">2.3s</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alert Dialog */}
      {selectedAlert && (
        <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {selectedAlert.title}
              </DialogTitle>
              <DialogDescription>
                Fraud Alert Details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Alert Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getRiskScoreColor(selectedAlert.riskScore)}`}>
                      {selectedAlert.riskScore}/100
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getSeverityBadgeVariant(selectedAlert.severity)}>
                      {selectedAlert.severity.charAt(0).toUpperCase() + selectedAlert.severity.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={getStatusBadgeVariant(selectedAlert.status)}>
                      {selectedAlert.status.charAt(0).toUpperCase() + selectedAlert.status.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction Details */}
              {selectedAlert.transaction && (
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium">Amount</div>
                        <div className="text-lg font-mono">{formatCurrency(selectedAlert.transaction.amount)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Description</div>
                        <div className="text-sm">{selectedAlert.transaction.description}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Date</div>
                        <div className="text-sm">{formatDate(selectedAlert.transaction.date)}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Account</div>
                        <div className="text-sm">{selectedAlert.transaction.account}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Evidence */}
              <Card>
                <CardHeader>
                  <CardTitle>Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedAlert.evidence.map((evidence, index) => (
                      <div key={index} className="flex items-start space-x-2 p-2 border rounded">
                        <Flag className="w-4 h-4 text-red-500 mt-0.5" />
                        <span className="text-sm">{evidence}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleResolveAlert(selectedAlert.id, 'false_positive')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark as False Positive
                </Button>
                <Button
                  onClick={() => handleResolveAlert(selectedAlert.id, 'resolved')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default AIFraudDetection;
