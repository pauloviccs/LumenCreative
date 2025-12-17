import { ipcMain, dialog } from 'electron'
import * as screenService from '../src/services/screenService'
import * as playlistService from '../src/services/playlistService'
import * as fileUpload from '../src/services/fileUpload'
import * as firebaseSync from '../src/services/firebaseSync'
import { initializeFirebase } from '../src/services/firebase'
import path from 'path'
import { app } from 'electron'

// Initialize IPC handlers
export function setupIpcHandlers() {
  // Screen handlers
  ipcMain.handle('screen:create', async (_, name: string) => {
    return await screenService.createScreen(name)
  })

  ipcMain.handle('screen:getAll', async () => {
    return await screenService.getAllScreens()
  })

  ipcMain.handle('screen:updateStatus', async (_, screenId: string, status: string) => {
    return await screenService.updateScreenStatus(screenId, status as any)
  })

  // Playlist handlers
  ipcMain.handle('playlist:create', async (_, name: string) => {
    return await playlistService.createPlaylist(name)
  })

  ipcMain.handle('playlist:getAll', async () => {
    return await playlistService.getAllPlaylists()
  })

  ipcMain.handle('playlist:getById', async (_, playlistId: string) => {
    return await playlistService.getPlaylistById(playlistId)
  })

  ipcMain.handle('playlist:addItem', async (_, playlistId: string, data: any) => {
    return await playlistService.addPlaylistItem(playlistId, data)
  })

  ipcMain.handle('playlist:updateItem', async (_, itemId: string, data: any) => {
    return await playlistService.updatePlaylistItem(itemId, data)
  })

  ipcMain.handle('playlist:deleteItem', async (_, itemId: string) => {
    return await playlistService.deletePlaylistItem(itemId)
  })

  ipcMain.handle('playlist:reorderItems', async (_, itemOrders: Array<{ id: string; order: number }>) => {
    return await playlistService.reorderPlaylistItems(itemOrders)
  })

  ipcMain.handle('playlist:assignToScreen', async (_, screenId: string, playlistId: string) => {
    return await playlistService.assignPlaylistToScreen(screenId, playlistId)
  })

  // File operations
  ipcMain.handle('file:select', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Media Files', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'] },
        { name: 'Video', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi'] },
        { name: 'Image', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (result.canceled) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('file:upload', async (_, localPath: string, screenId: string, fileName: string) => {
    // Check file size before upload
    const fs = await import('fs/promises')
    const stats = await fs.stat(localPath)
    const maxSize = 30 * 1024 * 1024 // 30MB
    
    if (stats.size > maxSize) {
      throw new Error(`File size exceeds 30MB limit: ${(stats.size / 1024 / 1024).toFixed(2)}MB`)
    }

    const fileType = fileUpload.getFileType(localPath)
    const uploadResult = await fileUpload.uploadFileToFirebase(localPath, screenId, fileName)

    return {
      ...uploadResult,
      type: fileType,
    }
  })

  // Firebase sync
  ipcMain.handle('firebase:initialize', async (_, serviceAccountPath: string) => {
    initializeFirebase(serviceAccountPath)
    return { success: true }
  })

  ipcMain.handle('firebase:syncPlaylist', async (_, screenId: string) => {
    await firebaseSync.syncPlaylistToFirebase(screenId)
    return { success: true }
  })
}

