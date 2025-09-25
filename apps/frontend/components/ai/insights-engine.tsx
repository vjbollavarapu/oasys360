"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  Lightbulb, 
  Zap, 
  Settings, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Users, 
  BarChart3,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Sparkles,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

interface AIInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation'
  title: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high' | 'critical'
  category: string
  actionable: boolean
  automated: boolean
  createdAt: string
  status: 'new' | 'viewed' | 'acknowledged' | 'resolved'
  data?: any
  suggestedActions?: string[]
  estimatedValue?: number
}

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: string
  condition: string
  action: string
  isEnabled: boolean
  executionCount: number
  lastExecuted?: string
  createdAt: string
}

interface AIModel {
  id: string
  name: string
  description: string
  category: string
  accuracy: number
  isEnabled: boolean
  lastTrained: string
  dataPoints: number
}

const mockInsights: AIInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Revenue Optimization Opportunity',
    description: 'Your subscription revenue could increase by 23% by targeting enterprise clients who typically upgrade within 3 months.',
    confidence: 87,
    impact: 'high',
    category: 'Revenue',
    actionable: true,
    automated: false,
    createdAt: '2024-01-22T10:00:00Z',
    status: 'new',
    estimatedValue: 15680,
    suggestedActions: [
      'Create enterprise onboarding workflow',
      'Develop premium feature showcase',
      'Schedule follow-up campaigns for trial users'
    ]
  },
  {
    id: '2',
    type: 'anomaly',
    title: 'Unusual Transaction Pattern Detected',
    description: 'Transaction volume has increased 340% in the healthcare sector over the past 48 hours. This may indicate a data quality issue or genuine growth.',
    confidence: 94,
    impact: 'medium',
    category: 'Operations',
    actionable: true,
    automated: true,
    createdAt: '2024-01-22T08:30:00Z',
    status: 'new'
  },
  {
    id: '3',
    type: 'risk',
    title: 'Churn Risk Alert',
    description: '12 high-value customers show signs of decreased engagement, with 89% probability of churning within 30 days.',
    confidence: 89,
    impact: 'critical',
    category: 'Customer Success',
    actionable: true,
    automated: false,
    createdAt: '2024-01-22T07:15:00Z',
    status: 'viewed',
    estimatedValue: -28450,
    suggestedActions: [
      'Trigger retention campaign',
      'Schedule customer success calls',
      'Offer personalized discounts'
    ]
  },
  {
    id: '4',
    type: 'trend',
    title: 'Emerging Market Trend',
    description: 'AI-powered accounting features usage has grown 156% month-over-month, indicating strong product-market fit.',
    confidence: 92,
    impact: 'high',
    category: 'Product',
    actionable: true,
    automated: false,
    createdAt: '2024-01-21T16:45:00Z',
    status: 'acknowledged'
  }
]

const mockAutomationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Fraud Detection Alert',
    description: 'Automatically flag transactions over $10,000 from new accounts',
    trigger: 'transaction.created',
    condition: 'amount > 10000 AND account_age < 30',
    action: 'flag_for_review',
    isEnabled: true,
    executionCount: 23,
    lastExecuted: '2024-01-22T09:30:00Z',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Customer Success Outreach',
    description: 'Send welcome email series to new enterprise customers',
    trigger: 'customer.upgraded',
    condition: 'plan_type == "enterprise"',
    action: 'send_email_sequence',
    isEnabled: true,
    executionCount: 8,
    lastExecuted: '2024-01-21T14:20:00Z',
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'Invoice Reminder Automation',
    description: 'Send payment reminders for overdue invoices',
    trigger: 'invoice.overdue',
    condition: 'days_overdue >= 7',
    action: 'send_reminder',
    isEnabled: false,
    executionCount: 45,
    lastExecuted: '2024-01-20T11:00:00Z',
    createdAt: '2024-01-05T00:00:00Z'
  }
]

const aiModels: AIModel[] = [
  {
    id: 'churn-prediction',
    name: 'Churn Prediction',
    description: 'Predicts customer churn probability based on usage patterns',
    category: 'Customer Analytics',
    accuracy: 89.4,
    isEnabled: true,
    lastTrained: '2024-01-20T10:00:00Z',
    dataPoints: 15840
  },
  {
    id: 'revenue-forecasting',
    name: 'Revenue Forecasting',
    description: 'Forecasts monthly recurring revenue and growth trends',
    category: 'Financial Analytics',
    accuracy: 94.7,
    isEnabled: true,
    lastTrained: '2024-01-21T15:30:00Z',
    dataPoints: 8920
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection',
    description: 'Detects unusual patterns in transactions and user behavior',
    category: 'Security & Compliance',
    accuracy: 96.2,
    isEnabled: true,
    lastTrained: '2024-01-22T08:00:00Z',
    dataPoints: 23670
  }
]

export function AIInsightsEngine() {
  const { user, tenant } = useAuth()
  const { toast } = useToast()
  
  const [insights, setInsights] = useState<AIInsight[]>(mockInsights)
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules)
  const [models, setModels] = useState<AIModel[]>(aiModels)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)

  const generateInsights = async () => {
    setIsGenerating(true)
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add a new insight
      const newInsight: AIInsight = {
        id: Date.now().toString(),
        type: 'recommendation',
        title: 'Cost Optimization Opportunity',
        description: 'Switch to annual billing for 15% of monthly subscribers could save $3,200 in processing fees annually.',
        confidence: 85,
        impact: 'medium',
        category: 'Finance',
        actionable: true,
        automated: false,
        createdAt: new Date().toISOString(),
        status: 'new',
        estimatedValue: 3200,
        suggestedActions: [
          'Create annual billing promotion',
          'Email existing monthly subscribers',
          'Add billing preference in user settings'
        ]
      }
      
      setInsights(prev => [newInsight, ...prev])
      toast({
        title: 'New Insights Generated',
        description: 'AI has discovered new opportunities and recommendations.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate insights',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const markInsightStatus = (id: string, status: AIInsight['status']) => {
    setInsights(prev => prev.map(insight => 
      insight.id === id ? { ...insight, status } : insight
    ))
  }

  const toggleAutomationRule = (id: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule
    ))
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'risk':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'trend':
        return <BarChart3 className="w-5 h-5 text-blue-600" />
      case 'anomaly':
        return <Eye className="w-5 h-5 text-orange-600" />
      case 'recommendation':
        return <Lightbulb className="w-5 h-5 text-purple-600" />
      default:
        return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const pendingInsights = insights.filter(i => i.status === 'new')
  const criticalInsights = insights.filter(i => i.impact === 'critical')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Insights Engine
          </h2>
          <p className="text-muted-foreground mt-1">
            Intelligent business insights powered by machine learning
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={generateInsights} disabled={isGenerating} className="bg-purple-600 hover:bg-purple-700">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">New Insights</p>
                <p className="text-2xl font-bold text-purple-900">{pendingInsights.length}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-900">{criticalInsights.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Active Models</p>
                <p className="text-2xl font-bold text-blue-900">{models.filter(m => m.isEnabled).length}</p>
              </div>
              <Target className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Automations</p>
                <p className="text-2xl font-bold text-green-900">{automationRules.filter(r => r.isEnabled).length}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 gap-1 p-1 bg-purple-50 rounded-2xl">
          <TabsTrigger value="insights" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm text-purple-600">
            <Brain className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="automation" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm text-purple-600">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="models" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm text-purple-600">
            <Target className="w-4 h-4 mr-2" />
            AI Models
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm text-purple-600">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className={`cursor-pointer transition-all hover:shadow-lg ${
                insight.status === 'new' ? 'ring-2 ring-purple-200' : ''
              }`} onClick={() => setSelectedInsight(insight)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <Badge className={getImpactColor(insight.impact)}>
                        {insight.impact}
                      </Badge>
                    </div>
                    <Badge variant={insight.status === 'new' ? 'default' : 'secondary'}>
                      {insight.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Confidence: {insight.confidence}%</span>
                    <span>{insight.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Progress value={insight.confidence} className="flex-1 mr-3" />
                    {insight.estimatedValue && (
                      <span className={`text-sm font-medium ${
                        insight.estimatedValue > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.estimatedValue > 0 ? '+' : ''}${Math.abs(insight.estimatedValue).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {insight.actionable && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          markInsightStatus(insight.id, 'acknowledged')
                        }}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                      {insight.suggestedActions && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <ArrowRight className="w-3 h-3 mr-1" />
                          Act
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Insight Detail Modal would go here */}
          {selectedInsight && (
            <Card className="fixed inset-4 z-50 bg-white shadow-2xl max-w-2xl mx-auto overflow-y-auto">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getInsightIcon(selectedInsight.type)}
                      {selectedInsight.title}
                    </CardTitle>
                    <CardDescription>{selectedInsight.category}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedInsight(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>{selectedInsight.description}</p>
                
                {selectedInsight.suggestedActions && (
                  <div>
                    <h4 className="font-medium mb-3">Suggested Actions:</h4>
                    <ul className="space-y-2">
                      {selectedInsight.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={() => markInsightStatus(selectedInsight.id, 'resolved')}>
                    Mark as Resolved
                  </Button>
                  <Button variant="outline">
                    Schedule Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">Automation Rules</CardTitle>
              <CardDescription className="text-purple-600">
                Automate routine tasks and responses based on AI insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-purple-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-purple-900">{rule.name}</h3>
                        <Badge className={rule.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {rule.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">{rule.description}</p>
                      <div className="flex items-center gap-4 text-xs text-purple-500 mt-2">
                        <span>Executed {rule.executionCount} times</span>
                        {rule.lastExecuted && (
                          <span>Last: {new Date(rule.lastExecuted).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rule.isEnabled}
                        onCheckedChange={() => toggleAutomationRule(rule.id)}
                      />
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Models Tab */}
        <TabsContent value="models" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-900">{model.name}</CardTitle>
                  <CardDescription className="text-purple-600">{model.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Accuracy</span>
                    <span className="font-semibold text-purple-900">{model.accuracy}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Data Points</span>
                    <span className="font-semibold text-purple-900">{model.dataPoints.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-700">Last Trained</span>
                    <span className="text-xs text-purple-600">
                      {new Date(model.lastTrained).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge className={model.isEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {model.isEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button size="sm" variant="outline" className="border-purple-200 text-purple-700">
                      Retrain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-900">AI Engine Configuration</CardTitle>
              <CardDescription className="text-purple-600">
                Configure AI models, thresholds, and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-purple-900">Real-time Insights</Label>
                    <p className="text-sm text-purple-600">Generate insights as data changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-purple-900">Anomaly Detection</Label>
                    <p className="text-sm text-purple-600">Automatically detect unusual patterns</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-purple-900">Automated Actions</Label>
                    <p className="text-sm text-purple-600">Allow AI to take predefined actions</p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-900">Confidence Threshold</Label>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-purple-600">Low</span>
                    <Progress value={75} className="flex-1" />
                    <span className="text-sm text-purple-600">High</span>
                  </div>
                  <p className="text-xs text-purple-500">Only show insights above 75% confidence</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AIInsightsEngine 