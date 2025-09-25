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
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Users,
  Activity,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Download,
  Search,
  Settings,
  UserCheck,
  FileText,
  Globe,
  Smartphone,
  Mail,
  Bell,
  Trash2,
  Edit,
  Plus,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export function SecurityOverview() {
  const [activeTab, setActiveTab] = useState("rbac")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedAction, setSelectedAction] = useState("all")
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isComplianceDialogOpen, setIsComplianceDialogOpen] = useState(false)

  const securityStats = {
    totalUsers: 247,
    activeRoles: 12,
    mfaEnabled: 189,
    complianceScore: 94,
    lastAudit: "2024-01-15",
    criticalAlerts: 3,
    passwordCompliance: 87,
    gdprRequests: 5,
  }

  const roles = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full system access and tenant management",
      permissions: ["*"],
      users: 3,
      type: "System",
      createdBy: "system",
      createdAt: "2024-01-01",
      lastModified: "2024-01-15",
    },
    {
      id: "2",
      name: "Finance Manager",
      description: "Full access to financial modules and reporting",
      permissions: ["accounting.*", "reports.*", "banking.*", "documents.read"],
      users: 12,
      type: "Custom",
      createdBy: "admin@company.com",
      createdAt: "2024-01-05",
      lastModified: "2024-01-12",
    },
    {
      id: "3",
      name: "Sales Representative",
      description: "Access to sales module and customer data",
      permissions: ["sales.*", "customers.read", "documents.read"],
      users: 45,
      type: "Custom",
      createdBy: "hr@company.com",
      createdAt: "2024-01-03",
      lastModified: "2024-01-10",
    },
    {
      id: "4",
      name: "Auditor",
      description: "Read-only access to all financial data",
      permissions: ["*.read", "reports.export", "audit.*"],
      users: 8,
      type: "Compliance",
      createdBy: "compliance@company.com",
      createdAt: "2024-01-02",
      lastModified: "2024-01-08",
    },
  ]

  const activityLogs = [
    {
      id: "1",
      timestamp: "2024-01-15 14:32:15",
      user: "john.doe@company.com",
      action: "Document Viewed",
      resource: "Invoice_TechCorp_INV-2024-001.pdf",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome 120.0.0.0",
      location: "New York, US",
      status: "Success",
      details: "Document accessed via web interface",
      riskLevel: "Low",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:28:43",
      user: "jane.smith@company.com",
      action: "Role Modified",
      resource: "Finance Manager Role",
      ipAddress: "192.168.1.105",
      userAgent: "Firefox 121.0.0.0",
      location: "London, UK",
      status: "Success",
      details: "Added document.write permission",
      riskLevel: "Medium",
    },
    {
      id: "3",
      timestamp: "2024-01-15 14:25:12",
      user: "mike.johnson@company.com",
      action: "Failed Login",
      resource: "Authentication System",
      ipAddress: "203.0.113.45",
      userAgent: "Chrome 119.0.0.0",
      location: "Unknown",
      status: "Failed",
      details: "Invalid 2FA code - 3rd attempt",
      riskLevel: "High",
    },
    {
      id: "4",
      timestamp: "2024-01-15 14:20:33",
      user: "sarah.chen@company.com",
      action: "Data Export",
      resource: "Financial Report Q4-2023",
      ipAddress: "192.168.1.110",
      userAgent: "Chrome 120.0.0.0",
      location: "Singapore, SG",
      status: "Success",
      details: "Exported 2,847 records to CSV",
      riskLevel: "Medium",
    },
    {
      id: "5",
      timestamp: "2024-01-15 14:15:22",
      user: "admin@company.com",
      action: "User Created",
      resource: "new.employee@company.com",
      ipAddress: "192.168.1.101",
      userAgent: "Chrome 120.0.0.0",
      location: "New York, US",
      status: "Success",
      details: "New user account created with Sales Representative role",
      riskLevel: "Low",
    },
  ]

  const complianceRequests = [
    {
      id: "GDPR-2024-001",
      type: "Data Access Request",
      requester: "customer@example.com",
      status: "In Progress",
      requestDate: "2024-01-10",
      dueDate: "2024-02-09",
      assignedTo: "privacy@company.com",
      dataTypes: ["Personal Info", "Transaction History", "Communication Records"],
      progress: 65,
    },
    {
      id: "GDPR-2024-002",
      type: "Data Deletion Request",
      requester: "former.employee@company.com",
      status: "Completed",
      requestDate: "2024-01-05",
      dueDate: "2024-02-04",
      assignedTo: "hr@company.com",
      dataTypes: ["Employee Records", "Access Logs", "Performance Data"],
      progress: 100,
    },
    {
      id: "PDPA-2024-001",
      type: "Data Portability Request",
      requester: "client@singapore.com",
      status: "Pending Review",
      requestDate: "2024-01-12",
      dueDate: "2024-02-11",
      assignedTo: "legal@company.com",
      dataTypes: ["Account Information", "Financial Records"],
      progress: 25,
    },
  ]

  const passwordPolicy = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    maxAge: 90,
    lockoutAttempts: 5,
    lockoutDuration: 30,
    mfaRequired: true,
    mfaGracePeriod: 7,
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Medium":
        return "bg-[#FFC700]/20 text-[#FFC700] border-[#FFC700]/30"
      case "Low":
        return "bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
      case "Completed":
        return "bg-[#00FFC6]/20 text-[#00FFC6] border-[#00FFC6]/30"
      case "Failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "In Progress":
        return "bg-[#FFC700]/20 text-[#FFC700] border-[#FFC700]/30"
      case "Pending Review":
        return "bg-[#4B0082]/20 text-[#4B0082] border-[#4B0082]/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance Center</h1>
          <p className="text-muted-foreground mt-2">
            Manage access control, monitor activities, and ensure regulatory compliance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isComplianceDialogOpen} onOpenChange={setIsComplianceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full">
                <FileText className="w-4 h-4 mr-2" />
                Compliance Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle>Generate Compliance Report</DialogTitle>
                <DialogDescription>
                  Create comprehensive compliance reports for audits and regulatory requirements
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Report Type</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                        <SelectItem value="pdpa">PDPA Compliance</SelectItem>
                        <SelectItem value="sox">SOX Compliance</SelectItem>
                        <SelectItem value="iso27001">ISO 27001</SelectItem>
                        <SelectItem value="custom">Custom Report</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label>Date Range</Label>
                    <Select>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last90">Last 90 Days</SelectItem>
                        <SelectItem value="last365">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Include Sections</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "User Access Logs",
                      "Data Processing Activities",
                      "Security Incidents",
                      "Privacy Impact Assessments",
                      "Data Retention Policies",
                      "Third-party Integrations",
                    ].map((section) => (
                      <div key={section} className="flex items-center space-x-3">
                        <Switch defaultChecked />
                        <Label className="text-sm">{section}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsComplianceDialogOpen(false)}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button className="rounded-full">Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button size="lg" className="rounded-full">
            <Settings className="w-4 h-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Active</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Users</p>
            <p className="text-2xl font-bold">{securityStats.totalUsers}</p>
            <p className="text-sm text-muted-foreground mt-1">{securityStats.mfaEnabled} with 2FA</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Score</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Compliance</p>
            <p className="text-2xl font-bold">{securityStats.complianceScore}%</p>
            <p className="text-sm text-muted-foreground mt-1">Last audit: {securityStats.lastAudit}</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Critical</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Security Alerts</p>
            <p className="text-2xl font-bold">{securityStats.criticalAlerts}</p>
            <p className="text-sm text-muted-foreground mt-1">Require attention</p>
          </div>
        </Card>

        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
              <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <Badge variant="secondary" className="rounded-full">Policy</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Password Compliance</p>
            <p className="text-2xl font-bold">{securityStats.passwordCompliance}%</p>
            <p className="text-sm text-muted-foreground mt-1">Users compliant</p>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="rbac" className="space-y-6">
        <TabsList className="bg-card/50 backdrop-blur-sm p-2 rounded-full h-auto border">
          <TabsTrigger
            value="rbac"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Users className="w-4 h-4 mr-2" />
            Role-Based Access
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Activity className="w-4 h-4 mr-2" />
            Activity Logs
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Shield className="w-4 h-4 mr-2" />
            Compliance
          </TabsTrigger>
          <TabsTrigger
            value="policies"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Key className="w-4 h-4 mr-2" />
            Security Policies
          </TabsTrigger>
        </TabsList>

        {/* Role-Based Access Control */}
        <TabsContent value="rbac">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Role-Based Access Control</CardTitle>
                  <CardDescription>
                    Manage user roles, permissions, and access levels across the system
                  </CardDescription>
                </div>
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] rounded-4xl shadow-soft dark:shadow-soft-dark overflow-hidden flex flex-col bg-white dark:bg-gray-900">
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>
                        Define a new role with specific permissions and access levels
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label>Role Name</Label>
                        <Input placeholder="Enter role name" className="rounded-xl" />
                      </div>
                      <div className="space-y-3">
                        <Label>Description</Label>
                        <Textarea placeholder="Describe the role's purpose and responsibilities" className="rounded-xl" />
                      </div>
                      <div className="space-y-3">
                        <Label>Permissions</Label>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            "accounting.*",
                            "sales.*",
                            "purchase.*",
                            "reports.*",
                            "documents.*",
                            "users.*",
                            "settings.*",
                            "audit.*"
                          ].map((permission) => (
                            <div key={permission} className="flex items-center space-x-3">
                              <Switch />
                              <Label className="text-sm font-mono">{permission}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" className="rounded-full">
                        Cancel
                      </Button>
                      <Button className="rounded-full">Create Role</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <Card key={role.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{role.name}</CardTitle>
                          <CardDescription className="mt-1">{role.description}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            role.type === "System" ? "default" :
                            role.type === "Custom" ? "secondary" : "outline"
                          }
                          className="rounded-full"
                        >
                          {role.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Users</span>
                          <span className="font-medium">{role.users}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Created</span>
                          <span>{role.createdAt}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Modified</span>
                          <span>{role.lastModified}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1">Permissions</div>
                        <div className="text-sm font-mono">
                          {role.permissions.length > 3 
                            ? `${role.permissions.slice(0, 3).join(", ")}...`
                            : role.permissions.join(", ")
                          }
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="rounded-full flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full flex-1">
                          <Users className="w-3 h-3 mr-1" />
                          Users
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs */}
        <TabsContent value="activity">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Activity Logs</CardTitle>
                  <CardDescription>
                    Monitor user activities, system events, and security incidents
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search activities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl w-64"
                    />
                  </div>
                  <Button variant="outline" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Timestamp</TableHead>
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Resource</TableHead>
                      <TableHead className="font-semibold">Location</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Risk Level</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.user}</div>
                            <div className="text-sm text-muted-foreground">{log.ipAddress}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{log.action}</div>
                            <div className="text-sm text-muted-foreground">{log.details}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="text-sm text-muted-foreground truncate" title={log.resource}>
                            {log.resource}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">{log.location}</div>
                            <div className="text-xs text-muted-foreground">{log.userAgent}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.status === "Success" ? "default" :
                              log.status === "Failed" ? "destructive" : "secondary"
                            }
                            className="rounded-full"
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.riskLevel === "High" ? "destructive" :
                              log.riskLevel === "Medium" ? "secondary" : "default"
                            }
                            className="rounded-full"
                          >
                            {log.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Compliance Management</CardTitle>
                  <CardDescription>
                    Track and manage regulatory compliance requests and requirements
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" />
                  New Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {complianceRequests.map((request) => (
                  <Card key={request.id} className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{request.type}</CardTitle>
                          <CardDescription className="mt-1">Request ID: {request.id}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            request.status === "Completed" ? "default" :
                            request.status === "In Progress" ? "secondary" : "outline"
                          }
                          className="rounded-full"
                        >
                          {request.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Requester</span>
                          <span className="font-medium">{request.requester}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Assigned To</span>
                          <span>{request.assignedTo}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Due Date</span>
                          <span>{request.dueDate}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{request.progress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${request.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="p-3 bg-muted/20 rounded-xl">
                        <div className="text-xs text-muted-foreground mb-1">Data Types</div>
                        <div className="flex flex-wrap gap-1">
                          {request.dataTypes.map((type, index) => (
                            <Badge key={index} variant="outline" className="rounded-full text-xs">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="rounded-full flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Update
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Policies */}
        <TabsContent value="policies">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Security Policies</CardTitle>
                  <CardDescription>
                    Configure password policies, MFA requirements, and security settings
                  </CardDescription>
                </div>
                <Button className="rounded-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      Password Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Minimum Length</span>
                        <span className="font-medium">{passwordPolicy.minLength} characters</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Uppercase</span>
                        <Switch checked={passwordPolicy.requireUppercase} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Lowercase</span>
                        <Switch checked={passwordPolicy.requireLowercase} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Numbers</span>
                        <Switch checked={passwordPolicy.requireNumbers} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Require Special Characters</span>
                        <Switch checked={passwordPolicy.requireSpecialChars} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Prevent Reuse</span>
                        <span className="font-medium">Last {passwordPolicy.preventReuse} passwords</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Maximum Age</span>
                        <span className="font-medium">{passwordPolicy.maxAge} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Multi-Factor Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">MFA Required</span>
                        <Switch checked={passwordPolicy.mfaRequired} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Grace Period</span>
                        <span className="font-medium">{passwordPolicy.mfaGracePeriod} days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lockout Attempts</span>
                        <span className="font-medium">{passwordPolicy.lockoutAttempts} attempts</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Lockout Duration</span>
                        <span className="font-medium">{passwordPolicy.lockoutDuration} minutes</span>
                      </div>
                    </div>
                    <div className="p-4 bg-muted/20 rounded-2xl">
                      <div className="text-sm font-medium mb-2">MFA Methods</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Authenticator App</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>SMS</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Email</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Hardware Token</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
