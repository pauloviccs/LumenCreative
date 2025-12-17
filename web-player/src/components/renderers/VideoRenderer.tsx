import { useEffect, useRef } from 'react'

interface VideoRendererProps {
  src: string
  onCanPlay: () => void
  onError: () => void
}

/**
 * Video Renderer - Uses HTML5 video tag
 * Cleanup is handled by Engine component
 */
export function VideoRenderer({ src, onCanPlay, onError }: VideoRendererProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.src = src
    video.load()

    const handleCanPlay = () => {
      video.play().catch((error) => {
        console.error('Error playing video:', error)
        onError()
      })
      onCanPlay()
    }

    const handleError = () => {
      console.error('Video error:', video.error)
      onError()
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.pause()
      video.src = ''
      video.load()
    }
  }, [src, onCanPlay, onError])

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-contain"
      autoPlay
      muted
      playsInline
      style={{ display: 'block' }}
    />
  )
}

