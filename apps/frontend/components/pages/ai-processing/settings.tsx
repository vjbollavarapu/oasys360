"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { 
  Settings,
  Brain,
  Zap,
  Shield,
  Database,
  Loader2,
  CheckCircle
} from "lucide-react"
import { aiProcessingService } from "@/lib/api-services"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { useToast } from "@/hooks/use-toast"

interface AISettings {
  auto_categorization_enabled?: boolean
  fraud_detection_enabled?: boolean
  forecasting_enabled?: boolean
  document_processing_enabled?: boolean
  max_concurrent_jobs?: number
  default_model?: string
  api_timeout?: number
  retry_attempts?: number
  data_retention_days?: number
  encryption_enabled?: boolean
  audit_logging_enabled?: boolean
}

export function AIProcessingSettingsOverview() {
  const [settings, setSettings] = useState<AISettings>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { withErrorHandling } = useErrorHandler()
  const { toast } = useToast()
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AISettings>()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    await withErrorHandling(async () => {
      setIsLoading(true)
      const response = await aiProcessingService.getSettings()
      if (response.success && response.data) {
        setSettings(response.data)
        reset(response.data)
      }
    })
    setIsLoading(false)
  }

  const onSubmit = async (data: AISettings) => {
    await withErrorHandling(async () => {
      setIsSaving(true)
      const response = await aiProcessingService.updateSettings(data)
      if (response.success) {
        setSettings(response.data || data)
        toast({
          title: "Settings saved",
          description: "AI processing settings have been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to save settings",
          variant: "destructive",
        })
      }
    })
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Processing Settings</h1>
          <p className="text-muted-foreground">
            Configure AI processing parameters and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadSettings}>
            <Zap className="h-4 w-4 mr-2" />
            Reload
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Settings className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic AI processing configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="default-model">Default Model</Label>
                    <Select
                      value={watch('default_model') || settings.default_model || ''}
                      onValueChange={(value) => setValue('default_model', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        <SelectItem value="claude-3">Claude-3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="api-timeout">API Timeout (seconds)</Label>
                    <Input
                      id="api-timeout"
                      type="number"
                      {...register('api_timeout', { valueAsNumber: true })}
                      defaultValue={settings.api_timeout || 30}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-categorization"
                      {...register('auto_categorization_enabled')}
                      defaultChecked={settings.auto_categorization_enabled}
                      className="rounded"
                    />
                    <Label htmlFor="auto-categorization">Enable Auto-Categorization</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="document-processing"
                      {...register('document_processing_enabled')}
                      defaultChecked={settings.document_processing_enabled}
                      className="rounded"
                    />
                    <Label htmlFor="document-processing">Enable Document Processing</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="models" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Configuration</CardTitle>
                <CardDescription>
                  Configure AI models for different tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Transaction Categorization</p>
                      <p className="text-sm text-muted-foreground">Automatically categorize transactions</p>
                    </div>
                    <Badge className={settings.auto_categorization_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {settings.auto_categorization_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Document Processing</p>
                      <p className="text-sm text-muted-foreground">Extract data from documents</p>
                    </div>
                    <Badge className={settings.document_processing_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {settings.document_processing_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Fraud Detection</p>
                      <p className="text-sm text-muted-foreground">Detect fraudulent transactions</p>
                    </div>
                    <Badge className={settings.fraud_detection_enabled ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {settings.fraud_detection_enabled ? "Enabled" : "Training"}
                    </Badge>
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
                  Configure security and privacy settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Data Encryption</p>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive data</p>
                    </div>
                    <Badge className={settings.encryption_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {settings.encryption_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Audit Logging</p>
                      <p className="text-sm text-muted-foreground">Log all AI operations</p>
                    </div>
                    <Badge className={settings.audit_logging_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {settings.audit_logging_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div>
                    <Label htmlFor="data-retention">Data Retention (days)</Label>
                    <Input
                      id="data-retention"
                      type="number"
                      {...register('data_retention_days', { valueAsNumber: true })}
                      defaultValue={settings.data_retention_days || 30}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Settings</CardTitle>
                <CardDescription>
                  Optimize AI processing performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="max-concurrent-jobs">Max Concurrent Jobs</Label>
                    <Input
                      id="max-concurrent-jobs"
                      type="number"
                      {...register('max_concurrent_jobs', { valueAsNumber: true })}
                      defaultValue={settings.max_concurrent_jobs || 5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retry-attempts">Retry Attempts</Label>
                    <Input
                      id="retry-attempts"
                      type="number"
                      {...register('retry_attempts', { valueAsNumber: true })}
                      defaultValue={settings.retry_attempts || 3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
