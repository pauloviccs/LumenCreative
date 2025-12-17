import { prisma } from '../lib/prisma'

/**
 * Generate a random 6-digit pairing code
 */
export function generatePairingCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Create a new screen with pairing code
 */
export async function createScreen(name: string) {
  let pairingCode: string
  let attempts = 0
  const maxAttempts = 10

  // Ensure unique pairing code
  do {
    pairingCode = generatePairingCode()
    const existing = await prisma.screen.findUnique({
      where: { pairingCode },
    })
    if (!existing) break
    attempts++
  } while (attempts < maxAttempts)

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique pairing code')
  }

  return await prisma.screen.create({
    data: {
      name,
      pairingCode,
      status: 'unpaired',
    },
  })
}

/**
 * Get all screens
 */
export async function getAllScreens() {
  return await prisma.screen.findMany({
    include: {
      playlist: {
        include: {
          items: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })
}

/**
 * Update screen status
 */
export async function updateScreenStatus(
  screenId: string,
  status: 'unpaired' | 'online' | 'offline'
) {
  return await prisma.screen.update({
    where: { id: screenId },
    data: { status },
  })
}

