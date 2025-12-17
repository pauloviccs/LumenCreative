import { initializeApp, getApps } from 'firebase/app'
import { getDatabase, ref, onValue, off, Database } from 'firebase/database'
import { usePlayerStore, PlaylistItem, ScreenSettings } from '../store/playerStore'

interface PlaylistPayload {
  screen_settings: {
    orientation: 'landscape' | 'portrait'
    refresh_rate_ms: number
    version_hash: string
  }
  playlist: Array<{
    id: string
    type: 'video' | 'image' | 'pdf'
    url: string
    duration: number
    local_cache_key?: string
    page_count?: number
  }>
}

/**
 * Firebase Sync Service
 * Listens to Firebase Realtime Database for playlist updates
 */
export class FirebaseSyncService {
  private db: Database | null = null
  private unsubscribe: (() => void) | null = null
  private currentVersionHash: string | null = null

  /**
   * Initialize Firebase
   */
  initialize(config: {
    apiKey: string
    authDomain: string
    databaseURL: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }) {
    if (getApps().length === 0) {
      initializeApp(config)
    }
    this.db = getDatabase()
  }

  /**
   * Start listening to screen updates
   */
  subscribeToScreen(screenId: string) {
    if (!this.db) {
      throw new Error('Firebase not initialized')
    }

    // Stop previous subscription
    if (this.unsubscribe) {
      this.unsubscribe()
    }

    const screenRef = ref(this.db, `screens/${screenId}`)

    this.unsubscribe = onValue(
      screenRef,
      (snapshot) => {
        const data = snapshot.val() as PlaylistPayload | null

        if (!data) {
          console.warn('No data received from Firebase')
          return
        }

        // Check if version changed
        if (this.currentVersionHash === data.screen_settings.version_hash) {
          return // No change, skip
        }

        this.currentVersionHash = data.screen_settings.version_hash

        // Update store
        const playlistItems: PlaylistItem[] = data.playlist.map((item) => ({
          id: item.id,
          type: item.type,
          url: item.url,
          duration: item.duration,
          local_cache_key: item.local_cache_key,
          page_count: item.page_count,
        }))

        usePlayerStore.getState().setPlaylist(playlistItems, data.screen_settings)
      },
      (error) => {
        console.error('Firebase subscription error:', error)
      }
    )
  }

  /**
   * Stop listening to updates
   */
  unsubscribe() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.currentVersionHash = null
  }
}

export const firebaseSyncService = new FirebaseSyncService()

