import { create } from 'zustand'

export interface PlaylistItem {
  id: string
  type: 'video' | 'image' | 'pdf'
  url: string
  duration: number
  local_cache_key?: string
  page_count?: number
}

export interface ScreenSettings {
  orientation: 'landscape' | 'portrait'
  refresh_rate_ms: number
  version_hash: string
}

export interface PlaylistState {
  screen_settings?: ScreenSettings
  playlist: PlaylistItem[]
  currentIndex: number
  isPlaying: boolean
  isReady: boolean
  cacheProgress: number
}

interface PlayerStore extends PlaylistState {
  setPlaylist: (playlist: PlaylistItem[], settings?: ScreenSettings) => void
  setCurrentIndex: (index: number) => void
  next: () => void
  previous: () => void
  setIsPlaying: (playing: boolean) => void
  setIsReady: (ready: boolean) => void
  setCacheProgress: (progress: number) => void
  reset: () => void
}

const initialState: PlaylistState = {
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  isReady: false,
  cacheProgress: 0,
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  ...initialState,

  setPlaylist: (playlist, settings) => {
    set({
      playlist,
      screen_settings: settings,
      currentIndex: 0,
      isReady: false,
      cacheProgress: 0,
    })
  },

  setCurrentIndex: (index) => {
    const { playlist } = get()
    if (index >= 0 && index < playlist.length) {
      set({ currentIndex: index })
    }
  },

  next: () => {
    const { currentIndex, playlist } = get()
    const nextIndex = (currentIndex + 1) % playlist.length
    set({ currentIndex: nextIndex })
  },

  previous: () => {
    const { currentIndex, playlist } = get()
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
    set({ currentIndex: prevIndex })
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsReady: (ready) => set({ isReady: ready }),
  setCacheProgress: (progress) => set({ cacheProgress: progress }),
  reset: () => set(initialState),
}))

