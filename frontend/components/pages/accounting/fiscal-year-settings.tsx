"use client"

import React, { useState } from 'react'
import { useOrganization } from '@/hooks/use-organization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Building2, DollarSign, Calendar, Plus, Edit, Trash2, Save, X, Check, AlertTriangle, Globe, Clock, Shield, Database, Users, Zap } from 'lucide-react'

interface Currency {
  code: string
  name: string
  symbol: string
  exchangeRate: number
  isBaseCurrency: boolean
  isActive: boolean
  lastUpdated: string
}

interface OrganizationSettings {
  id: string
  name: string
  code: string
  legalName: string
  taxId: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website: string
  }
  fiscal: {
    yearStart: string
    periodType: 'monthly' | 'quarterly' | 'annual'
    currency: string
    timezone: string
  }
  compliance: {
    auditRequired: boolean
    retentionYears: number
    regulatoryFramework: string[]
  }
  isActive: boolean
}

export function FiscalYearSettings() {
  const { currentOrganization, organizations } = useOrganization()
  
  // State management
  const [activeTab, setActiveTab] = useState("general")
  const [isAddOrgDialogOpen, setIsAddOrgDialogOpen] = useState(false)
  const [isAddCurrencyDialogOpen, setIsAddCurrencyDialogOpen] = useState(false)
  const [isEditOrgDialogOpen, setIsEditOrgDialogOpen] = useState(false)
  const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<string>('')

  // Mock currencies data
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 1.0, isBaseCurrency: true, isActive: true, lastUpdated: '2024-12-01T10:00:00Z' },
    { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: 0.85, isBaseCurrency: false, isActive: true, lastUpdated: '2024-12-01T10:00:00Z' },
    { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.73, isBaseCurrency: false, isActive: true, lastUpdated: '2024-12-01T10:00:00Z' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', exchangeRate: 110.0, isBaseCurrency: false, isActive: true, lastUpdated: '2024-12-01T10:00:00Z' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', exchangeRate: 1.35, isBaseCurrency: false, isActive: true, lastUpdated: '2024-12-01T10:00:00Z' }
  ])

  // Form states
  const [newOrg, setNewOrg] = useState<any>({})
  const [newCurrency, setNewCurrency] = useState<Partial<Currency>>({})
  const [fiscalSettings, setFiscalSettings] = useState({
    autoLockPeriods: true,
    requireAuditBeforeClose: true,
    allowPostingToPriorPeriods: false,
    autoCreateNextYear: true,
    defaultPeriodType: 'annual' as const,
    retainedEarningsAccount: '3100-Retained Earnings',
    closingReminderDays: 30,
    backupBeforeClose: true
  })

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Singapore', label: 'Singapore Standard Time (SGT)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ]

  const regulatoryFrameworks = [
    'GAAP (US)', 'IFRS', 'UK GAAP', 'SOX Compliance', 'GDPR', 'Basel III', 'MiFID II', 'Sarbanes-Oxley'
  ]

  const handleAddOrganization = () => {
    // Implementation for adding organization
    console.log('Adding organization:', newOrg)
    setIsAddOrgDialogOpen(false)
    setNewOrg({})
  }

  const handleAddCurrency = () => {
    if (newCurrency.code && newCurrency.name && newCurrency.symbol) {
      const currency: Currency = {
        code: newCurrency.code,
        name: newCurrency.name,
        symbol: newCurrency.symbol,
        exchangeRate: newCurrency.exchangeRate || 1.0,
        isBaseCurrency: false,
        isActive: true,
        lastUpdated: new Date().toISOString()
      }
      setCurrencies(prev => [...prev, currency])
      setIsAddCurrencyDialogOpen(false)
      setNewCurrency({})
    }
  }

  const toggleCurrencyStatus = (code: string) => {
    setCurrencies(prev => prev.map(currency => 
      currency.code === code 
        ? { ...currency, isActive: !currency.isActive }
        : currency
    ))
  }

  const updateExchangeRate = (code: string, rate: number) => {
    setCurrencies(prev => prev.map(currency => 
      currency.code === code 
        ? { ...currency, exchangeRate: rate, lastUpdated: new Date().toISOString() }
        : currency
    ))
  }

  if (!currentOrganization) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-blue-900">Fiscal Year Settings</h2>
          <p className="text-blue-600">
            Configure fiscal year management, organizations, and system preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-200">
            <Database className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-blue-50">
          <TabsTrigger value="general" className="data-[state=active]:bg-blue-100">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="organizations" className="data-[state=active]:bg-blue-100">
            <Building2 className="h-4 w-4 mr-2" />
            Organizations
          </TabsTrigger>
          <TabsTrigger value="currencies" className="data-[state=active]:bg-blue-100">
            <DollarSign className="h-4 w-4 mr-2" />
            Currencies
          </TabsTrigger>
          <TabsTrigger value="fiscal" className="data-[state=active]:bg-blue-100">
            <Calendar className="h-4 w-4 mr-2" />
            Fiscal Setup
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-blue-100">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
              <CardTitle className="text-blue-800">System Preferences</CardTitle>
              <CardDescription className="text-blue-600">
                Configure global system settings and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Default Currency Display</Label>
                      <p className="text-sm text-blue-600">Currency format for system-wide display</p>
                    </div>
                    <Select defaultValue="USD">
                      <SelectTrigger className="w-32 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.filter(c => c.isActive).map(currency => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Default Timezone</Label>
                      <p className="text-sm text-blue-600">System timezone for date calculations</p>
                    </div>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger className="w-48 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Date Format</Label>
                      <p className="text-sm text-blue-600">System-wide date display format</p>
                    </div>
                    <Select defaultValue="MM/DD/YYYY">
                      <SelectTrigger className="w-32 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Number Format</Label>
                      <p className="text-sm text-blue-600">How numbers are displayed</p>
                    </div>
                    <Select defaultValue="1,234.56">
                      <SelectTrigger className="w-32 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1,234.56">1,234.56</SelectItem>
                        <SelectItem value="1.234,56">1.234,56</SelectItem>
                        <SelectItem value="1 234.56">1 234.56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Session Timeout</Label>
                      <p className="text-sm text-blue-600">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="60">
                      <SelectTrigger className="w-32 border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Enable Notifications</Label>
                      <p className="text-sm text-blue-600">System notifications for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organizations Management */}
        <TabsContent value="organizations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Organization Management</h3>
              <p className="text-sm text-blue-600">Manage multiple organizations and their settings</p>
            </div>
            <Dialog open={isAddOrgDialogOpen} onOpenChange={setIsAddOrgDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-blue-50 to-blue-100">
                <DialogHeader>
                  <DialogTitle className="text-blue-800">Add New Organization</DialogTitle>
                  <DialogDescription className="text-blue-600">
                    Create a new organization with complete setup
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-800">Organization Name</Label>
                      <Input 
                        placeholder="OASYS Technologies Inc."
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label className="text-blue-800">Organization Code</Label>
                      <Input 
                        placeholder="OASYS-US"
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, code: e.target.value}))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-blue-800">Legal Name</Label>
                    <Input 
                      placeholder="OASYS Technologies Incorporated"
                      className="border-blue-200"
                      onChange={(e) => setNewOrg(prev => ({...prev, legalName: e.target.value}))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-800">Tax ID</Label>
                      <Input 
                        placeholder="12-3456789"
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, taxId: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label className="text-blue-800">Primary Currency</Label>
                      <Select onValueChange={(value) => setNewOrg(prev => ({...prev, fiscal: {...prev.fiscal, currency: value}}))}>
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.filter(c => c.isActive).map(currency => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-blue-800">Address</Label>
                    <Input 
                      placeholder="Street Address"
                      className="border-blue-200"
                      onChange={(e) => setNewOrg(prev => ({...prev, address: {...prev.address, street: e.target.value}}))}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input 
                        placeholder="City"
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, address: {...prev.address, city: e.target.value}}))}
                      />
                      <Input 
                        placeholder="State"
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, address: {...prev.address, state: e.target.value}}))}
                      />
                      <Input 
                        placeholder="Postal Code"
                        className="border-blue-200"
                        onChange={(e) => setNewOrg(prev => ({...prev, address: {...prev.address, postalCode: e.target.value}}))}
                      />
                    </div>
                    <Input 
                      placeholder="Country"
                      className="border-blue-200"
                      onChange={(e) => setNewOrg(prev => ({...prev, address: {...prev.address, country: e.target.value}}))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-800">Fiscal Year Start</Label>
                      <Select onValueChange={(value) => setNewOrg(prev => ({...prev, fiscal: {...prev.fiscal, yearStart: value}}))}>
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Select start month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01-01">January 1st</SelectItem>
                          <SelectItem value="04-01">April 1st</SelectItem>
                          <SelectItem value="04-06">April 6th (UK)</SelectItem>
                          <SelectItem value="07-01">July 1st</SelectItem>
                          <SelectItem value="10-01">October 1st</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-blue-800">Timezone</Label>
                      <Select onValueChange={(value) => setNewOrg(prev => ({...prev, fiscal: {...prev.fiscal, timezone: value}}))}>
                        <SelectTrigger className="border-blue-200">
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddOrgDialogOpen(false)} className="border-blue-200 text-blue-700">
                    Cancel
                  </Button>
                  <Button onClick={handleAddOrganization} className="bg-blue-600 hover:bg-blue-700">
                    Create Organization
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
                    <TableHead className="text-blue-800">Organization</TableHead>
                    <TableHead className="text-blue-800">Code</TableHead>
                    <TableHead className="text-blue-800">Currency</TableHead>
                    <TableHead className="text-blue-800">Fiscal Year</TableHead>
                    <TableHead className="text-blue-800">Status</TableHead>
                    <TableHead className="text-blue-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {organizations?.map((org) => (
                    <TableRow key={org.id} className="hover:bg-blue-50/50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-blue-900">{org.name}</div>
                          <div className="text-sm text-blue-600">{org.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {org.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-800">{org.currency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-blue-800">
                          {new Date(`2024-${org.fiscalYearStart}`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={org.isActive ? "default" : "secondary"} className={org.isActive ? "bg-blue-100 text-blue-800" : ""}>
                          {org.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Management */}
        <TabsContent value="currencies" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Currency Management</h3>
              <p className="text-sm text-blue-600">Manage currencies and exchange rates</p>
            </div>
            <Dialog open={isAddCurrencyDialogOpen} onOpenChange={setIsAddCurrencyDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Currency
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-blue-50 to-blue-100">
                <DialogHeader>
                  <DialogTitle className="text-blue-800">Add New Currency</DialogTitle>
                  <DialogDescription className="text-blue-600">
                    Add a new currency with exchange rate
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-blue-800">Currency Code</Label>
                      <Input 
                        placeholder="EUR"
                        className="border-blue-200"
                        onChange={(e) => setNewCurrency(prev => ({...prev, code: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label className="text-blue-800">Symbol</Label>
                      <Input 
                        placeholder="€"
                        className="border-blue-200"
                        onChange={(e) => setNewCurrency(prev => ({...prev, symbol: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-blue-800">Currency Name</Label>
                    <Input 
                      placeholder="Euro"
                      className="border-blue-200"
                      onChange={(e) => setNewCurrency(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label className="text-blue-800">Exchange Rate (to base currency)</Label>
                    <Input 
                      type="number"
                      step="0.0001"
                      placeholder="0.85"
                      className="border-blue-200"
                      onChange={(e) => setNewCurrency(prev => ({...prev, exchangeRate: parseFloat(e.target.value)}))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCurrencyDialogOpen(false)} className="border-blue-200 text-blue-700">
                    Cancel
                  </Button>
                  <Button onClick={handleAddCurrency} className="bg-blue-600 hover:bg-blue-700">
                    Add Currency
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
                  <CardTitle className="text-blue-800">Currency List</CardTitle>
                  <CardDescription className="text-blue-600">
                    Manage currencies and their exchange rates
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="text-blue-800">Currency</TableHead>
                        <TableHead className="text-blue-800">Exchange Rate</TableHead>
                        <TableHead className="text-blue-800">Last Updated</TableHead>
                        <TableHead className="text-blue-800">Status</TableHead>
                        <TableHead className="text-blue-800 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currencies.map((currency) => (
                        <TableRow key={currency.code} className="hover:bg-blue-50/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-800 font-semibold text-sm">{currency.symbol}</span>
                              </div>
                              <div>
                                <div className="font-medium text-blue-900">{currency.code}</div>
                                <div className="text-sm text-blue-600">{currency.name}</div>
                              </div>
                              {currency.isBaseCurrency && (
                                <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                                  Base
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-blue-800 font-mono">{currency.exchangeRate.toFixed(4)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-blue-600 text-sm">
                              {new Date(currency.lastUpdated).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={currency.isActive ? "default" : "secondary"} className={currency.isActive ? "bg-blue-100 text-blue-800" : ""}>
                              {currency.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100"
                                onClick={() => toggleCurrencyStatus(currency.code)}
                              >
                                {currency.isActive ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
                  <CardTitle className="text-blue-800">Exchange Rate Update</CardTitle>
                  <CardDescription className="text-blue-600">
                    Update rates manually or automatically
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Auto-update rates</Label>
                      <p className="text-sm text-blue-600">Update rates daily at 9:00 AM</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div>
                    <Label className="text-blue-800">Rate Source</Label>
                    <Select defaultValue="xe">
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xe">XE.com</SelectItem>
                        <SelectItem value="ecb">European Central Bank</SelectItem>
                        <SelectItem value="fed">Federal Reserve</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Zap className="h-4 w-4 mr-2" />
                    Update All Rates Now
                  </Button>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Last update: Today at 9:00 AM
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Fiscal Setup */}
        <TabsContent value="fiscal" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
              <CardTitle className="text-blue-800">Fiscal Year Configuration</CardTitle>
              <CardDescription className="text-blue-600">
                Configure fiscal year behavior and defaults
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Auto-lock periods</Label>
                      <p className="text-sm text-blue-600">Automatically lock periods when year closes</p>
                    </div>
                    <Switch 
                      checked={fiscalSettings.autoLockPeriods}
                      onCheckedChange={(checked) => setFiscalSettings(prev => ({...prev, autoLockPeriods: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Require audit before close</Label>
                      <p className="text-sm text-blue-600">Audit must be completed before year-end</p>
                    </div>
                    <Switch 
                      checked={fiscalSettings.requireAuditBeforeClose}
                      onCheckedChange={(checked) => setFiscalSettings(prev => ({...prev, requireAuditBeforeClose: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Allow posting to prior periods</Label>
                      <p className="text-sm text-blue-600">Post transactions to locked periods</p>
                    </div>
                    <Switch 
                      checked={fiscalSettings.allowPostingToPriorPeriods}
                      onCheckedChange={(checked) => setFiscalSettings(prev => ({...prev, allowPostingToPriorPeriods: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Auto-create next year</Label>
                      <p className="text-sm text-blue-600">Create next fiscal year automatically</p>
                    </div>
                    <Switch 
                      checked={fiscalSettings.autoCreateNextYear}
                      onCheckedChange={(checked) => setFiscalSettings(prev => ({...prev, autoCreateNextYear: checked}))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Backup before close</Label>
                      <p className="text-sm text-blue-600">Create backup before year-end process</p>
                    </div>
                    <Switch 
                      checked={fiscalSettings.backupBeforeClose}
                      onCheckedChange={(checked) => setFiscalSettings(prev => ({...prev, backupBeforeClose: checked}))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-blue-800 font-medium">Default Period Type</Label>
                    <p className="text-sm text-blue-600 mb-2">Default period structure for new fiscal years</p>
                    <Select 
                      value={fiscalSettings.defaultPeriodType}
                      onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => setFiscalSettings(prev => ({...prev, defaultPeriodType: value}))}
                    >
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (12 periods)</SelectItem>
                        <SelectItem value="quarterly">Quarterly (4 periods)</SelectItem>
                        <SelectItem value="annual">Annual (1 period)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-blue-800 font-medium">Retained Earnings Account</Label>
                    <p className="text-sm text-blue-600 mb-2">Account for retained earnings transfer</p>
                    <Input 
                      value={fiscalSettings.retainedEarningsAccount}
                      onChange={(e) => setFiscalSettings(prev => ({...prev, retainedEarningsAccount: e.target.value}))}
                      className="border-blue-200"
                    />
                  </div>

                  <div>
                    <Label className="text-blue-800 font-medium">Closing Reminder (Days)</Label>
                    <p className="text-sm text-blue-600 mb-2">Days before year-end to send reminders</p>
                    <Input 
                      type="number"
                      value={fiscalSettings.closingReminderDays}
                      onChange={(e) => setFiscalSettings(prev => ({...prev, closingReminderDays: parseInt(e.target.value)}))}
                      className="border-blue-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-150 border-b border-blue-200">
              <CardTitle className="text-blue-800">Security & Compliance</CardTitle>
              <CardDescription className="text-blue-600">
                Configure security settings and compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-blue-600">Require 2FA for all users</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Audit Trail</Label>
                      <p className="text-sm text-blue-600">Log all user actions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-blue-800 font-medium">Data Encryption</Label>
                      <p className="text-sm text-blue-600">Encrypt sensitive data at rest</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div>
                    <Label className="text-blue-800 font-medium">Password Policy</Label>
                    <p className="text-sm text-blue-600 mb-2">Minimum password requirements</p>
                    <Select defaultValue="strong">
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8 characters)</SelectItem>
                        <SelectItem value="moderate">Moderate (12 characters, mixed case)</SelectItem>
                        <SelectItem value="strong">Strong (16 characters, symbols)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-blue-800 font-medium">Data Retention Period</Label>
                    <p className="text-sm text-blue-600 mb-2">How long to keep archived data</p>
                    <Select defaultValue="7">
                      <SelectTrigger className="border-blue-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="5">5 years</SelectItem>
                        <SelectItem value="7">7 years (recommended)</SelectItem>
                        <SelectItem value="10">10 years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-blue-800 font-medium">Regulatory Framework</Label>
                    <p className="text-sm text-blue-600 mb-2">Compliance requirements</p>
                    <div className="space-y-2">
                      {regulatoryFrameworks.slice(0, 4).map(framework => (
                        <div key={framework} className="flex items-center space-x-2">
                          <input type="checkbox" className="rounded border-blue-300" />
                          <label className="text-sm text-blue-800">{framework}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Security Status</AlertTitle>
                <AlertDescription className="text-blue-700">
                  All security features are properly configured. Last security audit: November 2024
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 