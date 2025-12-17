import { useEffect, useRef, useState } from 'react'
import { useInterval } from '../../hooks/useInterval'
import { usePlayerStore } from '../../store/playerStore'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker source for PDF.js
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

interface PDFRendererProps {
  src: string
  duration: number // Duration per page in seconds
  pageCount?: number
  onLoad: () => void
  onError: () => void
}

/**
 * PDF Renderer - Renders PDF pages as canvas
 * Each page is displayed for the specified duration
 */
export function PDFRenderer({
  src,
  duration,
  pageCount = 1,
  onLoad,
  onError,
}: PDFRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        // Fetch PDF as array buffer
        const response = await fetch(src)
        const arrayBuffer = await response.arrayBuffer()

        // Load PDF document
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        setPdfDoc(pdf)
        setCurrentPage(1)
        setIsReady(true)
        onLoad()
      } catch (error) {
        console.error('Error loading PDF:', error)
        onError()
      }
    }

    loadPDF()
  }, [src, onLoad, onError])

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage)
        const canvas = canvasRef.current!
        const context = canvas.getContext('2d')!

        const viewport = page.getViewport({ scale: 2.0 })

        canvas.height = viewport.height
        canvas.width = viewport.width

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        }

        await page.render(renderContext).promise
      } catch (error) {
        console.error('Error rendering PDF page:', error)
      }
    }

    renderPage()
  }, [pdfDoc, currentPage])

  // Auto-advance pages
  useInterval(
    () => {
      if (isReady && pdfDoc) {
        const nextPage = currentPage + 1
        if (nextPage <= pageCount && nextPage <= pdfDoc.numPages) {
          setCurrentPage(nextPage)
        } else {
          // Finished all pages, advance to next playlist item
          usePlayerStore.getState().next()
        }
      }
    },
    isReady ? duration * 1000 : null
  )

  if (!isReady) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white">
        <p>Loading PDF...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  )
}

