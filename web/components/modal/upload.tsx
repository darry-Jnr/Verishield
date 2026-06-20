'use client'

import { useState } from 'react'
import { Upload, X, Image, Film, FileText, Shield, Check } from 'lucide-react'

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onRegister?: () => void
}

const fileIcons: Record<string, typeof Image> = {
  'image': Image,
  'video': Film,
  'application': FileText,
}

export default function UploadModal({ open, onClose, onRegister }: UploadModalProps) {
  const [step, setStep] = useState<'files' | 'details' | 'review'>('files')
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)

  const [form, setForm] = useState({
    productName: '',
    brand: '',
    category: '',
    campaign: '',
    description: '',
  })

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

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleRegister = () => {
    setForm({ productName: '', brand: '', category: '', campaign: '', description: '' })
    setFiles([])
    setStep('files')
    onRegister?.()
    onClose()
  }

  const reset = () => {
    setForm({ productName: '', brand: '', category: '', campaign: '', description: '' })
    setFiles([])
    setStep('files')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="surface w-full max-w-xl rounded-2xl border border-subtle shadow-2xl overflow-hidden">
        {/* Steps indicator */}
        <div className="flex items-center gap-1.5 border-b border-subtle px-6 pt-4 pb-3">
          {(['files', 'details', 'review'] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium transition-colors ${
                step === s ? 'bg-white text-black ring-1 ring-white/20' : 'bg-zinc-800 text-muted'
              }`}>
                {i + 1}
              </div>
              <span className={`text-xs capitalize ${step === s ? 'text-primary font-medium' : 'text-muted'}`}>
                {s === 'files' ? 'Media' : s}
              </span>
              {i < 2 && <span className="text-muted/30 mx-1 text-xs">—</span>}
            </div>
          ))}
        </div>

        <div className="p-6 sm:p-8">
          {/* Step 1: Upload files */}
          {step === 'files' && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-primary text-lg font-medium">Upload Media</h2>
                  <p className="text-muted mt-0.5 text-sm">Drop your product images, videos, or documents.</p>
                </div>
                <button onClick={reset} className="text-muted hover:text-primary transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

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
                          <p className="text-primary text-sm truncate">{f.name}</p>
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

              <div className="mt-8 flex items-center justify-between">
                <button onClick={reset} className="btn-inverted text-sm">Cancel</button>
                <button
                  onClick={() => setStep('details')}
                  disabled={files.length === 0}
                  className="btn-primary text-sm disabled:opacity-40"
                >
                  Continue — Add Details
                </button>
              </div>
            </>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-primary text-lg font-medium">Asset Details</h2>
                  <p className="text-muted mt-0.5 text-sm">Describe this product media.</p>
                </div>
                <button onClick={reset} className="text-muted hover:text-primary transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 block text-xs">Product Name</label>
                    <input
                      value={form.productName}
                      onChange={update('productName')}
                      placeholder="e.g. Summer Collection Hero Shot"
                      className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-muted mb-1.5 block text-xs">Brand</label>
                    <input
                      value={form.brand}
                      onChange={update('brand')}
                      placeholder="e.g. Nike, Acme Brands"
                      className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-muted mb-1.5 block text-xs">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-secondary outline-none focus:border-zinc-600 transition-colors appearance-none"
                    >
                      <option value="" disabled>Select category</option>
                      <option value="hero">Hero Image</option>
                      <option value="lookbook">Lookbook</option>
                      <option value="campaign">Campaign</option>
                      <option value="product">Product Shot</option>
                      <option value="video">Video / Ad</option>
                      <option value="collateral">Collateral</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted mb-1.5 block text-xs">Campaign / Collection</label>
                    <input
                      value={form.campaign}
                      onChange={update('campaign')}
                      placeholder="e.g. Spring 2026"
                      className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-muted mb-1.5 block text-xs">Description <span className="text-muted/50">(optional)</span></label>
                  <textarea
                    value={form.description}
                    onChange={update('description')}
                    rows={3}
                    placeholder="Any notes about this asset..."
                    className="elevated w-full rounded-lg border border-subtle px-4 py-2.5 text-sm text-primary placeholder-muted outline-none focus:border-zinc-600 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep('files')} className="btn-inverted text-sm">Back</button>
                <button
                  onClick={() => setStep('review')}
                  disabled={!form.productName || !form.brand || !form.category}
                  className="btn-primary text-sm disabled:opacity-40"
                >
                  Continue — Review
                </button>
              </div>
            </>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-primary text-lg font-medium">Review & Register</h2>
                  <p className="text-muted mt-0.5 text-sm">Confirm everything looks right.</p>
                </div>
                <button onClick={reset} className="text-muted hover:text-primary transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="elevated space-y-3 rounded-xl border border-subtle p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Product', value: form.productName },
                    { label: 'Brand', value: form.brand },
                    { label: 'Category', value: form.category },
                    { label: 'Campaign', value: form.campaign || '—' },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-muted text-xs">{f.label}</p>
                      <p className="text-primary text-sm truncate mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                {form.description && (
                  <div className="border-t border-subtle pt-3">
                    <p className="text-muted text-xs">Description</p>
                    <p className="text-primary text-sm mt-0.5">{form.description}</p>
                  </div>
                )}
                {files.length > 0 && (
                  <div className="border-t border-subtle pt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-500 font-medium">{files.length} file{files.length !== 1 ? 's' : ''} attached</span>
                    </div>
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted pl-6">
                        {f.type.startsWith('image') ? (
                          <div className="h-6 w-6 shrink-0 overflow-hidden rounded bg-zinc-800">
                            <img src={URL.createObjectURL(f)} alt="" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button onClick={() => setStep('details')} className="btn-inverted text-sm">Back</button>
                <button onClick={handleRegister} className="btn-primary text-sm">
                  <Check className="h-4 w-4" />
                  Register Asset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
