import { useEffect, useRef } from 'react'

/**
 * Custom hook for interval that respects React state
 * Cleans up properly to prevent memory leaks
 */
export function useInterval(
  callback: () => void,
  delay: number | null,
  immediate = false
) {
  const savedCallback = useRef<() => void>()

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return
    }

    if (immediate) {
      savedCallback.current?.()
    }

    const id = setInterval(() => {
      savedCallback.current?.()
    }, delay)

    return () => {
      clearInterval(id)
    }
  }, [delay, immediate])
}

