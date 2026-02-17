/**
 * Bank Reconciliation Component
 * For accounting module - manages bank reconciliation process
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
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Calculator,
  BookOpen,
  CreditCard,
  Download,
  Search,
  Filter,
} from 'lucide-react';
import { bankingService } from '@/lib/api-services';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { formatCurrency } from '@/lib/utils';

interface BankAccount {
  id: string;
  name: string;
  account_number?: string;
  bank_name?: string;
  balance?: number;
}

interface ReconciliationData {
  bank_account_id: string;
  bank_account_name: string;
  statement_date: string;
  statement_balance: number | string;
  book_balance: number | string;
  difference: number | string;
  reconciled_transactions: number;
  unreconciled_transactions: number;
}

export function BankReconciliationOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [reconciliationData, setReconciliationData] = useState<ReconciliationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Load bank accounts
  const loadBankAccounts = async () => {
    await withErrorHandling(async () => {
      setAccountsLoading(true);
      const response = await bankingService.getBankAccounts();
      if (response.success && response.data) {
        const accounts = response.data.results || response.data || [];
        setBankAccounts(accounts);
        if (accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accounts[0].id);
        }
      }
    });
    setAccountsLoading(false);
  };

  // Load reconciliation data for selected account
  const loadReconciliation = async (accountId: string) => {
    if (!accountId) return;
    
    await withErrorHandling(async () => {
      setLoading(true);
      try {
        // The endpoint is /api/v1/banking/accounts/{account_id}/reconciliation/
        // Use the base get method from BaseApiService
        const endpoint = `/banking/accounts/${accountId}/reconciliation/`;
        const response = await (bankingService as any).get(endpoint);
        if (response.success && response.data) {
          setReconciliationData(response.data);
        } else {
          // If no statement found, set to null
          setReconciliationData(null);
        }
      } catch (error: any) {
        // 404 is expected if no statement exists
        if (error?.status !== 404) {
          handleError(error, 'Failed to load reconciliation data');
        }
        setReconciliationData(null);
      }
    });
    setLoading(false);
  };

  useEffect(() => {
    loadBankAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      loadReconciliation(selectedAccountId);
    }
  }, [selectedAccountId]);

  const statementBalance = reconciliationData 
    ? parseFloat(reconciliationData.statement_balance as string || '0') 
    : 0;
  const bookBalance = reconciliationData 
    ? parseFloat(reconciliationData.book_balance as string || '0') 
    : 0;
  const difference = reconciliationData 
    ? parseFloat(reconciliationData.difference as string || '0') 
    : 0;

  const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Reconciliation</h1>
          <p className="text-muted-foreground">
            Reconcile bank statements with your accounting records
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={() => selectedAccountId && loadReconciliation(selectedAccountId)}
            disabled={loading || !selectedAccountId}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" className="rounded-full">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Account Selector */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Select Bank Account
          </CardTitle>
          <CardDescription>Choose a bank account to reconcile</CardDescription>
        </CardHeader>
        <CardContent>
          {accountsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bank accounts found</p>
              <p className="text-sm mt-2">Create a bank account first to start reconciliation</p>
            </div>
          ) : (
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="rounded-xl w-full max-w-md">
                <SelectValue placeholder="Select bank account" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} {account.account_number ? `(${account.account_number})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Reconciliation Summary */}
      {selectedAccountId && reconciliationData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Statement Balance */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Statement Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(statementBalance)}</div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  As of {new Date(reconciliationData.statement_date).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            {/* Book Balance */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Book Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(bookBalance)}</div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                    <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  From accounting records
                </p>
              </CardContent>
            </Card>

            {/* Difference */}
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Difference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`text-2xl font-bold ${
                    difference === 0 
                      ? 'text-green-600' 
                      : difference > 0 
                        ? 'text-blue-600' 
                        : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(difference))}
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    difference === 0 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : difference > 0 
                        ? 'bg-blue-100 dark:bg-blue-900/20' 
                        : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    {difference === 0 ? (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : difference > 0 ? (
                      <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>
                <p className={`text-xs mt-2 ${
                  difference === 0 
                    ? 'text-green-600' 
                    : 'text-muted-foreground'
                }`}>
                  {difference === 0 
                    ? 'Reconciled ✓' 
                    : difference > 0 
                      ? 'Statement higher' 
                      : 'Book higher'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Summary */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Reconciliation Status</CardTitle>
              <CardDescription>
                Summary of reconciled and unreconciled transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Reconciled Transactions
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                    {reconciliationData.reconciled_transactions || 0}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                    Transactions matched with statement
                  </p>
                </div>

                <div className="p-6 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                      Unreconciled Transactions
                    </span>
                    <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                    {reconciliationData.unreconciled_transactions || 0}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-500 mt-2">
                    Requires reconciliation
                  </p>
                </div>
              </div>

              {difference !== 0 && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                        Reconciliation Required
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        There is a difference of {formatCurrency(Math.abs(difference))} between the statement balance and book balance. 
                        Review unreconciled transactions to identify the discrepancy.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {difference === 0 && reconciliationData.unreconciled_transactions === 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Fully Reconciled
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                        All transactions have been reconciled and balances match.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Reconciliation Actions</CardTitle>
              <CardDescription>
                Manage reconciliation for {selectedAccount?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  // Navigate to banking transactions for this account
                  window.location.href = `/banking?account=${selectedAccountId}`;
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Transactions
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  // Navigate to banking transactions with reconcile filter
                  window.location.href = `/banking/transactions?account=${selectedAccountId}&reconcile=true`;
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Reconcile Transactions
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={() => {
                  // Export reconciliation report
                  console.log('Export reconciliation');
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {selectedAccountId && loading && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedAccountId && !loading && !reconciliationData && (
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardContent className="p-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reconciliation data available</p>
              <p className="text-sm mt-2">
                Bank statement data is required for reconciliation
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
