import { getFirebaseDatabase } from './firebase'
import { ref, set } from 'firebase-admin/database'
import { prisma } from '../lib/prisma'
import { createHash } from 'crypto'

export interface PlaylistPayload {
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
    page_count?: number // For PDFs
  }>
}

/**
 * Sync playlist to Firebase Realtime Database
 */
export async function syncPlaylistToFirebase(screenId: string): Promise<void> {
  const screen = await prisma.screen.findUnique({
    where: { id: screenId },
    include: {
      playlist: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!screen || !screen.playlist) {
    throw new Error(`Screen ${screenId} or playlist not found`)
  }

  // Build playlist payload
  const playlistItems = screen.playlist.items.map((item) => {
    const payload: PlaylistPayload['playlist'][0] = {
      id: item.id,
      type: item.type.toLowerCase() as 'video' | 'image' | 'pdf',
      url: item.remoteUrl || '',
      duration: item.duration,
      local_cache_key: `${item.type.toLowerCase()}_${item.id}_v1.${item.type.toLowerCase() === 'video' ? 'mp4' : item.type.toLowerCase() === 'pdf' ? 'pdf' : 'jpg'}`,
    }

    // Add page_count for PDFs (would need to be calculated when uploading)
    if (item.type === 'PDF' && item.remoteUrl) {
      // TODO: Pre-calculate page count during upload
      // payload.page_count = await getPdfPageCount(item.remoteUrl)
    }

    return payload
  })

  // Generate version hash
  const versionData = JSON.stringify(playlistItems)
  const versionHash = createHash('md5').update(versionData).digest('hex').substring(0, 8)

  const payload: PlaylistPayload = {
    screen_settings: {
      orientation: 'landscape', // Default, can be configurable
      refresh_rate_ms: 30000,
      version_hash: versionHash,
    },
    playlist: playlistItems,
  }

  // Write to Firebase
  const db = getFirebaseDatabase()
  await set(ref(db, `screens/${screen.firebaseId || screenId}`), payload)
}

