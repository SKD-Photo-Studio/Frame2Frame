# 📜 Changelog Archive: SKD Photo Studio

## [v2.4.5] - 2026-05-04
### Core Enhancements & Data Quality
- **Data Sync & Importing**: Processed the master migration data accurately into the active Supabase instance, preventing duplication.
- **Client Management Fixes**: Eliminated duplicate client payments and made email addresses optional across both client and team profiles.
- **Advanced UI Sorting**: Added premium, interactive sort buttons in the Client, Event, and Team lists.
- **Default Sort Orders**: Configured Event list to default to Latest-to-Oldest, and Team list to default to descending total earnings/amounts.
- **Visual Table Alignment**: Overhauled transparent artist and output assignment tables in the Team Detail view to match the high-contrast card background style of the Event Detail view.

## [v2.4.4] - 2026-05-02
### Edge Optimization & Build Resilience
- **Excel Parser Support**: Added support for direct `ArrayBuffer` extraction using `Uint8Array` to enable client-side parsing of bulk data within Cloudflare Edge workers.
- **Middleware Integration**: Safeguarded the dashboard login redirect logic to resolve intermittent loop states.
- **Build Performance**: Enabled server minification and Webpack tree-shaking optimizations to drastically reduce build function footprints.
- **Environment Isolation**: Commented out unused R2 bucket bindings to resolve runtime build failures on Cloudflare Pages.

## [v2.4.3] - 2026-05-01
### Cloudflare Adaptation
- **Edge Deployment Prep**: Migrated all remaining API and page routes to Edge runtime (`export const runtime = 'edge';`).
- **Network Resilience**: Made the `API_BASE` endpoint resolution dynamic for robust server-side fetching directly on Edge instances.
- **Cookie & Session Extraction**: Optimized Edge cookie handling for authenticating cross-tenant data requests safely.

## [v2.4.2] - 2026-04-30 (Live)
### Production Hardening & Sync
- **Architectural Sync**: Introduced `GEMINI.md` for cross-agent (CLI/IDE) synchronization.
- **Security Audit**: Verified tenant isolation and strictly hardened `.gitignore` hygiene.
- **Git Tracking Clean-up**: Completely removed local-only documentation from being tracked in git repository.
- **CI/CD Security**: Disabled automatic production repository mirroring and switched to manual token-based deployment via GitHub Action (`mirror.yml`).
- **Modern Edge Runtime**: Switched to Cloudflare 2026-04-01 compatibility mode in `wrangler.toml`.
- **Project Structure**: Reorganized files into `public_docs/` and `local_docs/` for professional repository management.

## [v2.4.1] - 2026-04-29
### Next.js 16 Migration
- **Framework Upgrade**: Successfully migrated to Next.js 16.2.4 and React 19.
- **App Router Optimization**: Upgraded Server Actions and dynamic route handling.
- **Supabase SSR Transition**: Migrated to the new `@supabase/ssr` authentication package.

## [v2.3.4] - 2026-04-24
### Last Vercel Stable Release
- **Premium UI overhaul**: Branding refinements and security hardening.
- **Maintenance Mode**: Added global kill-switch and splash page.

## [v2.3.3] - 2026-04-23
- **Premium login**: UI state synchronization and branding propagation.

## [v2.3.2] - 2026-04-22
- **Management hardening**: Branding finalization and docs restructuring.

## [v2.3.0] - 2026-04-22
### Hardening & Production Push
- **Security Lockdown**: Removed all local development authentication bypass logic.
- **Documentation Restructure**: Consolidated project documentation into a 5-doc system.

## [v2.2.0] - 2026-04-21
### Hardened Financial Reporting
- **Excel Alignment Fix**: Standardized Artist Expense exports to prevent column shifting.
- **Role Auto-fill**: Added `Usual Role` field to team member profiles for automated form population.
- **Hardened Bulk Logic**: Case-insensitive lookups and automatic workspace enrollment.

## [v2.1.0] - 2026-04-21
### Financial Optimization
- **Centralized Math**: Refactored total/balance logic to use `calcBalance` utility.
- **Automated Reporting**: Integrated standard financial logic into `BulkController`.

## [v2.0.0] - 2026-04-21
### Initial Code Release (Frame2Frame)
- **Framework**: Transitioned from AppSheet to a full-code Express/Next.js stack.
- **UI Overhaul**: Glassmorphic calibration and Modal Portal implementation.
- **Automated Badges**: High-contrast payment status badges (Emerald/Green/Orange/Red).

## [v1.5] - AuditBook 2.0
### AppSheet Advanced
- Improved data validation and multi-table relationships.
- Introduced legacy financial tracking formulas.

## [v1.0] - AuditBook
### Initial MVP
- Created as a custom AppSheet application for studio auditing.

---
*Maintained by the SKD Photo Studio IT Department*
