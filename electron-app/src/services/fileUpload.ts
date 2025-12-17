import { getStorage } from './firebase'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase-admin/storage'
import { createHash } from 'crypto'
import { readFile } from 'fs/promises'
import { stat } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 30 * 1024 * 1024 // 30MB

export interface UploadResult {
  remoteUrl: string
  fileSize: number
  md5Hash: string
}

/**
 * Upload file to Firebase Storage
 * Throws error if file > 30MB
 */
export async function uploadFileToFirebase(
  localPath: string,
  screenId: string,
  fileName: string
): Promise<UploadResult> {
  // Check file size
  const fileStats = await stat(localPath)
  if (fileStats.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 30MB limit: ${fileStats.size} bytes`)
  }

  // Read file and calculate MD5
  const fileBuffer = await readFile(localPath)
  const md5Hash = createHash('md5').update(fileBuffer).digest('hex')

  // Upload to Firebase Storage
  const storage = getStorage()
  const storageRef = ref(storage, `screens/${screenId}/${fileName}`)
  const snapshot = await uploadBytesResumable(storageRef, fileBuffer)

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref)

  return {
    remoteUrl: downloadURL,
    fileSize: fileStats.size,
    md5Hash,
  }
}

/**
 * Determine file type from extension
 */
export function getFileType(filePath: string): 'VIDEO' | 'IMAGE' | 'PDF' {
  const ext = path.extname(filePath).toLowerCase()
  
  if (['.mp4', '.webm', '.ogg', '.mov', '.avi'].includes(ext)) {
    return 'VIDEO'
  }
  if (['.pdf'].includes(ext)) {
    return 'PDF'
  }
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
    return 'IMAGE'
  }
  
  throw new Error(`Unsupported file type: ${ext}`)
}

