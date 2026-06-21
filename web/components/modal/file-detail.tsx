'use client'

import { useState } from 'react'
import { X, Download, Pencil, Trash2, Image, Film, FileText, Check, Loader2 } from 'lucide-react'
import { type FileRecord, renameFile, deleteFile } from '@/lib/db'

interface FileDetailModalProps {
  open: boolean
  file: FileRecord | null
  onClose: () => void
  onDeleted: () => void
  onRenamed: () => void
}

const typeIcon: Record<string, typeof Image> = { image: Image, video: Film, document: FileText, application: FileText }

export default function FileDetailModal({ open, file, onClose, onDeleted, onRenamed }: FileDetailModalProps) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

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
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
        <div className="relative max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              {renaming ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="bg-black/60 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white outline-none focus:border-white/30 w-48"
                    autoFocus
                  />
                  <button onClick={handleRename} disabled={busy} className="text-white/70 hover:text-white text-xs">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  </button>
                </div>
              ) : (
                <p className="text-white/90 text-sm font-medium truncate">{file.name}</p>
              )}
              <span className="text-white/40 text-xs">{file.size}</span>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center justify-center flex-1 min-h-0 bg-black/40 rounded-2xl overflow-hidden">
            <img src={file.url} alt={file.name} className="max-h-full max-w-full object-contain" />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => setConfirmDelete(false)} disabled={busy} className="text-white/50 hover:text-white text-xs transition-colors">Cancel</button>
                  <button onClick={handleDelete} disabled={busy} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors">
                    {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Delete
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-white/40 hover:text-red-400 text-xs flex items-center gap-1.5 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!renaming && (
                <button onClick={() => { setNewName(file.name); setRenaming(true); setConfirmDelete(false) }} className="text-white/50 hover:text-white text-xs flex items-center gap-1 transition-colors">
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
              )}
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-white/90 hover:text-white text-xs flex items-center gap-1 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-all">
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            </div>
          </div>
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
