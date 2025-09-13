"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Webhook, 
  Key, 
  Globe, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Activity,
  Clock,
  Code,
  Zap
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH'
  events: string[]
  headers?: { [key: string]: string }
  secret?: string
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  totalCalls: number
  successRate: number
  retryPolicy: {
    maxRetries: number
    backoffMultiplier: number
    maxBackoffDelay: number
  }
}

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  expiresAt?: string
  usageCount: number
  rateLimit: {
    requests: number
    period: 'minute' | 'hour' | 'day'
  }
}

interface WebhookLog {
  id: string
  webhookId: string
  event: string
  status: 'success' | 'failed' | 'retry'
  httpStatus?: number
  response?: string
  error?: string
  timestamp: string
  duration: number
}

interface IntegrationTemplate {
  id: string
  name: string
  description: string
  category: string
  icon: string
  events: string[]
  requiredFields: string[]
  documentation?: string
}

const availableEvents = [
  'invoice.created',
  'invoice.paid',
  'transaction.created',
  'user.created',
  'subscription.updated',
  'payment.failed',
  'report.generated',
  'approval.requested',
  'approval.completed'
]

const integrationTemplates: IntegrationTemplate[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    category: 'Communication',
    icon: '💬',
    events: ['invoice.paid', 'approval.requested'],
    requiredFields: ['webhook_url'],
    documentation: 'https://api.slack.com/messaging/webhooks'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    category: 'Automation',
    icon: '⚡',
    events: ['*'],
    requiredFields: ['webhook_url'],
    documentation: 'https://zapier.com/apps/webhook'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync accounting data with QuickBooks',
    category: 'Accounting',
    icon: '📊',
    events: ['invoice.created', 'transaction.created'],
    requiredFields: ['api_key', 'company_id'],
    documentation: 'https://developer.intuit.com/app/developer/qbo'
  }
]

export function WebhookManager() {
  const { user, tenant } = useAuth()
  const { toast } = useToast()
  
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Mock data for demonstration
      const mockWebhooks: WebhookEndpoint[] = [
        {
          id: '1',
          name: 'Slack Notifications',
          url: 'https://hooks.slack.com/services/...',
          method: 'POST',
          events: ['invoice.paid', 'approval.requested'],
          headers: { 'Content-Type': 'application/json' },
          secret: 'whsec_abc123...',
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          lastTriggered: '2024-01-22T14:30:00Z',
          totalCalls: 245,
          successRate: 98.8,
          retryPolicy: {
            maxRetries: 3,
            backoffMultiplier: 2,
            maxBackoffDelay: 300
          }
        },
        {
          id: '2',
          name: 'QuickBooks Sync',
          url: 'https://api.quickbooks.com/webhook',
          method: 'POST',
          events: ['transaction.created', 'invoice.created'],
          isActive: false,
          createdAt: '2024-01-10T09:00:00Z',
          totalCalls: 89,
          successRate: 94.4,
          retryPolicy: {
            maxRetries: 5,
            backoffMultiplier: 1.5,
            maxBackoffDelay: 600
          }
        }
      ]

      const mockApiKeys: APIKey[] = [
        {
          id: '1',
          name: 'Mobile App Key',
          key: 'ak_live_abc123...',
          permissions: ['read:invoices', 'write:transactions'],
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          lastUsed: '2024-01-22T15:45:00Z',
          usageCount: 1247,
          rateLimit: {
            requests: 1000,
            period: 'hour'
          }
        },
        {
          id: '2',
          name: 'Integration Key',
          key: 'ak_test_xyz789...',
          permissions: ['read:users', 'read:reports'],
          isActive: true,
          createdAt: '2024-01-15T10:00:00Z',
          lastUsed: '2024-01-20T12:30:00Z',
          expiresAt: '2024-12-31T23:59:59Z',
          usageCount: 456,
          rateLimit: {
            requests: 500,
            period: 'hour'
          }
        }
      ]

      const mockLogs: WebhookLog[] = [
        {
          id: '1',
          webhookId: '1',
          event: 'invoice.paid',
          status: 'success',
          httpStatus: 200,
          response: '{"status": "ok"}',
          timestamp: '2024-01-22T14:30:00Z',
          duration: 142
        },
        {
          id: '2',
          webhookId: '1',
          event: 'approval.requested',
          status: 'failed',
          httpStatus: 500,
          error: 'Internal Server Error',
          timestamp: '2024-01-22T13:15:00Z',
          duration: 5000
        }
      ]

      setWebhooks(mockWebhooks)
      setApiKeys(mockApiKeys)
      setWebhookLogs(mockLogs)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load API data',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createWebhook = async (data: Partial<WebhookEndpoint>) => {
    const newWebhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: data.name || '',
      url: data.url || '',
      method: data.method || 'POST',
      events: data.events || [],
      headers: data.headers,
      secret: data.secret,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      totalCalls: 0,
      successRate: 0,
      retryPolicy: {
        maxRetries: 3,
        backoffMultiplier: 2,
        maxBackoffDelay: 300
      }
    }

    setWebhooks(prev => [...prev, newWebhook])
    toast({
      title: 'Webhook Created',
      description: 'Your webhook endpoint has been created successfully.'
    })
  }

  const toggleWebhook = async (id: string) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, isActive: !webhook.isActive } : webhook
    ))
  }

  const deleteWebhook = async (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id))
    toast({
      title: 'Webhook Deleted',
      description: 'The webhook endpoint has been removed.'
    })
  }

  const createApiKey = async (data: Partial<APIKey>) => {
    const newKey: APIKey = {
      id: Date.now().toString(),
      name: data.name || '',
      key: `ak_live_${Math.random().toString(36).substr(2, 24)}`,
      permissions: data.permissions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      rateLimit: data.rateLimit || { requests: 1000, period: 'hour' },
      expiresAt: data.expiresAt
    }

    setApiKeys(prev => [...prev, newKey])
    toast({
      title: 'API Key Created',
      description: 'Your new API key has been generated. Make sure to copy it now!'
    })
  }

  const revokeApiKey = async (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id))
    toast({
      title: 'API Key Revoked',
      description: 'The API key has been permanently revoked.'
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Success</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Failed</Badge>
      case 'retry':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Retry</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">API Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage webhooks, API keys, and third-party integrations
          </p>
        </div>
      </div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-blue-50 rounded-2xl">
          <TabsTrigger value="webhooks" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Key className="w-4 h-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Zap className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm text-blue-600">
            <Activity className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">Webhook Endpoints</CardTitle>
                  <CardDescription className="text-blue-600">
                    Configure webhook endpoints to receive real-time events
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Webhook Endpoint</DialogTitle>
                      <DialogDescription>
                        Set up a new webhook to receive events from your OASYS account
                      </DialogDescription>
                    </DialogHeader>
                    <WebhookForm onSubmit={createWebhook} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Success Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{webhook.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {webhook.totalCalls} calls
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {webhook.url.length > 40 ? `${webhook.url.substring(0, 40)}...` : webhook.url}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {webhook.isActive ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className={webhook.isActive ? 'text-green-600' : 'text-red-600'}>
                            {webhook.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {webhook.successRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleWebhook(webhook.id)}
                          >
                            {webhook.isActive ? 'Disable' : 'Enable'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWebhook(webhook)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWebhook(webhook.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-900">API Keys</CardTitle>
                  <CardDescription className="text-blue-600">
                    Manage API keys for programmatic access to your data
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create API Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create API Key</DialogTitle>
                      <DialogDescription>
                        Generate a new API key for accessing your OASYS data
                      </DialogDescription>
                    </DialogHeader>
                    <ApiKeyForm onSubmit={createApiKey} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Rate Limit</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{apiKey.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(apiKey.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {showSecrets[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSecrets(prev => ({ 
                              ...prev, 
                              [apiKey.id]: !prev[apiKey.id] 
                            }))}
                          >
                            {showSecrets[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {apiKey.permissions.map(permission => (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{apiKey.usageCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {apiKey.rateLimit.requests}/{apiKey.rateLimit.period}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeApiKey(apiKey.id)}
                          className="text-red-600"
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Available Integrations</CardTitle>
              <CardDescription className="text-blue-600">
                Connect OASYS with your favorite tools and services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationTemplates.map((template) => (
                  <Card key={template.id} className="bg-white border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900">{template.name}</h3>
                          <p className="text-sm text-blue-600 mt-1">{template.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {template.category}
                          </Badge>
                          <div className="mt-4 space-y-2">
                            <Button size="sm" className="w-full">
                              Connect
                            </Button>
                            {template.documentation && (
                              <Button variant="outline" size="sm" className="w-full">
                                <Code className="w-4 h-4 mr-2" />
                                Documentation
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Webhook Activity Logs</CardTitle>
              <CardDescription className="text-blue-600">
                Monitor webhook deliveries and debug issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Webhook</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.map((log) => {
                    const webhook = webhooks.find(w => w.id === log.webhookId)
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="secondary">{log.event}</Badge>
                        </TableCell>
                        <TableCell>{webhook?.name || 'Unknown'}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>
                          {log.httpStatus && (
                            <span className="text-sm">{log.httpStatus}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.duration}ms</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Webhook Creation Form Component
function WebhookForm({ onSubmit }: { onSubmit: (data: Partial<WebhookEndpoint>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST' as const,
    events: [] as string[],
    secret: '',
    isActive: true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Webhook Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Slack Notifications"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Endpoint URL</Label>
        <Input
          id="url"
          type="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="https://hooks.slack.com/services/..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Events to Subscribe</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableEvents.map(event => (
            <div key={event} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={event}
                checked={formData.events.includes(event)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, events: [...prev.events, event] }))
                  } else {
                    setFormData(prev => ({ ...prev, events: prev.events.filter(e => e !== event) }))
                  }
                }}
              />
              <Label htmlFor={event} className="text-sm">{event}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secret">Webhook Secret (Optional)</Label>
        <Input
          id="secret"
          value={formData.secret}
          onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
          placeholder="whsec_..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label>Enable webhook immediately</Label>
      </div>

      <Button type="submit" className="w-full">
        Create Webhook
      </Button>
    </form>
  )
}

// API Key Creation Form Component
function ApiKeyForm({ onSubmit }: { onSubmit: (data: Partial<APIKey>) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    rateLimit: { requests: 1000, period: 'hour' as const },
    expiresAt: ''
  })

  const availablePermissions = [
    'read:invoices',
    'write:invoices',
    'read:transactions',
    'write:transactions',
    'read:users',
    'write:users',
    'read:reports',
    'write:reports'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="keyName">API Key Name</Label>
        <Input
          id="keyName"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Mobile App Key"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Permissions</Label>
        <div className="grid grid-cols-2 gap-2">
          {availablePermissions.map(permission => (
            <div key={permission} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={permission}
                checked={formData.permissions.includes(permission)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, permissions: [...prev.permissions, permission] }))
                  } else {
                    setFormData(prev => ({ ...prev, permissions: prev.permissions.filter(p => p !== permission) }))
                  }
                }}
              />
              <Label htmlFor={permission} className="text-sm">{permission}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="requests">Rate Limit (requests)</Label>
          <Input
            id="requests"
            type="number"
            value={formData.rateLimit.requests}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              rateLimit: { ...prev.rateLimit, requests: parseInt(e.target.value) }
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="period">Period</Label>
          <Select 
            value={formData.rateLimit.period}
            onValueChange={(value) => setFormData(prev => ({ 
              ...prev, 
              rateLimit: { ...prev.rateLimit, period: value as 'minute' | 'hour' | 'day' }
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minute">Per Minute</SelectItem>
              <SelectItem value="hour">Per Hour</SelectItem>
              <SelectItem value="day">Per Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full">
        Create API Key
      </Button>
    </form>
  )
}

export default WebhookManager 