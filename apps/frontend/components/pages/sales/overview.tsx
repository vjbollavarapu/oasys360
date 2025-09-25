"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  FileText,
  DollarSign,
  CreditCard,
  Users,
  Brain,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Send,
  Download,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  Zap,
  ArrowRight,
  Copy,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/ui/document-upload"

export function SalesOverview() {
  const [activeTab, setActiveTab] = useState("pipeline")
  const [isCreateQuoteOpen, setIsCreateQuoteOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [aiPricingEnabled, setAiPricingEnabled] = useState(true)

  const salesMetrics = {
    totalRevenue: "$2,847,392",
    monthlyRecurring: "$456,789",
    outstandingInvoices: "$89,247",
    conversionRate: "68.5%",
    averageDealSize: "$12,450",
    paymentSuccess: "97.8%",
    revenueGrowth: "+23.4%",
    recurringGrowth: "+18.7%",
  }

  const salesPipeline = [
    {
      id: "QT-2024-001",
      customer: "TechCorp Solutions",
      title: "Enterprise Software License",
      stage: "Quotation",
      amount: "$45,000",
      probability: 85,
      created: "2024-01-15",
      validUntil: "2024-02-15",
      aiSuggestion: "Increase probability to 90% based on customer engagement",
    },
    {
      id: "PF-2024-002",
      customer: "Global Dynamics",
      title: "Annual Subscription",
      stage: "Proforma",
      amount: "$78,500",
      probability: 75,
      created: "2024-01-14",
      validUntil: "2024-02-14",
      aiSuggestion: "Consider 5% discount to accelerate conversion",
    },
    {
      id: "SO-2024-003",
      customer: "StartupCorp",
      title: "Implementation Services",
      stage: "Sales Order",
      amount: "$23,750",
      probability: 95,
      created: "2024-01-13",
      validUntil: "2024-02-13",
      aiSuggestion: "Ready for invoicing - high conversion probability",
    },
    {
      id: "INV-2024-004",
      customer: "MegaCorp Industries",
      title: "Monthly Subscription",
      stage: "Invoice",
      amount: "$12,500",
      probability: 100,
      created: "2024-01-12",
      validUntil: "2024-01-27",
      aiSuggestion: "Payment expected within 3 days based on history",
    },
  ]

  const invoices = [
    {
      id: "INV-2024-001",
      customer: "TechCorp Solutions",
      amount: "$45,000.00",
      status: "Paid",
      dueDate: "2024-01-30",
      paidDate: "2024-01-28",
      paymentMethod: "Stripe",
      recurring: false,
      currency: "USD",
    },
    {
      id: "INV-2024-002",
      customer: "Global Dynamics",
      amount: "$6,541.67",
      status: "Pending",
      dueDate: "2024-02-15",
      paidDate: null,
      paymentMethod: null,
      recurring: true,
      currency: "USD",
    },
    {
      id: "INV-2024-003",
      customer: "CryptoTech Ltd",
      amount: "15.5 ETH",
      status: "Paid",
      dueDate: "2024-01-25",
      paidDate: "2024-01-24",
      paymentMethod: "Crypto Wallet",
      recurring: false,
      currency: "ETH",
    },
    {
      id: "INV-2024-004",
      customer: "StartupCorp",
      amount: "12,000 USDC",
      status: "Overdue",
      dueDate: "2024-01-20",
      paidDate: null,
      paymentMethod: null,
      recurring: false,
      currency: "USDC",
    },
  ]

  const customerLedger = [
    {
      date: "2024-01-28",
      reference: "INV-2024-001",
      description: "Enterprise Software License",
      debit: "$45,000.00",
      credit: "",
      balance: "$45,000.00",
      type: "Invoice",
    },
    {
      date: "2024-01-28",
      reference: "PMT-2024-001",
      description: "Payment via Stripe",
      debit: "",
      credit: "$45,000.00",
      balance: "$0.00",
      type: "Payment",
    },
    {
      date: "2024-01-15",
      reference: "CN-2024-001",
      description: "Service Credit - Downtime",
      debit: "",
      credit: "$2,500.00",
      balance: "-$2,500.00",
      type: "Credit Note",
    },
    {
      date: "2024-01-10",
      reference: "DN-2024-001",
      description: "Late Payment Fee",
      debit: "$150.00",
      credit: "",
      balance: "-$2,350.00",
      type: "Debit Note",
    },
  ]

  const recurringInvoices = [
    {
      id: "REC-001",
      customer: "Global Dynamics",
      template: "Monthly Subscription",
      amount: "$6,541.67",
      frequency: "Monthly",
      nextInvoice: "2024-02-01",
      status: "Active",
      totalInvoices: 12,
      successRate: "100%",
    },
    {
      id: "REC-002",
      customer: "TechFlow Solutions",
      template: "Quarterly Maintenance",
      amount: "$15,750.00",
      frequency: "Quarterly",
      nextInvoice: "2024-04-01",
      status: "Active",
      totalInvoices: 4,
      successRate: "100%",
    },
    {
      id: "REC-003",
      customer: "StartupCorp",
      template: "Annual License",
      amount: "$23,400.00",
      frequency: "Annually",
      nextInvoice: "2025-01-15",
      status: "Paused",
      totalInvoices: 1,
      successRate: "0%",
    },
  ]

  const paymentMethods = [
    {
      type: "Stripe",
      status: "Connected",
      transactions: 156,
      volume: "$1,247,392",
      successRate: "98.2%",
      fees: "$36,421",
    },
    {
      type: "Ethereum Wallet",
      status: "Connected",
      transactions: 23,
      volume: "245.7 ETH",
      successRate: "100%",
      fees: "2.1 ETH",
    },
    {
      type: "USDC Wallet",
      status: "Connected",
      transactions: 45,
      volume: "456,789 USDC",
      successRate: "97.8%",
      fees: "1,234 USDC",
    },
  ]

  const aiInsights = [
    {
      type: "Pricing Optimization",
      message: "Consider 8% price increase for Enterprise tier based on market analysis",
      confidence: 92,
      impact: "+$45K annual revenue",
      action: "Review Pricing",
    },
    {
      type: "Payment Prediction",
      message: "Global Dynamics likely to pay 2 days early based on payment history",
      confidence: 87,
      impact: "Improved cash flow",
      action: "Update Forecast",
    },
    {
      type: "Upsell Opportunity",
      message: "TechCorp Solutions ready for premium features upgrade",
      confidence: 94,
      impact: "+$12K potential revenue",
      action: "Create Quote",
    },
    {
      type: "Risk Alert",
      message: "StartupCorp showing payment delay patterns - consider credit review",
      confidence: 78,
      impact: "Risk mitigation",
      action: "Review Credit",
    },
  ]

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Management</h1>
          <p className="text-muted-foreground mt-2">
            Complete quote-to-cash workflow with AI-powered pricing and multi-currency payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="lg" className="rounded-full">
            <Brain className="w-4 h-4 mr-2" />
            AI Insights
          </Button>
          <Dialog open={isCreateQuoteOpen} onOpenChange={setIsCreateQuoteOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                New Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
              <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Quotation</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Build a new quote with AI-powered pricing suggestions
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Customer</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent className="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white border border-gray-300 dark:border-gray-600 min-w-[200px] z-50">
                        <SelectItem 
                          value="techcorp" 
                          className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer"
                        >
                          TechCorp Solutions
                        </SelectItem>
                        <SelectItem 
                          value="global" 
                          className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer"
                        >
                          Global Dynamics
                        </SelectItem>
                        <SelectItem 
                          value="startup" 
                          className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer"
                        >
                          StartupCorp
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="valid-until" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Valid Until</Label>
                    <Input
                      id="valid-until"
                      type="date"
                      className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                      defaultValue="2024-02-15"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="quote-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quote Title</Label>
                  <Input
                    id="quote-title"
                    placeholder="Enterprise Software License"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-gray-100">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of products/services..."
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Line Items</Label>
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Pricing</Label>
                      <Switch checked={aiPricingEnabled} onCheckedChange={setAiPricingEnabled} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-3">
                      <Input
                        placeholder="Product/Service"
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                      <Input 
                        placeholder="Quantity" 
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" 
                      />
                      <Input 
                        placeholder="Unit Price" 
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" 
                      />
                      <Input 
                        placeholder="Total" 
                        className="rounded-xl bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" 
                        readOnly 
                      />
                      <Button variant="outline" size="icon" className="rounded-xl border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {aiPricingEnabled && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            AI suggests $45,000 based on similar deals (92% confidence)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Supporting Documents</Label>
                    <DocumentUpload linkedTo="QT-2024-NEW" linkedType="Quotation" className="rounded-xl" />
                  </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button variant="outline" className="rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setIsCreateQuoteOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">Create Quote</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">{salesMetrics.revenueGrowth}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">{salesMetrics.totalRevenue}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">{salesMetrics.recurringGrowth}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Recurring</p>
            <p className="text-2xl font-bold">{salesMetrics.monthlyRecurring}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">{salesMetrics.averageDealSize}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold">{salesMetrics.conversionRate}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">{salesMetrics.outstandingInvoices}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Payment Success</p>
            <p className="text-2xl font-bold">{salesMetrics.paymentSuccess}</p>
          </div>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Sales Insights
                <Badge variant="default" className="rounded-full">Live</Badge>
              </CardTitle>
              <CardDescription>
                Real-time AI recommendations for pricing, payments, and opportunities
              </CardDescription>
            </div>
            <Button variant="outline" className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiInsights.map((insight, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-2xl border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        insight.type === "Pricing Optimization" ? "default" :
                        insight.type === "Payment Prediction" ? "secondary" :
                        insight.type === "Upsell Opportunity" ? "outline" : "destructive"
                      }
                      className="rounded-full"
                    >
                      {insight.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{insight.confidence}% confidence</div>
                </div>
                <p className="text-sm mb-3">{insight.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-primary font-medium">{insight.impact}</span>
                  <Button size="sm" variant="outline" className="rounded-full">
                    {insight.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
          <TabsTrigger value="pipeline" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Sales Pipeline
          </TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <DollarSign className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="recurring" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recurring
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Customer Ledger
          </TabsTrigger>
        </TabsList>

        {/* Sales Pipeline */}
        <TabsContent value="pipeline">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Sales Pipeline</CardTitle>
                  <CardDescription>
                    Quote → Proforma → Sales Order → Invoice → Payment workflow
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search pipeline..."
                      className="pl-10 rounded-xl w-64"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">ID</TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Title</TableHead>
                      <TableHead className="font-semibold">Stage</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                      <TableHead className="font-semibold">Probability</TableHead>
                      <TableHead className="font-semibold">AI Suggestion</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPipeline.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono">{item.id}</TableCell>
                        <TableCell>{item.customer}</TableCell>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.stage === "Invoice" ? "default" :
                              item.stage === "Sales Order" ? "secondary" :
                              item.stage === "Proforma" ? "outline" : "destructive"
                            }
                            className="rounded-full"
                          >
                            {item.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">{item.amount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${item.probability}%` }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground">{item.probability}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-muted-foreground truncate" title={item.aiSuggestion}>
                            {item.aiSuggestion}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Invoice Management</CardTitle>
                  <CardDescription>
                    Multi-currency invoices with crypto and traditional payment support
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button className="rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Invoice ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="font-semibold">Payment Method</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono">{invoice.id}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell className="text-right font-mono">{invoice.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.status === "Paid" ? "default" :
                            invoice.status === "Pending" ? "secondary" : "destructive"
                          }
                          className="rounded-full"
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {invoice.paymentMethod === "Stripe" && <CreditCard className="w-4 h-4 text-[#4B0082]" />}
                          {invoice.paymentMethod === "Crypto Wallet" && <Wallet className="w-4 h-4 text-[#00FFC6]" />}
                          <span className="text-sm">{invoice.paymentMethod || "Pending"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            invoice.recurring ? "default" : "outline"
                          }
                          className="rounded-full"
                        >
                          {invoice.recurring ? "Recurring" : "One-time"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Send className="w-4 h-4" />
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

        {/* Recurring Invoices */}
        <TabsContent value="recurring">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recurring Invoices</CardTitle>
                  <CardDescription>
                    Automated recurring billing with customizable schedules
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Recurring
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Template ID</TableHead>
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Template</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Frequency</TableHead>
                    <TableHead className="font-semibold">Next Invoice</TableHead>
                    <TableHead className="font-semibold">Success Rate</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurringInvoices.map((recurring) => (
                    <TableRow key={recurring.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono">{recurring.id}</TableCell>
                      <TableCell>{recurring.customer}</TableCell>
                      <TableCell>{recurring.template}</TableCell>
                      <TableCell className="text-right font-mono">{recurring.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-full"
                        >
                          {recurring.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>{recurring.nextInvoice}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{recurring.successRate}</span>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              recurring.successRate === "100%" ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            recurring.status === "Active" ? "default" : "destructive"
                          }
                          className="rounded-full"
                        >
                          {recurring.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Clock className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Zap className="w-4 h-4" />
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

        {/* Payment Methods */}
        <TabsContent value="payments">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Payment Methods</CardTitle>
                  <CardDescription>
                    Set up and manage payment processing options
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-3">
                {paymentMethods.map((method, index) => (
                  <Card key={index} className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {method.type === "Stripe" && <CreditCard className="w-5 h-5 text-[#4B0082]" />}
                          {method.type.includes("Wallet") && <Wallet className="w-5 h-5 text-[#00FFC6]" />}
                          <span className="text-sm">{method.type}</span>
                        </div>
                        <Badge
                          variant={
                            method.status === "Connected" ? "default" : "destructive"
                          }
                          className="rounded-full"
                        >
                          {method.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Transactions</div>
                          <div className="text-lg font-semibold">{method.transactions}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Volume</div>
                          <div className="text-lg font-semibold">{method.volume}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Success Rate</div>
                          <div className="text-lg font-semibold text-primary">{method.successRate}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Fees</div>
                          <div className="text-lg font-semibold">{method.fees}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Ledger */}
        <TabsContent value="customers">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Customer Ledger</CardTitle>
                  <CardDescription>
                    Complete transaction history with credit/debit notes
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <Select defaultValue="techcorp">
                    <SelectTrigger className="w-64 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="techcorp">TechCorp Solutions</SelectItem>
                      <SelectItem value="global">Global Dynamics</SelectItem>
                      <SelectItem value="startup">StartupCorp</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-muted/20 rounded-lg border border-muted">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">TechCorp Solutions</h3>
                    <p className="text-sm text-muted-foreground">Customer since January 2023</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">$0.00</div>
                    <div className="text-sm text-muted-foreground">Current Balance</div>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Reference</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Debit</TableHead>
                    <TableHead className="font-semibold">Credit</TableHead>
                    <TableHead className="font-semibold">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customerLedger.map((entry, index) => (
                    <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground">{entry.date}</TableCell>
                      <TableCell className="font-mono">{entry.reference}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            entry.type === "Invoice" ? "default" :
                            entry.type === "Payment" ? "secondary" :
                            entry.type === "Credit Note" ? "outline" : "destructive"
                          }
                          className="rounded-full"
                        >
                          {entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-red-400 font-medium">{entry.debit}</TableCell>
                      <TableCell className="text-primary font-medium">{entry.credit}</TableCell>
                      <TableCell className="text-muted-foreground font-bold">{entry.balance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
