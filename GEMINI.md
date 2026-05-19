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
- **AI Behavior**: Don't assume, ask. Always request clarification on any ambiguity.

## Source Control & Mirroring
- **Development (Origin)**: `Ashwyn-Mangalampalli/SKD-Frame2Frame`.
- **Production (Mirror)**: `SKD-Photo-Studio/Frame2Frame`.
- **Sync Workflow**: Manual trigger via GitHub Actions (`mirror.yml`). 
- **Security**: The `mirror` remote contains an access token. Never log or output full remote URLs containing credentials.

## Security Protocols
- **Secrets**: Strictly isolated to `.env.local` (Git-ignored).
- **Internal Specs**: `Local Docs/IT_DEPARTMENT_MASTER.md` is private-facing and Git-ignored.
- **Public Docs**: `CHANGELOG.md` and `README.md` are public-facing.

## CLI Interaction
- **Primary Model**: **Gemini 3 Flash** (Fast/Efficient).
- **Escalation**: Only use **Gemini 2.5 Pro** for heavy reasoning; explain the rationale and ask for user permission first.
- **Workspace Root**: Use `frontend/` as the primary directory for code queries.
- **Pause Protocol**: When the user says "pause" or "pause session", immediately stop the current task, persist all current research findings, audit statuses, and mission progress strictly to `Local Docs/MEMORY.md`, say goodbye, and then terminate the session.
- **AI Operational Rules**: All AI agents (IDE, CLI, Background Builders) MUST strictly read and adhere to the security, architecture, and human-first communication directives outlined in [AI_HANDBOOK.md](file:///c:/SKD%20Photo%20Studio/SKD-Tech/Frame2Frame%20-%20SKD%20Photo%20Studio/Projects/SKD%20Photo%20Studio%20-%20Frame2Frame/AI_HANDBOOK.md).
- **Security Boundary**: The CLI must **never** read, parse, or output `.env.local` or other security credential/key files. If verification is needed, it must ask the CTO first.
- **Write Restriction**: The Gemini CLI has access to both git repositories (Development origin `Ashwyn-Mangalampalli/SKD-Frame2Frame` and Production mirror `SKD-Photo-Studio/Frame2Frame`) to read metadata, audit histories, and track mirroring status. The CLI is **strictly restricted to reading/verifying code and updating documentation**. It is **strictly forbidden** from writing, deleting, or editing any source code files (which is reserved solely for AntiGravity).
- **Handshake Cabinet**: The CLI must read [Local Docs/SWARM_HANDSHAKE.md](./Local%20Docs/SWARM_HANDSHAKE.md) to audit, verify, and run pre-flight checks on changes implemented by AntiGravity. Note that `Local Docs/SWARM_HANDSHAKE.md` is strictly one-way (AntiGravity to CLI) and must never be edited by the CLI.
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
- **Session Pause Protocol**: When the user triggers a "pause" or "pause session", save all active contexts, sync the handbook statuses, say a warm, elite goodbye, and immediately close/end the session.
- **Session Resumption & Model Autocontrol**: When the user says "continue", the Gemini CLI must automatically switch its active model to **gemini-3-flash-preview**, read [Local Docs/MEMORY.md](./Local%20Docs/MEMORY.md) to load the exact state of progress and findings, and pick up exactly where we left off.
