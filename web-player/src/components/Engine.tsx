import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { offlineManager } from '../services/OfflineManager'
import { useInterval } from '../hooks/useInterval'
import { VideoRenderer } from './renderers/VideoRenderer'
import { ImageRenderer } from './renderers/ImageRenderer'
import { PDFRenderer } from './renderers/PDFRenderer'

/**
 * Engine - The maestro that orchestrates playlist playback
 * Key principles:
 * 1. Load next asset in DOM (hidden)
 * 2. Wait for onCanPlay (video) or onLoad (image)
 * 3. Swap visibility
 * 4. Unload previous asset to free memory
 */
export function Engine() {
  const {
    playlist,
    currentIndex,
    isPlaying,
    isReady,
    next,
    setIsReady,
    setCacheProgress,
  } = usePlayerStore()

  const [currentObjectURL, setCurrentObjectURL] = useState<string | null>(null)
  const [nextObjectURL, setNextObjectURL] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const currentItemRef = useRef<string | null>(null)
  const previousObjectURLRef = useRef<string | null>(null)

  const currentItem = playlist[currentIndex]
  const nextItem = playlist[(currentIndex + 1) % playlist.length]

  // Cache playlist on mount or when playlist changes
  useEffect(() => {
    if (playlist.length === 0) return

    const cachePlaylist = async () => {
      setIsReady(false)
      setCacheProgress(0)

      try {
        await offlineManager.cachePlaylist(playlist, (progress) => {
          setCacheProgress(progress)
        })

        // Get object URLs for items we want to keep
        const keepKeys = playlist
          .map((item) => item.local_cache_key)
          .filter((key): key is string => !!key)

        // Cleanup old cache
        await offlineManager.cleanupCache(keepKeys)

        setIsReady(true)
      } catch (error) {
        console.error('Failed to cache playlist:', error)
        // Still allow playback even if caching fails (fail-safe)
        setIsReady(true)
      }
    }

    cachePlaylist()
  }, [playlist])

  // Load current item's object URL
  useEffect(() => {
    if (!currentItem?.local_cache_key || !isReady) return

    const loadCurrentItem = async () => {
      try {
        // If item changed, revoke old URL
        if (currentItemRef.current !== currentItem.id && currentItemRef.current) {
          const oldItem = playlist.find((item) => item.id === currentItemRef.current)
          if (oldItem?.local_cache_key) {
            try {
              offlineManager.revokeObjectURL(oldItem.local_cache_key)
            } catch (e) {
              // Ignore errors when revoking
            }
          }
        }

        currentItemRef.current = currentItem.id
        const objectURL = await offlineManager.getObjectURL(currentItem.local_cache_key)
        previousObjectURLRef.current = currentObjectURL
        setCurrentObjectURL(objectURL)
      } catch (error) {
        console.error('Failed to load current item:', error)
        // Skip to next on error (fail-safe)
        setTimeout(() => next(), 1000)
      }
    }

    loadCurrentItem()
  }, [currentItem?.id, isReady, playlist, next])

  // Preload next item
  useEffect(() => {
    if (!nextItem?.local_cache_key || !isReady || isTransitioning) return

    const preloadNext = async () => {
      try {
        const objectURL = await offlineManager.getObjectURL(nextItem.local_cache_key)
        setNextObjectURL(objectURL)
      } catch (error) {
        console.error('Failed to preload next item:', error)
      }
    }

    preloadNext()
  }, [nextItem?.id, isReady, isTransitioning])

  // Auto-advance based on duration
  useInterval(
    () => {
      if (isPlaying && currentItem) {
        next()
      }
    },
    currentItem && isPlaying ? currentItem.duration * 1000 : null
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentItem?.local_cache_key) {
        try {
          offlineManager.revokeObjectURL(currentItem.local_cache_key)
        } catch (e) {
          // Ignore errors
        }
      }
      if (nextItem?.local_cache_key) {
        try {
          offlineManager.revokeObjectURL(nextItem.local_cache_key)
        } catch (e) {
          // Ignore errors
        }
      }
    }
  }, [currentItem?.local_cache_key, nextItem?.local_cache_key])

  if (!currentItem || !currentObjectURL) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        {!isReady ? (
          <div className="text-center">
            <p>Loading playlist...</p>
            <p className="text-sm mt-2">{Math.round(usePlayerStore.getState().cacheProgress)}%</p>
          </div>
        ) : (
          <p>No content</p>
        )}
      </div>
    )
  }

  const handleItemReady = () => {
    setIsTransitioning(false)
  }

  const handleItemError = () => {
    console.error('Item playback error, skipping to next')
    next()
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      {currentItem.type === 'video' && currentObjectURL && (
        <VideoRenderer
          src={currentObjectURL}
          onCanPlay={handleItemReady}
          onError={handleItemError}
        />
      )}
      {currentItem.type === 'image' && currentObjectURL && (
        <ImageRenderer
          src={currentObjectURL}
          onLoad={handleItemReady}
          onError={handleItemError}
        />
      )}
      {currentItem.type === 'pdf' && currentObjectURL && (
        <PDFRenderer
          src={currentObjectURL}
          duration={currentItem.duration}
          pageCount={currentItem.page_count || 1}
          onLoad={handleItemReady}
          onError={handleItemError}
        />
      )}
    </div>
  )
}

