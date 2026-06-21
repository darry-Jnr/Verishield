'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Pencil, Trash2, Image, Film, FileText, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { type FileRecord, renameFile, deleteFile } from '@/lib/db'

interface FileDetailModalProps {
  open: boolean
  file: FileRecord | null
  files: FileRecord[]
  onClose: () => void
  onDeleted: () => void
  onRenamed: () => void
  onNavigate?: (file: FileRecord) => void
}

const typeIcon: Record<string, typeof Image> = { image: Image, video: Film, document: FileText, application: FileText }

export default function FileDetailModal({ open, file, files, onClose, onDeleted, onRenamed, onNavigate }: FileDetailModalProps) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  const imageFiles = files.filter((f) => f.type === 'image')
  const currentIndex = file ? imageFiles.findIndex((f) => f.id === file.id) : -1

  const goNext = useCallback(() => {
    if (currentIndex < imageFiles.length - 1) {
      setRenaming(false)
      setConfirmDelete(false)
      onNavigate?.(imageFiles[currentIndex + 1])
    }
  }, [currentIndex, imageFiles, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setRenaming(false)
      setConfirmDelete(false)
      onNavigate?.(imageFiles[currentIndex - 1])
    }
  }, [currentIndex, imageFiles, onNavigate])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, goPrev, goNext, onClose])

  if (!open || !file) return null

  const FileIcon = typeIcon[file.type as keyof typeof typeIcon] || FileText

  const handleRename = async () => {
    if (!newName.trim()) return
    setBusy(true)
    try {
      await renameFile(file.id, newName.trim())
      setRenaming(false)
      onRenamed()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async () => {
    setBusy(true)
    try {
      await deleteFile(file)
      onDeleted()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  if (file.type === 'image') {
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < imageFiles.length - 1

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl mx-4 rounded-2xl border border-subtle bg-surface shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-subtle">
            <div className="flex items-center gap-3 min-w-0">
              {renaming ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="elevated rounded-lg border border-subtle px-3 py-1.5 text-xs text-primary outline-none focus:border-zinc-600 w-40"
                    autoFocus
                  />
                  <button onClick={handleRename} disabled={busy} className="text-primary hover:text-secondary transition-colors">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <p className="text-primary text-sm font-medium truncate max-w-[200px] sm:max-w-sm">{file.name}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted text-[11px] tabular-nums">
                {currentIndex + 1} / {imageFiles.length}
              </span>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-subtle bg-elevated text-muted hover:text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Image area with nav buttons */}
          <div className="relative flex items-center justify-center bg-black/40 min-h-[300px] sm:min-h-[400px] max-h-[60vh]">
            {hasPrev && (
              <button
                onClick={goPrev}
                className="absolute left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <img
              key={file.id}
              src={file.url}
              alt={file.name}
              className="max-h-full max-w-full object-contain p-4 transition-opacity duration-300"
              style={{
                opacity: 1,
                animation: 'fadeIn 0.3s ease',
              }}
            />

            {hasNext && (
              <button
                onClick={goNext}
                className="absolute right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 hover:bg-black/70 hover:text-white transition-all backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-subtle px-5 py-3">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmDelete(false)} disabled={busy} className="btn-inverted text-xs">Cancel</button>
                  <button onClick={handleDelete} disabled={busy} className="btn-danger text-xs">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    {busy ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!renaming && (
                <button
                  onClick={() => { setNewName(file.name); setRenaming(true); setConfirmDelete(false) }}
                  className="btn-inverted text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
              )}
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="surface w-full max-w-lg rounded-2xl border border-subtle shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-subtle">
          <span className="text-primary font-medium">File Details</span>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-subtle">
              <FileIcon className="h-16 w-16 text-white/20" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {renaming ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                      className="elevated w-full rounded-lg border border-subtle px-3 py-1.5 text-sm text-primary outline-none focus:border-zinc-600 transition-colors"
                      autoFocus
                    />
                    <button onClick={handleRename} disabled={busy} className="btn-primary text-xs px-2 py-1.5">
                      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <p className="text-primary text-sm font-medium truncate">{file.name}</p>
                )}
                <p className="text-muted text-xs mt-0.5">{file.size}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="elevated rounded-lg border border-subtle px-3 py-2">
                <p className="text-muted">Type</p>
                <p className="text-primary font-medium capitalize">{file.type}</p>
              </div>
              <div className="elevated rounded-lg border border-subtle px-3 py-2">
                <p className="text-muted">Status</p>
                <p className={`font-medium capitalize ${file.status === 'secured' ? 'text-emerald-500' : file.status === 'processing' ? 'text-amber-500' : 'text-muted'}`}>
                  {file.status}
                </p>
              </div>
              {file.tracking_id && (
                <div className="elevated rounded-lg border border-subtle px-3 py-2 col-span-2">
                  <p className="text-muted">Tracking ID</p>
                  <p className="text-primary font-mono text-[11px] mt-0.5">{file.tracking_id}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-subtle px-6 py-4">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setConfirmDelete(false)} disabled={busy} className="btn-inverted text-xs">Cancel</button>
                <button onClick={handleDelete} disabled={busy} className="btn-danger text-xs">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  {busy ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!renaming && (
              <button onClick={() => { setNewName(file.name); setRenaming(true); setConfirmDelete(false) }} className="btn-inverted text-xs">
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            )}
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs">
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
