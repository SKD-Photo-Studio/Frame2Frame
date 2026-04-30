# 🏗️ Frame2Frame — Unified Architecture

**Current Version:** v1.0.1 (Production Hardened)
**Tech Stack:** Next.js 16, React 19, Supabase SSR, Cloudflare Pages/R2
**Deployment Target:** Cloudflare

## 1. Core Architecture
Frame2Frame is a **Unified Monorepo**. All backend logic is integrated into `frontend/src/app/api` using Next.js API Routes.

- **Frontend**: Next.js 16.2.4 (App Router).
- **React**: React 19.0.0.
- **Backend**: Next.js API Routes (Edge Runtime).
- **Database**: Supabase (PostgreSQL) with RLS.
- **Storage**: Cloudflare R2 for studio assets.

## 2. Security & Multi-Tenancy
- **Isolation**: Every database record is scoped by `workspace_id`.
- **Authentication**: Managed via Supabase Auth + Next.js Middleware.
- **RBAC**: Readiness for Admin, Team, and Client roles is built into the API structure.

---

## 📜 Changelog (The Journey to v3.0.0)

### v3.0.0 (Current) — 2026-04-29
- **Cloudflare Launch Ready**: Switched from Vercel to Cloudflare Pages.
- **Unified Backend**: Successfully merged Express backend into Next.js API routes.
- **Doc Consolidation**: 13 docs reduced to 5 high-clarity pillars.
- **Hardened API**: Removed all Vercel-specific logic.

### v2.3.6.0 — 2026-04-24
- **Maintenance Mode**: Added global kill-switch and splash page.
- **Financial Hardening**: Automated Excel export column alignment.

### v2.0.0.0 — 2026-04-21
- **UI Overhaul**: Glassmorphic calibration and Modal Portal implementation.
