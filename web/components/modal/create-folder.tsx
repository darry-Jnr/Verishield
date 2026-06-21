'use client'

import { useState } from 'react'
import { X, FolderPlus, Check, Loader2, DollarSign } from 'lucide-react'
import { createFolder } from '@/lib/db'

interface CreateFolderModalProps {
  open: boolean
  onClose: () => void
  onCreate?: () => void
}

export default function CreateFolderModal({ open, onClose, onCreate }: CreateFolderModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!title) return
    setBusy(true)
    try {
      await createFolder(
        title,
        date,
        category || undefined,
        category === 'Product' && price ? parseFloat(price) : undefined,
      )
      setTitle('')
      setDate(new Date().toISOString().split('T')[0])
      setCategory('')
      setPrice('')
      onCreate?.()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setDate(new Date().toISOString().split('T')[0])
    setCategory('')
    setPrice('')
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
              Category <span className="text-muted/50">(optional)</span>
            </label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); if (e.target.value !== 'Product') setPrice('') }}
              className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary outline-none focus:border-zinc-600 transition-colors appearance-none"
            >
              <option value="">None</option>
              <option value="Video">Video — for content creators / ads</option>
              <option value="Product">Product — for ecommerce</option>
            </select>
          </div>

          {category === 'Product' && (
            <div>
              <label className="text-muted mb-1.5 block text-xs">
                Price <span className="text-muted/50">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="elevated w-full rounded-lg border border-subtle pl-9 pr-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>
          )}
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
