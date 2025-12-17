import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen APIs
  screen: {
    create: (name: string) => ipcRenderer.invoke('screen:create', name),
    getAll: () => ipcRenderer.invoke('screen:getAll'),
    updateStatus: (screenId: string, status: string) => 
      ipcRenderer.invoke('screen:updateStatus', screenId, status),
  },

  // Playlist APIs
  playlist: {
    create: (name: string) => ipcRenderer.invoke('playlist:create', name),
    getAll: () => ipcRenderer.invoke('playlist:getAll'),
    getById: (playlistId: string) => ipcRenderer.invoke('playlist:getById', playlistId),
    addItem: (playlistId: string, data: any) => 
      ipcRenderer.invoke('playlist:addItem', playlistId, data),
    updateItem: (itemId: string, data: any) => 
      ipcRenderer.invoke('playlist:updateItem', itemId, data),
    deleteItem: (itemId: string) => ipcRenderer.invoke('playlist:deleteItem', itemId),
    reorderItems: (itemOrders: Array<{ id: string; order: number }>) => 
      ipcRenderer.invoke('playlist:reorderItems', itemOrders),
    assignToScreen: (screenId: string, playlistId: string) => 
      ipcRenderer.invoke('playlist:assignToScreen', screenId, playlistId),
  },

  // File APIs
  file: {
    select: () => ipcRenderer.invoke('file:select'),
    upload: (localPath: string, screenId: string, fileName: string) => 
      ipcRenderer.invoke('file:upload', localPath, screenId, fileName),
  },

  // Firebase APIs
  firebase: {
    initialize: (serviceAccountPath: string) => 
      ipcRenderer.invoke('firebase:initialize', serviceAccountPath),
    syncPlaylist: (screenId: string) => 
      ipcRenderer.invoke('firebase:syncPlaylist', screenId),
  },
})
