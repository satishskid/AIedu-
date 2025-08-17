import { useCallback, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  memoryUsage?: number
}

interface UsePerformanceReturn {
  measureRender: (label: string) => void
  getMetrics: () => PerformanceMetrics
  clearMetrics: () => void
}

export const usePerformance = (): UsePerformanceReturn => {
  const metricsRef = useRef<Map<string, number>>(new Map())
  const startTimesRef = useRef<Map<string, number>>(new Map())

  const measureRender = useCallback((label: string) => {
    const now = performance.now()
    
    if (startTimesRef.current.has(label)) {
      // End measurement
      const startTime = startTimesRef.current.get(label)!
      const duration = now - startTime
      metricsRef.current.set(label, duration)
      startTimesRef.current.delete(label)
      
      // Log performance metric in development
      if (import.meta.env.DEV) {
        console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`)
      }
    } else {
      // Start measurement
      startTimesRef.current.set(label, now)
    }
  }, [])

  const getMetrics = useCallback((): PerformanceMetrics => {
    const renderTimes = Array.from(metricsRef.current.values())
    const avgRenderTime = renderTimes.length > 0 
      ? renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length 
      : 0

    return {
      renderTime: avgRenderTime,
      componentCount: metricsRef.current.size,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || undefined
    }
  }, [])

  const clearMetrics = useCallback(() => {
    metricsRef.current.clear()
    startTimesRef.current.clear()
  }, [])

  return {
    measureRender,
    getMetrics,
    clearMetrics
  }
}

export default usePerformance