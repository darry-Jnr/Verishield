import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const engineDir = path.resolve(process.cwd(), '../../engine')
    const venvPython = path.resolve(process.cwd(), '../test-shop/.venv/bin/python3')
    const pythonBin = fs.existsSync(venvPython) ? venvPython : 'python3'

    const result = execSync(
      `${pythonBin} -m scraper.cli`,
      {
        cwd: engineDir,
        timeout: 120_000,
        env: { ...process.env },
        encoding: 'utf-8',
      }
    )
    return NextResponse.json({ ok: true, output: result })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message, stderr: err.stderr || '' },
      { status: 500 }
    )
  }
}
