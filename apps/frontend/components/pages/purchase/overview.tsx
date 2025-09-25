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
  ShoppingCart,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Upload,
  Download,
  Send,
  Shield,
  TrendingUp,
  DollarSign,
  Building2,
  Zap,
  ArrowRight,
  FileCheck,
  Receipt,
  Package,
  Truck,
  XCircle,
  User,
  Mail,
  Phone,
  Globe,
  Star,
  StarOff,
  Award,
  Settings,
  BarChart3,
  TrendingDown,
  Activity,
  LineChart,
  PieChart,
  RefreshCw,
  Tag,
  Hash,
  Move,
  Bell,
  Calendar,
  Building,
  ArrowUpDown,
  MapPin,
  Brain,
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
import { ApprovalWorkflow, ApprovalItem } from "@/components/ui/approval-workflow"

// Enhanced purchase requisitions with approval workflow
const purchaseRequisitions: ApprovalItem[] = [
  {
    id: "PR-2024-001",
    title: "Laptop Computers - Dell XPS 15", 
    type: "Purchase Requisition",
    amount: 12500.00,
    submittedBy: "John Smith",
    submittedDate: "2024-01-15",
    status: "Approved",
    priority: "High",
    description: "Replacement laptops for development team. Current machines are 4+ years old and causing productivity issues.",
    department: "IT Department",
    vendor: "Dell Technologies",
    justification: "Critical for maintaining development velocity",
    approvedBy: "finance@company.com",
    approvedDate: "2024-01-15"
  },
  {
    id: "PR-2024-002",
    title: "Monthly Office Supplies Replenishment",
    type: "Purchase Requisition", 
    amount: 847.32,
    submittedBy: "Mike Davis",
    submittedDate: "2024-01-14",
    status: "Pending Approval",
    priority: "Medium",
    description: "Monthly office supplies replenishment including paper, pens, folders",
    department: "Marketing",
    vendor: "Office Depot",
    justification: "Regular monthly supplies for operations"
  },
  {
    id: "PR-2024-003",
    title: "Standing Desk Setup for HR Department",
    type: "Purchase Requisition",
    amount: 3200.00,
    submittedBy: "Sarah Wilson", 
    submittedDate: "2024-01-13",
    status: "Draft",
    priority: "Low",
    description: "4 standing desk setups for HR team to improve ergonomics",
    department: "Human Resources",
    vendor: "Herman Miller",
    justification: "Employee wellness and productivity improvement"
  },
  {
    id: "PR-2024-004",
    title: "Premium Coffee Machine",
    type: "Purchase Requisition",
    amount: 2800.00,
    submittedBy: "Alice Johnson",
    submittedDate: "2024-01-12", 
    status: "Rejected",
    priority: "Low",
    description: "High-end espresso machine for office break room",
    department: "Administration",
    vendor: "Commercial Coffee Solutions",
    justification: "Employee satisfaction and office amenities",
    approvedBy: "finance@company.com",
    rejectionReason: "Non-essential expense. Current coffee facilities are adequate."
  }
]

const vendors = [
  {
    id: "VEND-001",
    name: "Apple Inc.",
    code: "APPLE",
    contactPerson: "Steve Johnson",
    email: "procurement@apple.com",
    rating: 5,
    status: "Active",
    totalSpent: 84750.00,
    performance: {
      onTimeDelivery: 98,
      qualityRating: 5.0
    }
  },
  {
    id: "VEND-002",
    name: "Dell Technologies",
    code: "DELL",
    contactPerson: "Maria Rodriguez",
    email: "sales@dell.com",
    rating: 4,
    status: "Active",
    totalSpent: 45680.00,
    performance: {
      onTimeDelivery: 95,
      qualityRating: 4.8
    }
  }
]

export function PurchaseOverview() {
  const [selectedTab, setSelectedTab] = useState("overview")

  const handleApprove = (item: ApprovalItem, comments: string) => {
    console.log('Approved purchase requisition:', { 
      id: item.id, 
      comments,
      approvedBy: 'current-user@company.com',
      approvedDate: new Date().toISOString()
    })
    alert(`Purchase requisition ${item.id} approved successfully!`)
  }

  const handleReject = (item: ApprovalItem, reason: string, comments: string) => {
    console.log('Rejected purchase requisition:', { 
      id: item.id, 
      reason, 
      comments,
      rejectedBy: 'current-user@company.com',
      rejectedDate: new Date().toISOString()
    })
    alert(`Purchase requisition ${item.id} rejected: ${reason}`)
  }

  const handleEdit = (item: ApprovalItem) => {
    console.log('Edit purchase requisition:', item.id)
    alert(`Opening editor for purchase requisition ${item.id}`)
  }

  const purchaseRejectionReasons = [
    "Budget Exceeded",
    "Unauthorized Vendor",
    "Insufficient Justification", 
    "Duplicate Request",
    "Non-Essential Purchase",
    "Requires Competitive Bidding",
    "Department Budget Unavailable",
    "Other"
  ]

  const totalSpent = vendors.reduce((sum, vendor) => sum + vendor.totalSpent, 0)
  const activeVendors = vendors.filter(vendor => vendor.status === "Active").length
  const pendingRequisitions = purchaseRequisitions.filter(pr => pr.status === "Pending Approval").length

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Management</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive purchase requisition, order, and vendor management system
          </p>
        </div>
        <div className="flex items-center space-x-3">
              <Button variant="outline" size="lg" className="rounded-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
              </Button>
              <Button size="lg" className="rounded-full">
                <Plus className="w-4 h-4 mr-2" />
            Create Requisition
              </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">+12.5%</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Spent</p>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <Building className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Active</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active Vendors</p>
            <p className="text-2xl font-bold">{activeVendors}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Pending</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Requisitions</p>
            <p className="text-2xl font-bold">{pendingRequisitions}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">In Transit</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Orders In Transit</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requisitions">Purchase Requisitions</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Procurement Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseRequisitions.map((requisition) => (
                    <div key={requisition.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            requisition.status === "Approved"
                              ? "bg-green-100 text-green-600"
                              : requisition.status === "Pending Approval"
                              ? "bg-yellow-100 text-yellow-600"
                              : requisition.status === "Rejected"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{requisition.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {requisition.department} • ${requisition.amount?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{requisition.submittedDate}</p>
                        <Badge
                          className={
                            requisition.status === "Approved"
                              ? "bg-green-500/20 text-green-600 border-green-500/30"
                              : requisition.status === "Pending Approval"
                              ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                              : requisition.status === "Rejected"
                              ? "bg-red-500/20 text-red-600 border-red-500/30"
                              : "bg-gray-500/20 text-gray-600 border-gray-500/30"
                          }
                        >
                          {requisition.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Vendors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Top Vendors by Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.slice(0, 3).map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vendor.name}</p>
                        <p className="text-sm text-muted-foreground">{vendor.code} • {vendor.rating}⭐</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${vendor.totalSpent.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{vendor.performance.onTimeDelivery}% on-time</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Requisitions Tab */}
        <TabsContent value="requisitions" className="space-y-6">
          <Card className="rounded-4xl shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Requisition Approval Workflow
              </CardTitle>
              <CardDescription>Review and approve purchase requisitions with comprehensive audit trails</CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalWorkflow
                items={purchaseRequisitions}
                type="purchase-requisition"
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                rejectionReasons={purchaseRejectionReasons}
                additionalFields={
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Department</label>
                      <p className="font-medium">{(purchaseRequisitions.find(e => e.id === "selectedItem?.id") as any)?.department || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Vendor</label>
                      <p className="font-medium">{(purchaseRequisitions.find(e => e.id === "selectedItem?.id") as any)?.vendor || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-slate-600">Business Justification</label>
                      <p className="text-sm mt-1 p-3 bg-white rounded-lg border">{(purchaseRequisitions.find(e => e.id === "selectedItem?.id") as any)?.justification || "N/A"}</p>
                    </div>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vendors Tab */}
        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Vendor Management
              </CardTitle>
              <CardDescription>Manage vendor relationships and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>On-Time %</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>{vendor.code}</TableCell>
                        <TableCell>{vendor.contactPerson}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-1">{vendor.rating}</span>
                            <span className="text-yellow-500">⭐</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">${vendor.totalSpent.toFixed(2)}</TableCell>
                        <TableCell>{vendor.performance.onTimeDelivery}%</TableCell>
                        <TableCell>
                          <Badge variant={vendor.status === "Active" ? "default" : "secondary"}>
                            {vendor.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Procurement Analytics</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
                </Button>
              <Button size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Configure
                            </Button>
                          </div>
              </div>

          {/* Analytics Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Spend by Category
                </CardTitle>
                <CardDescription>Total spend distribution across categories</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                      <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Electronics</span>
                        </div>
                    <span className="font-medium">$130,430</span>
                      </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Office Supplies</span>
                        </div>
                    <span className="font-medium">$12,340</span>
                        </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Furniture</span>
                        </div>
                    <span className="font-medium">$2,990</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Vendor Performance
                </CardTitle>
                <CardDescription>Top performing vendors by rating</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors
                    .sort((a, b) => b.performance.qualityRating - a.performance.qualityRating)
                    .map((vendor) => (
                      <div key={vendor.id} className="flex items-center justify-between">
                <div>
                          <p className="font-medium">{vendor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vendor.performance.onTimeDelivery}% on-time delivery
                          </p>
                </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < vendor.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                </div>
                          <p className="text-sm text-muted-foreground">
                            {vendor.performance.qualityRating}/5.0
                          </p>
              </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
