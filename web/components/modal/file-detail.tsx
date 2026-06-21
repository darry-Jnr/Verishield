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
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          className="relative flex flex-col items-center justify-center w-full h-full select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/40 to-transparent">
            <div className="flex items-center gap-3 min-w-0">
              {renaming ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="bg-black/60 rounded-lg border border-white/10 px-3 py-1 text-xs text-white outline-none focus:border-white/30 w-40"
                    autoFocus
                  />
                  <button onClick={handleRename} disabled={busy} className="text-white/70 hover:text-white transition-colors">
                    {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <p className="text-white/60 text-xs font-medium truncate max-w-[200px] sm:max-w-sm">{file.name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/30 text-[11px] tabular-nums">
                {currentIndex + 1} / {imageFiles.length}
              </span>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Prev click zone */}
          {hasPrev && (
            <button
              onClick={goPrev}
              className="absolute left-0 top-0 bottom-0 z-10 w-1/4 flex items-center justify-start pl-4 sm:pl-8 text-white/0 hover:text-white/40 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                <ChevronLeft className="h-6 w-6" />
              </div>
            </button>
          )}

          {/* Next click zone */}
          {hasNext && (
            <button
              onClick={goNext}
              className="absolute right-0 top-0 bottom-0 z-10 w-1/4 flex items-center justify-end pr-4 sm:pr-8 text-white/0 hover:text-white/40 transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
                <ChevronRight className="h-6 w-6" />
              </div>
            </button>
          )}

          {/* Image */}
          <div className="relative flex items-center justify-center w-full h-full p-16 sm:p-20 animate-in fade-in zoom-in-95 duration-300">
            <img
              key={file.id}
              src={file.url}
              alt={file.name}
              className="max-h-full max-w-full rounded-lg object-contain transition-all duration-200"
              style={{ boxShadow: '0 0 60px rgba(0,0,0,0.4)' }}
            />
          </div>

          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/40 to-transparent pt-12 pb-4 sm:pb-6">
            <div className="flex items-center justify-center gap-4 px-4">
              <button
                onClick={() => { setConfirmDelete(true) }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>

              {!renaming && (
                <button
                  onClick={() => { setNewName(file.name); setRenaming(true); setConfirmDelete(false) }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/30 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}

              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-1.5 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          </div>

          {/* Delete confirmation overlay */}
          {confirmDelete && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
              <div className="surface rounded-2xl border border-subtle p-6 max-w-xs w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <p className="text-primary text-sm font-medium text-center">Delete this file?</p>
                <p className="text-muted text-xs text-center mt-1">This cannot be undone.</p>
                <div className="flex items-center justify-center gap-3 mt-5">
                  <button onClick={() => setConfirmDelete(false)} disabled={busy} className="btn-inverted text-xs">Cancel</button>
                  <button onClick={handleDelete} disabled={busy} className="btn-danger text-xs">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
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
