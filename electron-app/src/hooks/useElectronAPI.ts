import { useEffect, useState } from 'react'

export function useElectronAPI() {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    setIsAvailable(typeof window !== 'undefined' && !!window.electronAPI)
  }, [])

  if (!isAvailable) {
    throw new Error('Electron API not available. This app must run in Electron.')
  }

  return window.electronAPI
}

