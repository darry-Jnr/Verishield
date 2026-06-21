'use client'

import { useState } from 'react'
import { X, FolderPlus, Check, Loader2 } from 'lucide-react'
import { createFolder } from '@/lib/db'

interface CreateFolderModalProps {
  open: boolean
  onClose: () => void
  onCreate?: () => void
}

export default function CreateFolderModal({ open, onClose, onCreate }: CreateFolderModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [campaign, setCampaign] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!title) return
    setBusy(true)
    try {
      await createFolder(title, date, description, brand || undefined, campaign || undefined)
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setDescription('')
      setBrand('')
      setCampaign('')
      onCreate?.()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setBrand('')
    setCampaign('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="surface w-full max-w-md rounded-2xl border border-subtle shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-subtle">
          <div className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">New Folder</span>
          </div>
          <button onClick={handleCancel} className="text-muted hover:text-primary transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <label className="text-muted mb-1.5 block text-xs">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Collection"
              className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-muted mb-1.5 block text-xs">
              Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-muted mb-1.5 block text-xs">
              Description <span className="text-muted/50">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any notes about this folder..."
              className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-muted mb-1.5 block text-xs">
                Brand <span className="text-muted/50">(optional)</span>
              </label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Nike"
                className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-muted mb-1.5 block text-xs">
                Campaign <span className="text-muted/50">(optional)</span>
              </label>
              <input
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                placeholder="e.g. Summer 2026"
                className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-subtle px-6 py-4">
          <button onClick={handleCancel} className="btn-inverted text-sm">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={!title || busy}
            className="btn-primary text-sm disabled:opacity-40"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {busy ? 'Creating...' : 'Create Folder'}
          </button>
        </div>
      </div>
    </div>
  )
}
