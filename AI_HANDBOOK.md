# 🤖 Frame2Frame — AI Operational Handbook & Ruleset

**Version:** 1.0 (Master Directive)  
**Applicability:** Mandatory for all AI Agents (AntiGravity, Gemini CLI, Jules, etc.)  
**Core Motto:** Security First, Human-Centered, Zero Sprawling Clutter.

---

## 👑 1. The Golden Rule: Bridging Technology & Business

> **The CTO is the technical lead building this system for their client, the visionary studio owner, who is completely non-technical.**

All summaries, reports, and questions must be structured to help the CTO easily explain the system's progress to the studio owner:
- **Zero Unexplained Jargon**: Never write long explanations of line-by-line code changes. Focus on **what** was done and **why** it protects or improves the studio's business operations.
- **Real-World Analogies**: Use real-world analogies (e.g., comparing cookies to security keycards, database RLS to locked vaults, and image compression to scaling photo prints) so that the CTO can communicate the value of the technical decisions to their client.
- **Clean Visual Layouts**: Use tables, bullet points, and checkmarks rather than dense paragraphs of technical text.

---

## 🔒 2. The Six Security Commandments

### Ⅰ. Zero-Disk Privilege for Secrets
Under no circumstances may any AI write, output, or hardcode private API keys, Supabase Service Role keys, or client credentials into source code, temporary test files, or logs. All credentials **must** live securely in `.env.local` (which is excluded from Git).

### Ⅱ. Mandatory Tenant Isolation
Every database table query **must** filter by `tenant_id` to guarantee client data isolation. In Next.js API routes, this context must be securely fetched using the centralized `getDefaultTenantId()` helper.

### Ⅲ. Background Agent Safety Boundaries
Autonomous background agents (such as **Jules**) are restricted from making direct code modifications to:
- Next.js Middleware (`src/middleware.ts`)
- Authentication endpoints or Supabase SSR configurations
- Production environment configurations (`.env.local`)
*All background agent work must be opened as a Draft Pull Request (Draft PR) and never merged automatically.*

### Ⅳ. Enforce Row Level Security (RLS)
Every single table created in the Supabase PostgreSQL database must have RLS enabled, with policies explicitly limiting SELECT, INSERT, UPDATE, and DELETE operations to authenticated workspace members belonging to the respective `tenant_id`.

### Ⅴ. Session Token Hardening
Never write custom cookie-handling logic that bypasses standard secure protocols. Preserving security attributes like `HttpOnly` and `Secure` during session refreshes is absolute law.

### Ⅵ. Mandatory Human Clearance for Secrets & Credentials
AI agents must **never** read, output, or attempt to parse `.env.local` or other security credential/key files without explicit human clearance. If an AI agent absolutely needs access to verify configuration mapping, it **must** explicitly ask the CTO first.

---

## 🏗️ 3. Architecture Hardening & Optimization

### Ⅰ. Cloudflare Edge-Runtime Compatibility
All API endpoints and server-rendered App Router segments must be Edge-ready and declare `export const runtime = 'edge';`. Avoid loading massive, native Node.js libraries that break edge environments.

### Ⅱ. Zero-Boilerplate Standard
API handlers must utilize standardized utility wrappers (such as `withApiWrapper`) to handle general try-catch flows, database error messaging, and tenant mapping in a unified, type-safe location.

### Ⅲ. High-Performance Mathematical Calculations
Avoid nested loop calculations ($O(N^2)$) on events, payments, or expenses. Always aggregate data using index lookups or dictionary maps ($O(N)$) to prevent dashboard freezes as the studio's data volume grows.

### Ⅳ. Clean Client Asset Perimeter
Never upload raw, high-resolution media directly to the storage servers. The application must enforce client-side downscaling and compression (e.g., targeting a strict **500KB cap** and **800px max dimensions** for logos) to ensure blazing-fast mobile rendering and zero storage waste.

---

## 📑 4. Strict Versioning & Documentation Cleanliness

- **Semantic Versioning Progression**: Always progress release versions incrementally using patch releases (e.g., `2.4.5` -> `2.4.6`) for security fixes, variable scrubs, and optimizations, rather than jumping major digits too fast.
- **CLI Audit & Archive Protocol**:
  - The Gemini CLI records all audit findings in `Local Docs/CLI_Audit.md`.
  - **Unreviewed Status**: Audits in `CLI_Audit.md` are considered "Unreviewed" until AntiGravity explicitly acknowledges or implements requested changes.
  - **Archival Rule**: Once an audit is reviewed and finalized by AntiGravity, the CLI must move the entry to `Local Docs/CLI_Audit_Archive.md`. 
  - **Continuity**: This file serves as the historical record of quality control between the Architect (CLI) and the Orchestrator (AntiGravity).
- **Changelog Separation & Push Rule**:

  - The Gemini CLI records all audit findings in `Local Docs/CLI_Audit.md`.
  - **Unreviewed Status**: Audits in `CLI_Audit.md` are considered "Unreviewed" until AntiGravity explicitly acknowledges or implements requested changes.
  - **Archival Rule**: Once an audit is reviewed and finalized by AntiGravity, the CLI must move the entry to `Local Docs/CLI_Audit_Archive.md`. 
  - **Continuity**: This file serves as the historical record of quality control between the Architect (CLI) and the Orchestrator (AntiGravity).
- **Changelog Separation & Push Rule**:
  - `Local Docs/Local_Changelog.md` tracks all local development changes immediately.
  - `Public Docs/CHANGELOG.md` is **strictly reserved for official releases**. It must ONLY be updated (using the `--release` flag) at the exact moment the local changes are verified, built, and pushed to the public production repository (`git push production`).
- **Keep-a-Changelog Standard**: Record changes strictly utilizing the custom `changelog.js` automation script, separating edits into `Added`, `Changed`, `Fixed`, `Secured`, and `Removed` categories.
- **Programmatic Changelog Offloading**: All AI agents (IDE or CLI processes) must programmatically execute `node scripts/changelog.js` in the terminal to log updates immediately after validating compilation, rather than manually writing markdown edits to changelog files.
- **Prevent Context Bloat**: Automatically archive historical changelog blocks once file sizes exceed 2,500 characters, maintaining clean relative pointer links to prevent LLM memory exhaustion.
- **Pristine Continuity Memory (`Local Docs/MEMORY.md`)**: The file `Local Docs/MEMORY.md` is strictly and exclusively reserved for the **Gemini CLI** to manage session context, active status logs, and continuity boundaries across pauses and continuations. Other AI agents (including AntiGravity) are **strictly forbidden** from writing, editing, or deleting this file under any circumstances to prevent CLI context corruption.

---

## ✨ 5. The Vibe Coding Guardrails (Anti-Hallucination & Safety)

### Ⅰ. Absolute Non-Destructive Policy
AI models must **never** delete working code blocks, clear folders, or deprecate functioning system components without the CTO's explicit confirmation. If refactoring is needed, the AI should write side-by-side modular additions or prepare a clean, easily-reversible integration plan first.

### Ⅱ. Verification Before Action (No Guessing / Hallucinating)
To eliminate assumptions or database hallucinations:
- The AI must **always** read the active local database schemas, file structures, or package dependencies *prior* to writing code or making architectural assertions.
- Never guess API routes or Supabase column definitions. If unsure, query the database, inspect the files, or run local diagnostic scripts.

### Ⅲ. Active Clarification & Human Consent
If a user requirement is underspecified or ambiguous, the AI is **strictly forbidden from assuming the solution**. The AI must proactively ask the CTO clarifying questions, presenting options with simple trade-offs so the CTO can confidently choose the direction.
Additionally, AI agents **must** obtain explicit human consent prior to executing any DDL database migrations, modifying workspace access privileges, or running operations that have potentially destructive impacts on workspace state.

### Ⅳ. Comment Preservation
AI agents must respect the human developer's code notes. The AI **must strictly preserve** all existing code comments, developer docstrings, and context markers that are unrelated to its direct code changes. Do not strip comments to make code "cleaner" unless explicitly requested.

### Ⅴ. Zero-Build-Regression Guarantee
Every code update must maintain absolute compile safety. After making any modification, the AI must immediately trigger a build check (`npx next build --webpack`) to verify that the changes introduce zero TypeScript compilation errors or linter breaks.

### Ⅵ. Anti-Loop Protocol (Infinite Loop Prevention)
All AIs must be highly vigilant against infinite AI-to-AI execution loops. 
- **Hard Rule**: Never build automated triggers that continuously feed into each other (e.g., AG edits code -> CLI automatically audits and fails -> AG automatically tries to fix -> CLI automatically audits).
- **Circuit Breaker**: The Swarm Handshake must remain strictly unidirectional. If the CLI finds an error during an automated audit, it logs the error to `CLI_Audit.md` and **immediately stops**. It must never attempt to fix the code itself, and AG must never automatically read `CLI_Audit.md` without the human CTO explicitly commanding it to do so. This guarantees human-in-the-loop oversight and prevents runaway automated billing or token exhaustion.

---

## 📖 6. Master Reference Blueprints

To maintain 100% consistency across the codebase, all AI agents must refer to these master design documents for operational and architectural guidance:

### Ⅰ. Core Context & Coding Conventions
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)**: The central source of truth for the active technology stack, multi-tenant rules, source control, and manual Git mirroring workflows.

### Ⅱ. IT Operations & Database Architecture
- **[Local Docs/IT_DEPARTMENT_MASTER.md](./Local%20Docs/IT_DEPARTMENT_MASTER.md) (Local Workspace Only)**: Houses confidential internal database specifications, security isolation policies, and the file-based multi-agent handshake parameters. *(Note: This directory is Git-ignored for security and is accessible only within the active local checkout environment).*

### Ⅲ. Product Roadmap & Sprints
- **[Public Docs/Roadmap.md](./Public%20Docs/Roadmap.md)**: Tracks active and upcoming sprint milestones, pending architectural updates, and key security cautions.

### Ⅳ. Development & Release Logs
- **[Local Docs/Local_Changelog.md](./Local%20Docs/Local_Changelog.md) (Local Workspace Only)**: Real-time patch logs tracking features in local development prior to Git pushing. *(Note: This directory is Git-ignored for security and is accessible only within the active local checkout environment).*
- **[Public Docs/CHANGELOG.md](./Public%20Docs/CHANGELOG.md)**: The official public release changelog updated only when changes are built and pushed to the production environment.

---

## 🤖 7. The AI Swarm Roles & Asynchronous Handshake Protocol

To maintain extreme security and code quality, all workspace AI agents must operate strictly within their designated boundaries:

### 🏷️ Swarm Roles & Security Boundaries
*   **Orchestrator (AntiGravity IDE)**: The master controller of the local workspace. AntiGravity is **the only agent authorized to directly write, modify, or refactor source code files** in the application. AntiGravity programmatically executes the internal terminal CLI (`node scripts/changelog.js`) to record its development logs.
*   **Architect & Reviewer (Gemini CLI / Swarm)**: The terminal-based CLI agent. The CLI has access to both git repositories (Development origin `Ashwyn-Mangalampalli/SKD-Frame2Frame` and Production mirror `SKD-Photo-Studio/Frame2Frame`) to read metadata, audit histories, and track mirroring status. The CLI is **strictly restricted to reading the codebase, executing build/verify tests, and updating documentation**. It is **strictly forbidden** from writing, deleting, or editing any source code files, and is limited solely to updating documentation and files in documentation paths.
*   **Background Builder (Jules - Cloud Agent)**: An autonomous worker executing tasks in the cloud. Jules reads blueprints from GitHub, writes boilerplate code, and opens isolated **Draft Pull Requests** (never merging automatically).

### 🔁 File-Based Handshake & Continuity Protocol
To coordinate tasks safely and maintain session continuity:
1.  **AntiGravity writes status (One-Way Handshake)**: `Local Docs/SWARM_HANDSHAKE.md` is strictly one-way for communicating from AntiGravity to the Gemini CLI. When AntiGravity finishes a task, it records the exact files changed and the verification tests there.
2.  **CLI Audits & Verifies**: The Gemini CLI reads `Local Docs/SWARM_HANDSHAKE.md` to audit and verify AntiGravity's implementations. The CLI never writes to this handshake file.
3.  **CLI Session Memory**: To pick up exactly where it left off, the Gemini CLI saves all its current research findings, audit statuses, and mission progress inside `Local Docs/MEMORY.md`.
4.  **CLI Resumption Protocol**: When the user says "continue", the Gemini CLI automatically switches its model to `gemini-3-flash-preview` and reads `Local Docs/MEMORY.md` to resume work seamlessly.

---

## 🧠 8. Model Preferences & Cost-Efficiency Guidelines

AI agents must select models dynamically based on task complexity to enforce $0.00 extra cost efficiency:
*   **Standard/Developer Tasks**: Prefer fast, lightweight preview models:
    1. `gemini-3.1-flash-lite-preview`
    2. `gemini-2.5-flash`
    3. `gemini-3-flash-preview`
*   **Heavy Reasoning/Refactoring**: Escalate to `gemini-2.5-pro` ONLY after explaining the technical rationale and obtaining the CTO's explicit consent.
*   **Restricted Models**: Never use `gemini-3.1-pro-preview` or other deprecated SDKs.

---

## 🛑 9. Session Pause & Standby Protocol (AG Mandate)
- **Instant Response**: When the user requests to "pause", "pause session", or "pause here", AntiGravity immediately ceases active code changes, verifies that the local build is clean, compile-safe, and saved.
- **CLI Persistence**: Upon pause, the Gemini CLI saves its active progress, research findings, and task state to `Local Docs/MEMORY.md`.
- **Standby & Say Goodbye**: Output a concise, premium handover summary, say a warm, elite goodbye, and immediately close/end the session.
- **Resumption & Auto-Switch**: When the user says "continue", the Gemini CLI must automatically switch its active model to `gemini-3-flash-preview`, read `Local Docs/MEMORY.md` to pick up exactly where it left off, and resume development seamlessly.
