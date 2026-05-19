# 🚀 Frame2Frame Studio Management

> **Frame2Frame** is a premium, state-of-the-art Studio Management System specifically engineered for **SKD Photo Studio**. It automates complex client tracking, event logistics, freelancer timesheets, and deep financial statistics in a single, high-performance web interface.

---

## 🛠️ The Edge-Optimized Architecture

This ecosystem is built using a modern, serverless-first, edge-ready architecture to maintain sub-100ms response times globally at zero scaling cost.

*   **Core Framework**: Next.js 16.2.4 (App Router)
*   **Rendering & Runtime**: React 19 / Cloudflare Pages Edge Runtime (`edge`)
*   **Language**: TypeScript
*   **Styling**: Premium Glassmorphic Vanilla CSS
*   **Database & Auth**: Supabase SSR (PostgreSQL)
*   **Asset Management**: Cloudflare R2 (Global Distributed Object Storage - Planned)

---

## 🏗️ Technical Highlights

### ⚡ Sub-100ms Edge API Routes
All backend routes reside under `/src/app/api` and are configured for the **Cloudflare Edge Runtime**. Cold starts are completely eliminated, and queries are optimized for near-instant execution.

### 🛡️ Secure Multi-Tenant Isolation
The database enforces strict **Row Level Security (RLS)** using unique `tenant_id` scopes. Centralized server-side helpers retrieve current tenant contexts securely to protect client data integrity.

### 🔄 Asynchronous Token Refresh
Includes a custom Next.js Middleware cookie-preservation system that transparently refreshes Supabase sessions without dropping browser attributes (`HttpOnly`, `Secure`, `SameSite`), preventing random logouts.

### 🖼️ Auto-Optimizing Asset Pipeline
Integrated with custom client-side downscaling algorithms targeting a strict **500KB cap** and **800px max dimensions** to guarantee incredibly fast page loads without sacrificing image quality on retina displays.

---

## 📁 Repository Directory Structure

```
├── .github/                   # Automated GitHub Actions (Sync/Mirror workflows)
├── Public Docs/               # Public-facing product roadmap and changelogs
│   ├── CHANGELOG.md           # Slow-rolling active SemVer logs (Keep-a-Changelog standard)
│   ├── CHANGELOG_ARCHIVE.md   # Archived historical versions to prevent context bloat
│   └── Roadmap.md             # Active features and long-term project timeline
├── Local Docs/                # [GIT-IGNORED] Confidential internal blueprints
│   ├── IT_DEPARTMENT_MASTER.md# Central AI Swarm pipeline & handshake specifications
│   └── ...
├── frontend/                  # Main Application workspace
│   ├── src/app/               # Next.js App Router (Pages & Edge API Routes)
│   ├── src/components/        # Reusable premium glassmorphic UI components
│   ├── src/lib/               # Centralized API utilities & Supabase client definitions
│   └── src/styles/            # Tokenized layout designs and theme variables
└── scratch/                   # Protected local diagnostic utilities
```

---

## 📖 Project Documentation

To learn more about the project development pipeline, refer to the active documentation paths:
*   [Product Roadmap](./Public%20Docs/Roadmap.md)
*   [Active SemVer Changelog](./Public%20Docs/CHANGELOG.md)
*   [Changelog Archive](./Public%20Docs/CHANGELOG_ARCHIVE.md)

---
*Proprietary software of SKD Photo Studio. Confidential & Protected.*
