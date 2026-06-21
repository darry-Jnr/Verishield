'use client'

import { useRef, useEffect, useState } from 'react'
import { Play } from 'lucide-react'

export default function VideoThumbnail({ src, alt }: { src: string; alt: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [thumb, setThumb] = useState<string | null>(null)

  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    let removed = false

    const onLoaded = () => {
      if (removed) return
      el.currentTime = 1
    }

    const onSeeked = () => {
      if (removed) return
      try {
        const canvas = document.createElement('canvas')
        canvas.width = el.videoWidth
        canvas.height = el.videoHeight
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(el, 0, 0, canvas.width, canvas.height)
        setThumb(canvas.toDataURL('image/jpeg', 0.4))
      } catch {
        setFailed(true)
      }
    }

    el.addEventListener('loadeddata', onLoaded)
    el.addEventListener('seeked', onSeeked)

    return () => {
      removed = true
      el.removeEventListener('loadeddata', onLoaded)
      el.removeEventListener('seeked', onSeeked)
    }
  }, [src])

  return (
    <div className="absolute inset-0">
      {!thumb && !failed && <video ref={videoRef} src={src} crossOrigin="anonymous" preload="metadata" muted className="hidden" />}
      {thumb ? (
        <>
          <img src={thumb} alt={alt} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 border-2 border-white/30 backdrop-blur-sm">
              <Play className="h-5 w-5 text-white ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <div className="h-full w-full bg-zinc-900/50 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 border-2 border-white/30">
            <Play className="h-5 w-5 text-white ml-0.5" />
          </div>
        </div>
      )}
    </div>
  )
}
