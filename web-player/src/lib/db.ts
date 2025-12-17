import Dexie, { Table } from 'dexie'

export interface MediaCache {
  id?: number
  key: string // local_cache_key from playlist
  url: string // Original Firebase URL
  blob: Blob
  type: 'video' | 'image' | 'pdf'
  downloadedAt: number // Timestamp
}

export class MediaDatabase extends Dexie {
  mediaCache!: Table<MediaCache>

  constructor() {
    super('MediaDatabase')
    this.version(1).stores({
      mediaCache: '++id, key, url, type, downloadedAt',
    })
  }
}

export const db = new MediaDatabase()

