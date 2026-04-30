# 📂 SKD Photo Studio — AI IT Department Specification
**Version:** 2.0 (April 2026)
**Client:** Ashwyn Mangalampalli
**Objective:** Admin-First Delivery for SKD Photo Studio. Build efficiently using the Google AI Pro subscription — **zero extra spend** until product is delivered.

---

## 🎯 The Strategy in One Line
> Use **every tool included in your $20/month Google AI Pro subscription** to run a full AI development team — Architect, Builder, Reviewer — without touching your 1,000 monthly AI credits or paying a single extra rupee.

---

## 🏗️ 1. The Complete IT Department (100% Included in Google AI Pro)

| 🏷️ IT Role | 🛠️ Tool | 📍 Where | ✅ What It Does | 💰 Cost |
| :--- | :--- | :--- | :--- | :--- |
| **🧠 Architect** | Gemini Web App (Deep Research) | gemini.google.com | Plans features, researches architecture, writes `ARCHITECT_PLAN.md` | Included |
| **⚡ Architect (CLI)** | **Gemini CLI** | Your Terminal | Reads your entire codebase, produces technical blueprints. **No API key needed.** | Included |
| **🔨 Builder** | **AntiGravity** (this IDE) | Local IDE | Reads `ARCHITECT_PLAN.md`, writes production code. Higher limits + priority traffic for Pro members. | Included |
| **🤖 Builder (background)** | **Jules** | jules.google.com | Autonomous GitHub agent. Assign it a task, it opens a PR autonomously. Higher limits on Pro. | Included |
| **✏️ Code Assist** | **Gemini Code Assist** | VS Code Extension | Inline autocomplete & suggestions while you type code. | Included |
| **📖 Knowledge Base / Reviewer** | **NotebookLM** | notebooklm.google.com | Load all project docs (`ARCHITECTURE.md`, `ROADMAP.md`, plans). Use it to audit, generate Q&A, create review reports. | Included |
| **☁️ API Orchestration Scripts** | **Google Developer Program Premium** | developers.google.com | **$10 Google Cloud credits/month** — powers the `scripts/architect.js` and `scripts/reviewer.js` local CLI scripts. | Included (activate separately) |
| **🧪 API Prototyping** | **Google AI Studio** | aistudio.google.com | Test API calls, find valid model IDs, prototype prompts before automating. | Included |

---

## 🔑 2. The Critical Discovery: Gemini CLI is the Real Architect

The **Gemini CLI** is the game-changer. It is fully included in your subscription, runs directly in your PowerShell/terminal, and can read your entire codebase — **no API key, no billing, no extra setup.**

Instead of relying on the broken `scripts/architect.js` file, you can simply open a terminal and run:

```bash
gemini "Read ARCHITECTURE.md and ROADMAP.md, then design a detailed implementation blueprint for the Google Sheets Data Bridge integration and save it to ARCHITECT_PLAN.md"
```

This IS your Architect. It is free, it is fast, and it is running on the same Pro-tier Gemini model you are already paying for.

---

## 🔁 3. The File-Based Handshake Protocol (How Agents Communicate)

Because IDE chat windows cannot be auto-triggered by background scripts, the Swarm communicates through physical Markdown files. This prevents hallucinations and creates a full audit trail of every AI decision.

```
Step 1: YOU → Run Gemini CLI as Architect
        gemini "Plan the task..." → writes ARCHITECT_PLAN.md

Step 2: YOU → Paste to IDE Builder (AntiGravity / Claude Sonnet)
        "@workspace, execute ARCHITECT_PLAN.md and write BUILD_REPORT.md"
        → Builder writes code + BUILD_REPORT.md

Step 3: YOU → Run npm run reviewer
        → Reviewer (via API / Gemini Flash) reads both files, outputs REVIEW_REPORT.md

Step 4: If REVIEW_REPORT = ✅ PASS → git push → Cloudflare auto-deploys
        If REVIEW_REPORT = ❌ FAIL → go back to Step 2 with the report
```

### Communication Files (Source of Truth)
| File | Written By | Read By | Purpose |
| :--- | :--- | :--- | :--- |
| `ARCHITECT_PLAN.md` | Architect (Gemini CLI / Gemini Web) | Builder (AntiGravity / Jules) | The immutable blueprint. |
| `BUILD_REPORT.md` | Builder (AntiGravity) | Reviewer (API Script) | Summary of what was built. |
| `REVIEW_REPORT.md` | Reviewer (`npm run reviewer`) | You (CTO) | Final pass/fail with specific feedback. |

---

## 🤖 4. Jules — Your Background Worker

Jules is a fully autonomous coding agent connected to your GitHub. Use it for tasks that can run in the background while you focus on architecture.

- **How to use:** Go to [jules.google.com](https://jules.google.com), connect your GitHub repo, and assign it a task.
- **Best for:** Repetitive fixes, boilerplate generation, dependency updates, writing unit tests.
- **Output:** Jules opens a Pull Request you can review and merge.
- **Limit:** Your Pro subscription gives you higher task and concurrency limits.

> **Rule:** Never assign Jules to tasks involving security-critical code (auth, payments, API keys). Only use it for isolated, reviewable tasks.

---

## 📖 5. NotebookLM — The Institutional Memory

Load all your project documentation into NotebookLM as a persistent knowledge base. This acts as the "Reviewer's brain."

**Sources to load:**
- `ARCHITECTURE.md`
- `ROADMAP.md`
- `GEMINI_IT_DEPT_SPEC.md` (this file)
- `RBAC_IMPLEMENTATION_PLAN.md`
- `ARCHITECT_PLAN.md` (after each planning session)

**Use it to:**
- Ask "Does this plan align with the roadmap?" before building anything.
- Generate a Q&A report for stakeholder review.
- Create a pre-deployment checklist automatically.

---

## ☁️ 6. Google Developer Program Premium ($10/month Credits)

Your Google AI Pro subscription includes access to the **Google Developer Program Premium** tier.

**To activate:**
1. Go to [developers.google.com](https://developers.google.com)
2. Link your Google AI Pro subscription to your Developer Profile.
3. Claim the $10/month Google Cloud credit.
4. Use that credit to power `scripts/architect.js` and `scripts/reviewer.js`.

**What $10 gets you (more than enough for one developer):**

| Model | Monthly Capacity for $10 | Practical Workload |
| :--- | :--- | :--- |
| **Gemini Flash** | ~33 Million Tokens | Enough to review code for an entire year. |
| **Gemini Pro** | ~5 Million Tokens | ~50–100 deep architectural blueprints per month. |

> **Safety:** Set up Google Cloud in **Prepaid mode** with **Auto-recharge OFF**. Once the $10 credit is used, the API stops — your card will never be charged automatically.

---

## 🔐 7. Security & Access Standards

- **Admin Lockdown**: The `/admin` and `/api` routes must be protected by Cloudflare Access.
- **Google Service Accounts**: Keys for Google API access must be stored in `.env.local` only. Never committed to Git.
- **Edge Compatibility**: All new code must be "Edge-Ready" (avoiding Node-only libraries where possible).
- **Zero-Disk Privilege**: Service Role Keys must NEVER be saved to disk.
- **Authentication**: Supabase RLS is mandatory for all tables.

---

## 🗺️ 8. Roadmap Alignment

| Roadmap Phase | AI Swarm Role | Priority |
| :--- | :--- | :--- |
| **Phase 1:** Admin Suite + Google Sheets + Cloudflare | Architect + Builder + Reviewer | 🔴 NOW |
| **Phase 2:** Historical Data Migration + R2 Storage | Builder + Jules (background) | 🟡 NEXT |
| **Phase 3:** Team Portal (Deferred) | Jules + RBAC Refactor | ⚪ LATER |
| **Phase 4:** Client Portal (Long-term) | Full Swarm | ⚪ FUTURE |

> **RBAC Decision:** RBAC does NOT need to be implemented now. The current Supabase RLS + Next.js Middleware is secure for a single-tenant Admin environment. Revisit when Clients or Team Members need to log in (Phase 3+).

---

## 🚀 9. Immediate Next Steps (In Order)

- [ ] **Install Gemini CLI** — `npm install -g @google/gemini-cli` — This becomes your Architect.
- [ ] **Activate Google Developer Program Premium** — Claim your $10/month credits at [developers.google.com](https://developers.google.com).
- [ ] **Set up Jules on GitHub** — Connect the repo to [jules.google.com](https://jules.google.com).
- [ ] **Load NotebookLM** — Upload all project docs as a knowledge base.
- [ ] **Fix `scripts/architect.js`** — Update it to use the correct model IDs from AI Studio.
- [ ] **Build `scripts/reviewer.js`** — Uses `git diff` to audit actual code changes against the plan.

---

## 💬 10. Session Initialization Command

*When starting a new AntiGravity session, type:*
> "Initialize the IT Department Protocol. Focus on **Admin-First Delivery** and **Cloudflare Edge compatibility**. All code must be Edge-Ready. Preserve the 1,000 monthly AI credits for video/marketing only."