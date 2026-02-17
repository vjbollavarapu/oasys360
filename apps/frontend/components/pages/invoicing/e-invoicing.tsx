"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Globe,
  CheckCircle,
  AlertTriangle,
  Settings,
  Upload,
  Download,
  Loader2,
  FileText
} from "lucide-react"
import { invoicingService } from "@/lib/api-services"
import { MyInvoisSettings } from "./myinvois-settings"
import { useToast } from "@/hooks/use-toast"

export function EInvoicingSetup() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalInvoices: 0,
    eInvoicesSent: 0,
    eInvoicesAccepted: 0,
    eInvoicesRejected: 0,
    complianceRate: 0,
  })
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    loadStats()
    loadSettings()
  }, [])

  const loadStats = async () => {
    try {
      // Get all invoices and calculate e-invoice stats
      const response = await invoicingService.getInvoices({ limit: 1000 })
      
      if (response.data?.results) {
        const invoices = response.data.results
        const totalInvoices = invoices.length
        
        const eInvoicesSent = invoices.filter(
          (inv: any) => inv.e_invoice_status && ['submitted', 'accepted', 'rejected'].includes(inv.e_invoice_status)
        ).length
        
        const eInvoicesAccepted = invoices.filter(
          (inv: any) => inv.e_invoice_status === 'accepted'
        ).length
        
        const eInvoicesRejected = invoices.filter(
          (inv: any) => inv.e_invoice_status === 'rejected'
        ).length
        
        const complianceRate = eInvoicesSent > 0 
          ? Math.round((eInvoicesAccepted / eInvoicesSent) * 100 * 10) / 10 
          : 0

        setStats({
          totalInvoices,
          eInvoicesSent,
          eInvoicesAccepted,
          eInvoicesRejected,
          complianceRate,
        })
      }
    } catch (error: any) {
      console.error("Error loading stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await invoicingService.getEInvoiceSettings()
      
      if (response.data?.results && response.data.results.length > 0) {
        setSettings(response.data.results[0])
      }
    } catch (error: any) {
      console.error("Error loading settings:", error)
    }
  }

  const isConfigured = settings?.is_enabled && settings?.api_key && settings?.api_secret

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Invoicing</h1>
          <p className="text-muted-foreground">
            Manage LHDN e-Invoicing and compliance
          </p>
        </div>
        {!isConfigured && (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Not Configured
          </Badge>
        )}
        {isConfigured && (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        )}
      </div>

      {!isConfigured && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            E-Invoicing is not configured. Please configure MyInvois settings in the Settings tab to start submitting invoices.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
              <CardContent className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-2xl">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalInvoices}</div>
                    <p className="text-xs text-muted-foreground mt-2">All invoices</p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">E-Invoices Sent</CardTitle>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
                      <Upload className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.eInvoicesSent}</div>
                    <p className="text-xs text-muted-foreground mt-2">Submitted to MyInvois</p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">E-Invoices Accepted</CardTitle>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-2xl">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{stats.eInvoicesAccepted}</div>
                    <p className="text-xs text-muted-foreground mt-2">Accepted by LHDN</p>
                  </CardContent>
                </Card>
                
                <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Compliance Rate</CardTitle>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl">
                      <CheckCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.complianceRate}%</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {stats.eInvoicesSent > 0 
                        ? `${stats.eInvoicesAccepted} of ${stats.eInvoicesSent} accepted`
                        : 'No submissions yet'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
                <CardHeader>
                  <CardTitle>MyInvois Connection Status</CardTitle>
                  <CardDescription>
                    Status of your LHDN MyInvois integration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isConfigured 
                            ? settings?.settings?.environment === 'production'
                              ? 'bg-green-100'
                              : 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}>
                          <Globe className={`h-5 w-5 ${
                            isConfigured 
                              ? settings?.settings?.environment === 'production'
                                ? 'text-green-600'
                                : 'text-blue-600'
                              : 'text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium">LHDN MyInvois</p>
                          <p className="text-sm text-muted-foreground">
                            {isConfigured
                              ? settings?.settings?.environment === 'production'
                                ? 'Production Environment'
                                : 'Sandbox Environment'
                              : 'Not configured'
                            }
                          </p>
                        </div>
                      </div>
                      {isConfigured ? (
                        <Badge className={`rounded-full ${
                          settings?.settings?.environment === 'production'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                        }`}>
                          {settings?.settings?.environment === 'production' ? 'Production' : 'Sandbox'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-full">Not Connected</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <MyInvoisSettings />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card className="rounded-4xl shadow-soft dark:shadow-soft-dark border-0">
            <CardHeader>
              <CardTitle>LHDN E-Invoicing Compliance</CardTitle>
              <CardDescription>
                Information about LHDN e-Invoicing requirements and compliance phases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Implementation Phases</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 border rounded-xl">
                    <span>Phase 1 (Active)</span>
                    <Badge variant="outline" className="rounded-full bg-green-50">Active</Badge>
                  </div>
                  <div className="p-2 border rounded-xl">
                    <strong>Effective:</strong> 1 Aug 2024<br />
                    <strong>Threshold:</strong> Annual revenue &gt; RM 100 million
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border rounded-xl">
                    <span>Phase 2</span>
                    <Badge variant="outline" className="rounded-full">Upcoming</Badge>
                  </div>
                  <div className="p-2 border rounded-xl">
                    <strong>Effective:</strong> 1 Jan 2025<br />
                    <strong>Threshold:</strong> RM 25M - RM 100M
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border rounded-xl">
                    <span>Phase 3</span>
                    <Badge variant="outline" className="rounded-full">Upcoming</Badge>
                  </div>
                  <div className="p-2 border rounded-xl">
                    <strong>Effective:</strong> 1 Jul 2025<br />
                    <strong>Threshold:</strong> RM 5M - RM 25M
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border rounded-xl">
                    <span>Phase 4</span>
                    <Badge variant="outline" className="rounded-full">Upcoming</Badge>
                  </div>
                  <div className="p-2 border rounded-xl">
                    <strong>Effective:</strong> 1 Jan 2026<br />
                    <strong>Threshold:</strong> RM 1M - RM 5M
                  </div>
                  
                  <div className="flex justify-between items-center p-2 border rounded-xl">
                    <span>Phase 5</span>
                    <Badge variant="outline" className="rounded-full">Upcoming</Badge>
                  </div>
                  <div className="p-2 border rounded-xl">
                    <strong>Effective:</strong> 1 Jul 2026<br />
                    <strong>Threshold:</strong> &lt; RM 1M
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Requirements</h3>
                <ul className="space-y-2 text-sm list-disc list-inside">
                  <li>UBL 2.1 format compliance</li>
                  <li>Real-time submission to MyInvois</li>
                  <li>Mandatory fields validation</li>
                  <li>SST/GST calculation accuracy</li>
                  <li>7-year data retention</li>
                </ul>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  For more information, visit{" "}
                  <a
                    href="https://www.hasil.gov.my/en/e-invoicing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    LHDN e-Invoicing Guidelines
                  </a>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
