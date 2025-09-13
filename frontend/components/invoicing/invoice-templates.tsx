/**
 * Invoice Templates Component
 * Manages invoice templates for consistent branding
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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  Eye,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  X,
  FileText,
  Palette,
  Settings,
  Image,
  Type
} from 'lucide-react';
import { invoicingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  header: z.object({
    logoUrl: z.string().optional(),
    companyName: z.string().min(1, 'Company name is required'),
    companyAddress: z.string().min(1, 'Company address is required'),
    companyPhone: z.string().optional(),
    companyEmail: z.string().optional(),
    companyWebsite: z.string().optional(),
  }),
  footer: z.object({
    showFooter: z.boolean().default(true),
    footerText: z.string().optional(),
    showTerms: z.boolean().default(true),
    termsText: z.string().optional(),
  }),
  styling: z.object({
    primaryColor: z.string().default('#3b82f6'),
    secondaryColor: z.string().default('#64748b'),
    fontFamily: z.string().default('Inter'),
    fontSize: z.string().default('14px'),
    showBorders: z.boolean().default(true),
    showShadows: z.boolean().default(false),
  }),
  layout: z.object({
    showLogo: z.boolean().default(true),
    showCompanyInfo: z.boolean().default(true),
    showCustomerInfo: z.boolean().default(true),
    showInvoiceDetails: z.boolean().default(true),
    showItemTable: z.boolean().default(true),
    showTotals: z.boolean().default(true),
    showFooter: z.boolean().default(true),
  }),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  header: {
    logoUrl?: string;
    companyName: string;
    companyAddress: string;
    companyPhone?: string;
    companyEmail?: string;
    companyWebsite?: string;
  };
  footer: {
    showFooter: boolean;
    footerText?: string;
    showTerms: boolean;
    termsText?: string;
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    fontSize: string;
    showBorders: boolean;
    showShadows: boolean;
  };
  layout: {
    showLogo: boolean;
    showCompanyInfo: boolean;
    showCustomerInfo: boolean;
    showInvoiceDetails: boolean;
    showItemTable: boolean;
    showTotals: boolean;
    showFooter: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface InvoiceTemplatesProps {
  className?: string;
}

export function InvoiceTemplates({ className = '' }: InvoiceTemplatesProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      isDefault: false,
      header: {
        logoUrl: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        companyWebsite: '',
      },
      footer: {
        showFooter: true,
        footerText: '',
        showTerms: true,
        termsText: '',
      },
      styling: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'Inter',
        fontSize: '14px',
        showBorders: true,
        showShadows: false,
      },
      layout: {
        showLogo: true,
        showCompanyInfo: true,
        showCustomerInfo: true,
        showInvoiceDetails: true,
        showItemTable: true,
        showTotals: true,
        showFooter: true,
      },
    },
  });

  // Load templates
  const loadTemplates = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await invoicingService.getInvoiceTemplates();
      
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Handle template creation
  const handleCreateTemplate = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.createInvoiceTemplate(data);
      
      if (response.success) {
        await loadTemplates();
        setShowCreateDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to create template'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceTemplates',
        action: 'createTemplate',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle template update
  const handleUpdateTemplate = async (data: TemplateFormData) => {
    if (!selectedTemplate) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await invoicingService.updateInvoiceTemplate(selectedTemplate.id, data);
      
      if (response.success) {
        await loadTemplates();
        setShowEditDialog(false);
        setSelectedTemplate(null);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to update template'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceTemplates',
        action: 'updateTemplate',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (template: InvoiceTemplate) => {
    if (!confirm(`Are you sure you want to delete template "${template.name}"?`)) {
      return;
    }
    
    try {
      const response = await invoicingService.deleteInvoiceTemplate(template.id);
      
      if (response.success) {
        await loadTemplates();
      } else {
        handleError(new Error(response.message || 'Failed to delete template'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceTemplates',
        action: 'deleteTemplate',
      });
    }
  };

  // Handle template duplication
  const handleDuplicateTemplate = async (template: InvoiceTemplate) => {
    try {
      const response = await invoicingService.duplicateInvoiceTemplate(template.id);
      
      if (response.success) {
        await loadTemplates();
      } else {
        handleError(new Error(response.message || 'Failed to duplicate template'));
      }
    } catch (error) {
      handleError(error, {
        component: 'InvoiceTemplates',
        action: 'duplicateTemplate',
      });
    }
  };

  // Handle edit template
  const handleEditTemplate = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setValue('name', template.name);
    setValue('description', template.description || '');
    setValue('isDefault', template.isDefault);
    setValue('header', template.header);
    setValue('footer', template.footer);
    setValue('styling', template.styling);
    setValue('layout', template.layout);
    setShowEditDialog(true);
  };

  // Handle preview template
  const handlePreviewTemplate = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewDialog(true);
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

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
          <h2 className="text-2xl font-bold">Invoice Templates</h2>
          <p className="text-muted-foreground">
            Manage your invoice templates and branding
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="CREATE_INVOICE">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a new invoice template
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleCreateTemplate)} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Template Name *</Label>
                          <Input
                            id="name"
                            {...register('name')}
                            placeholder="e.g., Standard Invoice"
                            className={errors.name ? 'border-destructive' : ''}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input
                            id="description"
                            {...register('description')}
                            placeholder="Template description"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isDefault"
                          checked={watch('isDefault')}
                          onCheckedChange={(checked) => setValue('isDefault', checked)}
                        />
                        <Label htmlFor="isDefault">Set as default template</Label>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Header Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-5 h-5" />
                        Header Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="logoUrl">Logo URL</Label>
                        <Input
                          id="logoUrl"
                          {...register('header.logoUrl')}
                          placeholder="https://example.com/logo.png"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name *</Label>
                          <Input
                            id="companyName"
                            {...register('header.companyName')}
                            placeholder="Your Company Name"
                            className={errors.header?.companyName ? 'border-destructive' : ''}
                          />
                          {errors.header?.companyName && (
                            <p className="text-sm text-destructive">{errors.header.companyName.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyEmail">Company Email</Label>
                          <Input
                            id="companyEmail"
                            {...register('header.companyEmail')}
                            placeholder="contact@company.com"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress">Company Address *</Label>
                        <Textarea
                          id="companyAddress"
                          {...register('header.companyAddress')}
                          placeholder="123 Main St, City, State 12345"
                          rows={3}
                          className={errors.header?.companyAddress ? 'border-destructive' : ''}
                        />
                        {errors.header?.companyAddress && (
                          <p className="text-sm text-destructive">{errors.header.companyAddress.message}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="companyPhone">Company Phone</Label>
                          <Input
                            id="companyPhone"
                            {...register('header.companyPhone')}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="companyWebsite">Company Website</Label>
                          <Input
                            id="companyWebsite"
                            {...register('header.companyWebsite')}
                            placeholder="https://company.com"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Styling Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Styling Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryColor">Primary Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="primaryColor"
                              {...register('styling.primaryColor')}
                              type="color"
                              className="w-16 h-10"
                            />
                            <Input
                              {...register('styling.primaryColor')}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="secondaryColor">Secondary Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              id="secondaryColor"
                              {...register('styling.secondaryColor')}
                              type="color"
                              className="w-16 h-10"
                            />
                            <Input
                              {...register('styling.secondaryColor')}
                              placeholder="#64748b"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fontFamily">Font Family</Label>
                          <Select value={watch('styling.fontFamily')} onValueChange={(value) => setValue('styling.fontFamily', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Lato">Lato</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="fontSize">Font Size</Label>
                          <Select value={watch('styling.fontSize')} onValueChange={(value) => setValue('styling.fontSize', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12px">12px</SelectItem>
                              <SelectItem value="14px">14px</SelectItem>
                              <SelectItem value="16px">16px</SelectItem>
                              <SelectItem value="18px">18px</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showBorders"
                            checked={watch('styling.showBorders')}
                            onCheckedChange={(checked) => setValue('styling.showBorders', checked)}
                          />
                          <Label htmlFor="showBorders">Show borders</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="showShadows"
                            checked={watch('styling.showShadows')}
                            onCheckedChange={(checked) => setValue('styling.showShadows', checked)}
                          />
                          <Label htmlFor="showShadows">Show shadows</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Footer Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Footer Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showFooter"
                          checked={watch('footer.showFooter')}
                          onCheckedChange={(checked) => setValue('footer.showFooter', checked)}
                        />
                        <Label htmlFor="showFooter">Show footer</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="footerText">Footer Text</Label>
                        <Textarea
                          id="footerText"
                          {...register('footer.footerText')}
                          placeholder="Thank you for your business!"
                          rows={3}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showTerms"
                          checked={watch('footer.showTerms')}
                          onCheckedChange={(checked) => setValue('footer.showTerms', checked)}
                        />
                        <Label htmlFor="showTerms">Show terms and conditions</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="termsText">Terms and Conditions</Label>
                        <Textarea
                          id="termsText"
                          {...register('footer.termsText')}
                          placeholder="Payment terms and conditions"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
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
                          Create Template
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

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>
                    {template.description || 'No description'}
                  </CardDescription>
                </div>
                {template.isDefault && (
                  <Badge variant="default">Default</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  <strong>Company:</strong> {template.header.companyName}
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>Created:</strong> {formatDate(template.createdAt)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <strong>By:</strong> {template.createdBy.name}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: template.styling.primaryColor }}
                />
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: template.styling.secondaryColor }}
                />
                <span className="text-sm text-muted-foreground">
                  {template.styling.fontFamily}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-1">
                  <PermissionGate permission="READ_INVOICE">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreviewTemplate(template)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </PermissionGate>
                  <PermissionGate permission="UPDATE_INVOICE">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTemplate(template)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </PermissionGate>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <PermissionGate permission="DELETE_INVOICE">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTemplate(template)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </PermissionGate>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No templates found. Create your first template to get started.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default InvoiceTemplates;
