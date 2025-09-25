"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ApprovalWorkflow, ApprovalItem } from "@/components/ui/approval-workflow"
import {
  ArrowLeft,
  Plus,
  Camera,
  Receipt,
  Upload,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Car,
  Utensils,
  Plane,
  Hotel,
  Fuel,
  Smartphone,
  Wifi,
  FileText,
  Save,
  Send,
  Brain,
  RefreshCw,
} from "lucide-react"

export function MobileExpenses() {
  const [activeTab, setActiveTab] = useState("approvals")
  
  const handleApprove = (item: ApprovalItem, comments: string) => {
    console.log('Approved expense claim:', { 
      id: item.id, 
      comments,
      approvedBy: 'current-user@company.com',
      approvedDate: new Date().toISOString()
    })
    alert(`Expense claim ${item.id} approved successfully!`)
  }

  const handleReject = (item: ApprovalItem, reason: string, comments: string) => {
    console.log('Rejected expense claim:', { 
      id: item.id, 
      reason, 
      comments,
      rejectedBy: 'current-user@company.com',
      rejectedDate: new Date().toISOString()
    })
    alert(`Expense claim ${item.id} rejected: ${reason}`)
  }

  const handleEdit = (item: ApprovalItem) => {
    console.log('Edit expense claim:', item.id)
    alert(`Opening editor for expense claim ${item.id}`)
  }

  const expenseRejectionReasons = [
    "Exceeds Policy Limits",
    "Missing Receipts",
    "Inappropriate Business Expense",
    "Duplicate Claim",
    "Incorrect Project Classification",
    "Outside Approval Date Range", 
    "Requires Manager Pre-Approval",
    "Other"
  ]
  const [expenseData, setExpenseData] = useState({
    category: "",
    amount: "",
    currency: "USD",
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    description: "",
    location: "",
    project: "",
    billable: false,
    recurring: false,
  })

  const [receipts, setReceipts] = useState<string[]>([])
  const [aiSuggestions, setAiSuggestions] = useState({
    enabled: true,
    suggestedCategory: "Travel",
    suggestedMerchant: "Uber",
    confidence: 92,
  })

  const expenseCategories = [
    { id: "travel", name: "Travel", icon: Plane, color: "bg-blue-500" },
    { id: "meals", name: "Meals & Entertainment", icon: Utensils, color: "bg-green-500" },
    { id: "transport", name: "Transportation", icon: Car, color: "bg-purple-500" },
    { id: "accommodation", name: "Accommodation", icon: Hotel, color: "bg-orange-500" },
    { id: "fuel", name: "Fuel", icon: Fuel, color: "bg-red-500" },
    { id: "office", name: "Office Supplies", icon: FileText, color: "bg-gray-500" },
    { id: "communication", name: "Communication", icon: Smartphone, color: "bg-indigo-500" },
    { id: "internet", name: "Internet", icon: Wifi, color: "bg-cyan-500" },
  ]

  // Enhanced expense claims with approval workflow
  const myExpenses: ApprovalItem[] = [
    {
      id: "EXP-2024-001",
      title: "Flight to New York - Client Meeting",
      type: "Expense Claim",
      amount: 450.00,
      submittedBy: "Current User",
      submittedDate: "2024-01-15",
      status: "Approved",
      priority: "High",
      description: "Flight to New York for client meeting",
      category: "Travel",
      merchant: "Delta Airlines",
      project: "TechCorp Project",
      billable: true,
      receipts: ["receipt1.jpg"],
      approvedBy: "manager@company.com",
      approvedDate: "2024-01-15"
    },
    {
      id: "EXP-2024-002",
      title: "Client Dinner Meeting",
      type: "Expense Claim",
      amount: 85.50,
      submittedBy: "Current User",
      submittedDate: "2024-01-14",
      status: "Pending Approval",
      priority: "Medium",
      description: "Client dinner meeting at The Steakhouse",
      category: "Meals",
      merchant: "The Steakhouse",
      project: "TechCorp Project",
      billable: true,
      receipts: ["receipt2.jpg"]
    },
    {
      id: "EXP-2024-003",
      title: "Airport Transfer - Uber",
      type: "Expense Claim",
      amount: 25.00,
      submittedBy: "Current User",
      submittedDate: "2024-01-14",
      status: "Draft",
      priority: "Low",
      description: "Airport transfer via Uber",
      category: "Transportation",
      merchant: "Uber",
      project: "TechCorp Project",
      billable: true,
      receipts: []
    },
    {
      id: "EXP-2024-004",
      title: "Office Supplies Purchase",
      type: "Expense Claim",
      amount: 120.00,
      submittedBy: "Current User",
      submittedDate: "2024-01-13",
      status: "Rejected",
      priority: "Low",
      description: "Printer paper and office supplies",
      category: "Office Supplies",
      merchant: "Office Depot",
      project: "General",
      billable: false,
      receipts: ["receipt3.jpg"],
      approvedBy: "manager@company.com",
      rejectionReason: "Non-essential items. Please use existing supplies."
    },
  ]

  const projects = [
    { id: "techcorp", name: "TechCorp Project" },
    { id: "global", name: "Global Dynamics" },
    { id: "startup", name: "StartupCorp Initiative" },
    { id: "general", name: "General Operations" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Draft":
        return "bg-gray-100 text-gray-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Draft":
        return <Edit className="h-4 w-4 text-gray-600" />
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getCategoryIcon = (category: string) => {
    const categoryData = expenseCategories.find((c) => c.name === category)
    if (categoryData) {
      const Icon = categoryData.icon
      return <Icon className="h-4 w-4" />
    }
    return <Receipt className="h-4 w-4" />
  }

  const handleCameraCapture = () => {
    // Simulate camera capture
    const newReceipt = `receipt_${Date.now()}.jpg`
    setReceipts([...receipts, newReceipt])

    // Simulate AI processing
    if (aiSuggestions.enabled) {
      setTimeout(() => {
        setExpenseData({
          ...expenseData,
          category: "travel",
          merchant: "Uber",
          amount: "25.00",
        })
      }, 1000)
    }
  }

  const totalExpenses = myExpenses.reduce((sum, expense) => {
    return sum + (expense.amount || 0)
  }, 0)

  const pendingExpenses = myExpenses.filter((e) => e.status === "Pending Approval").length
  const approvedExpenses = myExpenses.filter((e) => e.status === "Approved").length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Expenses</h1>
              <p className="text-sm text-gray-500">${totalExpenses.toFixed(2)} total</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2" onClick={handleCameraCapture}>
              <Camera className="h-5 w-5" />
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                          <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="approvals">Approvals ({myExpenses.length})</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="my-expenses">My Expenses</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Approval Workflow */}
        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="h-5 w-5" />
                Expense Claim Approval Workflow
              </CardTitle>
              <CardDescription>Review and approve expense claims with comprehensive audit trails</CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalWorkflow
                items={myExpenses}
                type="expense-claim"
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                rejectionReasons={expenseRejectionReasons}
                additionalFields={
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Category</label>
                      <p className="font-medium">{(myExpenses.find(e => e.id === "selectedItem?.id") as any)?.category || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Project</label>
                      <p className="font-medium">{(myExpenses.find(e => e.id === "selectedItem?.id") as any)?.project || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Merchant</label>
                      <p className="font-medium">{(myExpenses.find(e => e.id === "selectedItem?.id") as any)?.merchant || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Receipts</label>
                      <p className="font-medium">{(myExpenses.find(e => e.id === "selectedItem?.id") as any)?.receipts?.length || 0} attached</p>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Create Expense */}
        <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Expense Claim</CardTitle>
                <CardDescription>Capture and submit your business expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Receipt Capture */}
                <div>
                  <Label>Receipt</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center gap-2"
                      onClick={handleCameraCapture}
                    >
                      <Camera className="h-6 w-6" />
                      <span className="text-sm">Take Photo</span>
                    </Button>
                    <Button variant="outline" className="h-24 flex flex-col items-center gap-2">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">Upload File</span>
                    </Button>
                  </div>
                  {receipts.length > 0 && (
                    <div className="mt-3 flex gap-2">
                      {receipts.map((receipt, index) => (
                        <div key={index} className="relative">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-gray-500" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 text-white rounded-full"
                            onClick={() => setReceipts(receipts.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Suggestions */}
                {aiSuggestions.enabled && receipts.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">AI Analysis</span>
                      <Badge variant="outline" className="text-xs">
                        {aiSuggestions.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-blue-700 mb-2">
                      Detected: {aiSuggestions.suggestedCategory} expense from {aiSuggestions.suggestedMerchant}
                    </p>
                    <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                      Apply Suggestions
                    </Button>
                  </div>
                )}

                {/* Category Selection */}
                <div>
                  <Label>Category</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {expenseCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={expenseData.category === category.id ? "default" : "outline"}
                        className="h-auto p-3 flex flex-col items-center gap-2"
                        onClick={() => setExpenseData({ ...expenseData, category: category.id })}
                      >
                        <div className={`p-2 rounded-lg ${category.color}`}>
                          <category.icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs">{category.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={expenseData.amount}
                      onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={expenseData.currency}
                      onValueChange={(value) => setExpenseData({ ...expenseData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date and Merchant */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={expenseData.date}
                      onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Merchant</Label>
                    <Input
                      placeholder="Merchant name"
                      value={expenseData.merchant}
                      onChange={(e) => setExpenseData({ ...expenseData, merchant: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Expense description and business purpose"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                  />
                </div>

                {/* Project and Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Project</Label>
                    <Select
                      value={expenseData.project}
                      onValueChange={(value) => setExpenseData({ ...expenseData, project: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      placeholder="City, Country"
                      value={expenseData.location}
                      onChange={(e) => setExpenseData({ ...expenseData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Billable to Client</Label>
                    <Switch
                      checked={expenseData.billable}
                      onCheckedChange={(checked) => setExpenseData({ ...expenseData, billable: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Recurring Expense</Label>
                    <Switch
                      checked={expenseData.recurring}
                      onCheckedChange={(checked) => setExpenseData({ ...expenseData, recurring: checked })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Expenses */}
          <TabsContent value="my-expenses" className="space-y-4">
            {myExpenses.map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">{getCategoryIcon(expense.category)}</div>
                      <div>
                        <div className="font-medium text-sm">{expense.description}</div>
                        <div className="text-xs text-gray-500">
                          {expense.merchant} • {expense.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{expense.amount}</div>
                      <Badge className={getStatusColor(expense.status)}>
                        {getStatusIcon(expense.status)}
                        <span className="ml-1">{expense.status}</span>
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{expense.category}</Badge>
                    <Badge variant="outline">{expense.project}</Badge>
                    {expense.billable && <Badge className="bg-green-100 text-green-800">Billable</Badge>}
                  </div>

                  {expense.status === "Rejected" && expense.rejectionReason && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200 mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Rejection Reason</span>
                      </div>
                      <p className="text-sm text-red-700">{expense.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                          <SheetTitle>{expense.description}</SheetTitle>
                          <SheetDescription>{expense.id}</SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(80vh-120px)] mt-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm text-gray-500">Amount</Label>
                                <div className="font-bold text-lg">{expense.amount}</div>
                              </div>
                              <div>
                                <Label className="text-sm text-gray-500">Status</Label>
                                <Badge className={getStatusColor(expense.status)}>{expense.status}</Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Merchant</Label>
                              <div>{expense.merchant}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Date</Label>
                              <div>{expense.date}</div>
                            </div>
                            <div>
                              <Label className="text-sm text-gray-500">Project</Label>
                              <div>{expense.project}</div>
                            </div>
                            {expense.receipts.length > 0 && (
                              <div>
                                <Label className="text-sm text-gray-500">Receipts</Label>
                                <div className="flex gap-2 mt-2">
                                  {expense.receipts.map((receipt: string, index: number) => (
                                    <div
                                      key={index}
                                      className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                                    >
                                      <Receipt className="h-6 w-6 text-gray-500" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                    {expense.status === "Draft" && (
                      <Button size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {expense.status === "Rejected" && (
                      <Button size="sm" className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resubmit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Summary */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{approvedExpenses}</div>
                  <div className="text-sm text-gray-500">Approved</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingExpenses}</div>
                  <div className="text-sm text-gray-500">Pending</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Submitted</span>
                    <span className="font-bold">${totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approved Amount</span>
                    <span className="font-bold text-green-600">
                      $
                      {myExpenses
                        .filter((e) => e.status === "Approved")
                        .reduce((sum, e) => sum + (e.amount || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Amount</span>
                    <span className="font-bold text-yellow-600">
                      $
                      {myExpenses
                        .filter((e) => e.status === "Pending Approval")
                        .reduce((sum, e) => sum + (e.amount || 0), 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenseCategories.map((category) => {
                    const categoryExpenses = myExpenses.filter((e) => e.category === category.name)
                    const categoryTotal = categoryExpenses.reduce(
                      (sum, e) => sum + (e.amount || 0),
                      0,
                    )

                    if (categoryTotal === 0) return null

                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${category.color}`}>
                            <category.icon className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="font-medium">${categoryTotal.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
