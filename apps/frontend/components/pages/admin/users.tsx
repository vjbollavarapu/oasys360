"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/lib/api-services"
import { UserCreateForm } from "@/components/user/user-create-form"
import { 
  Search, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Settings,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle
} from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: string
  role_display?: string
  tenant?: string
  tenant_name?: string
  status: "active" | "inactive" | "pending"
  lastLogin?: string
  last_login?: string
  createdAt: string
  created_at?: string
  permissions?: string[]
  phone?: string
  full_name?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  email_verified?: boolean
}

export function UserManagementOverview() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getUsers({
        search: searchQuery || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      })

      // Handle DRF paginated response format: { count, next, previous, results: [...] }
      // Or wrapped response: { success: true, data: { results: [...] } }
      // Or direct array: [...]
      let usersData: any[] = []
      
      if (!response) {
        // No response - treat as empty
        usersData = []
      } else if (Array.isArray(response)) {
        // Direct array response
        usersData = response
      } else if (response.results && Array.isArray(response.results)) {
        // DRF paginated response: { count, next, previous, results: [...] }
        usersData = response.results
      } else if (response.success !== undefined) {
        // Wrapped response with success flag
        if (response.success) {
          usersData = response.data?.results || response.data || []
        } else {
          // Wrapped error response
          setError(response.message || "Failed to fetch users")
          toast({
            title: "Error",
            description: response.message || "Failed to fetch users",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      } else if (response.data) {
        // Response with data property
        if (Array.isArray(response.data)) {
          usersData = response.data
        } else if (response.data.results && Array.isArray(response.data.results)) {
          usersData = response.data.results
        } else {
          usersData = []
        }
      } else {
        // Empty or unexpected format - treat as empty, not an error
        usersData = []
      }
      
      // Map backend user data to frontend User interface
      const mappedUsers = usersData.map((user: any) => ({
        id: user.id,
        name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
        email: user.email,
        role: user.role || 'staff',
        role_display: user.role_display,
        tenant: user.tenant?.name || user.tenant_name || 'N/A',
        status: user.is_active === false ? "inactive" : (user.email_verified ? "active" : "pending") as "active" | "inactive" | "pending",
        lastLogin: user.last_login || user.lastLogin,
        createdAt: user.created_at || user.createdAt,
        permissions: user.permissions || [],
        phone: user.phone,
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        is_active: user.is_active,
        email_verified: user.email_verified,
      }))
      
      setUsers(mappedUsers)
      // Clear error if we successfully got data (even if empty)
      setError(null)
    } catch (err: any) {
      // Only show error for actual network/API errors
      const errorMessage = err.message || "Failed to fetch users"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchQuery, roleFilter])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.tenant.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
  })

  const handleActivateUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const response = await userService.updateUser(userId, {
        is_active: true,
      })

      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: "active" as const, is_active: true }
            : u
        ))
        toast({
          title: "Success",
          description: "User activated successfully",
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to activate user",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to activate user",
        variant: "destructive",
      })
    }
  }

  const handleDeactivateUser = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user) return

      const response = await userService.updateUser(userId, {
        is_active: false,
      })

      if (response.success) {
        setUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: "inactive" as const, is_active: false }
            : u
        ))
        toast({
          title: "Success",
          description: "User deactivated successfully",
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to deactivate user",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to deactivate user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      const response = await userService.deleteUser(userId)

      if (response.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        toast({
          title: "Success",
          description: "User deleted successfully",
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete user",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "inactive": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "tenant_admin": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
      case "firm_admin": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300"
      case "cfo": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
      case "accountant": return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300"
      case "staff": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
      case "platform_admin": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    }
  }

  const getRoleDisplayName = (role: string, roleDisplay?: string) => {
    if (roleDisplay) return roleDisplay
    switch (role) {
      case "tenant_admin": return "Tenant Admin"
      case "firm_admin": return "Firm Admin"
      case "cfo": return "CFO"
      case "accountant": return "Accountant"
      case "staff": return "Staff"
      case "platform_admin": return "Platform Admin"
      default: return role
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across all tenants
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to your tenant. The user will receive an email verification link.
                </DialogDescription>
              </DialogHeader>
              <UserCreateForm 
                onSuccess={() => {
                  setShowCreateDialog(false)
                  fetchUsers()
                  toast({
                    title: "Success",
                    description: "User created successfully",
                  })
                }}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="rounded-full p-1 h-auto grid w-full grid-cols-3">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters */}
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="p-2 border rounded text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="tenant_admin">Tenant Admin</option>
                  <option value="firm_admin">Firm Admin</option>
                  <option value="cfo">CFO</option>
                  <option value="accountant">Accountant</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading users...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 border-red-200">
              <CardContent className="p-8">
                <div className="flex items-center justify-center text-red-600">
                  <AlertCircle className="h-6 w-6 mr-2" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          {!loading && !error && (
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                  <CardContent className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No Users Found</p>
                      <p className="text-sm mt-2">
                        {searchQuery || statusFilter !== "all" || roleFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "Get started by adding your first user"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredUsers.map((user) => (
              <Card key={user.id} className="rounded-2xl shadow-soft dark:shadow-soft-dark border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleDisplayName(user.role, user.role_display)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-2 font-medium">{user.email}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tenant:</span>
                          <span className="ml-2 font-medium">{user.tenant}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Login:</span>
                          <span className="ml-2 font-medium">
                            {user.lastLogin || user.last_login 
                              ? formatDate(user.lastLogin || user.last_login || '') 
                              : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(user.createdAt || user.created_at || '')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {user.phone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {user.phone}
                          </span>
                        )}
                        {user.email_verified === false && (
                          <span className="flex items-center text-yellow-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Email not verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.status === "active" ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeactivateUser(user.id)}
                          className="rounded-full text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleActivateUser(user.id)}
                          className="rounded-full text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="rounded-full text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage user roles and permission sets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Role and permission management will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all tenants</p>
              </CardContent>
            </Card>
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === "admin").length}
                </div>
                <p className="text-xs text-muted-foreground">Administrators</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.status === "pending").length}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Awaiting activation</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
