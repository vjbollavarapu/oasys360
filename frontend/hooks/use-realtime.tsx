"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "./use-auth"

interface RealtimeUser {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: Date
  isTyping?: boolean
  currentPage?: string
}

interface RealtimeEvent {
  id: string
  type: 'user_join' | 'user_leave' | 'data_change' | 'cursor_move' | 'typing' | 'collaboration' | 'ping'
  userId: string
  tenantId: string
  timestamp: Date
  data: Record<string, unknown>
  resourceId?: string
  resourceType?: string
}

interface CollaborationState {
  activeUsers: RealtimeUser[]
  events: RealtimeEvent[]
  isConnected: boolean
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
}

interface UseRealtimeOptions {
  resourceId?: string
  resourceType?: string
  enablePresence?: boolean
  enableCollaboration?: boolean
  autoReconnect?: boolean
}

interface MockWebSocket {
  send: (data: string) => void
  close: (code?: number, reason?: string) => void
  readyState: number
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const { user, tenant } = useAuth()
  const [state, setState] = useState<CollaborationState>({
    activeUsers: [],
    events: [],
    isConnected: false,
    connectionStatus: 'disconnected'
  })
  
  const wsRef = useRef<MockWebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const {
    resourceId,
    resourceType,
    enablePresence = true,
    enableCollaboration = true,
    autoReconnect = true
  } = options

  // Send real-time event
  const sendEvent = useCallback((type: RealtimeEvent['type'], data: Record<string, unknown>) => {
    if (!wsRef.current || !user || !tenant?.id) return

    const event: RealtimeEvent = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      userId: user.id,
      tenantId: tenant.id,
      timestamp: new Date(),
      data,
      resourceId,
      resourceType
    }

    // In real implementation, send via WebSocket
    wsRef.current.send(JSON.stringify(event))

    // For demo, add to local events
    setState(prev => ({
      ...prev,
      events: [...prev.events.slice(-100), event] // Keep last 100 events
    }))
  }, [user, tenant?.id, resourceId, resourceType])

  // Generate user color for collaboration
  const getUserColor = useCallback((userId: string) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ]
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }, [])

  // Connect to real-time service
  const connect = useCallback(() => {
    if (!user || !tenant?.id) return

    setState(prev => ({ ...prev, connectionStatus: 'reconnecting' }))

    try {
      // For demo, we'll simulate WebSocket behavior with proper interface
      const mockWebSocket: MockWebSocket = {
        send: (data: string) => {
          console.log('Real-time send:', data)
        },
        close: (code?: number, reason?: string) => {
          console.log('Real-time connection closed:', code, reason)
        },
        readyState: 1, // WebSocket.OPEN equivalent
      }
      
      wsRef.current = mockWebSocket

      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected'
      }))

      // Simulate user joining
      if (enablePresence) {
        const joinEvent: RealtimeEvent = {
          id: `${Date.now()}-join`,
          type: 'user_join',
          userId: user.id,
          tenantId: tenant.id,
          timestamp: new Date(),
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              color: getUserColor(user.id),
              lastSeen: new Date(),
              currentPage: typeof window !== 'undefined' ? window.location.pathname : '/'
            }
          },
          resourceId,
          resourceType
        }

        setState(prev => ({
          ...prev,
          events: [...prev.events, joinEvent],
          activeUsers: [
            ...prev.activeUsers.filter(u => u.id !== user.id),
            joinEvent.data.user as RealtimeUser
          ]
        }))
      }

      // Set up heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (wsRef.current?.readyState === 1) { // WebSocket.OPEN equivalent
          sendEvent('ping', {})
        }
      }, 30000)

    } catch (error) {
      console.error('Real-time connection failed:', error)
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }))
      
      if (autoReconnect) {
        reconnectTimeoutRef.current = setTimeout(() => connect(), 5000)
      }
    }
  }, [user, tenant?.id, resourceId, resourceType, enablePresence, getUserColor, autoReconnect, sendEvent])

  // Disconnect real-time service
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }

    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current)
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      activeUsers: prev.activeUsers.filter(u => u.id !== user?.id)
    }))
  }, [user?.id])

  // Update cursor position
  const updateCursor = useCallback((x: number, y: number) => {
    if (!enableCollaboration) return
    sendEvent('cursor_move', { cursor: { x, y } })
  }, [enableCollaboration, sendEvent])

  // Update typing status
  const updateTyping = useCallback((isTyping: boolean, field?: string) => {
    if (!enableCollaboration) return
    sendEvent('typing', { isTyping, field })
  }, [enableCollaboration, sendEvent])

  // Broadcast data change
  const broadcastDataChange = useCallback((resourceType: string, resourceId: string, changeType: string, data: Record<string, unknown>) => {
    if (!enableCollaboration) return
    sendEvent('data_change', {
      resourceType,
      resourceId,
      changeType,
      data
    })
  }, [enableCollaboration, sendEvent])

  // Get online users for current resource
  const getOnlineUsers = useCallback(() => {
    return state.activeUsers.filter(user => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return user.lastSeen > fiveMinutesAgo
    })
  }, [state.activeUsers])

  // Page visibility handling
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        disconnect()
      } else if (enablePresence) {
        connect()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [connect, disconnect, enablePresence])

  // Auto-connect on mount
  useEffect(() => {
    if (user && tenant?.id && enablePresence) {
      connect()
    }
    return () => disconnect()
  }, [user, tenant?.id, enablePresence, connect, disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendEvent,
    updateCursor,
    updateTyping,
    broadcastDataChange,
    onlineUsers: getOnlineUsers(),
    isOnline: state.isConnected && state.connectionStatus === 'connected'
  }
}

// Hook for collaborative document editing
export function useCollaborativeEditing(documentId: string) {
  const realtime = useRealtime({
    resourceId: documentId,
    resourceType: 'document',
    enableCollaboration: true
  })

  const [documentState, setDocumentState] = useState({
    content: '',
    isLocked: false,
    lockedBy: null as string | null,
    version: 0
  })

  const updateContent = useCallback((content: string) => {
    setDocumentState(prev => ({
      ...prev,
      content,
      version: prev.version + 1
    }))
    
    realtime.broadcastDataChange('document', documentId, 'content_update', {
      content,
      version: documentState.version + 1
    })
  }, [realtime, documentId, documentState.version])

  const lockDocument = useCallback(() => {
    const currentUser = realtime.activeUsers[0]?.id
    setDocumentState(prev => ({ ...prev, isLocked: true, lockedBy: currentUser }))
    realtime.broadcastDataChange('document', documentId, 'lock', { locked: true })
  }, [realtime, documentId])

  const unlockDocument = useCallback(() => {
    setDocumentState(prev => ({ ...prev, isLocked: false, lockedBy: null }))
    realtime.broadcastDataChange('document', documentId, 'unlock', { locked: false })
  }, [realtime, documentId])

  return {
    ...realtime,
    documentState,
    updateContent,
    lockDocument,
    unlockDocument
  }
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const realtime = useRealtime({
    enablePresence: true,
    enableCollaboration: false
  })

  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>>([])

  const addNotification = useCallback((notification: Omit<typeof notifications[0], 'id' | 'timestamp' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 99)])
    realtime.sendEvent('collaboration', { type: 'notification', notification: newNotification })
  }, [realtime])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    ...realtime,
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length
  }
}

export default useRealtime 