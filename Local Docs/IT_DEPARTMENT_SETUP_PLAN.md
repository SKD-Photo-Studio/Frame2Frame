# 🏢 Frame2Frame — AI IT Department Setup Plan
**Version:** v2.9 (Pre-Launch API Driven Loop)
**Owner:** Ashwyn Mangalampalli (CTO)
**Engine:** Google AI Pro ($20/mo) + Google AI Studio Free API Tier
**Target:** Absolute zero extra spend ($0.00). 

---

## 🎯 North Star Objective

Run a **fully connected, automated, secure, end-to-end AI development pipeline** using tools included in the Google AI Pro subscription and Free API tiers. The pipeline must be:
- **Connected** — every agent reads/writes through shared files and MCP servers.
- **Automated** — AntiGravity IDE is the orchestrator. It triggers every stage, reads PRs via GitHub MCP.
- **Safe** — no security-critical code assigned to Jules (Builder).
- **Efficient** — uses **Gemini 3.1 Flash** for 90% of operations; escalates to **3.1 Pro - Low** only for complex architectural blueprints.
- **Smart Quota Management** — Uses a custom CLI to toggle between Pro and Flash brains based on task complexity.
- **API Integrated** — Jules is triggered and monitored directly from the terminal via the Jules REST API.

---

## 🧠 The Core Design Principle: Separation of Duties

To maintain quality and avoid AI "grading its own homework," we must strictly separate the **Builder** from the **Tester** and **Reviewer**.

- **The IT Head**: **AntiGravity IDE**. The "Project Manager." Orchestrates the pipeline and reads PR status.
- **The Architect**: **Gemini CLI (`architect.js`)**. The "Senior Engineer." Produces immutable blueprints.
- **The Builder**: **Jules** (jules.google.com). The "Cloud Developer." Reads blueprints and writes code.
- **The Code Reviewer**: **Gemini CLI (`review.js`)**. The "Quality Controller." Audits Jules's PRs.
- **The Backlog**: **GitHub Projects**. The central Kanban board.

---

```
    ┌─────────────────────────────────────────────────────────────────────┐
    │              🖥️ CTO (You) — Approves each stage gate                │
    └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │  👑 IT HEAD: AntiGravity IDE (Orchestration Mode)                   │
    │  ① Chats with CTO to understand requirements                        │
    │  ② Invokes Architect CLI via terminal                               │
    │  ③ Runs `trigger_jules.js` to send blueprint via REST API           │
    └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │  🔨 PRIMARY BUILDER: Jules (Cloud Agent)                            │
    │  Reads blueprint → Writes code → Opens DRAFT Pull Request           │
    └─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │  🤖 QUALITY CONTROL LOOP (CLI)                                      │
    │  ① IT Head sees Draft PR via MCP                                    │
    │  ② IT Head runs `npm run review [PR]` (Flash Engine)                │
    └─────────────────────────────────────────────────────────────────────┘
                              │
                        ┌─────┴──────┐
                        │            │
                     ✅ PASS      ❌ FAIL → IT Head re-assigns Jules
                        │
                        ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │  📤 MANUAL MIRROR: CTO / IT Head                                    │
    │  IT Head merges PR. CTO manually triggers `mirror.yml`              │
    │  for deployment to Production Repo.                                 │
    └─────────────────────────────────────────────────────────────────────┘
```


## 👥 The Agents: Roles, Tools & Rules

### 👑 Agent 0: IT Head — AntiGravity IDE
**IT Head SOP (Anti-Lockout):**
1. **Flash-First:** All sessions begin in Flash. 
2. **Smart Quota Orchestration:** I smartly switch between CLI Pro and Flash tiers for the Architect/Reviewer roles to protect the 50-task-per-day limit.
3. **The API Summoner:** I trigger Jules by running `node frontend/scripts/trigger_jules.js`, which sends the blueprint over REST and actively polls for completion.

### 🧠 Agent 1: Architect — Gemini 3.1 Pro - Low (CLI)
| Property | Value |
| :--- | :--- |
| **Tool** | `node frontend/scripts/architect.js` |
| **Model** | **Gemini 1.5 Pro** (Major) OR **Flash** (Minor) |
| **Quota** | **50 Pro requests / day** |

**Architect Responsibilities:**
- Generates the immutable `docs/ARCHITECT_PLAN.md`.
- Invoked by IT Head via terminal.

### 🔨 Agent 2: Primary Builder — Jules
| Property | Value |
| :--- | :--- |
| **Tool** | Jules (jules.google.com) |
| **Mode** | **REST API Bot Mode** (Triggered via `trigger_jules.js`) |

**Jules Rules:**
- **Honesty:** Commits are authored by "Jules Only."
- **Safety:** Always opens **Draft PRs** for review.
- **Boundary:** Forbidden from touching Auth, middleware, or `.env` files.

### 📖 Agent 4: CI/CD Reviewer — Gemini 3.1 Flash (CLI)
| Property | Value |
| :--- | :--- |
| **Tool** | `node frontend/scripts/review.js` |
| **Model** | **Gemini 3.1 Flash** (1,500/day quota) |

---

## 🔑 Communication Artifacts (The Shared State)

| File / Object | Written By | Read By | Purpose |
| :--- | :--- | :--- | :--- |
| `docs/ARCHITECT_PLAN.md` | Architect | IT Head / Builder | The sprint blueprint. |
| **GitHub PR Description** | Builder (Jules) | IT Head / Reviewer | What was built. |
| REST API Payload | IT Head | Jules | The "Start" signal and blueprint delivery. |
| `docs/AGENT_SESSIONS.json` | IT Head | IT Head | Stores Session IDs for state persistence. |

---

## 💰 The Absolute Zero-Spend Financial Doctrine

**1. Google AI Pro ($20/mo Subscription) — The Core Engine**
- **IT Head (AntiGravity)** & **Builder (Jules)** use the subscription quota.

**2. Google AI Studio (Free Tier API) — Background Automation**
- **Architect CLI** defaults to **Pro-Low** (50/day).
- **Reviewer CLI** uses **Flash** (1,500/day).

---

## 🚀 Activation Checklist (Final Status)

- [x] **Setup Architect CLI:** `frontend/scripts/architect.js` (✅ UPGRADED to v3.0).
- [x] **Setup Reviewer CLI:** `frontend/scripts/review.js` (✅ CREATED).
- [x] **Setup Jules Trigger:** `frontend/scripts/trigger_jules.js` (✅ CREATED).
- [x] **PostHog Integration:** SDK installed & integrated (✅ DONE).
- [x] **Draft Rollback Procedure:** `docs/ROLLBACK_PROCEDURE.md` (✅ DONE).
- [x] **Cloudflare Keep-Alive:** Script drafted in `docs/` (✅ DONE).
- [ ] **Connect Jules:** Link `Ashwyn-Mangalampalli/SKD-Frame2Frame` in Jules UI.
- [ ] **Set API Keys in `.env.local`:** Add `GEMINI_API_KEY` and `JULES_API_KEY`.
- [ ] **Set GitHub Secrets:** Add `GEMINI_API_KEY`, `DEPLOY_KEY`, etc.
- [ ] **Deploy Worker:** Copy script to Cloudflare Dashboard.

---

## 💬 Session Commands

### IT Head Start (AntiGravity — Begin Sprint)
> "Initialize IT Department Protocol. First, run `git pull`. Plan [TASK] and run the architect CLI: `node frontend/scripts/architect.js \"[TASK]\"`."

### IT Head — Trigger Jules
> "Run the Jules Trigger: `node frontend/scripts/trigger_jules.js`. Wait for the polling script to confirm PR creation."

### IT Head — Review Jules
> "Run the reviewer CLI: `node frontend/scripts/review.js`. If PASS, notify CTO for merge."

---

*Last Updated: 2026-04-27 | Version: v2.8 (Final) | Status: Awaiting Secrets Activation.*