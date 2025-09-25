"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle,
  TrendingDown,
  Eye,
  Edit,
  Clock,
  AlertTriangle,
} from "lucide-react"

export interface ApprovalItem {
  id: string
  title: string
  type: string
  amount?: number
  submittedBy: string
  submittedDate: string
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected'
  approvedBy?: string
  approvedDate?: string
  rejectionReason?: string
  priority?: 'Low' | 'Medium' | 'High'
  description?: string
  [key: string]: any // Allow additional fields
}

export interface ApprovalWorkflowProps {
  items: ApprovalItem[]
  type: string // 'journal-entry', 'purchase-requisition', 'expense-claim', etc.
  onApprove: (item: ApprovalItem, comments: string) => void
  onReject: (item: ApprovalItem, reason: string, comments: string) => void
  onEdit?: (item: ApprovalItem) => void
  rejectionReasons?: string[]
  additionalFields?: React.ReactNode
}

export function ApprovalWorkflow({
  items,
  type,
  onApprove,
  onReject,
  onEdit,
  rejectionReasons = [
    "Insufficient Documentation",
    "Incorrect Amount",
    "Unauthorized Transaction",
    "Duplicate Entry",
    "Policy Violation",
    "Requires Additional Approval",
    "Other"
  ],
  additionalFields
}: ApprovalWorkflowProps) {
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null)
  const [approvalComments, setApprovalComments] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")

  const handleApprovalAction = (item: ApprovalItem, action: "approve" | "reject") => {
    setSelectedItem(item)
    setApprovalAction(action)
    setIsApprovalDialogOpen(true)
    setApprovalComments("")
    setRejectionReason("")
  }

  const submitApproval = () => {
    if (!selectedItem || !approvalAction) return

    if (approvalAction === "approve") {
      onApprove(selectedItem, approvalComments)
    } else {
      onReject(selectedItem, rejectionReason, approvalComments)
    }

    // Reset state
    setIsApprovalDialogOpen(false)
    setSelectedItem(null)
    setApprovalAction(null)
    setApprovalComments("")
    setRejectionReason("")
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-300'
      case 'pending approval': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-300'
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending approval': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'draft': return <Edit className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="rounded-2xl bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {items.filter(item => item.status === "Approved").length}
            </div>
            {items.some(item => item.amount) && (
              <p className="text-xs text-green-600">
                ${items
                  .filter(item => item.status === "Approved")
                  .reduce((sum, item) => sum + (item.amount || 0), 0)
                  .toFixed(2)} total
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-700">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {items.filter(item => item.status === "Pending Approval").length}
            </div>
            <p className="text-xs text-yellow-600">Require approval</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {items.filter(item => item.status === "Rejected").length}
            </div>
            <p className="text-xs text-red-600">Need revision</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-gray-50 border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-700">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {items.filter(item => item.status === "Draft").length}
            </div>
            <p className="text-xs text-gray-600">Being prepared</p>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {item.type} • {item.submittedBy} • {item.submittedDate}
                      </p>
                    </div>
                  </div>
                  {item.priority && (
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  {item.amount && (
                    <div className="text-right">
                      <p className="font-bold">${item.amount.toFixed(2)}</p>
                    </div>
                  )}
                  
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-xl"
                      onClick={() => {
                        setSelectedItem(item)
                        setIsApprovalDialogOpen(true)
                        setApprovalAction(null)
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {item.status === "Pending Approval" && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleApprovalAction(item, "approve")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleApprovalAction(item, "reject")}
                        >
                          <TrendingDown className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {(item.status === "Draft" || item.status === "Rejected") && onEdit && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-xl"
                        onClick={() => onEdit(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-2xl rounded-4xl shadow-soft dark:shadow-soft-dark">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {approvalAction === "approve" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {approvalAction === "reject" && <TrendingDown className="w-5 h-5 text-red-600" />}
              {!approvalAction && <Eye className="w-5 h-5 text-blue-600" />}
              {approvalAction === "approve" ? "Approve Item" : 
               approvalAction === "reject" ? "Reject Item" : 
               "Review Item"}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && `${selectedItem.type} ${selectedItem.id} - ${selectedItem.submittedBy}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-6">
              {/* Item Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Type</Label>
                  <p className="font-medium">{selectedItem.type}</p>
                </div>
                {selectedItem.amount && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Amount</Label>
                    <p className="font-bold text-lg">${selectedItem.amount.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-slate-600">Submitted By</Label>
                  <p className="font-medium">{selectedItem.submittedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600">Date</Label>
                  <p className="font-medium">{selectedItem.submittedDate}</p>
                </div>
              </div>

              {/* Description */}
              {selectedItem.description && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Description</Label>
                  <p className="mt-1 p-3 bg-slate-50 rounded-lg text-sm">{selectedItem.description}</p>
                </div>
              )}

              {/* Additional Fields */}
              {additionalFields}

              {/* Current Status */}
              <div>
                <Label className="text-sm font-medium text-slate-600">Current Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={getStatusColor(selectedItem.status)}>
                    {selectedItem.status}
                  </Badge>
                  {selectedItem.approvedBy && selectedItem.status === "Approved" && (
                    <p className="text-sm text-slate-600 mt-1">
                      Approved by {selectedItem.approvedBy} on {selectedItem.approvedDate}
                    </p>
                  )}
                  {selectedItem.status === "Rejected" && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700 font-medium">Rejected by {selectedItem.approvedBy}</p>
                      {selectedItem.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          <strong>Reason:</strong> {selectedItem.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Action Form */}
              {approvalAction && (
                <div className="space-y-4 p-4 border rounded-xl">
                  <div className="flex items-center gap-2">
                    {approvalAction === "approve" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <h3 className="font-medium">
                      {approvalAction === "approve" ? "Approve this item" : "Reject this item"}
                    </h3>
                  </div>

                  {approvalAction === "reject" && (
                    <div>
                      <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                      <Select value={rejectionReason} onValueChange={setRejectionReason}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select rejection reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {rejectionReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>
                              {reason}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="approval-comments">
                      {approvalAction === "approve" ? "Approval Comments (Optional)" : "Additional Comments"}
                    </Label>
                    <Textarea
                      id="approval-comments"
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      placeholder={
                        approvalAction === "approve" 
                          ? "Add any comments about this approval..."
                          : "Provide additional details about the rejection..."
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-full" 
              onClick={() => {
                setIsApprovalDialogOpen(false)
                setApprovalAction(null)
                setApprovalComments("")
                setRejectionReason("")
              }}
            >
              Cancel
            </Button>
            {approvalAction && (
              <Button 
                className={`rounded-full ${
                  approvalAction === "approve" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
                onClick={submitApproval}
                disabled={approvalAction === "reject" && !rejectionReason}
              >
                {approvalAction === "approve" ? "Approve" : "Reject"}
              </Button>
            )}
            {!approvalAction && selectedItem?.status === "Pending Approval" && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setApprovalAction("reject")}
                >
                  Reject
                </Button>
                <Button 
                  className="rounded-full bg-green-600 hover:bg-green-700"
                  onClick={() => setApprovalAction("approve")}
                >
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 