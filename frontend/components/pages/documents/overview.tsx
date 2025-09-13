"use client"

import { useState } from "react"
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
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  File,
  Hash,
  Archive,
  Share2,
  Copy,
  RefreshCw,
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

export function DocumentsOverview() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocType, setSelectedDocType] = useState("all")
  const [selectedVendor, setSelectedVendor] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isVerifyOpen, setIsVerifyOpen] = useState(false)

  const documents = [
    {
      id: "DOC-2024-001",
      name: "Invoice_TechCorp_INV-2024-001.pdf",
      type: "Invoice",
      size: "2.4 MB",
      uploadDate: "2024-01-15",
      uploadedBy: "john.doe@company.com",
      linkedTo: "INV-2024-001",
      linkedType: "Sales Invoice",
      vendor: "TechCorp Solutions",
      amount: "$12,500.00",
      tags: ["Urgent", "Q1-2024", "Technology"],
      status: "Verified",
      blockchainHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
      ipfsHash: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
      verificationStatus: "Verified",
      lastVerified: "2024-01-15 14:32:15",
      downloadCount: 5,
      shareCount: 2,
    },
    {
      id: "DOC-2024-002",
      name: "PO_OfficeSupplies_PO-2024-003.pdf",
      type: "Purchase Order",
      size: "1.8 MB",
      uploadDate: "2024-01-14",
      uploadedBy: "jane.smith@company.com",
      linkedTo: "PO-2024-003",
      linkedType: "Purchase Order",
      vendor: "Office Supplies Inc",
      amount: "$3,247.50",
      tags: ["Office", "Recurring", "Approved"],
      status: "Pending Verification",
      blockchainHash: "0x2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q",
      ipfsHash: "QmZwBPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH",
      verificationStatus: "Pending",
      lastVerified: null,
      downloadCount: 3,
      shareCount: 1,
    },
    {
      id: "DOC-2024-003",
      name: "Receipt_Expense_EXP-2024-045.jpg",
      type: "Receipt",
      size: "856 KB",
      uploadDate: "2024-01-13",
      uploadedBy: "mike.johnson@company.com",
      linkedTo: "EXP-2024-045",
      linkedType: "Expense Entry",
      vendor: "Business Travel Corp",
      amount: "$847.32",
      tags: ["Travel", "Reimbursement", "Q1-2024"],
      status: "Verified",
      blockchainHash: "0x3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r",
      ipfsHash: "QmAwCPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI",
      verificationStatus: "Verified",
      lastVerified: "2024-01-13 16:45:22",
      downloadCount: 2,
      shareCount: 0,
    },
    {
      id: "DOC-2024-004",
      name: "Contract_VendorAgreement_SC-001.pdf",
      type: "Contract",
      size: "4.2 MB",
      uploadDate: "2024-01-12",
      uploadedBy: "sarah.chen@company.com",
      linkedTo: "SC-001",
      linkedType: "Smart Contract",
      vendor: "TechSupply Corp",
      amount: "$500,000.00",
      tags: ["Legal", "Annual", "Smart Contract"],
      status: "Verified",
      blockchainHash: "0x4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s",
      ipfsHash: "QmBxDPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ",
      verificationStatus: "Verified",
      lastVerified: "2024-01-12 10:15:33",
      downloadCount: 8,
      shareCount: 4,
    },
    {
      id: "DOC-2024-005",
      name: "BankStatement_Jan2024.xlsx",
      type: "Bank Statement",
      size: "3.1 MB",
      uploadDate: "2024-01-11",
      uploadedBy: "finance@company.com",
      linkedTo: "RECON-2024-001",
      linkedType: "Bank Reconciliation",
      vendor: "First National Bank",
      amount: "$247,392.00",
      tags: ["Banking", "Reconciliation", "Monthly"],
      status: "Integrity Warning",
      blockchainHash: "0x5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      ipfsHash: "QmCyEPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdK",
      verificationStatus: "Warning",
      lastVerified: "2024-01-11 09:30:45",
      downloadCount: 12,
      shareCount: 3,
    },
  ]

  const documentStats = {
    totalDocuments: documents.length,
    verifiedDocuments: documents.filter((doc) => doc.verificationStatus === "Verified").length,
    pendingVerification: documents.filter((doc) => doc.verificationStatus === "Pending").length,
    integrityWarnings: documents.filter((doc) => doc.verificationStatus === "Warning").length,
    totalStorage: "47.3 GB",
    monthlyUploads: 156,
    blockchainVerified: "98.7%",
  }

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "invoice":
      case "receipt":
      case "contract":
        return <FileText className="w-5 h-5" />
      case "purchase order":
        return <FileSpreadsheet className="w-5 h-5" />
      case "bank statement":
        return <FileSpreadsheet className="w-5 h-5" />
      default:
        return <File className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified":
        return "bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30"
      case "Pending Verification":
        return "bg-[#FFC700]/20 text-[#FFC700] border-[#FFC700]/30"
      case "Integrity Warning":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.linkedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = selectedDocType === "all" || doc.type === selectedDocType
    const matchesVendor = selectedVendor === "all" || doc.vendor === selectedVendor
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus

    return matchesSearch && matchesType && matchesVendor && matchesStatus
  })

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management System</h1>
          <p className="text-muted-foreground mt-2">
            Secure document storage with blockchain verification and intelligent search
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full">
                <Shield className="w-4 h-4 mr-2" />
                Verify Integrity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
              <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Blockchain Integrity Verification</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Verify document integrity using blockchain hash comparison
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Document Hash</Label>
                  <Input
                    placeholder="Enter document hash or upload file"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Blockchain Hash</Label>
                  <Input
                    placeholder="Enter blockchain transaction hash"
                    className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">Verification Result</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Document integrity verified successfully</div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsVerifyOpen(false)}
                  className="rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">Verify Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
              <DialogHeader className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 pb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upload Document</DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400 mt-1">
                  Upload and tag documents with automatic blockchain verification
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-1">
                <div className="space-y-6 py-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-2xl p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="mb-2">Drag and drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF, DOC, XLS, JPG, PNG (Max 50MB)</p>
                  <Button variant="outline" className="mt-4 rounded-full">
                    Choose Files
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Document Type</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white border border-gray-300 dark:border-gray-600 min-w-[200px] z-50">
                          <SelectItem value="invoice" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Invoice</SelectItem>
                          <SelectItem value="purchase-order" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Purchase Order</SelectItem>
                          <SelectItem value="receipt" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Receipt</SelectItem>
                          <SelectItem value="contract" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Contract</SelectItem>
                          <SelectItem value="bank-statement" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Bank Statement</SelectItem>
                          <SelectItem value="journal-entry" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Journal Entry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Link to Transaction</Label>
                      <Input
                        placeholder="INV-2024-001, PO-2024-003, etc."
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Vendor/Customer</Label>
                      <Select>
                        <SelectTrigger className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                          <SelectValue placeholder="Select vendor/customer" />
                        </SelectTrigger>
                        <SelectContent className="!bg-white dark:!bg-gray-900 !text-gray-900 dark:!text-white border border-gray-300 dark:border-gray-600 min-w-[200px] z-50">
                          <SelectItem value="techcorp" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">TechCorp Solutions</SelectItem>
                          <SelectItem value="office-supplies" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Office Supplies Inc</SelectItem>
                          <SelectItem value="business-travel" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">Business Travel Corp</SelectItem>
                          <SelectItem value="techsupply" className="!text-gray-900 dark:!text-white hover:!bg-gray-100 dark:hover:!bg-gray-700 focus:!bg-gray-100 dark:focus:!bg-gray-700 data-[highlighted]:!bg-gray-100 dark:data-[highlighted]:!bg-gray-700 data-[highlighted]:!text-gray-900 dark:data-[highlighted]:!text-white cursor-pointer">TechSupply Corp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Amount (Optional)</Label>
                      <Input 
                        placeholder="$0.00" 
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400" 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Tags</Label>
                      <Input
                        placeholder="Urgent, Q1-2024, Technology (comma separated)"
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">Description</Label>
                      <Textarea
                        placeholder="Optional description..."
                        className="rounded-xl bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Blockchain Verification</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically store hash on blockchain for integrity
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                </div>
              </div>
              <DialogFooter className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsUploadOpen(false)}
                  className="rounded-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white">Upload & Verify</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Document Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Total</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Documents</p>
            <p className="text-2xl font-bold">{documentStats.totalDocuments}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Verified</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Verified Docs</p>
            <p className="text-2xl font-bold">{documentStats.verifiedDocuments}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Pending</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Verification</p>
            <p className="text-2xl font-bold">{documentStats.pendingVerification}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Blockchain</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Verified Rate</p>
            <p className="text-2xl font-bold">{documentStats.blockchainVerified}</p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Document Library</CardTitle>
              <CardDescription>
                Search and filter documents by type, vendor, status, and more
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="rounded-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="rounded-full">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search documents by name, vendor, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
            <Select value={selectedDocType} onValueChange={setSelectedDocType}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Document Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Invoice">Invoice</SelectItem>
                <SelectItem value="Purchase Order">Purchase Order</SelectItem>
                <SelectItem value="Receipt">Receipt</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Bank Statement">Bank Statement</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Pending Verification">Pending Verification</SelectItem>
                <SelectItem value="Integrity Warning">Integrity Warning</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-full">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Document</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Vendor</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Upload Date</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-muted/50 rounded-xl">
                          {getFileIcon(doc.type)}
                        </div>
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">{doc.size}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full">
                        {doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{doc.vendor}</div>
                        <div className="text-sm text-muted-foreground">Linked: {doc.linkedTo}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">
                      {doc.amount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          doc.status === "Verified" ? "default" :
                          doc.status === "Pending Verification" ? "secondary" : "destructive"
                        }
                        className="rounded-full"
                      >
                        {doc.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{doc.uploadDate}</div>
                        <div className="text-sm text-muted-foreground">by {doc.uploadedBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                          <Download className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl">
                            <DropdownMenuLabel>Document Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Document
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Hash className="w-4 h-4 mr-2" />
                              View Blockchain Hash
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="w-4 h-4 mr-2" />
                              Verify Integrity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Document
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
