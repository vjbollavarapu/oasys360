/**
 * Mobile Layout Component
 * Provides mobile-optimized layout and navigation
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Wallet, 
  FileText, 
  Settings, 
  User,
  Bell,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className = '' }: MobileLayoutProps) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  // Navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/accounting' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/reports' },
    { id: 'wallet', label: 'Web3 Wallet', icon: Wallet, path: '/web3' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/documents' },
    { id: 'ai', label: 'AI Processing', icon: BarChart3, path: '/ai-processing' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  // Check device type
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsMobile(true);
        setIsTablet(false);
        setDeviceType('mobile');
      } else if (width < 1024) {
        setIsMobile(false);
        setIsTablet(true);
        setDeviceType('tablet');
      } else {
        setIsMobile(false);
        setIsTablet(false);
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
    setMenuOpen(false);
  };

  // Get device icon
  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <span className="font-bold text-lg">OASYS</span>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <DeviceIcon className="w-3 h-3" />
              {deviceType}
            </Badge>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">3</Badge>
            </Button>
            
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 bg-background border-r">
            <div className="p-4 space-y-4">
              {/* User Info */}
              {session?.user && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{session.user.name}</div>
                        <div className="text-xs text-muted-foreground">{session.user.email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  
                  return (
                    <Button
                      key={item.id}
                      variant={isActive ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>

              {/* Quick Actions */}
              <div className="pt-4 border-t">
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-3 h-4 w-4" />
                    Quick Add
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-3 h-4 w-4" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className={cn(
          'space-y-6',
          isMobile && 'space-y-4',
          isTablet && 'space-y-5'
        )}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'flex flex-col items-center space-y-1 h-auto py-2',
                    isActive && 'text-primary'
                  )}
                  onClick={() => handleNavigation(item.path)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <Button
          size="lg"
          className="fixed bottom-20 right-4 z-40 rounded-full h-14 w-14 shadow-lg"
          onClick={() => {
            // Quick action - could be context-aware
            router.push('/accounting');
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

export default MobileLayout;
