"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  CreditCard, 
  Activity, 
  RefreshCw, 
  Link, 
  Zap, 
  Upload, 
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Banknote,
  PiggyBank,
  Wallet,
  Shield,
  Key,
  Globe,
  Network,
  Wifi,
  WifiOff,
  Signal,
  Battery,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Languages,
  HelpCircle,
  Info,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Share,
  Copy,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  Hash,
  Percent,
  Minus,
  Equal,
  Divide,
  Hash as HashIcon,
  FileSpreadsheet,
  FileImage,
  FilePdf,
  FileX,
  FileCheck,
  FileClock,
  FileAlert,
  FileMinus,
  FilePlus,
  FileEdit,
  FileSearch,
  FileBarChart,
  FilePieChart,
  FileLineChart,
  FileTrendingUp,
  FileTrendingDown,
  FileDollarSign,
  FilePercent,
  FileShield,
  FileKey,
  FileGlobe,
  FileUsers,
  FileBuilding,
  FileCreditCard,
  FileBanknote,
  FilePiggyBank,
  FileActivity,
  FileTarget,
  FileAward,
  FileStar,
  FileEye,
  FileTrash,
  FileMore,
  FileArrowUp,
  FileArrowDown,
  FileMinus as FileMinusIcon,
  FilePlus as FilePlusIcon,
  FileEqual,
  FileDivide,
  FileHash,
  FileTag,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  Users,
  Settings,
} from "lucide-react"

export function BankingOverview() {
  const [activeTab, setActiveTab] = useState("overview")

  const stats = [
    {
      title: "Total Balance",
      value: "$125,678",
      change: "+5.2%",
      changeType: "positive",
      icon: DollarSign,
      description: "Across all accounts"
    },
    {
      title: "Connected Accounts",
      value: "8",
      change: "+2",
      changeType: "positive",
      icon: CreditCard,
      description: "Bank integrations"
    },
    {
      title: "Pending Transactions",
      value: "156",
      change: "+12",
      changeType: "neutral",
      icon: Clock,
      description: "Awaiting processing"
    },
    {
      title: "Reconciliation Rate",
      value: "94.2%",
      change: "+2.1%",
      changeType: "positive",
      icon: CheckCircle,
      description: "This month"
    }
  ]

  const bankAccounts = [
    {
      id: "ACC-001",
      name: "Main Business Account",
      bank: "Chase Bank",
      accountNumber: "****1234",
      type: "checking",
      balance: 45678.90,
      status: "active",
      lastSync: "2024-01-15 14:30",
      integration: "plaid"
    },
    {
      id: "ACC-002",
      name: "Savings Account",
      bank: "Wells Fargo",
      accountNumber: "****5678",
      type: "savings",
      balance: 23456.78,
      status: "active",
      lastSync: "2024-01-15 13:45",
      integration: "plaid"
    },
    {
      id: "ACC-003",
      name: "Credit Card",
      bank: "American Express",
      accountNumber: "****9012",
      type: "credit",
      balance: -1234.56,
      status: "active",
      lastSync: "2024-01-15 12:15",
      integration: "manual"
    },
    {
      id: "ACC-004",
      name: "Investment Account",
      bank: "Fidelity",
      accountNumber: "****3456",
      type: "investment",
      balance: 56789.12,
      status: "inactive",
      lastSync: "2024-01-10 09:20",
      integration: "api"
    }
  ]

  const recentTransactions = [
    {
      id: "TXN-001",
      description: "Office Supplies - Staples",
      amount: -245.67,
      type: "debit",
      category: "Office Expenses",
      date: "2024-01-15",
      account: "Main Business Account",
      reconciled: true,
      aiCategorized: true
    },
    {
      id: "TXN-002",
      description: "Client Payment - ABC Corp",
      amount: 5000.00,
      type: "credit",
      category: "Client Revenue",
      date: "2024-01-14",
      account: "Main Business Account",
      reconciled: false,
      aiCategorized: true
    },
    {
      id: "TXN-003",
      description: "Monthly Rent Payment",
      amount: -2500.00,
      type: "debit",
      category: "Rent",
      date: "2024-01-13",
      account: "Main Business Account",
      reconciled: true,
      aiCategorized: false
    },
    {
      id: "TXN-004",
      description: "Software Subscription - Adobe",
      amount: -89.99,
      type: "debit",
      category: "Software",
      date: "2024-01-12",
      account: "Credit Card",
      reconciled: false,
      aiCategorized: true
    }
  ]

  const integrationStatus = [
    {
      provider: "Plaid",
      status: "connected",
      accounts: 3,
      lastSync: "2024-01-15 14:30",
      syncStatus: "success"
    },
    {
      provider: "Yodlee",
      status: "disconnected",
      accounts: 0,
      lastSync: "2024-01-10 09:20",
      syncStatus: "error"
    },
    {
      provider: "Manual Import",
      status: "active",
      accounts: 2,
      lastSync: "2024-01-15 12:15",
      syncStatus: "manual"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "inactive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "suspended": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getIntegrationColor = (integration: string) => {
    switch (integration) {
      case "plaid": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "yodlee": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "api": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "manual": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "manual": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banking</h1>
          <p className="text-muted-foreground">
            Manage bank accounts, transactions, and integrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={stat.changeType === "positive" ? "default" : stat.changeType === "negative" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Bank Accounts Summary */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  Connected accounts and balances
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bankAccounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {account.bank} • {account.accountNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-medium ${account.balance < 0 ? 'text-red-600' : ''}`}>
                            ${Math.abs(account.balance).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last sync: {account.lastSync}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          <Badge className={getStatusColor(account.status)}>
                            {account.status}
                          </Badge>
                          <Badge variant="outline" className={getIntegrationColor(account.integration)}>
                            {account.integration}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common banking tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Link className="h-4 w-4 mr-2" />
                  Connect with Plaid
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync All Accounts
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  View Transactions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Reconciliation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Account Management</CardTitle>
              <CardDescription>
                Manage connected bank accounts and integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </div>
              
              {/* Account Table Placeholder */}
              <div className="border rounded-lg">
                <div className="p-4 text-center text-muted-foreground">
                  Bank account table with integration status and sync information
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Management</CardTitle>
              <CardDescription>
                View and manage bank transactions with AI categorization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Transactions
                </Button>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        <Activity className={`h-5 w-5 ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.account} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.category}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={transaction.reconciled ? "default" : "secondary"}>
                          {transaction.reconciled ? "Reconciled" : "Pending"}
                        </Badge>
                        {transaction.aiCategorized && (
                          <Badge variant="outline" className="text-xs">
                            AI Categorized
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>
                  Bank integration providers and connection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {integrationStatus.map((integration) => (
                    <div key={integration.provider} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{integration.provider}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.accounts} accounts • Last sync: {integration.lastSync}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSyncStatusColor(integration.syncStatus)}>
                          {integration.syncStatus}
                        </Badge>
                        <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Integration Options</CardTitle>
                <CardDescription>
                  Available bank integration providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Plaid</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Connect to 11,000+ financial institutions
                    </p>
                    <Button size="sm" className="w-full">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Yodlee</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Enterprise-grade financial data platform
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Connect
                    </Button>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Network className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Direct API</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Custom bank API integrations
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bank Reconciliation</CardTitle>
              <CardDescription>
                Match bank transactions with accounting records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Reconciled</span>
                  </div>
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium">Discrepancies</span>
                  </div>
                  <p className="text-2xl font-bold">23</p>
                  <p className="text-sm text-muted-foreground">Issues</p>
                </div>
              </div>
              
              <div className="border rounded-lg">
                <div className="p-4 text-center text-muted-foreground">
                  Reconciliation interface with transaction matching and discrepancy resolution
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
