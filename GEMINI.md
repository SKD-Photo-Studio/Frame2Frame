# 🧠 GEMINI_CLI: ARCHITECTURAL SOURCE OF TRUTH

## Project Context
- **Name**: Frame2Frame Studio Management
- **Owner**: SKD Photo Studio
- **Stack**: Next.js 16.2.4 (App Router), React 19, TypeScript, Supabase SSR.
- **Infrastructure**: Cloudflare Pages (Hosting), Supabase (Database), Cloudflare R2 (Storage - Planned).

## Core Conventions
- **Multi-Tenancy**: Currently optimized for **Single-Studio (SKD)**.
- **Tenant Isolation**: Enforced via `tenant_id` column in all tables. Logic is centralized in `src/lib/supabase.server.ts` -> `getDefaultTenantId()`.
- **Authentication**: Managed via `@supabase/ssr`. Cookies are processed through the `createServerSupabaseClient` utility.

## Deployment Status
- **Target**: Cloudflare Pages via Git-based CI/CD.
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## Security Protocols
- **Secrets**: Strictly isolated to `.env.local` (Git-ignored).
- **Internal Specs**: `IT_DEPARTMENT_SETUP_PLAN.md` and `RBAC_IMPLEMENTATION_PLAN.md` are Git-ignored.
- **Public Docs**: `CHANGELOG.md` and `README.md` are public-facing.

## CLI Interaction
- **Workspace Root**: Use `frontend/` as the primary directory for code queries.
- **Restricted Models**: Never use `gemini-3.1-pro-preview` unless explicitly requested.
- **Heavy Task Preference**: 
  1. `gemini-2.5-pro`
  2. `gemini-3-flash-preview`
  3. `gemini-3.1-flash-lite-preview`
  4. `gemini-2.5-flash`
  5. `gemini-2.5-flash-lite`
- **Standard/Other Task Preference**: 
  1. `gemini-3.1-flash-lite-preview`
  2. `gemini-2.5-flash`
  3. `gemini-3-flash-preview`
  4. `gemini-2.5-flash-lite`
  5. `gemini-2.5-pro`
