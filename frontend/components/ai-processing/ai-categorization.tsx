/**
 * AI Categorization Component
 * Manages AI-powered transaction and document categorization
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
  Brain, 
  Tag, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  Plus,
  Save,
  X,
  Play,
  Pause,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { aiProcessingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const categoryRuleSchema = z.object({
  name: z.string().min(1, 'Rule name is required'),
  description: z.string().optional(),
  conditions: z.array(z.object({
    field: z.string().min(1, 'Field is required'),
    operator: z.string().min(1, 'Operator is required'),
    value: z.string().min(1, 'Value is required'),
  })).min(1, 'At least one condition is required'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  confidence: z.number().min(0).max(100).default(80),
  isActive: z.boolean().default(true),
});

type CategoryRuleFormData = z.infer<typeof categoryRuleSchema>;

interface CategoryRule {
  id: string;
  name: string;
  description?: string;
  conditions: {
    field: string;
    operator: string;
    value: string;
  }[];
  category: string;
  subcategory?: string;
  confidence: number;
  isActive: boolean;
  matchCount: number;
  accuracy: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface UncategorizedItem {
  id: string;
  type: 'transaction' | 'document';
  description: string;
  amount?: number;
  date: string;
  suggestedCategory?: string;
  suggestedSubcategory?: string;
  confidence?: number;
  source: string;
}

interface AICategorizationProps {
  className?: string;
}

export function AICategorization({ className = '' }: AICategorizationProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [rules, setRules] = useState<CategoryRule[]>([]);
  const [uncategorizedItems, setUncategorizedItems] = useState<UncategorizedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRule, setSelectedRule] = useState<CategoryRule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CategoryRuleFormData>({
    resolver: zodResolver(categoryRuleSchema),
    defaultValues: {
      name: '',
      description: '',
      conditions: [{ field: 'description', operator: 'contains', value: '' }],
      category: '',
      subcategory: '',
      confidence: 80,
      isActive: true,
    },
  });

  // Available fields for conditions
  const conditionFields = [
    { value: 'description', label: 'Description' },
    { value: 'amount', label: 'Amount' },
    { value: 'merchant', label: 'Merchant' },
    { value: 'reference', label: 'Reference' },
    { value: 'account', label: 'Account' },
  ];

  // Available operators
  const operators = [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'starts_with', label: 'Starts with' },
    { value: 'ends_with', label: 'Ends with' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
    { value: 'regex', label: 'Regex match' },
  ];

  // Available categories
  const categories = [
    'Office Supplies',
    'Travel & Entertainment',
    'Meals & Dining',
    'Transportation',
    'Utilities',
    'Professional Services',
    'Marketing & Advertising',
    'Software & Subscriptions',
    'Equipment & Hardware',
    'Training & Education',
    'Insurance',
    'Rent & Lease',
    'Other',
  ];

  // Load data
  const loadData = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      
      // Load categorization rules
      const rulesResponse = await aiProcessingService.getCategorizationRules();
      if (rulesResponse.success && rulesResponse.data) {
        setRules(rulesResponse.data);
      }
      
      // Load uncategorized items
      const itemsResponse = await aiProcessingService.getUncategorizedItems();
      if (itemsResponse.success && itemsResponse.data) {
        setUncategorizedItems(itemsResponse.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle rule creation
  const handleCreateRule = async (data: CategoryRuleFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await aiProcessingService.createCategorizationRule(data);
      
      if (response.success) {
        await loadData();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create categorization rule'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AICategorization',
        action: 'createCategorizationRule',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rule update
  const handleUpdateRule = async (data: CategoryRuleFormData) => {
    if (!selectedRule) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await aiProcessingService.updateCategorizationRule(selectedRule.id, data);
      
      if (response.success) {
        await loadData();
        setShowEditDialog(false);
        setSelectedRule(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update categorization rule'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AICategorization',
        action: 'updateCategorizationRule',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle rule deletion
  const handleDeleteRule = async (rule: CategoryRule) => {
    if (!confirm(`Are you sure you want to delete rule "${rule.name}"?`)) {
      return;
    }
    
    try {
      const response = await aiProcessingService.deleteCategorizationRule(rule.id);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to delete categorization rule'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AICategorization',
        action: 'deleteCategorizationRule',
      });
    }
  };

  // Handle auto-categorization
  const handleAutoCategorize = async () => {
    setIsProcessing(true);
    
    try {
      const response = await aiProcessingService.autoCategorizeItems();
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to auto-categorize items'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AICategorization',
        action: 'autoCategorizeItems',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle item categorization
  const handleCategorizeItem = async (itemId: string, category: string, subcategory?: string) => {
    try {
      const response = await aiProcessingService.categorizeItem(itemId, category, subcategory);
      
      if (response.success) {
        await loadData();
      } else {
        handleError(new Error(response.message || 'Failed to categorize item'));
      }
    } catch (error) {
      handleError(error, {
        component: 'AICategorization',
        action: 'categorizeItem',
      });
    }
  };

  // Handle edit rule
  const handleEditRule = (rule: CategoryRule) => {
    setSelectedRule(rule);
    setValue('name', rule.name);
    setValue('description', rule.description || '');
    setValue('conditions', rule.conditions);
    setValue('category', rule.category);
    setValue('subcategory', rule.subcategory || '');
    setValue('confidence', rule.confidence);
    setValue('isActive', rule.isActive);
    setShowEditDialog(true);
  };

  // Add condition
  const addCondition = () => {
    const currentConditions = watch('conditions');
    setValue('conditions', [...currentConditions, { field: 'description', operator: 'contains', value: '' }]);
  };

  // Remove condition
  const removeCondition = (index: number) => {
    const currentConditions = watch('conditions');
    if (currentConditions.length > 1) {
      setValue('conditions', currentConditions.filter((_, i) => i !== index));
    }
  };

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesSearch = !searchTerm || 
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? rule.isActive : !rule.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Filter uncategorized items
  const filteredUncategorizedItems = uncategorizedItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  // Get confidence badge variant
  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 70) return 'secondary';
    return 'destructive';
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
          <h2 className="text-2xl font-bold">AI Categorization</h2>
          <p className="text-muted-foreground">
            Manage AI-powered categorization rules and auto-categorize items
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={handleAutoCategorize}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Auto-Categorize
              </>
            )}
          </Button>
          <PermissionGate permission="CREATE_CATEGORIZATION_RULE">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Categorization Rule</DialogTitle>
                  <DialogDescription>
                    Create a new AI categorization rule
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
                        placeholder="e.g., Office Supplies Rule"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confidence">Confidence Threshold</Label>
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select onValueChange={(value) => setValue('category', value)}>
                        <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-sm text-destructive">{errors.category.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Input
                        id="subcategory"
                        {...register('subcategory')}
                        placeholder="Optional subcategory"
                      />
                    </div>
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
                          <SelectTrigger className="w-32">
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
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={watch('isActive')}
                      onCheckedChange={(checked) => setValue('isActive', checked)}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
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
                          <Save className="w-4 h-4 mr-2" />
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

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search rules and items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Categorization Rules</TabsTrigger>
          <TabsTrigger value="uncategorized">Uncategorized Items</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-6">
          {/* Rules Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Matches</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.map((rule) => (
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
                        <div>
                          <div className="font-medium">{rule.category}</div>
                          {rule.subcategory && (
                            <div className="text-sm text-muted-foreground">{rule.subcategory}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{rule.matchCount}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getConfidenceBadgeVariant(rule.accuracy)}>
                          {rule.accuracy.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(rule.isActive)}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <PermissionGate permission="UPDATE_CATEGORIZATION_RULE">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </PermissionGate>
                          <PermissionGate permission="DELETE_CATEGORIZATION_RULE">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRule(rule)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uncategorized" className="space-y-6">
          {/* Uncategorized Items Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Suggested Category</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUncategorizedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-muted-foreground">{item.source}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.amount ? (
                          <span className="font-mono">{formatCurrency(item.amount)}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{formatDate(item.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.suggestedCategory ? (
                          <div>
                            <div className="font-medium">{item.suggestedCategory}</div>
                            {item.suggestedSubcategory && (
                              <div className="text-sm text-muted-foreground">{item.suggestedSubcategory}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No suggestion</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.confidence ? (
                          <Badge variant={getConfidenceBadgeVariant(item.confidence)}>
                            {item.confidence.toFixed(1)}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {item.suggestedCategory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCategorizeItem(
                                item.id, 
                                item.suggestedCategory!, 
                                item.suggestedSubcategory
                              )}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
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
      </Tabs>
    </div>
  );
}

export default AICategorization;
