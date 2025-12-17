import { db, MediaCache } from '../lib/db'

export interface PlaylistItem {
  id: string
  type: 'video' | 'image' | 'pdf'
  url: string
  duration: number
  local_cache_key?: string
  page_count?: number
}

/**
 * Offline Manager - Handles caching media files in IndexedDB
 * Key principles:
 * - Download all media before playback starts
 * - Generate object URLs only when needed
 * - Revoke object URLs when items leave screen
 */
export class OfflineManager {
  private objectURLs: Map<string, string> = new Map()

  /**
   * Check if a media item is already cached
   */
  async isCached(cacheKey: string): Promise<boolean> {
    const cached = await db.mediaCache.get({ key: cacheKey })
    return !!cached
  }

  /**
   * Download and cache a media file
   */
  async cacheMedia(
    item: PlaylistItem,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    if (!item.local_cache_key) {
      throw new Error('Item missing local_cache_key')
    }

    // Check if already cached
    if (await this.isCached(item.local_cache_key)) {
      return
    }

    // Download file
    const response = await fetch(item.url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${item.url}: ${response.statusText}`)
    }

    const blob = await response.blob()

    // Store in IndexedDB
    await db.mediaCache.add({
      key: item.local_cache_key,
      url: item.url,
      blob,
      type: item.type,
      downloadedAt: Date.now(),
    })
  }

  /**
   * Get object URL for a cached item
   * IMPORTANT: Call revokeObjectURL when done with the URL
   */
  async getObjectURL(cacheKey: string): Promise<string> {
    // Check if we already have an object URL for this key
    if (this.objectURLs.has(cacheKey)) {
      return this.objectURLs.get(cacheKey)!
    }

    // Get from cache
    const cached = await db.mediaCache.get({ key: cacheKey })
    if (!cached) {
      throw new Error(`Media not cached: ${cacheKey}`)
    }

    // Create object URL
    const objectURL = URL.createObjectURL(cached.blob)
    this.objectURLs.set(cacheKey, objectURL)

    return objectURL
  }

  /**
   * Revoke object URL to free memory
   * MUST be called when item leaves screen
   */
  revokeObjectURL(cacheKey: string): void {
    const objectURL = this.objectURLs.get(cacheKey)
    if (objectURL) {
      URL.revokeObjectURL(objectURL)
      this.objectURLs.delete(cacheKey)
    }
  }

  /**
   * Download all media for a playlist
   */
  async cachePlaylist(
    items: PlaylistItem[],
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const itemsToCache = items.filter((item) => item.local_cache_key)
    const total = itemsToCache.length

    for (let i = 0; i < itemsToCache.length; i++) {
      const item = itemsToCache[i]
      try {
        await this.cacheMedia(item)
        onProgress?.(((i + 1) / total) * 100)
      } catch (error) {
        console.error(`Failed to cache ${item.id}:`, error)
        // Continue with next item (fail-safe)
      }
    }
  }

  /**
   * Clear old cache entries (keep only items in current playlist)
   */
  async cleanupCache(keepKeys: string[]): Promise<void> {
    const allCached = await db.mediaCache.toArray()
    const keysToDelete = allCached
      .filter((item) => !keepKeys.includes(item.key))
      .map((item) => item.id!)
      .filter((id): id is number => id !== undefined)

    if (keysToDelete.length > 0) {
      await db.mediaCache.bulkDelete(keysToDelete)
    }
  }
}

export const offlineManager = new OfflineManager()

