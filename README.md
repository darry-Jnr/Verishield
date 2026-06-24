# Auraguard

**Brand protection platform** — watermark digital assets with invisible tracking IDs, crawl the web for unauthorized use, and get AI-powered impact summaries.

Three services work together:

1. **Web** — dashboard for uploading assets, triggering scans, and reviewing alerts
2. **Forge** — automatically watermarks each upload with a unique tracking ID embedded in metadata
3. **Test Shop** — a fake storefront used to verify the scanner works end-to-end

### Workflow

1. **Upload** media assets into folders via the dashboard
2. **Forge** automatically stamps each file with a unique tracking ID
3. **Scan** — the crawler checks configured domains, downloads images, reads their metadata, and matches tracking IDs against the database
4. **Review** alerts in the dashboard with AI-generated impact summaries
