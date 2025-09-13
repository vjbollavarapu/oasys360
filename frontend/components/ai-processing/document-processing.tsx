/**
 * AI Document Processing Component
 * Handles document upload, OCR, and AI analysis
 */

"use client";

import { useState, useEffect, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Image, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  Zap,
  Brain,
  Scan,
  FileCheck,
  FileX,
  Clock,
  Calendar,
  User,
  DollarSign,
  Tag,
  Settings,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { aiProcessingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { useRBAC, PERMISSIONS } from '@/lib/rbac';
import { PermissionGate } from '@/components/rbac/permission-gate';

// Form validation schema
const documentUploadSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;

interface Document {
  id: string;
  name: string;
  originalName: string;
  category: string;
  description?: string;
  tags: string[];
  fileType: string;
  fileSize: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed' | 'pending';
  progress: number;
  extractedData?: {
    text: string;
    entities: any[];
    amounts: number[];
    dates: string[];
    confidence: number;
  };
  aiAnalysis?: {
    documentType: string;
    confidence: number;
    suggestions: string[];
    riskScore: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface DocumentProcessingProps {
  className?: string;
}

export function DocumentProcessing({ className = '' }: DocumentProcessingProps) {
  const { hasPermission } = useRBAC();
  const { error, handleError, withErrorHandling } = useErrorHandler();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DocumentUploadFormData>({
    resolver: zodResolver(documentUploadSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      tags: [],
    },
  });

  // Document categories
  const documentCategories = [
    { value: 'invoice', label: 'Invoice', icon: FileText },
    { value: 'receipt', label: 'Receipt', icon: FileText },
    { value: 'contract', label: 'Contract', icon: FileText },
    { value: 'statement', label: 'Bank Statement', icon: FileText },
    { value: 'tax_document', label: 'Tax Document', icon: FileText },
    { value: 'expense_report', label: 'Expense Report', icon: FileText },
    { value: 'other', label: 'Other', icon: FileText },
  ];

  // Load documents
  const loadDocuments = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await aiProcessingService.getDocuments();
      
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Handle file upload
  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', watch('name') || file.name);
    formData.append('category', watch('category'));
    formData.append('description', watch('description') || '');
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const response = await aiProcessingService.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });
      
      if (response.success) {
        await loadDocuments();
        setShowUploadDialog(false);
        reset();
      } else {
        handleError(new Error(response.message || 'Failed to upload document'));
      }
    } catch (error) {
      handleError(error, {
        component: 'DocumentProcessing',
        action: 'uploadDocument',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  // Handle document processing
  const handleProcessDocument = async (document: Document) => {
    try {
      const response = await aiProcessingService.processDocument(document.id);
      
      if (response.success) {
        await loadDocuments();
      } else {
        handleError(new Error(response.message || 'Failed to process document'));
      }
    } catch (error) {
      handleError(error, {
        component: 'DocumentProcessing',
        action: 'processDocument',
      });
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.name}"?`)) {
      return;
    }
    
    try {
      const response = await aiProcessingService.deleteDocument(document.id);
      
      if (response.success) {
        await loadDocuments();
      } else {
        handleError(new Error(response.message || 'Failed to delete document'));
      }
    } catch (error) {
      handleError(error, {
        component: 'DocumentProcessing',
        action: 'deleteDocument',
      });
    }
  };

  // Handle view analysis
  const handleViewAnalysis = (document: Document) => {
    setSelectedDocument(document);
    setShowAnalysisDialog(true);
  };

  // Filter documents
  const filteredDocuments = documents.filter(document => {
    const matchesSearch = !searchTerm || 
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || document.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || document.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'processing':
        return 'secondary';
      case 'uploading':
        return 'outline';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const categoryConfig = documentCategories.find(c => c.value === category);
    return categoryConfig?.icon || FileText;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          <h2 className="text-2xl font-bold">AI Document Processing</h2>
          <p className="text-muted-foreground">
            Upload and process documents with AI-powered analysis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadDocuments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <PermissionGate permission="UPLOAD_DOCUMENT">
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a document for AI processing and analysis
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(() => {})} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error.message}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Document Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Enter document name"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select document category" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-2">
                              <category.icon className="w-4 h-4" />
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Document description"
                      rows={3}
                    />
                  </div>
                  
                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileInputChange}
                        accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
                        className="hidden"
                      />
                      
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Uploading...</div>
                            <Progress value={uploadProgress} className="w-full" />
                            <div className="text-xs text-muted-foreground">{uploadProgress}%</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">
                              Drag and drop your file here, or{' '}
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-primary hover:underline"
                              >
                                browse
                              </button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Supports PDF, JPG, PNG, TIFF, DOC, DOCX
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
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
                  placeholder="Search documents..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {documentCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {React.createElement(getCategoryIcon(document.category), { className: "w-4 h-4 text-muted-foreground" })}
                      <div>
                        <div className="font-medium">{document.name}</div>
                        <div className="text-sm text-muted-foreground">{document.originalName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {documentCategories.find(c => c.value === document.category)?.label || document.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(document.fileSize)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(document.status)}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {document.status === 'processing' || document.status === 'uploading' ? (
                      <div className="flex items-center space-x-2">
                        <Progress value={document.progress} className="w-16" />
                        <span className="text-xs text-muted-foreground">{document.progress}%</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(document.createdAt)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {document.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewAnalysis(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {document.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleProcessDocument(document)}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(document)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      {selectedDocument && (
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Document Analysis: {selectedDocument.name}</DialogTitle>
              <DialogDescription>
                AI-powered analysis results
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="extracted" className="space-y-4">
              <TabsList>
                <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="extracted" className="space-y-4">
                {selectedDocument.extractedData && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Scan className="w-5 h-5" />
                        Extracted Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {selectedDocument.extractedData.text}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {selectedDocument.extractedData?.entities && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Extracted Entities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedDocument.extractedData.entities.map((entity, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <span className="font-medium">{entity.type}</span>
                            <span className="text-sm text-muted-foreground">{entity.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                {selectedDocument.aiAnalysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5" />
                          Document Type
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedDocument.aiAnalysis.documentType}</div>
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(selectedDocument.aiAnalysis.confidence * 100).toFixed(1)}%
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" />
                          Risk Score
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {selectedDocument.aiAnalysis.riskScore}/100
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedDocument.aiAnalysis.riskScore < 30 ? 'Low Risk' : 
                           selectedDocument.aiAnalysis.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-4">
                {selectedDocument.aiAnalysis?.suggestions && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        AI Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedDocument.aiAnalysis.suggestions.map((suggestion, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 border rounded-lg">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-sm">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default DocumentProcessing;
