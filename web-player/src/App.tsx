import { useEffect, useState } from 'react'
import { Engine } from './components/Engine'
import { Watchdog } from './components/Watchdog'
import { firebaseSyncService } from './services/FirebaseSync'
import { usePlayerStore } from './store/playerStore'

function App() {
  const { setIsPlaying } = usePlayerStore()
  const [pairingCode, setPairingCode] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Start playing when ready
    setIsPlaying(true)
  }, [setIsPlaying])

  const handlePair = async () => {
    if (!pairingCode.trim()) {
      setError('Please enter a pairing code')
      return
    }

    try {
      // TODO: Get Firebase config from environment or API
      // For now, this is a placeholder - needs to be configured
      const firebaseConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || '',
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || '',
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.VITE_FIREBASE_APP_ID || '',
      }

      if (!firebaseConfig.databaseURL) {
        throw new Error('Firebase configuration missing')
      }

      firebaseSyncService.initialize(firebaseConfig)
      firebaseSyncService.subscribeToScreen(pairingCode.trim())
      setIsConnected(true)
      setError(null)
    } catch (err) {
      console.error('Pairing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to pair with screen')
    }
  }

  if (!isConnected) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold mb-8">DS-System Player</h1>
          <div className="space-y-4">
            <input
              type="text"
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
              placeholder="Enter pairing code"
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl tracking-widest font-mono w-48"
              maxLength={6}
              onKeyDown={(e) => e.key === 'Enter' && handlePair()}
              autoFocus
            />
            <br />
            <button
              onClick={handlePair}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              Connect
            </button>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Engine />
      <Watchdog />
    </>
  )
}

export default App
