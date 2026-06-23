# Verishield

**Brand protection platform** — watermark digital assets with invisible tracking IDs, crawl the web for unauthorized use, and get AI-powered impact summaries.

## Architecture

Three independent services:

| Service | Stack | Role |
|---------|-------|------|
| **Web** (`web/`) | Next.js 16, React 19, Tailwind CSS 4, Supabase | Dashboard UI + scanner API |
| **Forge** (`engine/`) | Python, Pillow, Mutagen, piexif | Watches for new uploads, embeds tracking IDs in EXIF/metadata |
| **Test Shop** (`test-shop/`) | FastAPI, Supabase | Fake storefront for end-to-end scanner testing |

**Database:** Supabase (PostgreSQL) with RLS — `folders`, `files`, `scan_results`, `service_heartbeat`, `system_incidents`.

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- A Supabase project
- A Google Gemini API key

### 1. Database

Run `supabase-setup.sql` and `supabase-scanner.sql` in your Supabase SQL Editor.

### 2. Web App

```bash
cd web
cp .env.local.example .env.local   # fill in your Supabase + Gemini keys
npm install
npm run dev                         # → http://localhost:3000
```

### 3. Forge Worker

```bash
cd engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python forge/worker.py
```

Polls every 5s for files with `status = 'processing'`, stamps them with a tracking ID (`AG-XXXXXXXX`), and re-uploads.

### 4. Test Shop (optional)

```bash
cd test-shop
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload --port 8000
```

## Workflow

1. **Upload** media assets into named folders via the dashboard
2. **Forge** automatically watermark each file with a unique tracking ID
3. **Scan** — trigger a scan via the dashboard or `POST /api/scan`; the crawler fetches pre-configured domains, downloads images, reads their EXIF, and matches tracking IDs against your database
4. **Review** alerts in the dashboard with AI-generated impact summaries

## Environment Variables

### Web (`web/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `GROQ_API_KEY` / `GEMINI_API_KEY` | For AI summaries (Gemini) |

### Engine (`engine/.env`)
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `GEMINI_API_KEY` | Google Gemini API key |

## Project Structure

```
web/                  Next.js app — dashboard pages, API routes, scanner engine
engine/               Python forge worker — watermarking pipeline
test-shop/            FastAPI test storefront
supabase-setup.sql    Main database schema
supabase-scanner.sql  Scan results table schema
```
