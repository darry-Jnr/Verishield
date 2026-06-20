'use client'

import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'

interface Toast {
  id: number
  message: string
  type?: 'success' | 'alert'
}

let toastId = 0
const listeners: ((t: Toast) => void)[] = []

export function showToast(message: string, type: 'success' | 'alert' = 'success') {
  const t = { id: ++toastId, message, type }
  listeners.forEach((fn) => fn(t))
}

export default function Toast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t])
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id))
      }, 4000)
    }
    listeners.push(handler)
    return () => { listeners.splice(listeners.indexOf(handler), 1) }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`surface flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl animate-in slide-in-from-right ${
            t.type === 'alert' ? 'border-red-500/30' : 'border-emerald-500/30'
          }`}
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
            t.type === 'alert' ? 'bg-red-500/10' : 'bg-emerald-500/10'
          }`}>
            {t.type === 'alert' ? (
              <X className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            )}
          </div>
          <p className="text-primary text-sm">{t.message}</p>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
