import { prisma } from '../lib/prisma'

/**
 * Create a new playlist
 */
export async function createPlaylist(name: string) {
  return await prisma.playlist.create({
    data: {
      name,
    },
  })
}

/**
 * Get all playlists
 */
export async function getAllPlaylists() {
  return await prisma.playlist.findMany({
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
      screens: true,
    },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get playlist by ID
 */
export async function getPlaylistById(playlistId: string) {
  return await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      items: {
        orderBy: { order: 'asc' },
      },
      screens: true,
    },
  })
}

/**
 * Add item to playlist
 */
export async function addPlaylistItem(
  playlistId: string,
  data: {
    type: string
    localPath: string
    remoteUrl?: string
    duration: number
    order: number
    fileSize: number
    md5Hash?: string
  }
) {
  return await prisma.playlistItem.create({
    data: {
      playlistId,
      ...data,
    },
  })
}

/**
 * Update playlist item
 */
export async function updatePlaylistItem(
  itemId: string,
  data: {
    remoteUrl?: string
    duration?: number
    order?: number
    md5Hash?: string
  }
) {
  return await prisma.playlistItem.update({
    where: { id: itemId },
    data,
  })
}

/**
 * Delete playlist item
 */
export async function deletePlaylistItem(itemId: string) {
  return await prisma.playlistItem.delete({
    where: { id: itemId },
  })
}

/**
 * Reorder playlist items
 */
export async function reorderPlaylistItems(itemOrders: { id: string; order: number }[]) {
  await prisma.$transaction(
    itemOrders.map(({ id, order }) =>
      prisma.playlistItem.update({
        where: { id },
        data: { order },
      })
    )
  )
}

/**
 * Assign playlist to screen
 */
export async function assignPlaylistToScreen(screenId: string, playlistId: string) {
  return await prisma.screen.update({
    where: { id: screenId },
    data: { playlistId },
  })
}

