import { NextResponse } from 'next/server'
import { detectAll } from '@/lib/engine/detector'

export async function POST() {
  try {
    await detectAll()
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 },
    )
  }
}
