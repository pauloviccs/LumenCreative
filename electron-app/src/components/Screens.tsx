import { useEffect, useState } from 'react'
import { useElectronAPI } from '../hooks/useElectronAPI'

interface Screen {
  id: string
  name: string
  pairingCode: string
  status: 'unpaired' | 'online' | 'offline'
  playlistId?: string | null
}

export function Screens() {
  const electronAPI = useElectronAPI()
  const [screens, setScreens] = useState<Screen[]>([])
  const [loading, setLoading] = useState(false)
  const [newScreenName, setNewScreenName] = useState('')

  const loadScreens = async () => {
    setLoading(true)
    try {
      const data = await electronAPI.screen.getAll()
      setScreens(data)
    } catch (error) {
      console.error('Error loading screens:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScreens()
  }, [])

  const handleCreateScreen = async () => {
    if (!newScreenName.trim()) return

    try {
      await electronAPI.screen.create(newScreenName)
      setNewScreenName('')
      await loadScreens()
    } catch (error) {
      console.error('Error creating screen:', error)
      alert('Error creating screen')
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Screens</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newScreenName}
            onChange={(e) => setNewScreenName(e.target.value)}
            placeholder="Screen name"
            className="px-4 py-2 border rounded-lg flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreateScreen()}
          />
          <button
            onClick={handleCreateScreen}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Screen
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {screens.map((screen) => (
            <div
              key={screen.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
            >
              <h3 className="font-semibold text-lg mb-2">{screen.name}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Pairing Code: </span>
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {screen.pairingCode}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status: </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      screen.status === 'online'
                        ? 'bg-green-100 text-green-800'
                        : screen.status === 'offline'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {screen.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

