"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './use-auth'
import { useToast } from './use-toast'

interface ContentItem {
  id: string
  type: 'page' | 'component' | 'template' | 'ai-generated'
  title: string
  slug: string
  content: any
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

interface ContentFilters {
  type?: string
  category?: string
  tags?: string[]
  published?: boolean
}

interface AIGenerationRequest {
  prompt: string
  type: string
  title?: string
  category?: string
  tags?: string[]
  context?: any
}

interface ContentEnhancementRequest {
  contentId: string
  enhancement: string
}

export function useContent() {
  const { user, tenant } = useAuth()
  const { toast } = useToast()
  
  const [content, setContent] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch content with optional filters
  const fetchContent = useCallback(async (filters?: ContentFilters) => {
    if (!user || !tenant) return

    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (tenant.id) params.append('tenantId', tenant.id)
      if (filters?.type) params.append('type', filters.type)
      if (filters?.category) params.append('category', filters.category)
      if (filters?.tags) params.append('tags', filters.tags.join(','))
      if (filters?.published !== undefined) params.append('published', filters.published.toString())

      const response = await fetch(`/api/content?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch content')
      }

      const data = await response.json()
      setContent(data.content || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Create new content
  const createContent = useCallback(async (data: Partial<ContentItem>) => {
    if (!user || !tenant) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          metadata: {
            ...data.metadata,
            tenantId: tenant.id
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create content')
      }

      const result = await response.json()
      
      if (result.success) {
        setContent(prev => [result.content, ...prev])
        toast({
          title: 'Success',
          description: 'Content created successfully'
        })
        return result.content
      } else {
        throw new Error(result.error || 'Failed to create content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Update existing content
  const updateContent = useCallback(async (id: string, updates: Partial<ContentItem>) => {
    if (!user || !tenant) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, ...updates })
      })

      if (!response.ok) {
        throw new Error('Failed to update content')
      }

      const result = await response.json()
      
      if (result.success) {
        setContent(prev => prev.map(item => 
          item.id === id ? result.content : item
        ))
        toast({
          title: 'Success',
          description: 'Content updated successfully'
        })
        return result.content
      } else {
        throw new Error(result.error || 'Failed to update content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Delete content
  const deleteContent = useCallback(async (id: string) => {
    if (!user || !tenant) return false

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/content?id=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      const result = await response.json()
      
      if (result.success) {
        setContent(prev => prev.filter(item => item.id !== id))
        toast({
          title: 'Success',
          description: 'Content deleted successfully'
        })
        return true
      } else {
        throw new Error(result.error || 'Failed to delete content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Generate content using AI
  const generateContent = useCallback(async (request: AIGenerationRequest) => {
    if (!user || !tenant) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'generate',
          ...request,
          tenantId: tenant.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const result = await response.json()
      
      if (result.success) {
        setContent(prev => [result.content, ...prev])
        toast({
          title: 'AI Content Generated',
          description: `Content generated with ${result.generation.confidence}% confidence`
        })
        return result.content
      } else {
        throw new Error(result.error || 'Failed to generate content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Enhance existing content with AI
  const enhanceContent = useCallback(async (request: ContentEnhancementRequest) => {
    if (!user || !tenant) return null

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'enhance',
          ...request
        })
      })

      if (!response.ok) {
        throw new Error('Failed to enhance content')
      }

      const result = await response.json()
      
      if (result.success) {
        setContent(prev => prev.map(item => 
          item.id === request.contentId ? result.content : item
        ))
        toast({
          title: 'Content Enhanced',
          description: `Content enhanced with AI suggestions`
        })
        return result.content
      } else {
        throw new Error(result.error || 'Failed to enhance content')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enhance content'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user, tenant, toast])

  // Publish/unpublish content
  const togglePublished = useCallback(async (id: string) => {
    const contentItem = content.find(item => item.id === id)
    if (!contentItem) return null

    return await updateContent(id, {
      metadata: {
        ...contentItem.metadata,
        published: !contentItem.metadata.published
      }
    })
  }, [content, updateContent])

  // Get content by slug
  const getContentBySlug = useCallback((slug: string) => {
    return content.find(item => item.slug === slug)
  }, [content])

  // Get content by category
  const getContentByCategory = useCallback((category: string) => {
    return content.filter(item => item.metadata.category === category)
  }, [content])

  // Get AI-generated content
  const getAIGeneratedContent = useCallback(() => {
    return content.filter(item => item.type === 'ai-generated')
  }, [content])

  // Get content that needs review
  const getContentNeedingReview = useCallback(() => {
    return content.filter(item => 
      item.aiGenerated && !item.aiGenerated.reviewed
    )
  }, [content])

  // Check if user can perform action on content
  const canPerformAction = useCallback((contentItem: ContentItem, action: 'read' | 'write' | 'publish') => {
    if (!user) return false

    const permissions = contentItem.permissions[action]
    
    // Check if user has specific permission
    if (permissions.includes(user.email || '')) return true
    
    // Check role-based permissions
    if (permissions.includes('*')) return true
    if (permissions.includes('tenant-admin') && user.role === 'admin') return true
    if (permissions.includes('cfo') && user.role === 'cfo') return true
    if (permissions.includes('accountant') && user.role === 'staff') return true
    
    return false
  }, [user])

  // Load content on component mount
  useEffect(() => {
    if (user && tenant) {
      fetchContent()
    }
  }, [user, tenant, fetchContent])

  return {
    // State
    content,
    isLoading,
    error,
    
    // Actions
    fetchContent,
    createContent,
    updateContent,
    deleteContent,
    generateContent,
    enhanceContent,
    togglePublished,
    
    // Getters
    getContentBySlug,
    getContentByCategory,
    getAIGeneratedContent,
    getContentNeedingReview,
    
    // Utilities
    canPerformAction,
    
    // Computed values
    publishedContent: content.filter(item => item.metadata.published),
    draftContent: content.filter(item => !item.metadata.published),
    aiGeneratedCount: content.filter(item => item.type === 'ai-generated').length,
    needsReviewCount: content.filter(item => 
      item.aiGenerated && !item.aiGenerated.reviewed
    ).length
  }
}

export default useContent 