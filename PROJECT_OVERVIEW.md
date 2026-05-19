# 🚀 AntiGravity Project Overview: Frame2Frame

## 📌 Mission
**Frame2Frame** is a premium, state-of-the-art Studio Management System specifically designed for **SKD Photo Studio**. It automates client management, event tracking, team coordination, and financial analysis in a single, high-performance web interface.

## 🛠 Tech Stack
- **Framework**: Next.js 16.2.4 (App Router)
- **Runtime**: React 19 / Edge Runtime (Cloudflare Optimized)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium Glassmorphism Design)
- **Database**: Supabase (PostgreSQL) - Accurate Master Migration Data Synced as of May 4, 2026.
- **Auth**: Supabase SSR
- **Infrastructure**: Cloudflare Pages

## 🏗 Architecture
### Multi-Tenancy
- Designed with `tenant_id` isolation.
- Currently optimized for single-studio operations (SKD).
- Centralized logic in `src/lib/supabase.server.ts` via `getDefaultTenantId()`.

### Backend (API Routes)
- Located in `src/app/api`.
- All routes are configured for **Cloudflare Edge Runtime** (`export const runtime = 'edge';`).
- Uses `supabaseAdmin` for secured, tenant-isolated operations.

### Frontend
- Fully responsive, high-performance UI.
- Premium aesthetics using dark mode, gradients, and custom components.
- Direct API interaction via a centralized `api` client (`src/lib/api.ts`).

## 📁 Key Directories
- `src/app`: App Router pages and API routes.
- `src/components`: UI components (forms, stat cards, layouts).
- `src/lib`: Core utilities (api client, supabase config, helper functions).
- `src/styles`: Global CSS and theme variables.

## 🚀 Deployment & Git Protocols
- **Platform**: Cloudflare Pages.
- **Migration Note**: All routes have been explicitly moved to the **Edge Runtime** to ensure compatibility with Cloudflare's serverless infrastructure and avoid build failures.
- **Environment Variables**:
  - `NEXT_PUBLIC_APP_URL`: Production URL (https://frame2frame.pages.dev).
  - `NEXT_PUBLIC_MAINTENANCE_MODE`: Operational toggle.
  - `GOOGLE_AI_STUDIO_API_KEY`: For AI-enhanced features.

### ⚠️ Git Workflow Rules
> [!IMPORTANT]
> - **Development Repo** (`origin` - `Ashwyn-Mangalampalli/SKD-Frame2Frame`): AntiGravity (you) will always ask human (me) for confirmation before pushing.
> - **Production Repo** (`mirror` - `SKD-Photo-Studio/Frame2Frame`): AntiGravity (you) will always ask human (me) for confirmation before triggering the production build.
> - **AI Behavior**: Don't assume, ask. Always request clarification on any ambiguity.
