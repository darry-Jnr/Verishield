'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

type Status = 'online' | 'error' | 'no-network' | null

export default function SystemStatus() {
  const [status, setStatus] = useState<Status>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      try {
        const { data } = await supabase
          .from('service_heartbeat')
          .select('last_seen')
          .eq('service_name', 'forge')
          .maybeSingle()

        if (data?.last_seen) {
          const age = Date.now() - new Date(data.last_seen).getTime()
          setStatus(age < THRESHOLD_MS ? 'online' : 'error')
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('no-network')
      }
      setChecking(false)
    }
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (checking) return null

  return (
    <div className="flex w-full items-center gap-2.5 border-t border-subtle px-4 py-2.5">
      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
        {status === 'online' && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
        )}
        <span className={`relative h-2 w-2 rounded-full ${
          status === 'online' ? 'bg-green-500' : status === 'no-network' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      </span>
      <span className="text-xs text-secondary">
        {status === 'online' ? 'System Online' : status === 'no-network' ? 'No Network' : 'System Error'}
      </span>
    </div>
  )
}
