"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Building2, 
  Users, 
  Shield, 
  Globe, 
  CreditCard, 
  Clock, 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tenant, ModuleAccess } from '@/types/global'

interface TenantSettingsProps {
  tenant: Tenant
  onUpdate?: (tenant: Tenant) => void
}

const availableModules = [
  { id: 'accounting', name: 'Accounting', description: 'Core accounting features' },
  { id: 'inventory', name: 'Inventory Management', description: 'Stock tracking and management' },
  { id: 'banking', name: 'Banking', description: 'Bank reconciliation and management' },
  { id: 'reports', name: 'Reports', description: 'Financial reporting and analytics' },
  { id: 'purchase', name: 'Purchase Management', description: 'Purchase orders and requisitions' },
  { id: 'sales', name: 'Sales Management', description: 'Sales tracking and invoicing' },
  { id: 'documents', name: 'Document Management', description: 'File storage and organization' },
  { id: 'web3', name: 'Web3 Features', description: 'Blockchain and cryptocurrency support' },
  { id: 'security', name: 'Advanced Security', description: 'Enhanced security features' },
  { id: 'mobile', name: 'Mobile Access', description: 'Mobile app functionality' }
]

const timezones = [
  'UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST', 'IST'
]

const currencies = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MYR'
]

export function TenantSettings({ tenant, onUpdate }: TenantSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState(tenant.settings)
  const [enabledModules, setEnabledModules] = useState(tenant.enabledModules || [])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const toggleModule = (moduleId: string) => {
    const updatedModules = enabledModules.some(m => m.module === moduleId)
      ? enabledModules.filter(m => m.module !== moduleId)
      : [...enabledModules, { 
          module: moduleId as any, 
          enabled: true, 
          features: [] 
        }]
    
    setEnabledModules(updatedModules)
    setHasUnsavedChanges(true)
  }

  const saveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedTenant: Tenant = {
        ...tenant,
        settings,
        enabledModules
      }
      
      onUpdate?.(updatedTenant)
      setHasUnsavedChanges(false)
      
      toast({
        title: 'Settings Updated',
        description: 'Tenant settings have been successfully updated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tenant settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getModuleStatus = (moduleId: string) => {
    if (enabledModules.some(m => m.module === moduleId)) {
      return { status: 'enabled', icon: CheckCircle2, color: 'text-green-600' }
    }
    
    // Check if module is available in subscription plan
    const planModules = tenant.subscriptionPlan.moduleAccess?.map(m => m.module) || []
    if (planModules.includes(moduleId as any)) {
      return { status: 'available', icon: XCircle, color: 'text-yellow-600' }
    }
    
    return { status: 'unavailable', icon: XCircle, color: 'text-gray-400' }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">{tenant.name} Settings</h2>
            <p className="text-muted-foreground">{tenant.domain}.oasys.com</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={
            tenant.status === 'active' 
              ? "bg-green-100 text-green-700 border-green-200"
              : tenant.status === 'trial'
              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
              : "bg-red-100 text-red-700 border-red-200"
          }>
            {tenant.status}
          </Badge>
          {hasUnsavedChanges && (
            <Button onClick={saveSettings} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="modules" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Shield className="w-4 h-4 mr-2" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <CreditCard className="w-4 h-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional Settings
              </CardTitle>
              <CardDescription className="text-blue-600">
                Configure timezone, currency, and localization preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-blue-900">Timezone</Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => updateSetting('timezone', value)}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-blue-900">Primary Currency</Label>
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value) => updateSetting('currency', value)}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat" className="text-blue-900">Date Format</Label>
                  <Select 
                    value={settings.dateFormat} 
                    onValueChange={(value) => updateSetting('dateFormat', value)}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYear" className="text-blue-900">Fiscal Year Start</Label>
                  <Select 
                    value={settings.fiscalYearStart} 
                    onValueChange={(value) => updateSetting('fiscalYearStart', value)}
                  >
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Select fiscal year start" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01-01">January 1</SelectItem>
                      <SelectItem value="04-01">April 1</SelectItem>
                      <SelectItem value="07-01">July 1</SelectItem>
                      <SelectItem value="10-01">October 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="bg-blue-200" />

              <div className="space-y-4">
                <h4 className="font-semibold text-blue-900">Feature Settings</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-blue-900">Multi-Currency Support</Label>
                    <p className="text-sm text-blue-600">Enable multiple currency transactions</p>
                  </div>
                  <Switch 
                    checked={settings.multiCurrency}
                    onCheckedChange={(checked) => updateSetting('multiCurrency', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-blue-900">Approval Workflow</Label>
                    <p className="text-sm text-blue-600">Require approvals for transactions</p>
                  </div>
                  <Switch 
                    checked={settings.approvalWorkflow}
                    onCheckedChange={(checked) => updateSetting('approvalWorkflow', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Module Management */}
        <TabsContent value="modules" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Module Access Control</CardTitle>
              <CardDescription className="text-blue-600">
                Manage which modules are enabled for this tenant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableModules.map((module) => {
                  const status = getModuleStatus(module.id)
                  const StatusIcon = status.icon
                  
                  return (
                    <Card key={module.id} className="bg-white border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                            <div>
                              <h4 className="font-medium text-blue-900">{module.name}</h4>
                              <p className="text-sm text-blue-600">{module.description}</p>
                            </div>
                          </div>
                          <Switch
                            checked={enabledModules.some(m => m.module === module.id)}
                            onCheckedChange={() => toggleModule(module.id)}
                            disabled={status.status === 'unavailable'}
                          />
                        </div>
                        {status.status === 'unavailable' && (
                          <p className="text-xs text-gray-500 mt-2">
                            Not available in current subscription plan
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Information
              </CardTitle>
              <CardDescription className="text-blue-600">
                Current subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-blue-900">Current Plan</Label>
                  <div className="mt-2 p-4 bg-white rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900">{tenant.subscriptionPlan.name}</h4>
                    <p className="text-sm text-blue-600">${tenant.subscriptionPlan.price}/month</p>
                  </div>
                </div>

                <div>
                  <Label className="text-blue-900">Billing Email</Label>
                  <Input 
                    value={tenant.billingEmail}
                    className="mt-2 border-blue-200"
                    readOnly
                  />
                </div>

                <div>
                  <Label className="text-blue-900">User Limits</Label>
                  <div className="mt-2 p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-blue-900">
                      {tenant.currentUsers} / {tenant.maxUsers} users
                    </p>
                    <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(tenant.currentUsers / tenant.maxUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {tenant.status === 'trial' && tenant.trialEndsAt && (
                  <div>
                    <Label className="text-blue-900 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Trial Period
                    </Label>
                    <div className="mt-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-700">
                        Trial ends on {tenant.trialEndsAt}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-blue-600">
                Manage tenant users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">User Management</h3>
                <p className="text-blue-600 mb-4">
                  Advanced user management features coming soon
                </p>
                <Button variant="outline" className="border-blue-200 text-blue-700">
                  View User List
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 