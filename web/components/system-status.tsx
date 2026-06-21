'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const THRESHOLD_MS = 30_000

export default function SystemStatus() {
  const [online, setOnline] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('service_heartbeat')
        .select('last_seen')
        .eq('service_name', 'forge')
        .maybeSingle()
      if (data?.last_seen) {
        const age = Date.now() - new Date(data.last_seen).getTime()
        setOnline(age < THRESHOLD_MS)
      } else {
        setOnline(false)
      }
      setChecking(false)
    }
    check()
    const interval = setInterval(check, 10_000)
    return () => clearInterval(interval)
  }, [])

  if (checking) return null

  return (
    <div className="flex items-center gap-2 border-t border-subtle px-4 py-2.5">
      <span className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-xs text-secondary">System {online ? 'Online' : 'Offline'}</span>
    </div>
  )
}
