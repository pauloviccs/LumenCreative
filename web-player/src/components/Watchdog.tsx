import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { useInterval } from '../hooks/useInterval'

/**
 * Watchdog - Monitors video playback and detects stalls
 * If video is stuck for > 5 seconds, advances to next item
 */
export function Watchdog() {
  const { playlist, currentIndex, isPlaying } = usePlayerStore()
  const lastVideoTimeRef = useRef<number>(0)
  const stallStartRef = useRef<number | null>(null)

  const currentItem = playlist[currentIndex]
  const isVideo = currentItem?.type === 'video'

  useEffect(() => {
    if (!isVideo) {
      lastVideoTimeRef.current = 0
      stallStartRef.current = null
    }
  }, [isVideo, currentIndex])

  useInterval(
    () => {
      if (!isVideo || !isPlaying) {
        return
      }

      const videoElement = document.querySelector('video')
      if (!videoElement) {
        return
      }

      const currentTime = videoElement.currentTime

      // Check if video is playing (time is advancing)
      if (currentTime === lastVideoTimeRef.current) {
        // Video is stalled
        if (stallStartRef.current === null) {
          stallStartRef.current = Date.now()
        } else {
          const stallDuration = Date.now() - stallStartRef.current
          if (stallDuration > 5000) {
            // Stalled for more than 5 seconds, skip to next
            console.warn('Video stalled, advancing to next item')
            usePlayerStore.getState().next()
            stallStartRef.current = null
            lastVideoTimeRef.current = 0
          }
        }
      } else {
        // Video is playing normally
        lastVideoTimeRef.current = currentTime
        stallStartRef.current = null
      }
    },
    isVideo && isPlaying ? 1000 : null // Check every second
  )

  return null // This component doesn't render anything
}

