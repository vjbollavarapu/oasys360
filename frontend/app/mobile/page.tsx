/**
 * Mobile Dashboard Page
 * Comprehensive mobile-optimized dashboard
 */

"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  BarChart3, 
  Settings, 
  Bell,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Fingerprint,
  Camera,
  Download,
  Upload,
  Sync,
  Database,
  HardDrive,
  Cloud,
  CloudOff,
  Shield,
  Eye,
  EyeOff,
  Plus,
  Minus,
  RefreshCw,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Archive,
  Users,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PermissionGate } from '@/components/rbac/permission-gate';
import MobileLayout from '@/components/mobile/mobile-layout';
import { 
  MobileCard, 
  MobileQuickActions, 
  MobileSearchBar, 
  MobilePullToRefresh,
  TouchGesture 
} from '@/components/mobile/mobile-components';
import { 
  BiometricAuth, 
  CameraIntegration, 
  MobileNotifications, 
  DeviceStatus, 
  MobileShare 
} from '@/components/mobile/mobile-features';
import { 
  OfflineStatus, 
  OfflineStorage, 
  SyncManager, 
  PWAInstall, 
  OfflineDataManager 
} from '@/components/mobile/offline-capabilities';

export default function MobilePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Mock data for mobile dashboard
  const mobileMetrics = {
    totalTransactions: 1247,
    pendingApprovals: 23,
    recentActivity: 8,
    offlineData: 15,
  };

  const quickActions = [
    {
      id: 'add-transaction',
      label: 'Add Transaction',
      icon: <Plus className="w-6 h-6" />,
      onPress: () => console.log('Add transaction'),
      color: 'bg-green-500/10 text-green-600'
    },
    {
      id: 'scan-receipt',
      label: 'Scan Receipt',
      icon: <Camera className="w-6 h-6" />,
      onPress: () => console.log('Scan receipt'),
      color: 'bg-blue-500/10 text-blue-600'
    },
    {
      id: 'view-reports',
      label: 'View Reports',
      icon: <BarChart3 className="w-6 h-6" />,
      onPress: () => console.log('View reports'),
      color: 'bg-purple-500/10 text-purple-600'
    },
    {
      id: 'sync-data',
      label: 'Sync Data',
      icon: <Sync className="w-6 h-6" />,
      onPress: () => console.log('Sync data'),
      color: 'bg-orange-500/10 text-orange-600'
    }
  ];

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Data refreshed');
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  return (
    <ProtectedRoute>
      <MobileLayout>
        <div className="space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Mobile Dashboard</h1>
              <p className="text-muted-foreground">
                Optimized for mobile devices
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              Mobile
            </Badge>
          </div>

          {/* Connection Status */}
          <TouchGesture onSwipeDown={() => handleRefresh()}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <Wifi className="w-5 h-5 text-green-500" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-sm font-medium">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Battery className="w-4 h-4" />
                      <span>85%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Signal className="w-4 h-4" />
                      <span>4/4</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TouchGesture>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Home</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="offline">Offline</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileQuickActions actions={quickActions} />
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <MobileCard
                  title="Transactions"
                  value={mobileMetrics.totalTransactions.toLocaleString()}
                  trend="up"
                  trendValue="12%"
                  icon={<Activity className="w-4 h-4 text-blue-500" />}
                />
                <MobileCard
                  title="Pending"
                  value={mobileMetrics.pendingApprovals}
                  trend="down"
                  trendValue="5%"
                  icon={<Clock className="w-4 h-4 text-orange-500" />}
                />
                <MobileCard
                  title="Recent Activity"
                  value={mobileMetrics.recentActivity}
                  trend="neutral"
                  icon={<BarChart3 className="w-4 h-4 text-green-500" />}
                />
                <MobileCard
                  title="Offline Data"
                  value={mobileMetrics.offlineData}
                  trend="up"
                  trendValue="3"
                  icon={<Database className="w-4 h-4 text-purple-500" />}
                />
              </div>

              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <MobileSearchBar 
                    placeholder="Search transactions, invoices, contacts..."
                    onSearch={handleSearch}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              {/* Biometric Authentication */}
              <PermissionGate permission="USE_BIOMETRIC_AUTH">
                <BiometricAuth />
              </PermissionGate>

              {/* Camera Integration */}
              <PermissionGate permission="USE_CAMERA">
                <CameraIntegration />
              </PermissionGate>

              {/* Mobile Notifications */}
              <MobileNotifications />

              {/* Device Status */}
              <DeviceStatus />

              {/* Share */}
              <Card>
                <CardHeader>
                  <CardTitle>Share</CardTitle>
                  <CardDescription>
                    Share OASYS with others
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MobileShare />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="offline" className="space-y-6">
              {/* Offline Status */}
              <OfflineStatus />

              {/* PWA Install */}
              <PWAInstall />

              {/* Offline Storage */}
              <OfflineStorage />

              {/* Sync Manager */}
              <SyncManager />

              {/* Offline Data Manager */}
              <OfflineDataManager />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Mobile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Mobile Settings
                  </CardTitle>
                  <CardDescription>
                    Configure mobile-specific options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Dark Mode</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Toggle
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm font-medium">Notifications</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Security</span>
                    </div>
                    <Button variant="outline" size="sm">
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* App Info */}
              <Card>
                <CardHeader>
                  <CardTitle>App Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Build</span>
                    <span className="text-sm font-medium">2024.01.15</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <span className="text-sm font-medium">Mobile Web</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Offline Support</span>
                    <Badge variant="default">Enabled</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MobileLayout>
    </ProtectedRoute>
  );
}