// components/service-worker-registration.tsx
"use client"

import { useEffect } from 'react'
import { initWebVitals } from '@/lib/performance'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available, notify user
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
        })

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload)
        }
      })

      // Initialize performance monitoring
      initWebVitals()
    }

    // Handle online/offline events
    const handleOnline = () => {
      console.log('Connection restored')
      // Optionally show a notification or sync data
    }

    const handleOffline = () => {
      console.log('Connection lost')
      // Optionally show offline indicator
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null // This component doesn't render anything
}

// PWA Install Prompt Component
export function PWAInstallPrompt() {
  useEffect(() => {
    let deferredPrompt: any = null

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      deferredPrompt = e
      
      // Show install button or notification
      const installButton = document.getElementById('pwa-install-button')
      if (installButton) {
        installButton.style.display = 'block'
        installButton.addEventListener('click', async () => {
          if (deferredPrompt) {
            // Show the install prompt
            deferredPrompt.prompt()
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice
            console.log(`User response to the install prompt: ${outcome}`)
            // Clear the deferredPrompt variable
            deferredPrompt = null
            // Hide the install button
            if (installButton) {
              installButton.style.display = 'none'
            }
          }
        })
      }
    }

    const handleAppInstalled = () => {
      console.log('PWA was installed')
      // Hide the install button
      const installButton = document.getElementById('pwa-install-button')
      if (installButton) {
        installButton.style.display = 'none'
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return (
    <button
      id="pwa-install-button"
      style={{ display: 'none' }}
      className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50"
      onClick={() => {
        // This will be handled by the event listener
      }}
    >
      Install OASYS
    </button>
  )
}
