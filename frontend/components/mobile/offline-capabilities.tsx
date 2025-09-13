/**
 * Offline Capabilities Component
 * PWA features, service workers, and offline data storage
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Upload,
  Database,
  HardDrive,
  Cloud,
  CloudOff,
  Sync,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  Archive,
  Trash2,
  Settings,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Save,
  FileText,
  Image,
  Video,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Offline Status Component
interface OfflineStatusProps {
  className?: string;
}

export function OfflineStatus({ className = '' }: OfflineStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate pending changes
    const interval = setInterval(() => {
      setPendingChanges(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
          Connection Status
        </CardTitle>
        <CardDescription>
          Current network and sync status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
        
        {lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Last Sync</span>
            <span className="text-sm text-muted-foreground">
              {formatLastSync(lastSync)}
            </span>
          </div>
        )}
        
        {pendingChanges > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pending Changes</span>
            <Badge variant="secondary">{pendingChanges}</Badge>
          </div>
        )}
        
        {!isOnline && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're currently offline. Changes will be synced when connection is restored.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// Offline Storage Component
interface OfflineStorageProps {
  className?: string;
}

export function OfflineStorage({ className = '' }: OfflineStorageProps) {
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    total: 0,
    available: 0,
    percentage: 0
  });
  
  const [cachedData, setCachedData] = useState([
    { id: 1, name: 'User Profile', size: '2.5 MB', type: 'profile', lastUpdated: '2 hours ago' },
    { id: 2, name: 'Transaction History', size: '15.2 MB', type: 'transactions', lastUpdated: '1 hour ago' },
    { id: 3, name: 'Documents', size: '8.7 MB', type: 'documents', lastUpdated: '30 min ago' },
    { id: 4, name: 'Settings', size: '0.5 MB', type: 'settings', lastUpdated: '1 day ago' },
  ]);

  useEffect(() => {
    // Simulate storage usage
    const updateStorageInfo = () => {
      const used = Math.random() * 100; // MB
      const total = 100; // MB
      const available = total - used;
      const percentage = (used / total) * 100;
      
      setStorageInfo({ used, total, available, percentage });
    };

    updateStorageInfo();
    const interval = setInterval(updateStorageInfo, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'profile': return <Database className="w-4 h-4" />;
      case 'transactions': return <FileText className="w-4 h-4" />;
      case 'documents': return <Archive className="w-4 h-4" />;
      case 'settings': return <Settings className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const clearCache = (id: number) => {
    setCachedData(prev => prev.filter(item => item.id !== id));
  };

  const clearAllCache = () => {
    setCachedData([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Offline Storage
        </CardTitle>
        <CardDescription>
          Manage cached data and storage usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Storage Usage</span>
            <span className="text-sm text-muted-foreground">
              {storageInfo.used.toFixed(1)} MB / {storageInfo.total} MB
            </span>
          </div>
          <Progress value={storageInfo.percentage} className="w-full" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{storageInfo.available.toFixed(1)} MB available</span>
            <span>{storageInfo.percentage.toFixed(1)}% used</span>
          </div>
        </div>

        {/* Cached Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Cached Data</h4>
            <Button variant="ghost" size="sm" onClick={clearAllCache}>
              Clear All
            </Button>
          </div>
          
          {cachedData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                {getTypeIcon(item.type)}
                <div>
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.size} • {item.lastUpdated}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCache(item.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sync Manager Component
interface SyncManagerProps {
  className?: string;
}

export function SyncManager({ className = '' }: SyncManagerProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncHistory, setSyncHistory] = useState([
    { id: 1, time: new Date(Date.now() - 3600000), status: 'success', items: 15 },
    { id: 2, time: new Date(Date.now() - 7200000), status: 'success', items: 8 },
    { id: 3, time: new Date(Date.now() - 10800000), status: 'error', items: 0 },
  ]);

  const startSync = async () => {
    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncProgress(0);

    try {
      // Simulate sync process
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSyncProgress(i);
      }

      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      // Add to sync history
      setSyncHistory(prev => [{
        id: Date.now(),
        time: new Date(),
        status: 'success',
        items: Math.floor(Math.random() * 20) + 5
      }, ...prev.slice(0, 4)]);
      
    } catch (error) {
      setSyncStatus('error');
      setSyncHistory(prev => [{
        id: Date.now(),
        time: new Date(),
        status: 'error',
        items: 0
      }, ...prev.slice(0, 4)]);
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatSyncTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sync className="w-5 h-5" />
          Sync Manager
        </CardTitle>
        <CardDescription>
          Manage data synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sync Controls */}
        <div className="space-y-3">
          <Button
            onClick={startSync}
            disabled={isSyncing}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing... {syncProgress}%
              </>
            ) : (
              <>
                <Sync className="w-4 h-4 mr-2" />
                Start Sync
              </>
            )}
          </Button>
          
          {isSyncing && (
            <Progress value={syncProgress} className="w-full" />
          )}
          
          {lastSyncTime && (
            <div className="text-sm text-muted-foreground text-center">
              Last sync: {formatSyncTime(lastSyncTime)}
            </div>
          )}
        </div>

        {/* Sync History */}
        <div className="space-y-2">
          <h4 className="font-medium">Sync History</h4>
          {syncHistory.map((sync) => (
            <div key={sync.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                {getStatusIcon(sync.status)}
                <div>
                  <div className="text-sm font-medium">
                    {sync.status === 'success' ? 'Sync completed' : 'Sync failed'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {sync.items} items • {formatSyncTime(sync.time)}
                  </div>
                </div>
              </div>
              <Badge variant={sync.status === 'success' ? 'default' : 'destructive'}>
                {sync.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// PWA Install Component
interface PWAInstallProps {
  className?: string;
}

export function PWAInstall({ className = '' }: PWAInstallProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  if (isInstalled) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">App Installed</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            OASYS is installed and ready to use offline.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Install App
        </CardTitle>
        <CardDescription>
          Install OASYS for offline access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm">Secure offline access</span>
          </div>
          <div className="flex items-center space-x-2">
            <CloudOff className="w-4 h-4 text-blue-500" />
            <span className="text-sm">Works without internet</span>
          </div>
          <div className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Local data storage</span>
          </div>
        </div>
        
        <Button onClick={handleInstall} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Install OASYS
        </Button>
      </CardContent>
    </Card>
  );
}

// Offline Data Manager
interface OfflineDataManagerProps {
  className?: string;
}

export function OfflineDataManager({ className = '' }: OfflineDataManagerProps) {
  const [offlineData, setOfflineData] = useState([
    { id: 1, name: 'Draft Invoice #001', type: 'invoice', size: '2.1 KB', created: '1 hour ago', status: 'draft' },
    { id: 2, name: 'Expense Report', type: 'expense', size: '1.5 KB', created: '2 hours ago', status: 'pending' },
    { id: 3, name: 'Transaction Log', type: 'transaction', size: '5.2 KB', created: '3 hours ago', status: 'synced' },
  ]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const toggleSelection = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setOfflineData(prev => prev.filter(item => !selectedItems.includes(item.id)));
    setSelectedItems([]);
  };

  const syncSelected = () => {
    // Simulate sync
    setOfflineData(prev => 
      prev.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: 'synced' }
          : item
      )
    );
    setSelectedItems([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <FileText className="w-4 h-4" />;
      case 'expense': return <Archive className="w-4 h-4" />;
      case 'transaction': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'synced': return <Badge variant="default">Synced</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Offline Data Manager
        </CardTitle>
        <CardDescription>
          Manage offline data and sync status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        {selectedItems.length > 0 && (
          <div className="flex space-x-2">
            <Button onClick={syncSelected} size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Sync ({selectedItems.length})
            </Button>
            <Button onClick={deleteSelected} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete ({selectedItems.length})
            </Button>
          </div>
        )}

        {/* Data List */}
        <div className="space-y-2">
          {offlineData.map((item) => (
            <div
              key={item.id}
              className={cn(
                'flex items-center justify-between p-3 border rounded cursor-pointer transition-colors',
                selectedItems.includes(item.id) && 'bg-primary/5 border-primary/20'
              )}
              onClick={() => toggleSelection(item.id)}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="rounded"
                />
                {getTypeIcon(item.type)}
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.size} • {item.created}
                  </div>
                </div>
              </div>
              {getStatusBadge(item.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export {
  OfflineStatus,
  OfflineStorage,
  SyncManager,
  PWAInstall,
  OfflineDataManager
};
