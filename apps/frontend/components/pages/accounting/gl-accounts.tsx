"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  FileText,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Filter,
} from "lucide-react"
import { accountingService } from '@/lib/api-services'
import { useErrorHandler } from '@/hooks/use-error-handler'

// Account form state
interface AccountFormData {
  code: string;
  name: string;
  type: string;
  parent?: string;
  description?: string;
  is_active?: boolean;
  normal_balance?: 'debit' | 'credit';
}

export function GLAccountsOverview() {
  return <GLAccountsTab />;
}

export function GLAccountsTab() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [isCreateGLAccountOpen, setIsCreateGLAccountOpen] = useState(false)
  const [expandedAccounts, setExpandedAccounts] = useState<{ [id: string]: boolean }>({})
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [formData, setFormData] = useState<AccountFormData>({
    code: '',
    name: '',
    type: 'asset',
    is_active: true,
    normal_balance: 'debit',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load accounts from backend
  const loadAccounts = useCallback(async () => {
    await withErrorHandling(async () => {
      setLoading(true);
      const response = await accountingService.getAccounts({ 
        limit: 1000, // Get all accounts
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter })
      });
      
      if (response.success && response.data) {
        const accountsData = response.data.results || response.data || [];
        setAccounts(accountsData);
      }
    });
    setLoading(false);
  }, [searchTerm, typeFilter, withErrorHandling]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const toggleExpand = (id: string) => {
    setExpandedAccounts(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Handle create account
  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    try {
      const response = await accountingService.createAccount({
        code: formData.code,
        name: formData.name,
        type: formData.type,
        parent: formData.parent || null,
        description: formData.description || '',
        is_active: formData.is_active !== false,
        normal_balance: formData.normal_balance || 'debit',
      });

      if (response.success) {
        await loadAccounts();
        setIsCreateGLAccountOpen(false);
        setFormData({
          code: '',
          name: '',
          type: 'asset',
          is_active: true,
          normal_balance: 'debit',
        });
      } else {
        handleError(new Error(response.message || 'Failed to create account'));
      }
    } catch (error) {
      handleError(error, 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build account tree structure from flat list
  const buildAccountTree = (accountsList: any[]) => {
    const accountMap = new Map();
    const rootAccounts: any[] = [];

    // First pass: create map of all accounts
    accountsList.forEach(account => {
      accountMap.set(account.id, {
        ...account,
        children: [],
        isHeader: account.parent === null || account.parent === undefined,
      });
    });

    // Second pass: build tree structure
    accountsList.forEach(account => {
      const accountNode = accountMap.get(account.id);
      if (account.parent && accountMap.has(account.parent)) {
        const parent = accountMap.get(account.parent);
        parent.children.push(accountNode);
      } else {
        rootAccounts.push(accountNode);
      }
    });

    return rootAccounts.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
  };

  const accountTree = buildAccountTree(accounts);

  // Format balance
  const formatBalance = (balance: number | string) => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (numBalance === 0) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numBalance);
  };

  // Get account type badge variant
  const getTypeBadgeVariant = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'asset': 'default',
      'liability': 'destructive',
      'equity': 'secondary',
      'income': 'outline',
      'expense': 'outline',
    };
    return typeMap[type.toLowerCase()] || 'outline';
  };

  return (
    <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Chart of Accounts
            </CardTitle>
            <CardDescription>Manage your chart of accounts - create, edit, or delete accounts.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-xl"
              onClick={loadAccounts}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <FileText className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog open={isCreateGLAccountOpen} onOpenChange={setIsCreateGLAccountOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Normal Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Create New General Ledger Account</DialogTitle>
                  <DialogDescription>
                    Add a new account to your chart of accounts with complete details
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-1">
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="account-code">Account Code *</Label>
                        <Input 
                          id="account-code" 
                          placeholder="e.g., 1000" 
                          className="rounded-xl"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-name">Account Name *</Label>
                        <Input 
                          id="account-name" 
                          placeholder="e.g., Cash and Cash Equivalents" 
                          className="rounded-xl"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="account-type">Account Type *</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => {
                          setFormData({ 
                            ...formData, 
                            type: value,
                            normal_balance: value === 'asset' || value === 'expense' ? 'debit' : 'credit'
                          });
                        }}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asset">Asset</SelectItem>
                          <SelectItem value="liability">Liability</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="parent-account">Parent Account (Optional)</Label>
                      <Select 
                        value={formData.parent || ''} 
                        onValueChange={(value) => setFormData({ ...formData, parent: value || undefined })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select parent account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No parent account</SelectItem>
                          {accounts.filter(acc => acc.id !== formData.parent).map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="account-description">Description</Label>
                      <Textarea 
                        id="account-description" 
                        placeholder="Detailed description of the account..." 
                        className="rounded-xl"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="normal-balance">Normal Balance</Label>
                      <Select 
                        value={formData.normal_balance || 'debit'} 
                        onValueChange={(value: 'debit' | 'credit') => setFormData({ ...formData, normal_balance: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="is-active" 
                        checked={formData.is_active !== false}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label htmlFor="is-active">Account is active</Label>
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button 
                    variant="outline" 
                    className="rounded-full" 
                    onClick={() => setIsCreateGLAccountOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="rounded-full" 
                    onClick={handleCreateAccount}
                    disabled={isSubmitting || !formData.code || !formData.name}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="mb-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="asset">Asset</SelectItem>
              <SelectItem value="liability">Liability</SelectItem>
              <SelectItem value="equity">Equity</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : accountTree.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No accounts found</p>
            <Button 
              variant="outline" 
              className="mt-4 rounded-full"
              onClick={() => setIsCreateGLAccountOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Account
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Account Code</TableHead>
                  <TableHead className="font-semibold">Account Name</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold text-right">Balance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountTree.map((account) => {
                  const renderAccountRow = (acc: any, level: number = 0) => (
                    <React.Fragment key={acc.id}>
                      <TableRow 
                        className={`hover:bg-muted/30 transition-colors ${
                          acc.is_system ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-l-blue-400' : 
                          acc.isHeader ? 'bg-amber-50 dark:bg-amber-950/20 font-semibold' : ''
                        }`}
                      >
                        <TableCell className="font-mono" style={{ paddingLeft: `${level * 24 + 16}px` }}>
                          {acc.children && acc.children.length > 0 ? (
                            <button
                              className="mr-2 text-lg font-bold text-blue-600 hover:text-blue-800"
                              onClick={() => toggleExpand(acc.id)}
                              aria-label={expandedAccounts[acc.id] ? 'Collapse' : 'Expand'}
                            >
                              {expandedAccounts[acc.id] ? '-' : '+'}
                            </button>
                          ) : (
                            <span className="mr-2 text-lg text-gray-400">•</span>
                          )}
                          <span className={acc.is_system ? 'text-blue-700 font-semibold' : ''}>
                            {acc.code}
                          </span>
                        </TableCell>
                        <TableCell className={`font-medium ${acc.is_system ? 'text-blue-700' : ''}`}>
                          {acc.name}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getTypeBadgeVariant(acc.type) as any}
                            className="rounded-full"
                          >
                            {acc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-mono ${
                          parseFloat(acc.balance || 0) < 0 ? 'text-red-600' : 
                          parseFloat(acc.balance || 0) > 0 ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {formatBalance(acc.balance || 0)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={acc.is_active !== false ? 'default' : 'destructive'} 
                            className="rounded-full"
                          >
                            {acc.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!acc.is_system && (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedAccounts[acc.id] && acc.children && acc.children.map((child: any) => 
                        renderAccountRow(child, level + 1)
                      )}
                    </React.Fragment>
                  );
                  return renderAccountRow(account);
                })}
              </TableBody>
            </Table>
          </div>
        )}
        </CardContent>
      </Card>
    );
  } 