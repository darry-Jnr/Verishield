'use client'

import { useState } from 'react'
import { Upload, X, Image, Film, FileText, Loader2 } from 'lucide-react'
import { uploadFiles } from '@/lib/db'

const stripExt = (n: string) => n.replace(/\.[^.]+$/, '')

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onUpload?: () => void
  folderId?: number
}

const fileIcons: Record<string, typeof Image> = {
  image: Image,
  video: Film,
  application: FileText,
}

export default function UploadModal({ open, onClose, onUpload, folderId }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  if (!open) return null

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)])
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
  }

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const waitForSecured = async (folderId: number, retries = 30): Promise<void> => {
    const { getFiles } = await import('@/lib/db')
    for (let i = 0; i < retries; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      const files = await getFiles(folderId)
      if (files.length > 0 && files.every((f) => f.status !== 'processing')) return
      setStatusMessage(`Stamping asset${i < 3 ? '...' : '... still working'}`)
    }
    setStatusMessage('Stamping complete')
  }

  const handleAdd = async () => {
    if (!folderId || files.length === 0) return
    setBusy(true)
    setStatusMessage('')
    try {
      await uploadFiles(
        folderId,
        files.map((f) => ({
          file: f,
          name: f.name,
          type: f.type,
          size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
        })),
      )
      setStatusMessage('Uploaded — waiting for Forge to stamp...')
      await waitForSecured(folderId)
      setFiles([])
      setStatusMessage('')
      onUpload?.()
      onClose()
    } catch (e) {
      console.error(e)
      setStatusMessage('Upload failed. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const reset = () => {
    setFiles([])
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="surface w-full max-w-xl rounded-2xl border border-subtle shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
          <h2 className="text-primary text-lg font-medium">Upload Media</h2>
          <button onClick={reset} className="text-muted hover:text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`elevated flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-14 transition-all ${
              dragging ? 'border-zinc-400 bg-zinc-800/50 scale-[1.01]' : 'border-zinc-700 hover:border-zinc-500'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <div className={`elevated mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform ${dragging ? 'scale-110' : ''}`}>
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-secondary text-sm font-medium">Drop files here or click to browse</p>
            <p className="text-muted mt-1 text-xs">JPEG, PNG, MP4, PDF — up to 50 MB each</p>
            <input id="file-input" type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={handleFileInput} />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {files.map((f, i) => {
                const type = f.type.split('/')[0]
                const Icon = fileIcons[type] || FileText
                const isImage = type === 'image'
                return (
                  <div key={i} className="elevated flex items-center gap-3 rounded-lg border border-subtle px-3 py-2.5 group/file">
                    {isImage ? (
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                        <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="elevated flex h-9 w-9 shrink-0 items-center justify-center rounded-md">
                        <Icon className="h-4 w-4 text-secondary" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-primary text-sm truncate">{stripExt(f.name)}</p>
                      <p className="text-muted text-xs">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-muted hover:text-primary shrink-0 opacity-0 group-hover/file:opacity-100 transition-all">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {statusMessage && (
            <p className="mt-4 text-center text-xs text-emerald-500 font-medium">{statusMessage}</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-subtle px-6 py-4">
          <button onClick={reset} className="btn-inverted text-sm">Cancel</button>
          <button
            onClick={handleAdd}
            disabled={files.length === 0 || busy}
            className="btn-primary text-sm disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
