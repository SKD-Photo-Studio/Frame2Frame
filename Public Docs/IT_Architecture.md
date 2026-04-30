# 🏗️ SKD Photo Studio — IT Architecture

## 🚀 Infrastructure Overview
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com/) (Edge-Optimized)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase SSR with Next.js Middleware
- **Storage**: Cloudflare R2 (Global Edge Storage)
- **Framework**: Next.js 16.2.4 (App Router)
- **Runtime**: Node.js 22.x (Edge Runtime compatible)

## 🔐 Security & Multi-Tenancy
- **Tenant Isolation**: Every database record is scoped by a mandatory `tenant_id` column.
- **Application-Level Isolation**: API routes enforce `tenant_id` filtering on all queries via a resilient server-side utility.
- **Edge Security**: Cloudflare Access & WAF protection for administrative routes.

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion (for premium animations).
- **Backend**: Next.js API Routes integrated into the monorepo.
- **Data Flow**: Direct Supabase client interaction for authenticated sessions.

---
*Maintained by the SKD Photo Studio IT Department*
