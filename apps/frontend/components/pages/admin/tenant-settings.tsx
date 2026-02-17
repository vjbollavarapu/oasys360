"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Building2, 
  Globe, 
  CreditCard, 
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/get-api-url"
import { useAuth } from "@/hooks/use-auth"

interface TenantData {
  id: string
  name: string
  slug: string
  plan: string
  is_active: boolean
  max_users: number
  max_storage_gb: number
  features: string[]
  settings: Record<string, any>
  onboarding_status: string
  industry_code?: string
  country_code?: string
  currency_code: string
  timezone: string
  primary_domain?: string
  domain_status: string
  subscription_id?: string
  plan_code?: string
  billing_cycle: string
  trial_expiry?: string
  supports_tax: boolean
  supports_einvoice: boolean
  supports_inventory: boolean
  supports_multi_branch: boolean
  active_users_count?: number
  can_add_user?: boolean
  company?: {
    id: string
    name: string
    legal_name?: string
    tax_id?: string
    registration_number?: string
    address?: string
    city?: string
    state?: string
    country: string
    postal_code?: string
    phone?: string
    email?: string
    website?: string
    currency: string
    timezone: string
    fiscal_year_start?: string
  }
}

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Singapore', 'Asia/Kuala_Lumpur',
  'Australia/Sydney', 'Asia/Kolkata'
]

const currencies = [
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MYR', 'SGD', 'THB'
]

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
]

const plans = [
  { value: 'basic', label: 'Basic' },
  { value: 'professional', label: 'Professional' },
  { value: 'enterprise', label: 'Enterprise' },
]

const billingCycles = [
  { value: 'trial', label: 'Trial' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

export function TenantSettingsOverview() {
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [formData, setFormData] = useState<Partial<TenantData>>({})
  const [companyData, setCompanyData] = useState<Partial<TenantData['company']>>({})
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    fetchTenantSettings()
  }, [])

  const fetchTenantSettings = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('oasys_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const response = await fetch(getApiUrl('/api/v1/tenants/settings/'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Clear tokens and redirect to login
          localStorage.removeItem('oasys_access_token')
          localStorage.removeItem('oasys_refresh_token')
          window.location.href = '/auth/login'
          return
        }
        throw new Error(`Failed to fetch tenant settings: ${response.statusText}`)
      }

      const data = await response.json()
      setTenant(data)
      setFormData({
        name: data.name,
        plan: data.plan,
        currency_code: data.currency_code,
        timezone: data.timezone,
        industry_code: data.industry_code,
        country_code: data.country_code,
        primary_domain: data.primary_domain,
        domain_status: data.domain_status,
        billing_cycle: data.billing_cycle,
        supports_tax: data.supports_tax,
        supports_einvoice: data.supports_einvoice,
        supports_inventory: data.supports_inventory,
        supports_multi_branch: data.supports_multi_branch,
        max_users: data.max_users,
        max_storage_gb: data.max_storage_gb,
        settings: data.settings || {},
      })
      
      if (data.company) {
        setCompanyData(data.company)
      }
    } catch (error) {
      console.error('Error fetching tenant settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load tenant settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!tenant) return

    try {
      setIsSaving(true)
      const token = localStorage.getItem('oasys_access_token')
      if (!token) {
        throw new Error('No access token found')
      }

      const payload: any = {
        ...formData,
      }

      // Include company data if provided
      if (Object.keys(companyData).length > 0) {
        payload.company = companyData
      }

      const response = await fetch(getApiUrl('/api/v1/tenants/settings/'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('oasys_access_token')
          localStorage.removeItem('oasys_refresh_token')
          window.location.href = '/auth/login'
          return
        }
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.detail || 'Failed to update tenant settings')
      }

      const updatedData = await response.json()
      setTenant(updatedData.tenant)
      setHasUnsavedChanges(false)
      
      toast({
        title: 'Settings Updated',
        description: 'Tenant settings have been successfully updated.',
      })
    } catch (error) {
      console.error('Error saving tenant settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update tenant settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const updateCompanyData = (field: string, value: any) => {
    setCompanyData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load tenant settings</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-soft-gradient -m-10 p-10 rounded-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Settings</h1>
          <p className="text-muted-foreground">
            Manage your tenant configuration, company information, and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={tenant.is_active ? "default" : "secondary"}>
            {tenant.is_active ? "Active" : "Inactive"}
          </Badge>
          {hasUnsavedChanges && (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="company">
            <Building2 className="h-4 w-4 mr-2" />
            Company
          </TabsTrigger>
          <TabsTrigger value="domain">
            <Globe className="h-4 w-4 mr-2" />
            Domain
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="features">
            <Shield className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure your tenant's basic settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tenant Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={tenant.slug}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Slug cannot be changed after creation</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select
                    value={formData.plan || 'basic'}
                    onValueChange={(value) => updateFormData('plan', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.value} value={plan.value}>
                          {plan.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.timezone || 'UTC'}
                    onValueChange={(value) => updateFormData('timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.currency_code || 'USD'}
                    onValueChange={(value) => updateFormData('currency_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(curr => (
                        <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country_code || ''}
                    onValueChange={(value) => updateFormData('country_code', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry Code</Label>
                  <Input
                    id="industry"
                    value={formData.industry_code || ''}
                    onChange={(e) => updateFormData('industry_code', e.target.value)}
                    placeholder="e.g., SaaS, Retail, Manufacturing"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limits & Quotas</CardTitle>
              <CardDescription>Configure user and storage limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="max_users">Max Users</Label>
                  <Input
                    id="max_users"
                    type="number"
                    value={formData.max_users || 10}
                    onChange={(e) => updateFormData('max_users', parseInt(e.target.value))}
                  />
                  {tenant.active_users_count !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {tenant.active_users_count} active users
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_storage">Max Storage (GB)</Label>
                  <Input
                    id="max_storage"
                    type="number"
                    value={formData.max_storage_gb || 10}
                    onChange={(e) => updateFormData('max_storage_gb', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Manage your company details and legal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={companyData.name || ''}
                    onChange={(e) => updateCompanyData('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_name">Legal Name</Label>
                  <Input
                    id="legal_name"
                    value={companyData.legal_name || ''}
                    onChange={(e) => updateCompanyData('legal_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_id">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={companyData.tax_id || ''}
                    onChange={(e) => updateCompanyData('tax_id', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_number">Registration Number</Label>
                  <Input
                    id="registration_number"
                    value={companyData.registration_number || ''}
                    onChange={(e) => updateCompanyData('registration_number', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={companyData.address || ''}
                    onChange={(e) => updateCompanyData('address', e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companyData.city || ''}
                    onChange={(e) => updateCompanyData('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={companyData.state || ''}
                    onChange={(e) => updateCompanyData('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={companyData.postal_code || ''}
                    onChange={(e) => updateCompanyData('postal_code', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_country">Country</Label>
                  <Select
                    value={companyData.country || 'US'}
                    onValueChange={(value) => updateCompanyData('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={companyData.phone || ''}
                    onChange={(e) => updateCompanyData('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.email || ''}
                    onChange={(e) => updateCompanyData('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={companyData.website || ''}
                    onChange={(e) => updateCompanyData('website', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscal_year_start">Fiscal Year Start</Label>
                  <Input
                    id="fiscal_year_start"
                    type="date"
                    value={companyData.fiscal_year_start || ''}
                    onChange={(e) => updateCompanyData('fiscal_year_start', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain Settings */}
        <TabsContent value="domain" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domain Configuration</CardTitle>
              <CardDescription>Manage your tenant's domain and subdomain settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_domain">Primary Domain</Label>
                  <Input
                    id="primary_domain"
                    value={formData.primary_domain || tenant.slug}
                    onChange={(e) => updateFormData('primary_domain', e.target.value)}
                    placeholder="yourcompany"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your subdomain will be: {formData.primary_domain || tenant.slug}.oasys360.com
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain_status">Domain Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      tenant.domain_status === 'active' ? 'default' :
                      tenant.domain_status === 'verified' ? 'secondary' : 'outline'
                    }>
                      {tenant.domain_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">Billing Cycle</Label>
                  <Select
                    value={formData.billing_cycle || 'trial'}
                    onValueChange={(value) => updateFormData('billing_cycle', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {billingCycles.map(cycle => (
                        <SelectItem key={cycle.value} value={cycle.value}>
                          {cycle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subscription_id">Subscription ID</Label>
                  <Input
                    id="subscription_id"
                    value={tenant.subscription_id || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Managed by billing system</p>
                </div>
                {tenant.trial_expiry && (
                  <div className="space-y-2">
                    <Label>Trial Expiry</Label>
                    <div className="text-sm text-muted-foreground">
                      {new Date(tenant.trial_expiry).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>Enable or disable specific features for your tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="supports_tax" className="text-base">Tax Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable tax calculation and compliance features
                    </p>
                  </div>
                  <Switch
                    id="supports_tax"
                    checked={formData.supports_tax || false}
                    onCheckedChange={(checked) => updateFormData('supports_tax', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="supports_einvoice" className="text-base">E-Invoicing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable electronic invoicing and compliance
                    </p>
                  </div>
                  <Switch
                    id="supports_einvoice"
                    checked={formData.supports_einvoice || false}
                    onCheckedChange={(checked) => updateFormData('supports_einvoice', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="supports_inventory" className="text-base">Inventory Management</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable inventory tracking and management
                    </p>
                  </div>
                  <Switch
                    id="supports_inventory"
                    checked={formData.supports_inventory || false}
                    onCheckedChange={(checked) => updateFormData('supports_inventory', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="supports_multi_branch" className="text-base">Multi-Branch Support</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable support for multiple branches or locations
                    </p>
                  </div>
                  <Switch
                    id="supports_multi_branch"
                    checked={formData.supports_multi_branch || false}
                    onCheckedChange={(checked) => updateFormData('supports_multi_branch', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

