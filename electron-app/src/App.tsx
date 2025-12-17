import { useState } from 'react'
import { Screens } from './components/Screens'
import { Playlists } from './components/Playlists'

type Tab = 'screens' | 'playlists'

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('screens')

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">DS-System Dashboard</h1>
        </div>
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('screens')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'screens'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Screens
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'playlists'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Playlists
          </button>
        </div>
      </nav>

      <main>
        {activeTab === 'screens' && <Screens />}
        {activeTab === 'playlists' && <Playlists />}
      </main>
    </div>
  )
}

export default App
