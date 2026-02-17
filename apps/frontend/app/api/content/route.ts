import { NextRequest, NextResponse } from 'next/server'
// Note: Auth temporarily disabled - uncomment when auth is re-enabled
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../auth/[...nextauth]/route'

interface ContentItem {
  id: string
  type: 'page' | 'component' | 'template' | 'ai-generated'
  title: string
  slug: string
  content: Record<string, unknown>
  metadata: {
    author: string
    created: string
    modified: string
    published: boolean
    tags: string[]
    category: string
    tenantId?: string
    version: number
  }
  permissions: {
    read: string[]
    write: string[]
    publish: string[]
  }
  aiGenerated?: {
    prompt: string
    model: string
    confidence: number
    reviewed: boolean
  }
}

// Mock content database - in production, this would be your actual database
const mockContent: ContentItem[] = [
  {
    id: '1',
    type: 'ai-generated',
    title: 'Monthly Financial Summary Template',
    slug: 'monthly-financial-summary',
    content: {
      template: "# Monthly Financial Summary for {{month}} {{year}}\n\n## Key Metrics\n- **Total Revenue**: ${{totalRevenue}}\n- **Total Expenses**: ${{totalExpenses}}\n- **Net Profit**: ${{netProfit}}\n- **Profit Margin**: {{profitMargin}}%\n\n## Revenue Breakdown\n{{#each revenueByCategory}}\n- **{{category}}**: ${{amount}} ({{percentage}}%)\n{{/each}}\n\n## Expense Analysis\n{{#each expensesByCategory}}\n- **{{category}}**: ${{amount}} ({{percentage}}%)\n{{/each}}\n\n## Key Insights\n{{#if insights}}\n{{#each insights}}\n- {{description}}\n{{/each}}\n{{else}}\nNo significant insights for this period.\n{{/if}}\n\n## Recommendations\n{{#if recommendations}}\n{{#each recommendations}}\n- {{action}} - Expected impact: {{impact}}\n{{/each}}\n{{else}}\nContinue monitoring current trends.\n{{/if}}",
      variables: [
        'month', 'year', 'totalRevenue', 'totalExpenses', 'netProfit', 
        'profitMargin', 'revenueByCategory', 'expensesByCategory', 
        'insights', 'recommendations'
      ]
    },
    metadata: {
      author: 'ai-system',
      created: '2024-01-22T10:00:00Z',
      modified: '2024-01-22T10:00:00Z',
      published: true,
      tags: ['financial', 'report', 'template', 'ai-generated'],
      category: 'reports',
      tenantId: 'tenant-1',
      version: 1
    },
    permissions: {
      read: ['tenant-admin', 'cfo', 'accountant'],
      write: ['tenant-admin', 'cfo'],
      publish: ['tenant-admin']
    },
    aiGenerated: {
      prompt: 'Create a professional monthly financial summary template with dynamic data placeholders',
      model: 'gpt-4',
      confidence: 92,
      reviewed: true
    }
  },
  {
    id: '2',
    type: 'component',
    title: 'Invoice Payment Status Widget',
    slug: 'invoice-payment-status',
    content: {
      component: 'InvoiceStatusWidget',
      props: {
        showOverdue: true,
        showPaid: true,
        showPending: true,
        refreshInterval: 30000,
        maxItems: 10
      },
      styling: {
        theme: 'default',
        colors: {
          overdue: '#ef4444',
          paid: '#10b981',
          pending: '#f59e0b'
        }
      }
    },
    metadata: {
      author: 'admin@oasys360.com',
      created: '2024-01-20T15:30:00Z',
      modified: '2024-01-22T09:15:00Z',
      published: true,
      tags: ['invoice', 'payment', 'widget', 'dashboard'],
      category: 'components',
      version: 3
    },
    permissions: {
      read: ['*'],
      write: ['tenant-admin', 'developer'],
      publish: ['tenant-admin']
    }
  },
  {
    id: '3',
    type: 'page',
    title: 'Compliance Dashboard',
    slug: 'compliance-dashboard',
    content: {
      sections: [
        {
          type: 'header',
          content: {
            title: 'Compliance Overview',
            description: 'Monitor your organization\'s compliance status and requirements'
          }
        },
        {
          type: 'metrics',
          content: {
            cards: [
              { title: 'Compliance Score', value: '94%', trend: '+2%' },
              { title: 'Open Issues', value: '3', trend: '-1' },
              { title: 'Audits Scheduled', value: '2', trend: 'stable' }
            ]
          }
        },
        {
          type: 'checklist',
          content: {
            title: 'Compliance Checklist',
            items: [
              { id: 1, text: 'Monthly reconciliation completed', completed: true },
              { id: 2, text: 'Tax filings up to date', completed: true },
              { id: 3, text: 'Audit trail documentation', completed: false },
              { id: 4, text: 'Data backup verification', completed: true }
            ]
          }
        }
      ]
    },
    metadata: {
      author: 'compliance@oasys360.com',
      created: '2024-01-18T11:00:00Z',
      modified: '2024-01-21T16:45:00Z',
      published: true,
      tags: ['compliance', 'audit', 'dashboard', 'regulations'],
      category: 'pages',
      version: 2
    },
    permissions: {
      read: ['tenant-admin', 'compliance-officer', 'cfo'],
      write: ['tenant-admin', 'compliance-officer'],
      publish: ['tenant-admin']
    }
  }
]

// AI Content Generation Service
class AIContentService {
  static async generateContent(prompt: string, type: string, context?: Record<string, unknown>) {
    // In production, this would call your AI service (OpenAI, Anthropic, etc.)
    // For demo, we'll simulate AI responses
    
    const templates = {
      'financial-report': {
        content: {
          template: "# {{reportTitle}}\n\n## Executive Summary\nThis report provides a comprehensive analysis of the financial performance for {{period}}.\n\n## Key Findings\n- Revenue has {{revenuetrend}} by {{revenueChange}}%\n- Expenses have {{expensesTrend}} by {{expensesChange}}%\n- Net profit margin is {{profitMargin}}%\n\n## Detailed Analysis\n{{#each metrics}}\n### {{name}}\n- Current: {{current}}\n- Previous: {{previous}}\n- Change: {{change}}%\n{{/each}}\n\n## Recommendations\n{{#each recommendations}}\n- {{text}}\n{{/each}}"
        },
        confidence: 88
      },
      'policy-document': {
        content: {
          template: "# {{policyTitle}}\n\n## Purpose\nThis policy establishes guidelines for {{purpose}}.\n\n## Scope\nThis policy applies to {{scope}}.\n\n## Procedures\n{{#each procedures}}\n### {{title}}\n{{description}}\n\n**Steps:**\n{{#each steps}}\n1. {{step}}\n{{/each}}\n{{/each}}\n\n## Compliance\n- All {{audience}} must comply with this policy\n- Regular reviews will be conducted {{reviewFrequency}}\n- Non-compliance may result in {{consequences}}"
        },
        confidence: 91
      },
      'dashboard-component': {
        content: {
          component: 'CustomDashboard',
          props: {
            title: '{{title}}',
            data: '{{dataSource}}',
            refreshInterval: 60000,
            widgets: [
              { type: 'metric', metric: '{{primaryMetric}}' },
              { type: 'chart', chartType: 'line', data: '{{chartData}}' },
              { type: 'table', data: '{{tableData}}' }
            ]
          }
        },
        confidence: 85
      }
    }

    const template = templates[type as keyof typeof templates] || templates['financial-report']
    
    return {
      content: template.content,
      confidence: template.confidence,
      model: 'gpt-4-turbo',
      metadata: {
        generated: new Date().toISOString(),
        prompt,
        type,
        context
      }
    }
  }

  static async enhanceContent(existingContent: string, enhancement: string) {
    // Simulate AI enhancement
    return {
      content: { 
        enhanced: existingContent + `\n\n## Enhanced Section\n${enhancement}`,
        original: existingContent 
      },
      confidence: 87,
      changes: [`Added enhanced section based on: ${enhancement}`]
    }
  }
}

// Content Management Service
class ContentService {
  static async getContent(tenantId?: string, filters?: Record<string, unknown>) {
    let content = mockContent

    // Filter by tenant if provided
    if (tenantId) {
      content = content.filter(item => 
        !item.metadata.tenantId || item.metadata.tenantId === tenantId
      )
    }

    // Apply additional filters
    if (filters) {
      if (filters.type) {
        content = content.filter(item => item.type === filters.type)
      }
      if (filters.category) {
        content = content.filter(item => item.metadata.category === filters.category)
      }
      if (filters.tags) {
        const filterTags = Array.isArray(filters.tags) ? filters.tags : [filters.tags]
        content = content.filter(item => 
          filterTags.some(tag => item.metadata.tags.includes(tag))
        )
      }
      if (filters.published !== undefined) {
        content = content.filter(item => item.metadata.published === filters.published)
      }
    }

    return content
  }

  static async createContent(data: Partial<ContentItem>, userId: string) {
    const newContent: ContentItem = {
      id: Date.now().toString(),
      type: data.type || 'page',
      title: data.title || 'Untitled',
      slug: data.slug || data.title?.toLowerCase().replace(/\s+/g, '-') || 'untitled',
      content: data.content || {},
      metadata: {
        author: userId,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        published: false,
        tags: data.metadata?.tags || [],
        category: data.metadata?.category || 'uncategorized',
        tenantId: data.metadata?.tenantId,
        version: 1
      },
      permissions: data.permissions || {
        read: ['tenant-admin'],
        write: ['tenant-admin'],
        publish: ['tenant-admin']
      },
      aiGenerated: data.aiGenerated
    }

    mockContent.push(newContent)
    return newContent
  }

  static async updateContent(id: string, updates: Partial<ContentItem>, userId: string) {
    const index = mockContent.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('Content not found')
    }

    const existing = mockContent[index]
    const updated = {
      ...existing,
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        modified: new Date().toISOString(),
        version: existing.metadata.version + 1
      }
    }

    mockContent[index] = updated
    return updated
  }

  static async deleteContent(id: string) {
    const index = mockContent.findIndex(item => item.id === id)
    if (index === -1) {
      throw new Error('Content not found')
    }

    mockContent.splice(index, 1)
    return true
  }
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable auth check when authentication is ready
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || undefined
    const type = searchParams.get('type') || undefined
    const category = searchParams.get('category') || undefined
    const tags = searchParams.get('tags') || undefined
    const published = searchParams.get('published') || undefined

    const filters = {
      type,
      category, 
      tags: tags ? tags.split(',') : undefined,
      published: published !== null ? published === 'true' : undefined
    }

    const content = await ContentService.getContent(tenantId, filters)

    return NextResponse.json({
      success: true,
      data: content,
      meta: {
        total: content.length,
        filters: filters
      }
    })
  } catch (error) {
    console.error('Content GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable auth check when authentication is ready
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const userId = 'system'; // Temporary fallback until auth is enabled

    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'generate':
        const aiResult = await AIContentService.generateContent(
          data.prompt,
          data.type,
          data.context
        )
        
        // Create the AI-generated content
        const aiContent = await ContentService.createContent(
          {
            type: 'ai-generated',
            title: data.title || 'AI Generated Content',
            content: aiResult.content,
            metadata: {
              ...data.metadata,
              category: data.category || 'ai-generated'
            },
            aiGenerated: {
              prompt: data.prompt,
              model: aiResult.model,
              confidence: aiResult.confidence,
              reviewed: false
            }
          },
          userId
        )

        return NextResponse.json({
          success: true,
          data: aiContent,
          meta: {
            aiGenerated: true,
            confidence: aiResult.confidence
          }
        })

      case 'enhance':
        if (!data.contentId || !data.enhancement) {
          return NextResponse.json(
            { error: 'Content ID and enhancement text required' },
            { status: 400 }
          )
        }

        const enhanceResult = await AIContentService.enhanceContent(
          data.existingContent,
          data.enhancement
        )

        const enhancedContent = await ContentService.updateContent(
          data.contentId,
          {
            content: enhanceResult.content,
            aiGenerated: {
              ...data.aiGenerated,
              confidence: enhanceResult.confidence,
              reviewed: false
            }
          },
          userId
        )

        return NextResponse.json({
          success: true,
          data: enhancedContent,
          meta: {
            enhanced: true,
            changes: enhanceResult.changes
          }
        })

      default:
        // Regular content creation
        const newContent = await ContentService.createContent(data, userId)
        return NextResponse.json({
          success: true,
          data: newContent
        })
    }
  } catch (error) {
    console.error('Content POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // TODO: Re-enable auth check when authentication is ready
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    const userId = 'system'; // Temporary fallback until auth is enabled

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID required' },
        { status: 400 }
      )
    }

    const updatedContent = await ContentService.updateContent(id, updates, userId)

    return NextResponse.json({
      success: true,
      data: updatedContent
    })
  } catch (error) {
    console.error('Content PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // TODO: Re-enable auth check when authentication is ready
    // const session = await getServerSession(authOptions)
    // if (!session?.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Content ID required' },
        { status: 400 }
      )
    }

    await ContentService.deleteContent(id)

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error) {
    console.error('Content DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
} 