interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  type: 'timing' | 'counter' | 'gauge'
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []

  constructor() {
    this.setupObservers()
  }

  private setupObservers() {
    // Observe long tasks
    if ('PerformanceObserver' in window && 'PerformanceLongTaskTiming' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: entry.startTime,
            type: 'timing'
          })
          
          if (entry.duration > 50) {
            console.warn(`Long task detected: ${entry.duration}ms`)
          }
        }
      })
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.push(longTaskObserver)
      } catch (error) {
        console.warn('Long task observer not supported')
      }
    }

    // Observe layout shifts
    if ('PerformanceObserver' in window && 'LayoutShift' in window) {
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.recordMetric({
              name: 'cumulative-layout-shift',
              value: clsValue,
              timestamp: entry.startTime,
              type: 'gauge'
            })
          }
        }
      })

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (error) {
        console.warn('Layout shift observer not supported')
      }
    }
  }

  start() {
    // Record initial page load metrics
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      
      if (loadTime > 0) {
        this.recordMetric({
          name: 'page-load-time',
          value: loadTime,
          timestamp: Date.now(),
          type: 'timing'
        })
      }
    }

    // Monitor memory usage
    this.monitorMemory()
    
    // Monitor network status
    this.monitorNetwork()
  }

  private monitorMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      
      this.recordMetric({
        name: 'memory-used',
        value: memory.usedJSHeapSize,
        timestamp: Date.now(),
        type: 'gauge'
      })

      this.recordMetric({
        name: 'memory-total',
        value: memory.totalJSHeapSize,
        timestamp: Date.now(),
        type: 'gauge'
      })

      // Warn if memory usage is high
      const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      if (memoryUsagePercent > 90) {
        console.warn(`High memory usage: ${memoryUsagePercent.toFixed(1)}%`)
      }
    }
  }

  private monitorNetwork() {
    // Monitor connection changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      
      this.recordMetric({
        name: 'network-downlink',
        value: connection.downlink || 0,
        timestamp: Date.now(),
        type: 'gauge'
      })

      connection.addEventListener('change', () => {
        this.recordMetric({
          name: 'network-type-change',
          value: 1,
          timestamp: Date.now(),
          type: 'counter'
        })
      })
    }

    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.recordMetric({
        name: 'network-online',
        value: 1,
        timestamp: Date.now(),
        type: 'counter'
      })
    })

    window.addEventListener('offline', () => {
      this.recordMetric({
        name: 'network-offline',
        value: 1,
        timestamp: Date.now(),
        type: 'counter'
      })
    })
  }

  measurePageLoad() {
    if (window.performance && window.performance.getEntriesByType) {
      const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigationEntry) {
        // Core Web Vitals
        this.recordMetric({
          name: 'first-contentful-paint',
          value: navigationEntry.responseStart - navigationEntry.fetchStart,
          timestamp: Date.now(),
          type: 'timing'
        })

        this.recordMetric({
          name: 'dom-content-loaded',
          value: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
          timestamp: Date.now(),
          type: 'timing'
        })

        this.recordMetric({
          name: 'load-complete',
          value: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
          timestamp: Date.now(),
          type: 'timing'
        })
      }
    }
  }

  measureRender(name: string) {
    const startTime = performance.now()
    
    return {
      end: () => {
        const duration = performance.now() - startTime
        this.recordMetric({
          name: `render-${name}`,
          value: duration,
          timestamp: Date.now(),
          type: 'timing'
        })
      }
    }
  }

  measureAPI(name: string, duration: number) {
    this.recordMetric({
      name: `api-${name}`,
      value: duration,
      timestamp: Date.now(),
      type: 'timing'
    })
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)
    
    // Keep only last 1000 metrics to prevent memory leak
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }

    // Send critical metrics to analytics
    if (import.meta.env.PROD && this.shouldReportMetric(metric)) {
      this.reportMetric(metric)
    }
  }

  private shouldReportMetric(metric: PerformanceMetric): boolean {
    // Report slow operations
    if (metric.type === 'timing' && metric.value > 1000) {
      return true
    }

    // Report layout shifts
    if (metric.name === 'cumulative-layout-shift' && metric.value > 0.1) {
      return true
    }

    // Report memory issues
    if (metric.name === 'memory-used' && metric.value > 100 * 1024 * 1024) {
      return true
    }

    return false
  }

  private async reportMetric(metric: PerformanceMetric) {
    try {
      // Send to your analytics service
      if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
        // Google Analytics 4
        gtag('event', metric.name, {
          event_category: 'performance',
          value: metric.value,
          custom_parameter_1: metric.type
        })
      }
    } catch (error) {
      console.warn('Failed to report performance metric:', error)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  getAverageMetric(name: string): number {
    const metrics = this.metrics.filter(m => m.name === name)
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0)
    return sum / metrics.length
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.metrics = []
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for measuring async and sync operations
export const measureAsync = async <T>(
  name: string,
  fn: () => Promise<T>,
  monitor?: PerformanceMonitor
): Promise<T> => {
  const perfMonitor = monitor || performanceMonitor
  const measurement = perfMonitor.measureRender(name)
  
  try {
    const result = await fn()
    measurement.end()
    return result
  } catch (error) {
    measurement.end()
    throw error
  }
}

export const measureSync = <T>(
  name: string,
  fn: () => T,
  monitor?: PerformanceMonitor
): T => {
  const perfMonitor = monitor || performanceMonitor
  const measurement = perfMonitor.measureRender(name)
  
  try {
    const result = fn()
    measurement.end()
    return result
  } catch (error) {
    measurement.end()
    throw error
  }
}

// Auto-start performance monitoring in production
if (typeof window !== 'undefined' && import.meta.env.PROD) {
  performanceMonitor.start()
}

// Declare gtag for Google Analytics
declare global {
  function gtag(...args: any[]): void
}