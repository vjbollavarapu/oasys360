/**
 * Credit/Debit Notes Component
 * Manages credit and debit notes
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Receipt,
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { formatCurrency } from '@/lib/utils';

interface Note {
  id: string;
  number: string;
  type: 'credit' | 'debit';
  date: string;
  customer?: string;
  supplier?: string;
  invoiceNumber?: string;
  description: string;
  amount: number;
  status: 'draft' | 'issued' | 'cancelled';
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export function CreditDebitNotesOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load notes
  // TODO: Replace with actual API call when backend endpoint is available
  const loadNotes = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      // Mock data for now
      const mockNotes: Note[] = [
        {
          id: "1",
          number: "CN-2024-001",
          type: 'credit',
          date: new Date().toISOString().split('T')[0],
          customer: "TechCorp Solutions",
          invoiceNumber: "INV-2024-001",
          description: "Return of damaged goods",
          amount: 500.00,
          status: 'issued',
          reason: "Product defect",
          createdBy: "John Doe",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          number: "DN-2024-001",
          type: 'debit',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          customer: "Global Dynamics",
          invoiceNumber: "INV-2024-002",
          description: "Additional charges for late payment",
          amount: 150.00,
          status: 'issued',
          reason: "Late payment fee",
          createdBy: "Jane Smith",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          number: "CN-2024-002",
          type: 'credit',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          supplier: "Supplier ABC",
          invoiceNumber: "SUP-2024-001",
          description: "Price adjustment",
          amount: 250.00,
          status: 'draft',
          reason: "Price correction",
          createdBy: "Admin",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setNotes(mockNotes);
    });
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = notes.filter(note => {
    const matchesSearch = !searchTerm || 
      note.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || note.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const creditNotes = filteredNotes.filter(n => n.type === 'credit');
  const debitNotes = filteredNotes.filter(n => n.type === 'debit');
  
  const totalCredit = creditNotes
    .filter(n => n.status === 'issued')
    .reduce((sum, n) => sum + n.amount, 0);
  
  const totalDebit = debitNotes
    .filter(n => n.status === 'issued')
    .reduce((sum, n) => sum + n.amount, 0);

  const getTypeBadge = (type: string) => {
    return type === 'credit' ? (
      <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 flex items-center gap-1">
        <ArrowDown className="w-3 h-3" />
        Credit Note
      </Badge>
    ) : (
      <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 flex items-center gap-1">
        <ArrowUp className="w-3 h-3" />
        Debit Note
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Issued</Badge>;
      case 'draft':
        return <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Draft</Badge>;
      case 'cancelled':
        return <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Cancelled</Badge>;
      default:
        return <Badge className="rounded-full">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Credit & Debit Notes</h1>
          <p className="text-muted-foreground">
            Manage credit and debit notes for adjustments and corrections
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={loadNotes}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Credit Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalCredit)}</div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                <ArrowDown className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {creditNotes.filter(n => n.status === 'issued').length} issued notes
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Debit Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalDebit)}</div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                <ArrowUp className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {debitNotes.filter(n => n.status === 'issued').length} issued notes
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Difference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className={`text-2xl font-bold ${
                totalCredit - totalDebit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totalCredit - totalDebit)}
              </div>
              <div className={`p-3 rounded-2xl ${
                totalCredit - totalDebit >= 0 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-red-100 dark:bg-red-900/20'
              }`}>
                <Receipt className={`w-6 h-6 ${
                  totalCredit - totalDebit >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Credit minus Debit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="rounded-xl w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit Notes</SelectItem>
                <SelectItem value="debit">Debit Notes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notes Table */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle>All Notes</CardTitle>
          <CardDescription>Credit and debit notes list</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No notes found</p>
              <Button 
                variant="outline" 
                className="mt-4 rounded-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Note
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Note Number</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Customer/Supplier</TableHead>
                    <TableHead className="font-semibold">Invoice</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => (
                    <TableRow key={note.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono">{note.number}</TableCell>
                      <TableCell>{getTypeBadge(note.type)}</TableCell>
                      <TableCell>{new Date(note.date).toLocaleDateString()}</TableCell>
                      <TableCell>{note.customer || note.supplier || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{note.invoiceNumber || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{note.description}</TableCell>
                      <TableCell className={`text-right font-mono font-medium ${
                        note.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(note.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(note.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {note.status === 'draft' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
