/**
 * Accounting Settings Component
 * Manages accounting configuration and settings
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Building2,
} from 'lucide-react';
import { useErrorHandler } from '@/hooks/use-error-handler';

export function AccountingSettingsOverview() {
  const { handleError, withErrorHandling } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state - TODO: Load from API when available
  const [settings, setSettings] = useState({
    // General Settings
    companyName: '',
    fiscalYearStart: '01-01',
    fiscalYearEnd: '12-31',
    baseCurrency: 'USD',
    defaultLanguage: 'en',
    
    // Accounting Settings
    enableAutoPosting: false,
    requireJournalEntryApproval: true,
    defaultChartOfAccounts: '',
    allowNegativeBalances: false,
    roundingMethod: 'half_up',
    
    // Reporting Settings
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US',
    showZeroBalances: true,
    groupByDepartment: false,
    
    // Tax Settings
    enableTaxManagement: false,
    defaultTaxRate: 0,
    taxInclusive: false,
    
    // Integration Settings
    enableBankSync: false,
    autoReconcile: false,
    enableInvoiceAutoNumbering: true,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to API when available
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message
    } catch (error) {
      handleError(error, 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounting Settings</h1>
          <p className="text-muted-foreground">
            Configure accounting preferences and defaults
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="rounded-full"
            onClick={() => {}}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reset
          </Button>
          <Button 
            className="rounded-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* General Settings */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            General Settings
          </CardTitle>
          <CardDescription>Basic accounting configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="rounded-xl"
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select value={settings.baseCurrency} onValueChange={(value) => setSettings({ ...settings, baseCurrency: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
              <Input
                id="fiscalYearStart"
                type="text"
                value={settings.fiscalYearStart}
                onChange={(e) => setSettings({ ...settings, fiscalYearStart: e.target.value })}
                className="rounded-xl"
                placeholder="MM-DD (e.g., 01-01)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiscalYearEnd">Fiscal Year End</Label>
              <Input
                id="fiscalYearEnd"
                type="text"
                value={settings.fiscalYearEnd}
                onChange={(e) => setSettings({ ...settings, fiscalYearEnd: e.target.value })}
                className="rounded-xl"
                placeholder="MM-DD (e.g., 12-31)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Settings */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Accounting Settings
          </CardTitle>
          <CardDescription>Configure accounting behavior and defaults</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoPosting">Enable Auto Posting</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically post journal entries without approval
                </p>
              </div>
              <Switch
                id="autoPosting"
                checked={settings.enableAutoPosting}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAutoPosting: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requireApproval">Require Journal Entry Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require approval before posting journal entries
                </p>
              </div>
              <Switch
                id="requireApproval"
                checked={settings.requireJournalEntryApproval}
                onCheckedChange={(checked) => setSettings({ ...settings, requireJournalEntryApproval: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="negativeBalances">Allow Negative Balances</Label>
                <p className="text-sm text-muted-foreground">
                  Allow accounts to have negative balances
                </p>
              </div>
              <Switch
                id="negativeBalances"
                checked={settings.allowNegativeBalances}
                onCheckedChange={(checked) => setSettings({ ...settings, allowNegativeBalances: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="roundingMethod">Rounding Method</Label>
              <Select value={settings.roundingMethod} onValueChange={(value) => setSettings({ ...settings, roundingMethod: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="half_up">Half Up (Standard)</SelectItem>
                  <SelectItem value="half_down">Half Down</SelectItem>
                  <SelectItem value="ceil">Always Round Up</SelectItem>
                  <SelectItem value="floor">Always Round Down</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reporting Settings */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reporting Settings
          </CardTitle>
          <CardDescription>Configure report formats and display options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => setSettings({ ...settings, dateFormat: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberFormat">Number Format</Label>
              <Select value={settings.numberFormat} onValueChange={(value) => setSettings({ ...settings, numberFormat: value })}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">1,234.56 (US)</SelectItem>
                  <SelectItem value="en-GB">1,234.56 (UK)</SelectItem>
                  <SelectItem value="de-DE">1.234,56 (EU)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="showZero">Show Zero Balances in Reports</Label>
                <p className="text-sm text-muted-foreground">
                  Include accounts with zero balance in reports
                </p>
              </div>
              <Switch
                id="showZero"
                checked={settings.showZeroBalances}
                onCheckedChange={(checked) => setSettings({ ...settings, showZeroBalances: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="groupByDept">Group by Department</Label>
                <p className="text-sm text-muted-foreground">
                  Group transactions by department in reports
                </p>
              </div>
              <Switch
                id="groupByDept"
                checked={settings.groupByDepartment}
                onCheckedChange={(checked) => setSettings({ ...settings, groupByDepartment: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Tax Settings
          </CardTitle>
          <CardDescription>Configure tax management options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableTax">Enable Tax Management</Label>
                <p className="text-sm text-muted-foreground">
                  Enable tax calculation and tracking
                </p>
              </div>
              <Switch
                id="enableTax"
                checked={settings.enableTaxManagement}
                onCheckedChange={(checked) => setSettings({ ...settings, enableTaxManagement: checked })}
              />
            </div>
            
            {settings.enableTaxManagement && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                    <Input
                      id="defaultTaxRate"
                      type="number"
                      value={settings.defaultTaxRate}
                      onChange={(e) => setSettings({ ...settings, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                      className="rounded-xl"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-8">
                    <div className="space-y-0.5">
                      <Label htmlFor="taxInclusive">Tax Inclusive Pricing</Label>
                      <p className="text-sm text-muted-foreground">
                        Prices include tax by default
                      </p>
                    </div>
                    <Switch
                      id="taxInclusive"
                      checked={settings.taxInclusive}
                      onCheckedChange={(checked) => setSettings({ ...settings, taxInclusive: checked })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Integration Settings
          </CardTitle>
          <CardDescription>Configure external integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bankSync">Enable Bank Synchronization</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync bank transactions
                </p>
              </div>
              <Switch
                id="bankSync"
                checked={settings.enableBankSync}
                onCheckedChange={(checked) => setSettings({ ...settings, enableBankSync: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoReconcile">Auto Reconcile Transactions</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically match bank transactions
                </p>
              </div>
              <Switch
                id="autoReconcile"
                checked={settings.autoReconcile}
                onCheckedChange={(checked) => setSettings({ ...settings, autoReconcile: checked })}
                disabled={!settings.enableBankSync}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoNumbering">Enable Invoice Auto Numbering</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically assign invoice numbers
                </p>
              </div>
              <Switch
                id="autoNumbering"
                checked={settings.enableInvoiceAutoNumbering}
                onCheckedChange={(checked) => setSettings({ ...settings, enableInvoiceAutoNumbering: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
