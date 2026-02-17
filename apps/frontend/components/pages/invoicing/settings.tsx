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
  FileText,
  Shield,
  Bell,
  DollarSign,
  Globe
} from "lucide-react"

export function InvoicingSettingsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoicing Settings</h1>
          <p className="text-muted-foreground">
            Configure invoicing preferences and compliance settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="rounded-full">
            <FileText className="h-4 w-4 mr-2" />
            Test Invoice
          </Button>
          <Button className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic invoicing configuration
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
                  <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
                  <Input id="invoice-prefix" placeholder="INV-" className="rounded-xl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-terms">Default Payment Terms</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="net-15">Net 15</SelectItem>
                      <SelectItem value="net-30">Net 30</SelectItem>
                      <SelectItem value="net-45">Net 45</SelectItem>
                      <SelectItem value="net-60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tax-rate">Default Tax Rate</Label>
                  <Input id="tax-rate" type="number" step="0.01" placeholder="0.00" className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>
                Configure compliance and regulatory requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">US Tax Compliance</p>
                    <p className="text-sm text-muted-foreground">IRS requirements and tax codes</p>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">EU VAT Compliance</p>
                    <p className="text-sm text-muted-foreground">European Union VAT regulations</p>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">Digital Signatures</p>
                    <p className="text-sm text-muted-foreground">Electronic signature requirements</p>
                  </div>
                  <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Configured</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>
                Configure invoice templates and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="default-template">Default Template</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="logo">Company Logo</Label>
                  <Input id="logo" type="file" accept="image/*" className="rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure invoicing-related notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-muted-foreground">Send payment reminders</p>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">Overdue Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify about overdue invoices</p>
                  </div>
                  <Badge className="rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-2xl">
                  <div>
                    <p className="font-medium">Compliance Alerts</p>
                    <p className="text-sm text-muted-foreground">Alert about compliance issues</p>
                  </div>
                  <Badge className="rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">Weekly</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
