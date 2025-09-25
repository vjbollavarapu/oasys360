"use client"

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Users, 
  Circle, 
  Wifi, 
  WifiOff, 
  Eye, 
  Edit, 
  MessageCircle,
  Clock
} from 'lucide-react'

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
  isOnline?: boolean
}

interface RealtimePresenceProps {
  users: RealtimeUser[]
  currentUserId?: string
  isConnected: boolean
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting'
  showAvatars?: boolean
  showStatus?: boolean
  maxVisible?: number
  compact?: boolean
}

export function RealtimePresence({ 
  users, 
  currentUserId, 
  isConnected, 
  connectionStatus,
  showAvatars = true,
  showStatus = true,
  maxVisible = 5,
  compact = false
}: RealtimePresenceProps) {
  const [expandedView, setExpandedView] = useState(false)
  
  // Filter out current user and sort by activity
  const otherUsers = users
    .filter(user => user.id !== currentUserId)
    .sort((a, b) => {
      // Online users first, then by last seen
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1
      }
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    })

  const visibleUsers = expandedView ? otherUsers : otherUsers.slice(0, maxVisible)
  const hiddenCount = Math.max(0, otherUsers.length - maxVisible)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'now'
    if (diffMins < 60) return `${diffMins}m ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const getStatusIcon = (user: RealtimeUser) => {
    if (user.isTyping) {
      return <Edit className="w-3 h-3 text-blue-500 animate-pulse" />
    }
    if (user.isOnline) {
      return <Circle className="w-3 h-3 text-green-500 fill-current" />
    }
    return <Circle className="w-3 h-3 text-gray-400" />
  }

  const ConnectionIndicator = () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            {!compact && (
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus === 'connected' && 'Live'}
                {connectionStatus === 'disconnected' && 'Offline'}
                {connectionStatus === 'reconnecting' && 'Connecting...'}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connection: {connectionStatus}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {showStatus && <ConnectionIndicator />}
        
        <div className="flex items-center -space-x-2">
          {visibleUsers.map((user) => (
            <TooltipProvider key={user.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Avatar className="w-6 h-6 border-2 border-white">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback 
                        className="text-xs font-medium"
                        style={{ backgroundColor: user.color + '20', color: user.color }}
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIcon(user)}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.isOnline ? 'Online' : `Last seen ${getTimeAgo(user.lastSeen)}`}
                    </p>
                    {user.currentPage && (
                      <p className="text-xs text-muted-foreground">
                        Viewing: {user.currentPage}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {hiddenCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      +{hiddenCount}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hiddenCount} more user{hiddenCount > 1 ? 's' : ''} online</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {otherUsers.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {otherUsers.length} online
          </span>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Users ({otherUsers.length})
          </CardTitle>
          {showStatus && <ConnectionIndicator />}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {otherUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No other users online</p>
          </div>
        ) : (
          <>
            {visibleUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                {showAvatars && (
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback 
                        className="text-sm font-medium"
                        style={{ backgroundColor: user.color + '20', color: user.color }}
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      {getStatusIcon(user)}
                    </div>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    {user.isTyping && (
                      <Badge variant="secondary" className="text-xs">
                        typing...
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {user.isOnline ? 'Online' : getTimeAgo(user.lastSeen)}
                    </span>
                    
                    {user.currentPage && (
                      <span className="flex items-center gap-1 truncate">
                        <Eye className="w-3 h-3" />
                        {user.currentPage}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {hiddenCount > 0 && !expandedView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedView(true)}
                className="w-full text-sm text-muted-foreground"
              >
                Show {hiddenCount} more user{hiddenCount > 1 ? 's' : ''}
              </Button>
            )}
            
            {expandedView && hiddenCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedView(false)}
                className="w-full text-sm text-muted-foreground"
              >
                Show less
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Floating presence indicator for minimal UI
export function FloatingPresence({ users, currentUserId, isConnected }: {
  users: RealtimeUser[]
  currentUserId?: string
  isConnected: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const otherUsers = users.filter(user => user.id !== currentUserId)
  const onlineUsers = otherUsers.filter(user => user.isOnline)

  if (otherUsers.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full shadow-lg bg-white border-gray-200 hover:bg-gray-50"
        >
          <Users className="w-4 h-4 mr-2" />
          {onlineUsers.length}
          {isConnected && (
            <Circle className="w-2 h-2 ml-2 text-green-500 fill-current" />
          )}
        </Button>

        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-2 w-64">
            <RealtimePresence
              users={users}
              currentUserId={currentUserId}
              isConnected={isConnected}
              connectionStatus={isConnected ? 'connected' : 'disconnected'}
              maxVisible={3}
            />
          </div>
        )}
      </div>
    </div>
  )
} 