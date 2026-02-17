"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Building2, 
  Shield, 
  FileText, 
  Settings, 
  Database,
  CheckCircle,
  AlertTriangle,
  Activity
} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System administration and management overview
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="rounded-full">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="rounded-full">
              <Activity className="h-4 w-4 mr-2" />
              System Status
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground mt-2">Across all tenants</p>
            </CardContent>
          </Card>
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenants</CardTitle>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-2">Active organizations</p>
            </CardContent>
          </Card>
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Security Alerts</CardTitle>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-2xl">
                <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
            </CardContent>
          </Card>
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground">Audit Logs</CardTitle>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,247</div>
              <p className="text-xs text-muted-foreground mt-2">Total logs this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Modules */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/users">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  User Management
                </CardTitle>
                <CardDescription>Manage users, roles, and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage all users across tenants
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/tenants">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-xl">
                    <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  Tenant Management
                </CardTitle>
                <CardDescription>Manage multi-tenant organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage tenants, subscriptions, and billing
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/security">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-xl">
                    <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  Security
                </CardTitle>
                <CardDescription>Security settings and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure security policies and access controls
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/audit">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  Audit Logs
                </CardTitle>
                <CardDescription>System activity and audit trails</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monitor system activity and security events
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/backup">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                    <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  Backup & Restore
                </CardTitle>
                <CardDescription>Backup management and recovery</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage system backups and data recovery
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-xl">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  System Settings
                </CardTitle>
                <CardDescription>System-wide configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Configure system settings and preferences
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">System backup completed</p>
                    <p className="text-sm text-muted-foreground">2 hours ago - 2.5 GB backed up</p>
                  </div>
                </div>
                <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Success</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">New tenant registered</p>
                    <p className="text-sm text-muted-foreground">5 hours ago - Demo Corporation</p>
                  </div>
                </div>
                <Badge className="rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">New</Badge>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium">Security alert triggered</p>
                    <p className="text-sm text-muted-foreground">1 day ago - Failed login attempt detected</p>
                  </div>
                </div>
                <Badge className="rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">Alert</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

