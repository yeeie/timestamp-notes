import { useCallback, useEffect, useRef, useState } from 'react'

export function useTimer() {
  const [running, setRunning] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const startRef = useRef<number | null>(null)
  const baseRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const tick = useCallback(() => {
    const now = performance.now()
    if (startRef.current != null) {
      setTimeMs(baseRef.current + Math.floor(now - startRef.current))
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (running) {
      startRef.current = performance.now()
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      startRef.current = null
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [running, tick])

  const start = () => {
    if (!running) {
      setRunning(true)
    }
  }
  const pause = () => {
    if (running) {
      // freeze base
      if (startRef.current != null) baseRef.current = baseRef.current + Math.floor(performance.now() - startRef.current)
      setRunning(false)
    }
  }
  const reset = () => {
    setRunning(false)
    setTimeMs(0)
    baseRef.current = 0
    startRef.current = null
  }
  const setTime = (ms: number) => {
    setTimeMs(ms)
    baseRef.current = ms
    startRef.current = performance.now()
  }

  return { timeMs, running, start, pause, reset, setTimeMs: setTime }
}
