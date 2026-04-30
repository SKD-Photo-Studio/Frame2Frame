# 📓 Local Changelog: SKD Photo Studio

This file tracks features and fixes currently in local development that have **not yet been pushed** to the development repository.

## [v2.7-Local] - 2026-04-30
### Current Progress: Production Hardening
- **Next.js 16/React 19 Audit**: Completed full architectural scan with Gemini CLI.
- **Tenant Isolation Hardening**: Refactored `getDefaultTenantId` in `supabase.server.ts` to support dynamic overrides.
- **Cloudflare Edge Sync**: Updated `wrangler.toml` to modern compatibility date (`2026-04-01`).
- **Documentation Overhaul**: Restructured project docs into Public (Git) and Private (Local) zones.
- **CLI Synchronization**: Established `GEMINI.md` as the source of truth for AI agents.

---
*Move these items to the public CHANGELOG.md upon git push.*
