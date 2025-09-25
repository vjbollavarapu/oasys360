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
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  Building2,
  Calendar,
  FileText,
  Calculator,
  DollarSign,
  Plus,
  Settings,
  Users,
  Briefcase,
  RefreshCw,
  CheckCircle,
  Eye,
  Globe,
  TrendingUp,
  Zap,
  PieChart,
  BarChart3,
  Clock,
  Landmark,
  AlertTriangle,
  ArrowUpRight,
  X,
  Save,
} from "lucide-react"

export function CompanyPortalOverview() {
  const [activeTab, setActiveTab] = useState("companies")
  const [liveFxEnabled, setLiveFxEnabled] = useState(true)
  const [selectedTaxType, setSelectedTaxType] = useState("gst")
  const [isSyncing, setIsSyncing] = useState(false)
  
  // Modal states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false)
  const [showCurrencySetupModal, setShowCurrencySetupModal] = useState(false)
  const [showTaxConfigModal, setShowTaxConfigModal] = useState(false)
  const [showConsolidationModal, setShowConsolidationModal] = useState(false)
  
  // Form states
  const [newCompany, setNewCompany] = useState({
    name: "",
    type: "branch",
    location: "",
    currency: "USD",
    fiscalYear: "01-01"
  })
  
  const { toast } = useToast()
  const router = useRouter()

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast({
        title: "Success",
        description: "Multi-company data synced successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAddCompany = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Company Added",
        description: `${newCompany.name} has been successfully added to your organization.`,
      })
      
      setShowAddCompanyModal(false)
      setNewCompany({
        name: "",
        type: "branch",
        location: "",
        currency: "USD",
        fiscalYear: "01-01"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add company. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCurrencySetup = () => {
    setActiveTab("currency")
    setShowCurrencySetupModal(false)
    toast({
      title: "Currency Setup",
      description: "Navigated to currency management section",
    })
  }

  const handleTaxConfig = () => {
    setActiveTab("tax")
    setShowTaxConfigModal(false)
    toast({
      title: "Tax Configuration",
      description: "Navigated to tax management section",
    })
  }

  const handleConsolidation = () => {
    setActiveTab("consolidation")
    setShowConsolidationModal(false)
    toast({
      title: "Consolidation Started",
      description: "Financial consolidation process initiated",
    })
  }

  const companies = [
    {
      id: "1",
      name: "TechFlow Solutions Inc.",
      type: "Headquarters",
      location: "New York, USA",
      fiscalYear: "Jan - Dec",
      currency: "USD",
      status: "Active",
      employees: 245,
    },
    {
      id: "2",
      name: "TechFlow Europe Ltd.",
      type: "Regional Office",
      location: "London, UK",
      fiscalYear: "Apr - Mar",
      currency: "GBP",
      status: "Active",
      employees: 89,
    },
    {
      id: "3",
      name: "TechFlow APAC Pte Ltd.",
      type: "Branch",
      location: "Singapore",
      fiscalYear: "Jan - Dec",
      currency: "SGD",
      status: "Setup",
      employees: 34,
    },
  ]

  const companyMetrics = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.status === "Active").length,
    totalEmployees: companies.reduce((sum, c) => sum + c.employees, 0),
    totalRevenue: "$2,847K",
    currencies: [...new Set(companies.map(c => c.currency))].length,
    revenueChange: "+18.5%"
  }

  const chartOfAccounts = [
    {
      code: "1000",
      name: "Cash and Cash Equivalents",
      type: "Asset",
      category: "Current Assets",
      balance: "$247,392",
      template: "Standard",
    },
    {
      code: "1200",
      name: "Accounts Receivable",
      type: "Asset",
      category: "Current Assets",
      balance: "$89,247",
      template: "Standard",
    },
    {
      code: "2000",
      name: "Accounts Payable",
      type: "Liability",
      category: "Current Liabilities",
      balance: "$34,892",
      template: "Standard",
    },
    {
      code: "3000",
      name: "Share Capital",
      type: "Equity",
      category: "Equity",
      balance: "$500,000",
      template: "Standard",
    },
    {
      code: "4000",
      name: "Revenue",
      type: "Income",
      category: "Operating Revenue",
      balance: "$1,247,392",
      template: "SaaS",
    },
  ]

  const taxConfigurations = [
    {
      country: "United States",
      taxType: "Sales Tax",
      rate: "8.25%",
      code: "US-ST",
      status: "Active",
      lastUpdated: "2024-01-15",
    },
    {
      country: "United Kingdom",
      taxType: "VAT",
      rate: "20%",
      code: "UK-VAT",
      status: "Active",
      lastUpdated: "2024-01-10",
    },
    {
      country: "Singapore",
      taxType: "GST",
      rate: "8%",
      code: "SG-GST",
      status: "Active",
      lastUpdated: "2024-01-12",
    },
    {
      country: "India",
      taxType: "WHT",
      rate: "10%",
      code: "IN-WHT",
      status: "Pending",
      lastUpdated: "2024-01-08",
    },
  ]

  const currencies = [
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      rate: "1.0000",
      lastUpdated: "2 minutes ago",
      change: "+0.00%",
      primary: true,
    },
    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      rate: "0.8547",
      lastUpdated: "2 minutes ago",
      change: "+0.12%",
      primary: false,
    },
    {
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      rate: "0.7834",
      lastUpdated: "2 minutes ago",
      change: "-0.08%",
      primary: false,
    },
    {
      code: "SGD",
      name: "Singapore Dollar",
      symbol: "S$",
      rate: "1.3421",
      lastUpdated: "2 minutes ago",
      change: "+0.05%",
      primary: false,
    },
  ]

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Portal</h1>
          <p className="text-muted-foreground mt-2">Manage multi-company operations and global compliance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full" 
            onClick={handleSyncData}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync All'}
          </Button>
          <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Create a new company entity in your organization
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Company Name
                  </Label>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter company name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Company Type
                  </Label>
                  <Select value={newCompany.type} onValueChange={(value) => setNewCompany(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="headquarters">Headquarters</SelectItem>
                      <SelectItem value="regional">Regional Office</SelectItem>
                      <SelectItem value="branch">Branch</SelectItem>
                      <SelectItem value="subsidiary">Subsidiary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newCompany.location}
                    onChange={(e) => setNewCompany(prev => ({ ...prev, location: e.target.value }))}
                    className="col-span-3"
                    placeholder="City, Country"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">
                    Currency
                  </Label>
                  <Select value={newCompany.currency} onValueChange={(value) => setNewCompany(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddCompanyModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCompany} disabled={!newCompany.name || !newCompany.location}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-1 p-1 bg-blue-50 rounded-2xl min-w-max">
            <TabsTrigger value="companies" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="accounts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <Calculator className="w-4 h-4 mr-2" />
              Chart of Accounts
            </TabsTrigger>
            <TabsTrigger value="tax" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <FileText className="w-4 h-4 mr-2" />
              Tax Management
            </TabsTrigger>
            <TabsTrigger value="currency" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Currency
            </TabsTrigger>
            <TabsTrigger value="consolidation" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Consolidation
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="companies" className="space-y-8">
          {/* Company Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Companies</p>
                    <p className="text-2xl font-bold text-blue-900">{companyMetrics.totalCompanies}</p>
                    <p className="text-xs text-blue-600 mt-1">{companyMetrics.activeCompanies} active</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Employees</p>
                    <p className="text-2xl font-bold text-green-900">{companyMetrics.totalEmployees}</p>
                    <p className="text-xs text-green-600 mt-1">Across all entities</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-purple-900">{companyMetrics.totalRevenue}</p>
                    <p className="text-xs text-purple-600 mt-1">{companyMetrics.revenueChange} growth</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Currencies</p>
                    <p className="text-2xl font-bold text-orange-900">{companyMetrics.currencies}</p>
                    <p className="text-xs text-orange-600 mt-1">Multi-currency setup</p>
                  </div>
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions with Modals */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-blue-600">
                Common multi-company management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <Dialog open={showAddCompanyModal} onOpenChange={setShowAddCompanyModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <Building2 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Add Company</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Dialog open={showCurrencySetupModal} onOpenChange={setShowCurrencySetupModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <Globe className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Currency Setup</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Currency Setup</DialogTitle>
                      <DialogDescription>
                        Configure multi-currency settings for your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        This will navigate you to the currency management section where you can:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>Enable/disable live exchange rates</li>
                        <li>Set your base currency</li>
                        <li>Configure supported currencies</li>
                        <li>Manage exchange rate providers</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCurrencySetupModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCurrencySetup}>
                        Go to Currency Setup
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showTaxConfigModal} onOpenChange={setShowTaxConfigModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <FileText className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Tax Config</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Tax Configuration</DialogTitle>
                      <DialogDescription>
                        Set up tax settings for different jurisdictions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Configure tax settings including:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>GST, VAT, and Sales Tax rates</li>
                        <li>Country-specific tax codes</li>
                        <li>Tax reporting requirements</li>
                        <li>Withholding tax settings</li>
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowTaxConfigModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleTaxConfig}>
                        Go to Tax Setup
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showConsolidationModal} onOpenChange={setShowConsolidationModal}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 bg-white border-blue-200 hover:bg-blue-50"
                    >
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      <span className="text-sm text-blue-900">Consolidate</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Financial Consolidation</DialogTitle>
                      <DialogDescription>
                        Generate consolidated financial reports
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-4">
                        <div>
                          <Label>Consolidation Period</Label>
                          <Select defaultValue="current-quarter">
                            <SelectTrigger className="mt-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="current-quarter">Current Quarter</SelectItem>
                              <SelectItem value="ytd">Year to Date</SelectItem>
                              <SelectItem value="previous-quarter">Previous Quarter</SelectItem>
                              <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Include Entities</Label>
                          <div className="mt-2 space-y-2">
                            {companies.map(company => (
                              <div key={company.id} className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked id={company.id} />
                                <Label htmlFor={company.id} className="text-sm">
                                  {company.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowConsolidationModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleConsolidation}>
                        Start Consolidation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Companies List */}
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Company Entities</CardTitle>
              <CardDescription className="text-blue-600">
                Manage your global company structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Company</TableHead>
                      <TableHead className="text-blue-900">Type</TableHead>
                      <TableHead className="text-blue-900">Location</TableHead>
                      <TableHead className="text-blue-900">Fiscal Year</TableHead>
                      <TableHead className="text-blue-900">Currency</TableHead>
                      <TableHead className="text-blue-900">Employees</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                      <TableHead className="text-blue-900">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id} className="border-blue-100">
                        <TableCell>
                          <div className="font-medium text-blue-900">{company.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              company.type === "Headquarters" 
                                ? "border-purple-200 text-purple-700 bg-purple-50"
                                : company.type === "Regional Office"
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : "border-green-200 text-green-700 bg-green-50"
                            }
                          >
                            {company.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-800">{company.location}</TableCell>
                        <TableCell className="text-blue-800">{company.fiscalYear}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                            {company.currency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-800">{company.employees}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              company.status === "Active" 
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {company.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => toast({ title: "View Details", description: `Viewing details for ${company.name}` })}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              onClick={() => toast({ title: "Company Settings", description: `Opening settings for ${company.name}` })}
                            >
                              <Settings className="w-4 h-4" />
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

        <TabsContent value="accounts" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Global Chart of Accounts</CardTitle>
                  <CardDescription className="text-blue-600">
                    Standardized accounting structure across all entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-48 border-blue-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Accounts</SelectItem>
                          <SelectItem value="assets">Assets</SelectItem>
                          <SelectItem value="liabilities">Liabilities</SelectItem>
                          <SelectItem value="equity">Equity</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expenses">Expenses</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Account
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-blue-200">
                            <TableHead className="text-blue-900">Code</TableHead>
                            <TableHead className="text-blue-900">Account Name</TableHead>
                            <TableHead className="text-blue-900">Type</TableHead>
                            <TableHead className="text-blue-900">Balance</TableHead>
                            <TableHead className="text-blue-900">Template</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chartOfAccounts.map((account) => (
                            <TableRow key={account.code} className="border-blue-100">
                              <TableCell className="font-mono text-blue-800">{account.code}</TableCell>
                              <TableCell className="font-medium text-blue-900">{account.name}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    account.type === "Asset" 
                                      ? "border-green-200 text-green-700 bg-green-50"
                                      : account.type === "Liability"
                                      ? "border-red-200 text-red-700 bg-red-50"
                                      : account.type === "Equity"
                                      ? "border-purple-200 text-purple-700 bg-purple-50"
                                      : account.type === "Income"
                                      ? "border-yellow-200 text-yellow-700 bg-yellow-50"
                                      : "border-orange-200 text-orange-700 bg-orange-50"
                                  }
                                >
                                  {account.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-blue-900 font-medium">{account.balance}</TableCell>
                              <TableCell className="text-blue-600">{account.template}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">Account Templates</CardTitle>
                  <CardDescription className="text-blue-600">
                    Pre-configured account structures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-900">Standard Template</h4>
                      <p className="text-xs text-blue-600">Basic accounting structure</p>
                      <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-900">SaaS Template</h4>
                      <p className="text-xs text-blue-600">Software company focused</p>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-200">Available</Badge>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-blue-100">
                      <h4 className="font-medium text-blue-900">Manufacturing</h4>
                      <p className="text-xs text-blue-600">Production-based accounts</p>
                      <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-200">Available</Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                    Apply Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Global Tax Configuration</CardTitle>
              <CardDescription className="text-blue-600">
                Manage tax settings across all jurisdictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Country</TableHead>
                      <TableHead className="text-blue-900">Tax Type</TableHead>
                      <TableHead className="text-blue-900">Rate</TableHead>
                      <TableHead className="text-blue-900">Code</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                      <TableHead className="text-blue-900">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxConfigurations.map((tax, index) => (
                      <TableRow key={index} className="border-blue-100">
                        <TableCell className="font-medium text-blue-900">{tax.country}</TableCell>
                        <TableCell className="text-blue-800">{tax.taxType}</TableCell>
                        <TableCell className="text-blue-800 font-mono">{tax.rate}</TableCell>
                        <TableCell className="text-blue-800 font-mono">{tax.code}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              tax.status === "Active" 
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-yellow-100 text-yellow-700 border-yellow-200"
                            }
                          >
                            {tax.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-blue-600">{tax.lastUpdated}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currency" className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Multi-Currency Management</CardTitle>
                  <CardDescription className="text-blue-600">
                    Live exchange rates and currency settings
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="live-fx" className="text-blue-900">Live FX</Label>
                  <Switch
                    id="live-fx"
                    checked={liveFxEnabled}
                    onCheckedChange={setLiveFxEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-blue-200">
                      <TableHead className="text-blue-900">Currency</TableHead>
                      <TableHead className="text-blue-900">Name</TableHead>
                      <TableHead className="text-blue-900">Rate</TableHead>
                      <TableHead className="text-blue-900">Change</TableHead>
                      <TableHead className="text-blue-900">Last Updated</TableHead>
                      <TableHead className="text-blue-900">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currencies.map((currency) => (
                      <TableRow key={currency.code} className="border-blue-100">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-blue-900">{currency.code}</span>
                            <span className="text-blue-800">{currency.symbol}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-blue-800">{currency.name}</TableCell>
                        <TableCell className="font-mono text-blue-900">{currency.rate}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            currency.change.startsWith('+') ? 'text-green-600' : 
                            currency.change.startsWith('-') ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {currency.change}
                          </span>
                        </TableCell>
                        <TableCell className="text-blue-600">{currency.lastUpdated}</TableCell>
                        <TableCell>
                          {currency.primary ? (
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">Primary</Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50">Secondary</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consolidation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Consolidation Status</CardTitle>
                <CardDescription className="text-blue-600">
                  Financial consolidation across entities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-blue-900">Q1 2024 Consolidation</div>
                    <div className="text-sm text-blue-600">3 entities included</div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-green-200">Complete</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100">
                  <div>
                    <div className="font-medium text-blue-900">Q2 2024 Consolidation</div>
                    <div className="text-sm text-blue-600">In progress</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader>
                <CardTitle className="text-purple-900">Quick Consolidate</CardTitle>
                <CardDescription className="text-purple-600">
                  Generate consolidated reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-900">Period</Label>
                  <Select defaultValue="current">
                    <SelectTrigger className="border-purple-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Quarter</SelectItem>
                      <SelectItem value="ytd">Year to Date</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => toast({ title: "Report Generated", description: "Consolidated report has been generated successfully" })}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
