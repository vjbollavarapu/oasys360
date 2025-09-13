"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  FileText,
  DollarSign,
  Receipt,
  CreditCard,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"

export function MobileApprovals() {
  const [activeTab, setActiveTab] = useState("pending")
  const [selectedApproval, setSelectedApproval] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const pendingApprovals = [
    {
      id: "PR-2024-001",
      type: "Purchase Request",
      title: "Laptop Computers - Dell XPS 15",
      requester: {
        name: "John Doe",
        department: "IT",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      amount: "$45,000",
      currency: "USD",
      priority: "High",
      submittedDate: "2024-01-15",
      daysOld: 2,
      description:
        "Replacement laptops for development team. Current machines are 4+ years old and causing productivity issues.",
      justification:
        "Critical for maintaining development velocity. Current hardware cannot run latest development tools efficiently.",
      attachments: ["quote-dell-laptops.pdf", "technical-specs.pdf"],
      approvalChain: [
        { name: "Sarah Chen", role: "Department Manager", status: "approved", date: "2024-01-15" },
        { name: "You", role: "Finance Director", status: "pending", date: null },
        { name: "Mike Johnson", role: "CFO", status: "pending", date: null },
      ],
      vendor: "Dell Technologies",
      category: "IT Equipment",
    },
    {
      id: "EXP-2024-045",
      type: "Expense Claim",
      title: "Client Meeting - Travel Expenses",
      requester: {
        name: "Jane Smith",
        department: "Sales",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      amount: "$1,250",
      currency: "USD",
      priority: "Medium",
      submittedDate: "2024-01-14",
      daysOld: 1,
      description: "Travel expenses for client meeting in New York. Includes flight, hotel, and meals.",
      justification: "Critical client meeting that resulted in $50K contract signing.",
      attachments: ["flight-receipt.pdf", "hotel-receipt.pdf", "meal-receipts.pdf"],
      approvalChain: [{ name: "You", role: "Finance Director", status: "pending", date: null }],
      expenseBreakdown: [
        { item: "Flight", amount: "$450" },
        { item: "Hotel (2 nights)", amount: "$600" },
        { item: "Meals", amount: "$200" },
      ],
    },
    {
      id: "INV-2024-089",
      type: "Invoice Approval",
      title: "Consulting Services - Q4 2023",
      requester: {
        name: "Bob Wilson",
        department: "Operations",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      amount: "$8,750",
      currency: "USD",
      priority: "Low",
      submittedDate: "2024-01-12",
      daysOld: 3,
      description: "Quarterly consulting services for process optimization and efficiency improvements.",
      justification: "Resulted in 15% efficiency improvement and $25K annual cost savings.",
      attachments: ["consulting-invoice.pdf", "deliverables-report.pdf"],
      approvalChain: [
        { name: "Lisa Brown", role: "Department Manager", status: "approved", date: "2024-01-12" },
        { name: "You", role: "Finance Director", status: "pending", date: null },
      ],
      vendor: "Efficiency Consulting Group",
      category: "Professional Services",
    },
    {
      id: "PMT-2024-012",
      type: "Payment Authorization",
      title: "Vendor Payment - Marketing Campaign",
      requester: {
        name: "Alice Johnson",
        department: "Marketing",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      amount: "$23,750",
      currency: "USD",
      priority: "High",
      submittedDate: "2024-01-13",
      daysOld: 2,
      description: "Payment for Q1 marketing campaign development and execution.",
      justification: "Campaign generated 150% ROI and 500 new qualified leads.",
      attachments: ["campaign-invoice.pdf", "performance-report.pdf"],
      approvalChain: [
        { name: "David Lee", role: "Department Manager", status: "approved", date: "2024-01-13" },
        { name: "You", role: "Finance Director", status: "pending", date: null },
        { name: "Mike Johnson", role: "CFO", status: "pending", date: null },
      ],
      vendor: "Creative Solutions Agency",
      category: "Marketing Services",
    },
  ]

  const approvedItems = [
    {
      id: "PR-2024-002",
      type: "Purchase Request",
      title: "Office Furniture - Standing Desks",
      amount: "$12,500",
      approvedDate: "2024-01-14",
      requester: "Tom Brown",
    },
    {
      id: "EXP-2024-044",
      type: "Expense Claim",
      title: "Conference Attendance",
      amount: "$2,100",
      approvedDate: "2024-01-13",
      requester: "Sarah Wilson",
    },
  ]

  const rejectedItems = [
    {
      id: "PR-2024-003",
      type: "Purchase Request",
      title: "Premium Coffee Machine",
      amount: "$3,500",
      rejectedDate: "2024-01-12",
      requester: "Mike Davis",
      reason: "Non-essential expense. Current coffee facilities are adequate.",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Purchase Request":
        return <FileText className="h-4 w-4" />
      case "Expense Claim":
        return <Receipt className="h-4 w-4" />
      case "Invoice Approval":
        return <DollarSign className="h-4 w-4" />
      case "Payment Authorization":
        return <CreditCard className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

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
              <h1 className="text-lg font-semibold">Approvals</h1>
              <p className="text-sm text-gray-500">{pendingApprovals.length} pending</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingApprovals.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedItems.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedItems.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Approvals */}
          <TabsContent value="pending" className="space-y-4">
            {pendingApprovals.map((approval) => (
              <Card key={approval.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={approval.requester.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {approval.requester.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{approval.title}</div>
                        <div className="text-xs text-gray-500">
                          {approval.requester.name} • {approval.requester.department}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{approval.amount}</div>
                      <div className="text-xs text-gray-500">{approval.daysOld}d old</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getTypeIcon(approval.type)}
                      {approval.type}
                    </Badge>
                    <Badge className={getPriorityColor(approval.priority)}>{approval.priority}</Badge>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{approval.description}</p>

                  <div className="flex items-center gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedApproval(approval)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="bottom" className="h-[90vh]">
                        <SheetHeader>
                          <SheetTitle>{selectedApproval?.title}</SheetTitle>
                          <SheetDescription>
                            {selectedApproval?.type} • {selectedApproval?.id}
                          </SheetDescription>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(90vh-200px)] mt-4">
                          {selectedApproval && (
                            <div className="space-y-6">
                              {/* Requester Info */}
                              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={selectedApproval.requester.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {selectedApproval.requester.name
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{selectedApproval.requester.name}</div>
                                  <div className="text-sm text-gray-500">{selectedApproval.requester.department}</div>
                                  <div className="text-xs text-gray-400">
                                    Submitted {selectedApproval.submittedDate}
                                  </div>
                                </div>
                              </div>

                              {/* Amount & Priority */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <div className="text-sm text-gray-600">Amount</div>
                                  <div className="text-2xl font-bold text-blue-600">{selectedApproval.amount}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <div className="text-sm text-gray-600">Priority</div>
                                  <Badge className={getPriorityColor(selectedApproval.priority)}>
                                    {selectedApproval.priority}
                                  </Badge>
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <h3 className="font-medium mb-2">Description</h3>
                                <p className="text-sm text-gray-600">{selectedApproval.description}</p>
                              </div>

                              {/* Justification */}
                              <div>
                                <h3 className="font-medium mb-2">Business Justification</h3>
                                <p className="text-sm text-gray-600">{selectedApproval.justification}</p>
                              </div>

                              {/* Expense Breakdown (if applicable) */}
                              {selectedApproval.expenseBreakdown && (
                                <div>
                                  <h3 className="font-medium mb-2">Expense Breakdown</h3>
                                  <div className="space-y-2">
                                    {selectedApproval.expenseBreakdown.map((expense: any, index: number) => (
                                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm">{expense.item}</span>
                                        <span className="text-sm font-medium">{expense.amount}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Approval Chain */}
                              <div>
                                <h3 className="font-medium mb-2">Approval Chain</h3>
                                <div className="space-y-3">
                                  {selectedApproval.approvalChain.map((approver: any, index: number) => (
                                    <div key={index} className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                          approver.status === "approved"
                                            ? "bg-green-100 text-green-600"
                                            : approver.status === "pending"
                                              ? "bg-yellow-100 text-yellow-600"
                                              : "bg-gray-100 text-gray-600"
                                        }`}
                                      >
                                        {index + 1}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{approver.name}</div>
                                        <div className="text-xs text-gray-500">{approver.role}</div>
                                      </div>
                                      <Badge className={getStatusColor(approver.status)}>{approver.status}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Attachments */}
                              {selectedApproval.attachments && (
                                <div>
                                  <h3 className="font-medium mb-2">Attachments</h3>
                                  <div className="space-y-2">
                                    {selectedApproval.attachments.map((attachment: any, index: number) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <FileText className="h-4 w-4 text-gray-500" />
                                        <span className="text-sm flex-1">{attachment}</span>
                                        <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </ScrollArea>
                        <div className="flex gap-2 mt-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="flex-1">
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Reject Approval</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Please provide a reason for rejecting this request.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="py-4">
                                <Label htmlFor="rejection-reason">Reason for rejection</Label>
                                <Textarea
                                  id="rejection-reason"
                                  placeholder="Explain why this request is being rejected..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                  Reject Request
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button className="flex-1">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </SheetContent>
                    </Sheet>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Approved Items */}
          <TabsContent value="approved" className="space-y-4">
            {approvedItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        {item.requester} • Approved {item.approvedDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.amount}</div>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit">
                    {getTypeIcon(item.type)}
                    {item.type}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Rejected Items */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">
                        {item.requester} • Rejected {item.rejectedDate}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{item.amount}</div>
                      <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1 w-fit mb-2">
                    {getTypeIcon(item.type)}
                    {item.type}
                  </Badge>
                  <p className="text-xs text-gray-600">{item.reason}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
