"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { 
  CreditCard,
  Plus,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Save,
  Loader2
} from "lucide-react"
import { bankingService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { formatCurrency } from "@/lib/utils"

interface BankAccount {
  id: string
  name: string
  bank_name: string
  account_number: string
  account_type: string
  currency: string
  current_balance: number
  is_active: boolean
  company_name?: string
}

interface BankAccountFormData {
  name: string
  bank_name: string
  account_number: string
  routing_number: string
  account_type: string
  currency: string
  opening_balance: string
  notes: string
}

const accountTypes = [
  { value: 'checking', label: 'Checking' },
  { value: 'savings', label: 'Savings' },
  { value: 'money_market', label: 'Money Market' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'line_of_credit', label: 'Line of Credit' },
]

const currencies = [
  // Major currencies
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  // Southeast Asian (SEA) currencies
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'VND', label: 'VND - Vietnamese Dong' },
  { value: 'MMK', label: 'MMK - Myanmar Kyat' },
  { value: 'KHR', label: 'KHR - Cambodian Riel' },
  { value: 'LAK', label: 'LAK - Lao Kip' },
  { value: 'BND', label: 'BND - Brunei Dollar' },
  // Other major currencies
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
]

export function BankAccountsOverview() {
  const { withErrorHandling, error, handleError } = useErrorHandler()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)
  const [lastSync, setLastSync] = useState<string>("Never")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm<BankAccountFormData>({
    defaultValues: {
      name: '',
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_type: 'checking',
      currency: 'USD',
      opening_balance: '0.00',
      notes: '',
    }
  })

  const loadAccounts = async () => {
    await withErrorHandling(async () => {
      setLoading(true)
      const response = await bankingService.getBankAccounts()
      
      if (response.success && response.data) {
        const accountsData = response.data.results || response.data || []
        const accountsList = Array.isArray(accountsData) ? accountsData : []
        setAccounts(accountsList)
        
        // Calculate total balance
        const total = accountsList.reduce((sum: number, account: BankAccount) => {
          return sum + (parseFloat(account.current_balance?.toString() || '0') || 0)
        }, 0)
        setTotalBalance(total)
        
        // Set last sync time (mock for now)
        setLastSync("2 min ago")
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    loadAccounts()
  }, [])

  const handleCreateAccount = async (data: BankAccountFormData) => {
    setIsSubmitting(true)
    
    try {
      const accountData = {
        name: data.name,
        bank_name: data.bank_name,
        account_number: data.account_number,
        routing_number: data.routing_number || '',
        account_type: data.account_type,
        currency: data.currency,
        opening_balance: parseFloat(data.opening_balance) || 0,
        current_balance: parseFloat(data.opening_balance) || 0,
        notes: data.notes || '',
        is_active: true,
      }

      const response = await bankingService.createBankAccount(accountData)
      
      if (response.success) {
        reset()
        setShowCreateDialog(false)
        await loadAccounts() // Reload accounts after creation
      } else {
        handleError(new Error(response.message || 'Failed to create bank account'), {
          component: 'BankAccountsOverview',
          action: 'createBankAccount',
        })
      }
    } catch (err) {
      handleError(err, {
        component: 'BankAccountsOverview',
        action: 'createBankAccount',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bank Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected bank accounts and balances
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={loadAccounts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
                <DialogDescription>
                  Add a new bank account to your banking dashboard
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(handleCreateAccount)} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Account Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Account name is required' })}
                      placeholder="e.g., Main Checking Account"
                      className={errors.name ? 'border-destructive' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">Bank Name *</Label>
                    <Input
                      id="bank_name"
                      {...register('bank_name', { required: 'Bank name is required' })}
                      placeholder="e.g., Chase Bank"
                      className={errors.bank_name ? 'border-destructive' : ''}
                    />
                    {errors.bank_name && (
                      <p className="text-sm text-destructive">{errors.bank_name.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_number">Account Number *</Label>
                    <Input
                      id="account_number"
                      {...register('account_number', { required: 'Account number is required' })}
                      placeholder="e.g., 1234567890"
                      className={errors.account_number ? 'border-destructive' : ''}
                    />
                    {errors.account_number && (
                      <p className="text-sm text-destructive">{errors.account_number.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <Input
                      id="routing_number"
                      {...register('routing_number')}
                      placeholder="e.g., 021000021"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_type">Account Type *</Label>
                    <Select 
                      onValueChange={(value) => setValue('account_type', value)}
                      defaultValue="checking"
                    >
                      <SelectTrigger className={errors.account_type ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.account_type && (
                      <p className="text-sm text-destructive">{errors.account_type.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select 
                      onValueChange={(value) => setValue('currency', value)}
                      defaultValue="USD"
                    >
                      <SelectTrigger className={errors.currency ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.currency && (
                      <p className="text-sm text-destructive">{errors.currency.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opening_balance">Opening Balance *</Label>
                  <Input
                    id="opening_balance"
                    type="number"
                    step="0.01"
                    {...register('opening_balance', { 
                      required: 'Opening balance is required',
                      valueAsNumber: false,
                      validate: (value) => {
                        const num = parseFloat(value)
                        return !isNaN(num) || 'Opening balance must be a valid number'
                      }
                    })}
                    placeholder="0.00"
                    className={errors.opening_balance ? 'border-destructive' : ''}
                  />
                  {errors.opening_balance && (
                    <p className="text-sm text-destructive">{errors.opening_balance.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Additional notes about this account"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      reset()
                      setShowCreateDialog(false)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBalance, 'USD')}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all accounts</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Connected Accounts</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.length}</div>
                <p className="text-xs text-muted-foreground mt-2">Active connections</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Sync</CardTitle>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                  <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lastSync}</div>
                <p className="text-xs text-muted-foreground mt-2">Auto-sync enabled</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Transactions</CardTitle>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                  <Eye className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting categorization</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>
                Overview of all connected bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bank accounts found. Click "Add Account" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{account.name || `${account.bank_name} - ${account.account_type}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.account_number ? `****${account.account_number.slice(-4)}` : 'No account number'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(parseFloat(account.current_balance?.toString() || '0'), account.currency || 'USD')}
                        </p>
                        <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Manage Accounts</CardTitle>
              <CardDescription>
                Add, remove, or configure bank accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bank accounts found. Click "Add Account" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{account.name || `${account.bank_name} - ${account.account_type}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.bank_name} • {account.account_type}
                            {account.account_number && ` • ****${account.account_number.slice(-4)}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(parseFloat(account.current_balance?.toString() || '0'), account.currency || 'USD')}
                        </p>
                        <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                          {account.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Banking Settings</CardTitle>
              <CardDescription>
                Configure banking integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sync-frequency">Sync Frequency</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="1hour">Every hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="auto-categorize">Auto Categorize</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
