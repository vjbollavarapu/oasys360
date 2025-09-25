/**
 * Mobile-Specific Components
 * Touch-optimized components for mobile devices
 */

"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  SwipeLeft, 
  SwipeRight, 
  SwipeUp, 
  ArrowDown,
  MousePointer,
  Hand,
  Fingerprint,
  Smartphone,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalZero,
  Sun,
  Moon,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Touch Gesture Component
interface TouchGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  longPressDelay?: number;
}

export function TouchGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onLongPress,
  children,
  className = '',
  threshold = 50,
  longPressDelay = 500
}: TouchGestureProps) {
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setEndPos({ x: touch.clientX, y: touch.clientY });
    setIsLongPress(false);

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      onLongPress?.();
    }, longPressDelay);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setEndPos({ x: touch.clientX, y: touch.clientY });

    // Cancel long press if user moves
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isLongPress) return;

    const deltaX = endPos.x - startPos.x;
    const deltaY = endPos.y - startPos.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    // Check for tap (small movement)
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      onTap?.();
    }
  };

  return (
    <div
      className={cn('touch-manipulation', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

// Mobile Card Component
interface MobileCardProps {
  title: string;
  description?: string;
  value?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  onTap?: () => void;
  className?: string;
}

export function MobileCard({
  title,
  description,
  value,
  trend,
  trendValue,
  icon,
  onTap,
  className = ''
}: MobileCardProps) {
  return (
    <TouchGesture onTap={onTap}>
      <Card className={cn('cursor-pointer transition-all duration-200 hover:shadow-md active:scale-95', className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {icon}
                <h3 className="font-medium text-sm">{title}</h3>
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mb-2">{description}</p>
              )}
              {value && (
                <div className="text-lg font-bold">{value}</div>
              )}
            </div>
            {trend && trendValue && (
              <div className="text-right">
                <Badge 
                  variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{trendValue}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TouchGesture>
  );
}

// Mobile Swipeable List Item
interface SwipeableListItemProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
}

export function SwipeableListItem({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = ''
}: SwipeableListItemProps) {
  const [translateX, setTranslateX] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    // Limit swipe distance
    const maxSwipe = 120;
    setTranslateX(Math.max(-maxSwipe, Math.min(maxSwipe, deltaX)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Determine if swipe threshold is met
    if (Math.abs(translateX) > 60) {
      if (translateX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    }
    
    // Reset position
    setTranslateX(0);
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {leftAction && (
          <div className="flex-1 bg-red-500 flex items-center justify-end pr-4">
            {leftAction}
          </div>
        )}
        {rightAction && (
          <div className="flex-1 bg-green-500 flex items-center justify-start pl-4">
            {rightAction}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div
        className="relative bg-background transition-transform duration-200"
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Mobile Status Bar Component
interface MobileStatusBarProps {
  isOnline: boolean;
  batteryLevel?: number;
  signalStrength?: number;
  isDarkMode?: boolean;
  className?: string;
}

export function MobileStatusBar({
  isOnline,
  batteryLevel = 100,
  signalStrength = 4,
  isDarkMode = false,
  className = ''
}: MobileStatusBarProps) {
  const getBatteryIcon = () => {
    if (batteryLevel < 20) return <BatteryLow className="w-4 h-4 text-red-500" />;
    return <Battery className="w-4 h-4" />;
  };

  const getSignalIcon = () => {
    if (signalStrength === 0) return <SignalZero className="w-4 h-4 text-red-500" />;
    return <Signal className="w-4 h-4" />;
  };

  return (
    <div className={cn('flex items-center justify-between px-4 py-2 text-xs', className)}>
      <div className="flex items-center space-x-2">
        <span className="font-medium">OASYS</span>
        {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
      </div>
      
      <div className="flex items-center space-x-2">
        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 text-red-500" />}
        {getSignalIcon()}
        {getBatteryIcon()}
        <span>{batteryLevel}%</span>
      </div>
    </div>
  );
}

// Mobile Quick Actions
interface MobileQuickActionsProps {
  actions: {
    id: string;
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
    color?: string;
  }[];
  className?: string;
}

export function MobileQuickActions({ actions, className = '' }: MobileQuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-3', className)}>
      {actions.map((action) => (
        <TouchGesture key={action.id} onTap={action.onPress}>
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
          >
            <div className={cn('p-2 rounded-full', action.color || 'bg-primary/10')}>
              {action.icon}
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        </TouchGesture>
      ))}
    </div>
  );
}

// Mobile Search Bar
interface MobileSearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function MobileSearchBar({ 
  placeholder = "Search...", 
  onSearch,
  className = '' 
}: MobileSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-3 text-base"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Touch className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </form>
  );
}

// Mobile Pull to Refresh
interface MobilePullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function MobilePullToRefresh({ 
  onRefresh, 
  children, 
  className = '' 
}: MobilePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        setIsPulling(true);
        setPullDistance(Math.min(deltaY * 0.5, 100));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    
    setPullDistance(0);
    setIsPulling(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 transition-all duration-200"
          style={{ height: `${pullDistance}px`, transform: `translateY(-${100 - pullDistance}px)` }}
        >
          <div className="flex items-center space-x-2 text-primary">
            {isRefreshing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </>
            ) : (
              <>
                <SwipeDown className="w-4 h-4" />
                <span className="text-sm">Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}
      
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Components are already exported individually above
