# Live Architecture
**Last update pushed: 2026-04-22 | 12:34 PM IST**


Frame2Frame is a multi-tenant SaaS platform for event production houses, managed as a **Unified Monorepo** for seamless deployment and scalability.

## Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Express (Node.js) with TypeScript
- **Database**: Supabase (PostgreSQL + Auth)
- **Hosting**: Unified Vercel Monorepo

---

## 1. Unified Monorepo Flow
We host both the frontend and backend on Vercel as a single project using `vercel.json` for routing.
- **API Routing**: All requests to `/api/*` are routed to the Express backend.
- **Frontend Routing**: All other requests serve the Next.js application.
- **Environment**: Shared environment variables across the project (prefixed with `NEXT_PUBLIC_` for frontend access).

## 2. Backend Architecture
The backend serves as a secure proxy to Supabase, handling complex business logic and multi-tenancy.
- **Multi-Tenancy**: Every record is tied to a `tenant_id`. The system identifies the tenant context to isolate data.
- **Authentication**: Strict middleware validates Supabase JWT tokens on every request.
- **Business Logic**: Centralized utilities for financial calculations (`calcBalance`) and date formatting.
- **Bulk Processing**: High-performance Excel parsing and data reconciliation.

## 3. Frontend Architecture
- **Server Components**: Initial data is fetched on the server for speed and SEO.
- **API Client**: Centralized in `src/lib/api.ts`, providing a typed interface to all backend modules.
- **Design System**: Built with Tailwind CSS and Lucide icons, featuring a custom responsive sidebar and glassmorphic UI elements.

## 4. Scaling & Decoupling
The project is architected for future decoupling. To move the backend to a dedicated server:
1. Move the `backend/` folder to a separate repository.
2. Update `frontend/src/lib/api.ts` to point to the new backend URL.
3. Enable CORS in the backend for the frontend domain.
4. Update `vercel.json` or delete it if hosting separately.

---
*Last Updated: 2026-04-22*
