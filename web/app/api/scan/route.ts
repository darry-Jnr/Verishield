import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

function findUp(start: string, relativePath: string): string | null {
  let dir = start
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, relativePath))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

export async function POST() {
  try {
    const cwd = process.cwd()

    const repoRoot = findUp(cwd, 'engine/scraper/cli.py')
    if (!repoRoot) {
      return NextResponse.json(
        { ok: false, error: 'Engine directory not found' },
        { status: 500 }
      )
    }

    const engineDir = path.join(repoRoot, 'engine')
    const venvPython = path.join(repoRoot, 'test-shop/.venv/bin/python3')
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
