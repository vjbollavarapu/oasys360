/**
 * Mobile-Specific Features Component
 * Biometric authentication, camera integration, and mobile notifications
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Fingerprint, 
  Camera, 
  Bell, 
  BellOff,
  Volume2,
  VolumeX,
  Vibrate,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Signal,
  SignalZero,
  Location,
  LocationOff,
  Bluetooth,
  BluetoothOff,
  Smartphone,
  Shield,
  Eye,
  EyeOff,
  Mic,
  MicOff,
  Flashlight,
  FlashlightOff,
  QrCode,
  Scan,
  Download,
  Upload,
  Share,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Biometric Authentication Component
interface BiometricAuthProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function BiometricAuth({ onSuccess, onError, className = '' }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'voice' | null>(null);

  useEffect(() => {
    // Check for biometric support
    if ('navigator' in window && 'credentials' in navigator) {
      // Check for WebAuthn support
      setIsSupported(true);
      
      // Detect biometric type (simplified)
      if ('TouchID' in window || 'FaceID' in window) {
        setBiometricType('fingerprint');
      }
    }
  }, []);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    
    try {
      // Simulate biometric authentication
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would use WebAuthn API
      onSuccess?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Biometric authentication is not supported on this device.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="w-5 h-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          Secure login using your biometric data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={handleBiometricAuth}
          disabled={isAuthenticating}
          className="w-full"
        >
          {isAuthenticating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Authenticating...
            </>
          ) : (
            <>
              <Fingerprint className="w-4 h-4 mr-2" />
              Authenticate with {biometricType || 'Biometric'}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Camera Integration Component
interface CameraIntegrationProps {
  onCapture?: (imageData: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function CameraIntegration({ onCapture, onError, className = '' }: CameraIntegrationProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check for camera support
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsSupported(true);
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setHasPermission(true);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Camera access denied');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        onCapture?.(imageData);
      }
    }
  };

  const scanQRCode = async () => {
    // In a real implementation, you would use a QR code scanning library
    // For now, we'll simulate it
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onCapture?.('qr_code_data_simulated');
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'QR code scan failed');
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Camera Integration
        </CardTitle>
        <CardDescription>
          Capture photos and scan QR codes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isSupported ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Camera is not supported on this device.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Camera Preview */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={cn(
                  'w-full h-48 object-cover',
                  !isStreaming && 'hidden'
                )}
              />
              {!isStreaming && (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  <Camera className="w-12 h-12" />
                </div>
              )}
            </div>
            
            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Controls */}
            <div className="flex space-x-2">
              {!isStreaming ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <>
                  <Button onClick={capturePhoto} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    Capture
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Stop
                  </Button>
                </>
              )}
            </div>
            
            {/* QR Code Scanner */}
            <Button onClick={scanQRCode} variant="outline" className="w-full">
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Mobile Notifications Component
interface MobileNotificationsProps {
  className?: string;
}

export function MobileNotifications({ className = '' }: MobileNotificationsProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Transaction', message: 'Payment received from John Doe', time: '2 min ago', read: false },
    { id: 2, title: 'Low Balance Alert', message: 'Account balance is below $100', time: '1 hour ago', read: false },
    { id: 3, title: 'Invoice Sent', message: 'Invoice #INV-001 has been sent', time: '3 hours ago', read: true },
  ]);
  
  const [isEnabled, setIsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setIsEnabled(permission === 'granted');
    }
  };

  const sendTestNotification = () => {
    if (isEnabled && 'Notification' in window) {
      new Notification('Test Notification', {
        body: 'This is a test notification from OASYS',
        icon: '/oasys-logo.svg'
      });
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Mobile Notifications
        </CardTitle>
        <CardDescription>
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Notification Settings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">Enable Notifications</span>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Sound</span>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              disabled={!isEnabled}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Vibrate className="w-4 h-4" />
              <span className="text-sm font-medium">Vibration</span>
            </div>
            <Switch
              checked={vibrationEnabled}
              onCheckedChange={setVibrationEnabled}
              disabled={!isEnabled}
            />
          </div>
        </div>

        {/* Permission Request */}
        {!isEnabled && (
          <Button onClick={requestNotificationPermission} className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        {/* Test Notification */}
        {isEnabled && (
          <Button onClick={sendTestNotification} variant="outline" className="w-full">
            <Bell className="w-4 h-4 mr-2" />
            Send Test Notification
          </Button>
        )}

        {/* Notification List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Notifications</h4>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>
          
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'p-3 border rounded-lg cursor-pointer transition-colors',
                !notification.read && 'bg-primary/5 border-primary/20'
              )}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h5 className="font-medium text-sm">{notification.title}</h5>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Device Status Component
interface DeviceStatusProps {
  className?: string;
}

export function DeviceStatus({ className = '' }: DeviceStatusProps) {
  const [deviceInfo, setDeviceInfo] = useState({
    isOnline: navigator.onLine,
    batteryLevel: 100,
    signalStrength: 4,
    isLocationEnabled: false,
    isBluetoothEnabled: false,
    isMicrophoneEnabled: false,
    isFlashlightEnabled: false,
  });

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setDeviceInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDeviceInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate battery level (in a real app, you'd use the Battery API)
    const updateBattery = () => {
      setDeviceInfo(prev => ({
        ...prev,
        batteryLevel: Math.max(0, prev.batteryLevel - Math.random() * 2)
      }));
    };

    const batteryInterval = setInterval(updateBattery, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(batteryInterval);
    };
  }, []);

  const getBatteryIcon = () => {
    if (deviceInfo.batteryLevel < 20) return <BatteryLow className="w-4 h-4 text-red-500" />;
    return <Battery className="w-4 h-4" />;
  };

  const getSignalIcon = () => {
    if (deviceInfo.signalStrength === 0) return <SignalZero className="w-4 h-4 text-red-500" />;
    return <Signal className="w-4 h-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Device Status
        </CardTitle>
        <CardDescription>
          Current device status and capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {deviceInfo.isOnline ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
            <span className="text-sm">Internet</span>
          </div>
          
          {/* Battery Status */}
          <div className="flex items-center space-x-2">
            {getBatteryIcon()}
            <span className="text-sm">{deviceInfo.batteryLevel.toFixed(0)}%</span>
          </div>
          
          {/* Signal Strength */}
          <div className="flex items-center space-x-2">
            {getSignalIcon()}
            <span className="text-sm">Signal</span>
          </div>
          
          {/* Location */}
          <div className="flex items-center space-x-2">
            {deviceInfo.isLocationEnabled ? <Location className="w-4 h-4 text-green-500" /> : <LocationOff className="w-4 h-4 text-gray-500" />}
            <span className="text-sm">Location</span>
          </div>
          
          {/* Bluetooth */}
          <div className="flex items-center space-x-2">
            {deviceInfo.isBluetoothEnabled ? <Bluetooth className="w-4 h-4 text-green-500" /> : <BluetoothOff className="w-4 h-4 text-gray-500" />}
            <span className="text-sm">Bluetooth</span>
          </div>
          
          {/* Microphone */}
          <div className="flex items-center space-x-2">
            {deviceInfo.isMicrophoneEnabled ? <Mic className="w-4 h-4 text-green-500" /> : <MicOff className="w-4 h-4 text-gray-500" />}
            <span className="text-sm">Microphone</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile Share Component
interface MobileShareProps {
  title?: string;
  text?: string;
  url?: string;
  className?: string;
}

export function MobileShare({ 
  title = 'OASYS', 
  text = 'Check out OASYS - The future of accounting', 
  url = window.location.href,
  className = '' 
}: MobileShareProps) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('share' in navigator);
  }, []);

  const handleShare = async () => {
    if (isSupported) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // You could show a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <Button onClick={handleShare} variant="outline" className={className}>
      <Share className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}

export {
  BiometricAuth,
  CameraIntegration,
  MobileNotifications,
  DeviceStatus,
  MobileShare
};
