"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DocumentUpload } from "@/components/ui/document-upload"
import { Receipt, Users, DollarSign, TrendingDown, TrendingUp, Plus, Eye, Edit } from "lucide-react"
import { ApprovalWorkflow, ApprovalItem } from "@/components/ui/approval-workflow"
import { useOrganization } from "@/hooks/use-organization"

// Mock data for petty cash accounts
const pettyCashAccounts = [
  {
    id: "PC-001",
    name: "Main Office Petty Cash",
    accountCode: "1100-001",
    custodian: "John Smith",
    currentBalance: 2500.00,
    maxAmount: 5000.00,
    status: "Active",
    lastReconciliation: "2024-01-15",
  },
  {
    id: "PC-002",
    name: "Branch Office Petty Cash",
    accountCode: "1100-002",
    custodian: "Sarah Wilson",
    currentBalance: 1800.00,
    maxAmount: 3000.00,
    status: "Active",
    lastReconciliation: "2024-01-14",
  },
]

// Enhanced petty cash transactions with approval workflow
const pettyCashTransactions: ApprovalItem[] = [
  {
    id: "PC-TXN-001",
    title: "Office Supplies Purchase - Staples",
    type: "Petty Cash Expense",
    amount: 150.00,
    submittedBy: "John Smith",
    submittedDate: "2024-01-15",
    status: "Approved",
    priority: "Medium",
    description: "Office supplies including paper, pens, folders, and staplers",
    account: "Office Expenses",
    category: "Office Supplies",
    custodian: "John Smith",
    receipt: "REC-001",
    approvedBy: "finance@company.com",
    approvedDate: "2024-01-15"
  },
  {
    id: "PC-TXN-002",
    title: "Client Meeting Refreshments",
    type: "Petty Cash Expense", 
    amount: 85.50,
    submittedBy: "Sarah Wilson",
    submittedDate: "2024-01-14",
    status: "Pending Approval",
    priority: "Low",
    description: "Coffee, pastries, and beverages for client presentation meeting",
    account: "Entertainment Expenses",
    category: "Meals & Entertainment",
    custodian: "Sarah Wilson",
    receipt: "REC-002"
  },
  {
    id: "PC-TXN-003",
    title: "Emergency Taxi Fare - Site Visit",
    type: "Petty Cash Expense",
    amount: 45.00,
    submittedBy: "Mike Davis",
    submittedDate: "2024-01-13",
    status: "Draft",
    priority: "Medium",
    description: "Urgent taxi fare for emergency client site visit",
    account: "Travel Expenses",
    category: "Transportation",
    custodian: "John Smith"
  },
  {
    id: "PC-TXN-004",
    title: "Team Lunch - Expensive Restaurant",
    type: "Petty Cash Expense",
    amount: 320.00,
    submittedBy: "Alice Johnson", 
    submittedDate: "2024-01-12",
    status: "Rejected",
    priority: "Low",
    description: "Team lunch at high-end restaurant for project celebration",
    account: "Entertainment Expenses",
    category: "Meals & Entertainment",
    custodian: "Sarah Wilson",
    receipt: "REC-003",
    approvedBy: "finance@company.com",
    rejectionReason: "Exceeds per-person limit for team meals"
  },
  {
    id: "PC-TXN-005",
    title: "Cash Replenishment - Main Office",
    type: "Petty Cash Replenishment",
    amount: 1000.00,
    submittedBy: "John Smith",
    submittedDate: "2024-01-14",
    status: "Approved",
    priority: "High",
    description: "Monthly cash replenishment for main office petty cash fund",
    account: "Petty Cash",
    category: "Cash Replenishment",
    custodian: "John Smith",
    approvedBy: "finance@company.com",
    approvedDate: "2024-01-14"
  }
]

export function PettyCashTab() {
  const { canAddTransaction } = useOrganization()
  const [activeTab, setActiveTab] = useState("transactions")
  const [isCreatePettyCashTransactionOpen, setIsCreatePettyCashTransactionOpen] = useState(false)
  const [selectedTransactionDate, setSelectedTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [showFileUpload, setShowFileUpload] = useState(false)

  const handleApprove = (item: ApprovalItem, comments: string) => {
    console.log('Approved petty cash transaction:', { 
      id: item.id, 
      comments,
      approvedBy: 'current-user@company.com',
      approvedDate: new Date().toISOString()
    })
    alert(`Petty cash transaction ${item.id} approved successfully!`)
  }

  const handleReject = (item: ApprovalItem, reason: string, comments: string) => {
    console.log('Rejected petty cash transaction:', { 
      id: item.id, 
      reason, 
      comments,
      rejectedBy: 'current-user@company.com',
      rejectedDate: new Date().toISOString()
    })
    alert(`Petty cash transaction ${item.id} rejected: ${reason}`)
  }

  const handleEdit = (item: ApprovalItem) => {
    console.log('Edit petty cash transaction:', item.id)
    alert(`Opening editor for petty cash transaction ${item.id}`)
  }

  const pettyCashRejectionReasons = [
    "Exceeds Amount Limit",
    "Missing Receipt",
    "Inappropriate Expense Category",
    "Insufficient Cash Balance", 
    "Unauthorized Custodian",
    "Duplicate Transaction",
    "Policy Violation",
    "Other"
  ]

  // File upload handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files)
      setAttachedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">Petty Cash Management</h2>
          <p className="text-blue-600">Manage petty cash accounts and transaction approvals</p>
        </div>
        <Button 
          size="lg" 
          className="rounded-full bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsCreatePettyCashTransactionOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Transaction
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="transactions" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Transaction Approvals
          </TabsTrigger>
          <TabsTrigger value="accounts" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Account Management
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card className="rounded-4xl shadow-soft border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Petty Cash Transaction Approval Workflow
              </CardTitle>
              <CardDescription className="text-blue-600">
                Review and approve petty cash transactions with comprehensive audit trails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalWorkflow
                items={pettyCashTransactions}
                type="petty-cash-transaction"
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                rejectionReasons={pettyCashRejectionReasons}
                additionalFields={
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Category</label>
                      <p className="font-medium text-blue-900">{(pettyCashTransactions.find(e => e.id === "selectedItem?.id") as any)?.category || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Custodian</label>
                      <p className="font-medium text-blue-900">{(pettyCashTransactions.find(e => e.id === "selectedItem?.id") as any)?.custodian || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Account</label>
                      <p className="font-medium text-blue-900">{(pettyCashTransactions.find(e => e.id === "selectedItem?.id") as any)?.account || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Receipt #</label>
                      <p className="font-medium text-blue-900">{(pettyCashTransactions.find(e => e.id === "selectedItem?.id") as any)?.receipt || "N/A"}</p>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          <Card className="rounded-4xl shadow-soft border-blue-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
                    <Receipt className="w-5 h-5" />
                    Petty Cash Accounts
                  </CardTitle>
                  <CardDescription className="text-blue-600">Manage petty cash accounts and custodians</CardDescription>
                </div>
                <Button size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {pettyCashAccounts.map((account) => (
                  <Card key={account.id} className="rounded-2xl shadow-soft border-blue-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-blue-900">{account.name}</CardTitle>
                        <Badge variant={account.status === "Active" ? "default" : "secondary"} className="rounded-full bg-green-100 text-green-700">
                          {account.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-blue-600">Code: {account.accountCode}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600">Custodian</p>
                          <p className="font-medium text-blue-900">{account.custodian}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Current Balance</p>
                          <p className="font-bold text-green-600">${account.currentBalance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Maximum Amount</p>
                          <p className="font-medium text-blue-900">${account.maxAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">Last Reconciliation</p>
                          <p className="font-medium text-blue-900">{account.lastReconciliation}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-blue-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(account.currentBalance / account.maxAmount) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-blue-600 text-center">
                        {((account.currentBalance / account.maxAmount) * 100).toFixed(1)}% of maximum
                      </p>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                          <Edit className="w-4 h-4 mr-2" />
                          Reconcile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Transaction Dialog */}
      <Dialog open={isCreatePettyCashTransactionOpen} onOpenChange={setIsCreatePettyCashTransactionOpen}>
        <DialogContent className="max-w-2xl rounded-4xl">
          <DialogHeader>
            <DialogTitle>Create Petty Cash Transaction</DialogTitle>
            <DialogDescription>
              Record a new petty cash transaction for approval
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account">Petty Cash Account</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {pettyCashAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction-type">Transaction Type</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="replenishment">Replenishment</SelectItem>
                    <SelectItem value="adjustment">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transaction-amount">Amount</Label>
                <Input id="transaction-amount" type="number" placeholder="0.00" className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office-supplies">Office Supplies</SelectItem>
                    <SelectItem value="travel">Travel & Transportation</SelectItem>
                    <SelectItem value="meals">Meals & Entertainment</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="transaction-description">Description</Label>
              <Textarea 
                id="transaction-description" 
                placeholder="Transaction description..."
                className="rounded-xl"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="receipt-number">Receipt Number</Label>
                <Input id="receipt-number" placeholder="Receipt/Reference number" className="rounded-xl" />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* File attachment section */}
            <div>
              <Label>Receipt Attachment</Label>
              <DocumentUpload />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setIsCreatePettyCashTransactionOpen(false)}>
              Cancel
            </Button>
            <Button className="rounded-full bg-blue-600 hover:bg-blue-700">
              Submit for Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 