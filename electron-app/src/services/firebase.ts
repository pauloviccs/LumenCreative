import { initializeApp, cert, App } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { getDatabase } from 'firebase-admin/database'

let firebaseApp: App | null = null

/**
 * Initialize Firebase Admin SDK
 * Requires service account credentials
 */
export function initializeFirebase(serviceAccountPath: string): App {
  if (firebaseApp) {
    return firebaseApp
  }

  firebaseApp = initializeApp({
    credential: cert(serviceAccountPath),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  })

  return firebaseApp
}

export function getFirebaseStorage() {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.')
  }
  return getStorage(firebaseApp)
}

export function getFirebaseDatabase() {
  if (!firebaseApp) {
    throw new Error('Firebase not initialized. Call initializeFirebase first.')
  }
  return getDatabase(firebaseApp)
}

