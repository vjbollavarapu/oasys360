"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { invoicingService } from "@/lib/api-services"
import { 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  EyeOff,
  Save,
  TestTube
} from "lucide-react"

const settingsSchema = z.object({
  is_enabled: z.boolean(),
  provider: z.string().min(1, "Provider is required"),
  api_key: z.string().min(1, "API Key is required"),
  api_secret: z.string().min(1, "API Secret is required"),
  webhook_url: z.string().url().optional().or(z.literal("")),
  environment: z.enum(["sandbox", "production"]),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export function MyInvoisSettings() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showApiSecret, setShowApiSecret] = useState(false)
  const [settings, setSettings] = useState<any>(null)
  const [settingsId, setSettingsId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      is_enabled: false,
      provider: "MyInvois",
      api_key: "",
      api_secret: "",
      webhook_url: "",
      environment: "sandbox",
    },
  })

  const isEnabled = watch("is_enabled")
  const environment = watch("environment")

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await invoicingService.getEInvoiceSettings()
      
      if (response.data && response.data.results && response.data.results.length > 0) {
        const setting = response.data.results[0]
        setSettings(setting)
        setSettingsId(setting.id)
        
        // Populate form with existing settings
        setValue("is_enabled", setting.is_enabled || false)
        setValue("provider", setting.provider || "MyInvois")
        setValue("api_key", setting.api_key || "")
        setValue("api_secret", setting.api_secret || "")
        setValue("webhook_url", setting.webhook_url || "")
        setValue("environment", setting.settings?.environment || "sandbox")
      }
    } catch (error: any) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load e-invoice settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setSaving(true)
      
      const settingsData = {
        is_enabled: data.is_enabled,
        provider: data.provider,
        api_key: data.api_key,
        api_secret: data.api_secret,
        webhook_url: data.webhook_url || "",
        settings: {
          environment: data.environment,
        },
      }

      let response
      if (settingsId) {
        response = await invoicingService.updateEInvoiceSetting(settingsId, settingsData)
      } else {
        response = await invoicingService.createEInvoiceSetting(settingsData)
        if (response.data?.id) {
          setSettingsId(response.data.id)
        }
      }

      setSettings(response.data)
      
      toast({
        title: "Success",
        description: "E-invoice settings saved successfully",
      })
      
      await loadSettings()
    } catch (error: any) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save e-invoice settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    try {
      setTesting(true)
      
      // First save settings if not saved yet
      if (!settingsId) {
        const formData = watch()
        const settingsData = {
          is_enabled: formData.is_enabled,
          provider: formData.provider,
          api_key: formData.api_key,
          api_secret: formData.api_secret,
          webhook_url: formData.webhook_url || "",
          settings: {
            environment: formData.environment,
          },
        }
        
        const createResponse = await invoicingService.createEInvoiceSetting(settingsData)
        if (createResponse.data?.id) {
          setSettingsId(createResponse.data.id)
        }
      }
      
      // Test connection
      const response = await invoicingService.testEInvoiceConnection(settingsId || undefined)
      
      if (response.success) {
        toast({
          title: "Connection Successful",
          description: response.data?.message || "Successfully connected to MyInvois API",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: response.data?.error || response.message || "Failed to connect to MyInvois API",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Connection test failed",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            MyInvois Configuration
          </CardTitle>
          <CardDescription>
            Configure your MyInvois API credentials and settings for LHDN e-Invoicing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="is_enabled" className="text-base font-medium">
                  Enable E-Invoicing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable submission of invoices to LHDN MyInvois
                </p>
              </div>
              <Switch
                id="is_enabled"
                checked={isEnabled}
                onCheckedChange={(checked) => setValue("is_enabled", checked)}
              />
            </div>

            {isEnabled && (
              <>
                {/* Provider */}
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    {...register("provider")}
                    placeholder="MyInvois"
                    disabled
                  />
                  {errors.provider && (
                    <p className="text-sm text-destructive">{errors.provider.message}</p>
                  )}
                </div>

                {/* Environment */}
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={environment}
                    onValueChange={(value) => setValue("environment", value as "sandbox" | "production")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.environment && (
                    <p className="text-sm text-destructive">{errors.environment.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Use Sandbox for testing. Switch to Production only after thorough testing.
                  </p>
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <Label htmlFor="api_key">API Key</Label>
                  <Input
                    id="api_key"
                    type="text"
                    {...register("api_key")}
                    placeholder="Enter your MyInvois API Key"
                  />
                  {errors.api_key && (
                    <p className="text-sm text-destructive">{errors.api_key.message}</p>
                  )}
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                  <Label htmlFor="api_secret">API Secret</Label>
                  <div className="relative">
                    <Input
                      id="api_secret"
                      type={showApiSecret ? "text" : "password"}
                      {...register("api_secret")}
                      placeholder="Enter your MyInvois API Secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                    >
                      {showApiSecret ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.api_secret && (
                    <p className="text-sm text-destructive">{errors.api_secret.message}</p>
                  )}
                </div>

                {/* Webhook URL */}
                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL (Optional)</Label>
                  <Input
                    id="webhook_url"
                    type="url"
                    {...register("webhook_url")}
                    placeholder="https://your-domain.com/webhooks/myinvois"
                  />
                  {errors.webhook_url && (
                    <p className="text-sm text-destructive">{errors.webhook_url.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    URL to receive status updates from MyInvois
                  </p>
                </div>

                {/* Environment Warning */}
                {environment === "production" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You are using the Production environment. Please ensure all credentials are correct
                      and you have tested thoroughly in Sandbox first.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={testConnection}
                    disabled={testing || !isEnabled}
                  >
                    {testing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {!isEnabled && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Enable e-invoicing to configure MyInvois settings
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Register with MyInvois</h4>
            <p className="text-sm text-muted-foreground">
              Register your business at{" "}
              <a
                href="https://myinvois.hasil.gov.my"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                myinvois.hasil.gov.my
              </a>
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Get API Credentials</h4>
            <p className="text-sm text-muted-foreground">
              Obtain your API Key and API Secret from the MyInvois portal after registration.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Test in Sandbox</h4>
            <p className="text-sm text-muted-foreground">
              Always test your integration in Sandbox environment before switching to Production.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">4. Compliance Phase</h4>
            <p className="text-sm text-muted-foreground">
              Check your compliance phase based on annual revenue. Phase 1 (RM 100M+) started Aug 2024.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

