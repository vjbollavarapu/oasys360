"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { 
  Save, 
  RefreshCw, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Brain,
  Zap,
  FileText,
  DollarSign,
  Users,
  Settings
} from 'lucide-react'

interface ContentData {
  hero: any
  features: any
  pricing: any
  countries: any
  ai: any
  web3: any
  waitlist: any
}

export function ContentEditor() {
  const { user } = useAuth()
  const [content, setContent] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('hero')

  // Check if user has admin access
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (isAdmin) {
      loadContent()
    }
  }, [isAdmin])

  const loadContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/content')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        throw new Error('Failed to load content')
      }
    } catch (error) {
      console.error('Error loading content:', error)
      setMessage({ type: 'error', text: 'Failed to load content' })
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (section: string, data: any) => {
    try {
      setSaving(true)
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer admin-${user?.id}` // Simple auth for demo
        },
        body: JSON.stringify({ section, data })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `${section} updated successfully!` })
        // Update local state
        setContent(prev => prev ? { ...prev, [section]: data } : null)
      } else {
        throw new Error('Failed to save content')
      }
    } catch (error) {
      console.error('Error saving content:', error)
      setMessage({ type: 'error', text: 'Failed to save content' })
    } finally {
      setSaving(false)
    }
  }

  const updateField = async (section: string, field: string, value: any) => {
    try {
      setSaving(true)
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer admin-${user?.id}` // Simple auth for demo
        },
        body: JSON.stringify({ section, field, value })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `${field} updated successfully!` })
        // Update local state
        setContent(prev => {
          if (!prev) return null
          const newContent = { ...prev }
          const fieldParts = field.split('.')
          let current = (newContent as any)[section]
          
          for (let i = 0; i < fieldParts.length - 1; i++) {
            current = current[fieldParts[i]]
          }
          current[fieldParts[fieldParts.length - 1]] = value
          
          return newContent
        })
      } else {
        throw new Error('Failed to update field')
      }
    } catch (error) {
      console.error('Error updating field:', error)
      setMessage({ type: 'error', text: 'Failed to update field' })
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You need admin privileges to access the content editor.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading content...
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Error
            </CardTitle>
            <CardDescription>
              Failed to load content. Please try refreshing the page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadContent} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Content Editor
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your landing page content in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadContent} disabled={saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => window.open('/', '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="hero" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="countries" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Countries
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="web3" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Web3
            </TabsTrigger>
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Waitlist
            </TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>Main landing page hero content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={content.hero.title}
                      onChange={(e) => updateField('hero', 'title', e.target.value)}
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Textarea
                      value={content.hero.subtitle}
                      onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                      placeholder="Enter hero subtitle"
                      rows={3}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Primary CTA Text</Label>
                    <Input
                      value={content.hero.cta.primary}
                      onChange={(e) => updateField('hero', 'cta.primary', e.target.value)}
                      placeholder="Join Waitlist"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary CTA Text</Label>
                    <Input
                      value={content.hero.cta.secondary}
                      onChange={(e) => updateField('hero', 'cta.secondary', e.target.value)}
                      placeholder="Watch Demo"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Users Count</Label>
                    <Input
                      type="number"
                      value={content.hero.stats.users}
                      onChange={(e) => updateField('hero', 'stats.users', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Countries Count</Label>
                    <Input
                      type="number"
                      value={content.hero.stats.countries}
                      onChange={(e) => updateField('hero', 'stats.countries', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Accuracy</Label>
                    <Input
                      value={content.hero.stats.accuracy}
                      onChange={(e) => updateField('hero', 'stats.accuracy', e.target.value)}
                      placeholder="99.5%"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Section */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Features Section</CardTitle>
                <CardDescription>Main features and capabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.features.title}
                      onChange={(e) => updateField('features', 'title', e.target.value)}
                      placeholder="Enter features title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={content.features.subtitle}
                      onChange={(e) => updateField('features', 'subtitle', e.target.value)}
                      placeholder="Enter features subtitle"
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Feature Items</Label>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Feature
                    </Button>
                  </div>
                  
                  {content.features.items.map((feature: any, index: number) => (
                    <Card key={feature.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={feature.title}
                              onChange={(e) => {
                                const newItems = [...content.features.items]
                                newItems[index].title = e.target.value
                                updateField('features', 'items', newItems)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Input
                              value={feature.icon}
                              onChange={(e) => {
                                const newItems = [...content.features.items]
                                newItems[index].icon = e.target.value
                                updateField('features', 'items', newItems)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color</Label>
                            <Input
                              value={feature.color}
                              onChange={(e) => {
                                const newItems = [...content.features.items]
                                newItems[index].color = e.target.value
                                updateField('features', 'items', newItems)
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Features List</Label>
                          {feature.features.map((feat: string, featIndex: number) => (
                            <div key={featIndex} className="flex gap-2">
                              <Input
                                value={feat}
                                onChange={(e) => {
                                  const newItems = [...content.features.items]
                                  newItems[index].features[featIndex] = e.target.value
                                  updateField('features', 'items', newItems)
                                }}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newItems = [...content.features.items]
                                  newItems[index].features.splice(featIndex, 1)
                                  updateField('features', 'items', newItems)
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newItems = [...content.features.items]
                              newItems[index].features.push('New feature')
                              updateField('features', 'items', newItems)
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Feature
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Section */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Section</CardTitle>
                <CardDescription>Pricing plans and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.pricing.title}
                      onChange={(e) => updateField('pricing', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Input
                      value={content.pricing.subtitle}
                      onChange={(e) => updateField('pricing', 'subtitle', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Toggle Text</Label>
                    <Input
                      value={content.pricing.toggle.monthly}
                      onChange={(e) => updateField('pricing', 'toggle.monthly', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yearly Toggle Text</Label>
                    <Input
                      value={content.pricing.toggle.yearly}
                      onChange={(e) => updateField('pricing', 'toggle.yearly', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Pricing Plans</Label>
                  {content.pricing.plans.map((plan: any, index: number) => (
                    <Card key={plan.id} className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="space-y-2">
                            <Label>Plan Name</Label>
                            <Input
                              value={plan.name}
                              onChange={(e) => {
                                const newPlans = [...content.pricing.plans]
                                newPlans[index].name = e.target.value
                                updateField('pricing', 'plans', newPlans)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Monthly Price</Label>
                            <Input
                              type="number"
                              value={plan.price.monthly}
                              onChange={(e) => {
                                const newPlans = [...content.pricing.plans]
                                newPlans[index].price.monthly = parseInt(e.target.value)
                                updateField('pricing', 'plans', newPlans)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Yearly Price</Label>
                            <Input
                              type="number"
                              value={plan.price.yearly}
                              onChange={(e) => {
                                const newPlans = [...content.pricing.plans]
                                newPlans[index].price.yearly = parseInt(e.target.value)
                                updateField('pricing', 'plans', newPlans)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Revenue Bracket</Label>
                            <Input
                              value={plan.revenue}
                              onChange={(e) => {
                                const newPlans = [...content.pricing.plans]
                                newPlans[index].revenue = e.target.value
                                updateField('pricing', 'plans', newPlans)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Badge Text</Label>
                            <Input
                              value={plan.badge || ''}
                              placeholder="e.g., Best for startups"
                              onChange={(e) => {
                                const newPlans = [...content.pricing.plans]
                                newPlans[index].badge = e.target.value
                                updateField('pricing', 'plans', newPlans)
                              }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={plan.popular}
                            onCheckedChange={(checked) => {
                              const newPlans = [...content.pricing.plans]
                              newPlans[index].popular = checked
                              updateField('pricing', 'plans', newPlans)
                            }}
                          />
                          <Label>Popular Plan</Label>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Countries Section */}
          <TabsContent value="countries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Country-Specific Content</CardTitle>
                <CardDescription>Geolocation-based compliance and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(content.countries).map(([countryCode, countryData]: [string, any]) => (
                  <Card key={countryCode} className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Country Name</Label>
                          <Input
                            value={countryData.name}
                            onChange={(e) => updateField('countries', `${countryCode}.name`, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Flag Emoji</Label>
                          <Input
                            value={countryData.flag}
                            onChange={(e) => updateField('countries', `${countryCode}.flag`, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Compliance</Label>
                          <Input
                            value={countryData.compliance.join(', ')}
                            onChange={(e) => updateField('countries', `${countryCode}.compliance`, e.target.value.split(', '))}
                            placeholder="GST, IRAS"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Features</Label>
                        {countryData.features.map((feature: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={feature}
                              onChange={(e) => {
                                const newFeatures = [...countryData.features]
                                newFeatures[index] = e.target.value
                                updateField('countries', `${countryCode}.features`, newFeatures)
                              }}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newFeatures = countryData.features.filter((_: string, i: number) => i !== index)
                                updateField('countries', `${countryCode}.features`, newFeatures)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newFeatures = [...countryData.features, 'New feature']
                            updateField('countries', `${countryCode}.features`, newFeatures)
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Feature
                        </Button>
                      </div>
                      
                      {countryData.important && (
                        <div className="space-y-2">
                          <Label>Important Notice</Label>
                          <Textarea
                            value={countryData.important}
                            onChange={(e) => updateField('countries', `${countryCode}.important`, e.target.value)}
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Section */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Section</CardTitle>
                <CardDescription>AI capabilities and metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.ai.title}
                      onChange={(e) => updateField('ai', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={content.ai.subtitle}
                      onChange={(e) => updateField('ai', 'subtitle', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>AI Capabilities</Label>
                  {content.ai.capabilities.map((capability: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={capability.name}
                            onChange={(e) => {
                              const newCapabilities = [...content.ai.capabilities]
                              newCapabilities[index].name = e.target.value
                              updateField('ai', 'capabilities', newCapabilities)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Value</Label>
                          <Input
                            value={capability.value}
                            onChange={(e) => {
                              const newCapabilities = [...content.ai.capabilities]
                              newCapabilities[index].value = e.target.value
                              updateField('ai', 'capabilities', newCapabilities)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Percentage</Label>
                          <Input
                            type="number"
                            value={capability.percentage}
                            onChange={(e) => {
                              const newCapabilities = [...content.ai.capabilities]
                              newCapabilities[index].percentage = parseFloat(e.target.value)
                              updateField('ai', 'capabilities', newCapabilities)
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Color</Label>
                          <Input
                            value={capability.color}
                            onChange={(e) => {
                              const newCapabilities = [...content.ai.capabilities]
                              newCapabilities[index].color = e.target.value
                              updateField('ai', 'capabilities', newCapabilities)
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web3 Section */}
          <TabsContent value="web3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Web3 Section</CardTitle>
                <CardDescription>Web3 features and advantages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.web3.title}
                      onChange={(e) => updateField('web3', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={content.web3.subtitle}
                      onChange={(e) => updateField('web3', 'subtitle', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <Label>Web3 Advantages</Label>
                  {content.web3.advantages.map((advantage: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                              value={advantage.title}
                              onChange={(e) => {
                                const newAdvantages = [...content.web3.advantages]
                                newAdvantages[index].title = e.target.value
                                updateField('web3', 'advantages', newAdvantages)
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Input
                              value={advantage.icon}
                              onChange={(e) => {
                                const newAdvantages = [...content.web3.advantages]
                                newAdvantages[index].icon = e.target.value
                                updateField('web3', 'advantages', newAdvantages)
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={advantage.content}
                            onChange={(e) => {
                              const newAdvantages = [...content.web3.advantages]
                              newAdvantages[index].content = e.target.value
                              updateField('web3', 'advantages', newAdvantages)
                            }}
                            rows={3}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Waitlist Section */}
          <TabsContent value="waitlist" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Waitlist Section</CardTitle>
                <CardDescription>Waitlist configuration and stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Section Title</Label>
                    <Input
                      value={content.waitlist.title}
                      onChange={(e) => updateField('waitlist', 'title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={content.waitlist.subtitle}
                      onChange={(e) => updateField('waitlist', 'subtitle', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Current Count</Label>
                    <Input
                      type="number"
                      value={content.waitlist.count}
                      onChange={(e) => updateField('waitlist', 'count', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Count</Label>
                    <Input
                      type="number"
                      value={content.waitlist.maxCount}
                      onChange={(e) => updateField('waitlist', 'maxCount', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Launch Date</Label>
                    <Input
                      type="date"
                      value={content.waitlist.launchDate}
                      onChange={(e) => updateField('waitlist', 'launchDate', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 