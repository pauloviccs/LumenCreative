import { useEffect, useState } from 'react'
import { useElectronAPI } from '../hooks/useElectronAPI'

interface PlaylistItem {
  id: string
  type: string
  localPath: string
  remoteUrl?: string | null
  duration: number
  order: number
}

interface Playlist {
  id: string
  name: string
  items: PlaylistItem[]
  createdAt: string
}

export function Playlists() {
  const electronAPI = useElectronAPI()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const data = await electronAPI.playlist.getAll()
      setPlaylists(data)
    } catch (error) {
      console.error('Error loading playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlaylists()
  }, [])

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    try {
      await electronAPI.playlist.create(newPlaylistName)
      setNewPlaylistName('')
      await loadPlaylists()
    } catch (error) {
      console.error('Error creating playlist:', error)
      alert('Error creating playlist')
    }
  }

  const handleAddFile = async (playlistId: string) => {
    try {
      const filePath = await electronAPI.file.select()
      if (!filePath) return

      // For now, just add the item locally
      // TODO: Implement full upload flow with Firebase
      alert(`File selected: ${filePath}. Upload functionality coming soon.`)
    } catch (error) {
      console.error('Error selecting file:', error)
      alert('Error selecting file')
    }
  }

  const handleSelectPlaylist = async (playlistId: string) => {
    try {
      const playlist = await electronAPI.playlist.getById(playlistId)
      setSelectedPlaylist(playlist)
    } catch (error) {
      console.error('Error loading playlist:', error)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Playlists</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name"
            className="px-4 py-2 border rounded-lg flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
          />
          <button
            onClick={handleCreatePlaylist}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Playlist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelectPlaylist(playlist.id)}
                >
                  <h3 className="font-semibold text-lg mb-2">{playlist.name}</h3>
                  <p className="text-sm text-gray-600">
                    {playlist.items.length} item{playlist.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPlaylist && (
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">{selectedPlaylist.name}</h3>
              <button
                onClick={() => handleAddFile(selectedPlaylist.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Add File
              </button>
            </div>
            <div className="space-y-2">
              {selectedPlaylist.items.length === 0 ? (
                <p className="text-gray-500 text-sm">No items in this playlist</p>
              ) : (
                selectedPlaylist.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{index + 1}. </span>
                      <span className="text-sm">{item.type}</span>
                      {item.duration > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.duration}s)
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

