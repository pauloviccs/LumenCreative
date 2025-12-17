export interface ElectronAPI {
  screen: {
    create: (name: string) => Promise<any>
    getAll: () => Promise<any[]>
    updateStatus: (screenId: string, status: string) => Promise<any>
  }
  playlist: {
    create: (name: string) => Promise<any>
    getAll: () => Promise<any[]>
    getById: (playlistId: string) => Promise<any>
    addItem: (playlistId: string, data: any) => Promise<any>
    updateItem: (itemId: string, data: any) => Promise<any>
    deleteItem: (itemId: string) => Promise<any>
    reorderItems: (itemOrders: Array<{ id: string; order: number }>) => Promise<void>
    assignToScreen: (screenId: string, playlistId: string) => Promise<any>
  }
  file: {
    select: () => Promise<string | null>
    upload: (localPath: string, screenId: string, fileName: string) => Promise<any>
  }
  firebase: {
    initialize: (serviceAccountPath: string) => Promise<{ success: boolean }>
    syncPlaylist: (screenId: string) => Promise<{ success: boolean }>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

