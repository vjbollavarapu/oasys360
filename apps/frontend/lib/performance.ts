// lib/performance.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals'

export function reportWebVitals(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric)
  }

  // Send to analytics service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    // gtag('event', metric.name, {
    //   value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //   event_label: metric.id,
    //   non_interaction: true,
    // })
  }
}

export function initWebVitals() {
  onCLS(reportWebVitals)
  onFID(reportWebVitals)
  onFCP(reportWebVitals)
  onLCP(reportWebVitals)
  onTTFB(reportWebVitals)
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  startTiming(name: string): void {
    this.metrics.set(name, performance.now())
  }

  endTiming(name: string): number {
    const startTime = this.metrics.get(name)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.delete(name)
      return duration
    }
    return 0
  }

  measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.startTiming(name)
    return fn().finally(() => {
      const duration = this.endTiming(name)
      console.log(`${name} took ${duration.toFixed(2)}ms`)
    })
  }

  measureSync<T>(name: string, fn: () => T): T {
    this.startTiming(name)
    try {
      return fn()
    } finally {
      const duration = this.endTiming(name)
      console.log(`${name} took ${duration.toFixed(2)}ms`)
    }
  }
}

// Bundle size monitoring
export function getBundleSize(): Promise<number> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        resolve(navigation.transferSize || 0)
      }
    }
    resolve(0)
  })
}

// Memory usage monitoring
export function getMemoryUsage(): any {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    return (performance as any).memory
  }
  return null
}

// Network monitoring
export function getNetworkInfo(): any {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    return (navigator as any).connection
  }
  return null
}
