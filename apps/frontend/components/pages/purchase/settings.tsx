"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Settings,
  ShoppingCart,
  DollarSign,
  Bell,
  Shield,
  User
} from "lucide-react"

export function PurchaseSettingsOverview() {
  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Settings</h1>
          <p className="text-muted-foreground">
            Configure purchase system settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Test Purchase
          </Button>
          <Button className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 rounded-full p-1 h-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic purchase system configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                      <SelectItem value="gbp">GBP - British Pound</SelectItem>
                      <SelectItem value="cad">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="po-prefix">PO Prefix</Label>
                  <Input id="po-prefix" placeholder="PO-" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approval-limit">Auto Approval Limit</Label>
                  <Input id="approval-limit" type="number" placeholder="1000" />
                </div>
                <div>
                  <Label htmlFor="tax-rate">Default Tax Rate</Label>
                  <Input id="tax-rate" type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approval Settings</CardTitle>
              <CardDescription>
                Configure purchase approval workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Multi-Level Approvals</p>
                    <p className="text-sm text-muted-foreground">Require multiple approval levels</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Budget Limits</p>
                    <p className="text-sm text-muted-foreground">Enforce budget constraints</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Vendor Approval</p>
                    <p className="text-sm text-muted-foreground">Approve new vendors</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Manual</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure purchase-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Approval Requests</p>
                    <p className="text-sm text-muted-foreground">Notify about pending approvals</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order Status</p>
                    <p className="text-sm text-muted-foreground">Notify about order updates</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Budget Alerts</p>
                    <p className="text-sm text-muted-foreground">Alert when approaching budget limits</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Weekly</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure purchase system security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Purchase Authorization</p>
                    <p className="text-sm text-muted-foreground">Require authorization for purchases</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all purchase activities</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive purchase data</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
