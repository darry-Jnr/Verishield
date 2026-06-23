'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Download, Pencil, Trash2, Image, Film, FileText, Check, Loader2, ChevronLeft, ChevronRight, ShieldCheck, Shield, Moon } from 'lucide-react'
import { type FileRecord, renameFile, deleteFile } from '@/lib/db'

const stripExt = (n: string) => n.replace(/\.[^.]+$/, '')

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

  const mediaFiles = files.filter((f) => f.type === 'image' || f.type === 'video')
  const currentIndex = file ? mediaFiles.findIndex((f) => f.id === file.id) : -1

  const goNext = useCallback(() => {
    if (currentIndex < mediaFiles.length - 1) {
      setRenaming(false)
      setConfirmDelete(false)
      onNavigate?.(mediaFiles[currentIndex + 1])
    }
  }, [currentIndex, mediaFiles, onNavigate])

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setRenaming(false)
      setConfirmDelete(false)
      onNavigate?.(mediaFiles[currentIndex - 1])
    }
  }, [currentIndex, mediaFiles, onNavigate])

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
      const ext = file.name.match(/\.[^.]+$/)?.[0] || ''
      const finalName = newName.trim().endsWith(ext) ? newName.trim() : newName.trim() + ext
      await renameFile(file.id, finalName)
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

  // Auto-download helper that drops the file directly into the browser tray instead of rendering it as code text
  const triggerAutoDownload = async (url: string, filename: string) => {
    try {
      const extFromUrl = url.match(/\.([^.?#]+)(?:[?#]|$)/)?.[1] || ''
      const finalName = filename.match(/\.[^.]+$/)
        ? filename
        : extFromUrl
          ? filename + '.' + extFromUrl
          : filename
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', finalName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      // Fallback if browser security rules reject the proxy fetch
      window.open(url, '_blank')
    }
  }

  // Dynamic system component UI styling based on current secure tracking workflow states
  const renderAIStatusWidget = () => {
    if (file.status === 'secured') {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400 font-medium text-xs">Protected</span>
        </div>
      )
    }
    if (file.status === 'processing') {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2.5">
          <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
          <Shield className="h-4 w-4 text-amber-400" />
          <span className="text-amber-400 font-medium text-xs">Protecting...</span>
        </div>
      )
    }
    return (
      <div className="flex items-center gap-2 rounded-xl bg-zinc-500/10 border border-zinc-500/20 px-3 py-2.5">
        <Moon className="h-4 w-4 text-zinc-400" />
        <span className="text-zinc-400 font-medium text-xs">Unprotected</span>
      </div>
    )
  }

  if (file.type === 'image') {
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < mediaFiles.length - 1

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl mx-4 rounded-2xl border border-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-subtle shrink-0">
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
                  <button onClick={handleRename} disabled={busy} className="text-primary hover:text-secondary transition-colors cursor-pointer">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-primary text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{stripExt(file.name)}</p>
                  {renderAIStatusWidget()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted text-[11px] tabular-nums">
                {currentIndex + 1} / {mediaFiles.length}
              </span>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-subtle bg-elevated text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Image area with nav buttons */}
          <div className="relative flex-1 bg-black/40 min-h-0 overflow-hidden">
            {hasPrev && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[3]" />
              </button>
            )}

            <img
              key={file.id}
              src={file.url}
              alt={file.name}
              className="h-full w-full object-cover transition-opacity duration-300"
              style={{
                opacity: 1,
                animation: 'fadeIn 0.3s ease',
              }}
            />

            {hasNext && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm cursor-pointer"
              >
                <ChevronRight className="h-6 w-6 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-subtle px-5 py-3 shrink-0">
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
                <button onClick={() => setConfirmDelete(true)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!renaming && (
                <button
                  onClick={() => { setNewName(stripExt(file.name)); setRenaming(true); setConfirmDelete(false) }}
                  className="btn-inverted text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
              )}
              <button
                onClick={() => triggerAutoDownload(file.url, file.name)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
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

  if (file.type === 'video') {
    const hasPrev = currentIndex > 0
    const hasNext = currentIndex < mediaFiles.length - 1

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl mx-4 rounded-2xl border border-subtle bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-subtle shrink-0">
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
                  <button onClick={handleRename} disabled={busy} className="text-primary hover:text-secondary transition-colors cursor-pointer">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <p className="text-primary text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{stripExt(file.name)}</p>
                  {renderAIStatusWidget()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted text-[11px] tabular-nums">
                {currentIndex + 1} / {mediaFiles.length}
              </span>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-subtle bg-elevated text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Video area with nav buttons */}
          <div className="relative flex-1 bg-black min-h-0 overflow-hidden">
            {hasPrev && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm cursor-pointer"
              >
                <ChevronLeft className="h-6 w-6 stroke-[3]" />
              </button>
            )}

            <video
              key={file.id}
              src={file.url}
              controls
              className="h-full w-full object-contain"
              style={{ animation: 'fadeIn 0.3s ease' }}
            />

            {hasNext && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-black/50 text-white hover:bg-black/70 transition-all backdrop-blur-sm cursor-pointer"
              >
                <ChevronRight className="h-6 w-6 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-subtle px-5 py-3 shrink-0">
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
                <button onClick={() => setConfirmDelete(true)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!renaming && (
                <button
                  onClick={() => { setNewName(stripExt(file.name)); setRenaming(true); setConfirmDelete(false) }}
                  className="btn-inverted text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
              )}
              <button
                onClick={() => triggerAutoDownload(file.url, file.name)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
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
          <div className="flex items-center gap-3">
            <span className="text-primary font-medium">File Details</span>
            {renderAIStatusWidget()}
          </div>
          <button onClick={onClose} className="text-muted hover:text-primary transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
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
              <button onClick={() => setConfirmDelete(true)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!renaming && (
              <button onClick={() => { setNewName(stripExt(file.name)); setRenaming(true); setConfirmDelete(false) }} className="btn-inverted text-xs cursor-pointer">
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
            )}
            <button 
              onClick={() => triggerAutoDownload(file.url, file.name)} 
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}