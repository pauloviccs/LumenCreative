import { useEffect, useState } from 'react'

interface ImageRendererProps {
  src: string
  onLoad: () => void
  onError: () => void
}

/**
 * Image Renderer - Uses HTML img tag
 * Cleanup is handled by Engine component
 */
export function ImageRenderer({ src, onLoad, onError }: ImageRendererProps) {
  const [imageSrc, setImageSrc] = useState(src)

  useEffect(() => {
    setImageSrc(src)
  }, [src])

  const handleLoad = () => {
    onLoad()
  }

  const handleError = () => {
    console.error('Image load error')
    onError()
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={imageSrc}
        alt=""
        className="max-w-full max-h-full object-contain"
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: 'block' }}
      />
    </div>
  )
}

