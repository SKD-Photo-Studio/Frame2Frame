# Frame2Frame: Unified Current Architecture

## Overview
Frame2Frame (SKD AuditBook 2.0) is a multi-tenant SaaS platform for event production houses. It manages clients, events, team assignments, and financial tracking (expenses vs. payments).

## Tech Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Lucide React.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** Supabase PostgreSQL.
- **Hosting (Planned):** 
  - Frontend: Vercel
  - Backend: Koyeb

## Core Architecture

### 1. Database & Multi-Tenancy
- **Supabase PostgreSQL:** Uses a relational schema with a strong emphasis on multi-tenancy.
- **Tenant Isolation:** Every table includes a `tenant_id`. The backend currently defaults to a single tenant ("SKD Studios") but is architected for expansion.
- **RLS (Row Level Security):** Enabled on Supabase, but bypassed by the backend using the `SUPABASE_SERVICE_ROLE_KEY` to act as a secure proxy.

### 2. Backend (Express + TypeScript)
- **Typed Routes:** All routes under `/api/`. Core modules: `clients`, `events`, `team`, `dashboard`.
- **Logic Placement:** Business logic (balance calculations, status determination) is mostly handled in the route handlers.
- **ID Management:** Uses `display_id` for human-readable tracking (e.g., `Client Name | Event Type`) while using UUIDs for internal relations.

### 3. Frontend (Next.js 14)
- **Data Fetching:** Utilizes React Server Components for initial page loads, fetching directly from the backend API.
- **API Service:** Centralized in `frontend/src/lib/api.ts` with typed response shapes.
- **Styling:** Consistent UI components using Tailwind CSS and custom design tokens (sidebar, brand colors).

## Current State Summary
- **Infra:** Supabase is fully integrated. In-memory `store.ts` replaced by live PostgreSQL queries.
- **Functional:** CRUD operations for Clients, Events, and Team members are operational.
- **Financials:** Dynamic calculation of collected amounts, pending balances, and savings based on payments and expenses.

## Project Structure
```
skd-frame2frame/
├── frontend/                 # Next.js App
│   ├── src/app/              # App Router pages
│   ├── src/components/       # UI & Form components
│   └── src/lib/              # API wrapper, types, utils
└── backend/                  # Express API
    ├── src/DB/               # Supabase client & migrations
    ├── src/routes/           # API endpoints
    └── src/scripts/          # Seeding & utilities
```
