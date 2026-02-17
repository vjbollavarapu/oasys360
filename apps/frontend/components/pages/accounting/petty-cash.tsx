/**
 * Petty Cash Component
 * Manages petty cash transactions and balances
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
  DollarSign,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { formatCurrency } from '@/lib/utils';

interface PettyCashTransaction {
  id: string;
  date: string;
  type: 'expense' | 'replenishment' | 'adjustment';
  description: string;
  amount: number;
  category?: string;
  receiptNumber?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: string;
}

interface PettyCashAccount {
  id: string;
  name: string;
  currentBalance: number;
  initialBalance: number;
  maxBalance: number;
  custodian: string;
  location?: string;
}

export function PettyCashOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [accounts, setAccounts] = useState<PettyCashAccount[]>([]);
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load petty cash accounts
  // TODO: Replace with actual API call when backend endpoint is available
  const loadAccounts = async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      // Mock data for now
      const mockAccounts: PettyCashAccount[] = [
        {
          id: "1",
          name: "Main Office Petty Cash",
          currentBalance: 450.00,
          initialBalance: 500.00,
          maxBalance: 1000.00,
          custodian: "John Doe",
          location: "Main Office - Reception",
        },
        {
          id: "2",
          name: "Branch Office Petty Cash",
          currentBalance: 250.00,
          initialBalance: 300.00,
          maxBalance: 500.00,
          custodian: "Jane Smith",
          location: "Branch Office - Admin",
        },
      ];
      setAccounts(mockAccounts);
      if (mockAccounts.length > 0 && !selectedAccountId) {
        setSelectedAccountId(mockAccounts[0].id);
      }
    });
    setLoading(false);
  };

  // Load transactions
  const loadTransactions = async (accountId: string) => {
    if (!accountId) return;
    
    await withErrorHandling(async () => {
      setLoading(true);
      // Mock data for now
      const mockTransactions: PettyCashTransaction[] = [
        {
          id: "1",
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          description: "Office supplies - pens and paper",
          amount: 25.50,
          category: "Office Supplies",
          receiptNumber: "RCP-001",
          approvedBy: "Manager",
          status: 'approved',
          createdBy: "Staff Member",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          type: 'expense',
          description: "Coffee for client meeting",
          amount: 15.00,
          category: "Entertainment",
          receiptNumber: "RCP-002",
          status: 'approved',
          createdBy: "Staff Member",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          type: 'replenishment',
          description: "Monthly replenishment",
          amount: 200.00,
          status: 'approved',
          createdBy: "Admin",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      setTransactions(mockTransactions);
    });
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadTransactions(selectedAccountId);
    }
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
  const filteredTransactions = transactions.filter(t => 
    !searchTerm || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'expense':
        return <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Expense</Badge>;
      case 'replenishment':
        return <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Replenishment</Badge>;
      case 'adjustment':
        return <Badge className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">Adjustment</Badge>;
      default:
        return <Badge className="rounded-full">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Approved</Badge>;
      case 'pending':
        return <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Pending</Badge>;
      case 'rejected':
        return <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Rejected</Badge>;
      default:
        return <Badge className="rounded-full">Unknown</Badge>;
    }
  };

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalReplenishments = filteredTransactions
    .filter(t => t.type === 'replenishment' && t.status === 'approved')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Petty Cash Management</h1>
          <p className="text-muted-foreground">
            Track and manage petty cash transactions and balances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={() => selectedAccountId && loadTransactions(selectedAccountId)}
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
            New Transaction
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Petty Cash Accounts
          </CardTitle>
          <CardDescription>Select a petty cash account to view transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && accounts.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No petty cash accounts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account) => (
                <Card 
                  key={account.id}
                  className={`rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    selectedAccountId === account.id ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{account.name}</h3>
                        {account.location && (
                          <p className="text-sm text-muted-foreground">{account.location}</p>
                        )}
                      </div>
                      {selectedAccountId === account.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Current Balance</span>
                        <span className="text-lg font-bold">{formatCurrency(account.currentBalance)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Max Balance</span>
                        <span className="text-sm font-medium">{formatCurrency(account.maxBalance)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Custodian</span>
                        <span className="text-sm font-medium">{account.custodian}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${(account.currentBalance / account.maxBalance) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Account Summary */}
      {selectedAccount && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(selectedAccount.currentBalance)}</div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Available balance
                </p>
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
                  <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                    <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Approved expenses
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Replenishments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(totalReplenishments)}</div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Funds added
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Transactions - {selectedAccount.name}</CardTitle>
                  <CardDescription>Transaction history for this petty cash account</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="rounded-2xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Receipt</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                          <TableCell>{getTransactionTypeBadge(transaction.type)}</TableCell>
                          <TableCell className="font-medium">{transaction.description}</TableCell>
                          <TableCell>{transaction.category || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">{transaction.receiptNumber || '-'}</TableCell>
                          <TableCell className={`text-right font-mono ${
                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {transaction.status === 'pending' && (
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
        </>
      )}
    </div>
  );
}
