# 🏢 IT Department Expansion: SKD Photo Studio

## 🎯 North Star Objective
Run a **fully connected, automated, secure, end-to-end AI development pipeline** using tools included in the Google AI Pro subscription and Free API tiers.

---

## 🏗️ 1. The Department Manifest (Roles & Tools)

| 🏷️ IT Role | 🛠️ Tool | ✅ What It Does |
| :--- | :--- | :--- |
| **🧠 Architect** | Gemini CLI / Web | Plans features, researches architecture, writes blueprints. |
| **🔨 Builder** | **AntiGravity** (this IDE) | Writes production code. |
| **🤖 Background Builder** | **Jules** | Autonomous GitHub agent for repetitive fixes. |
| **✏️ Code Assist** | **Gemini Code Assist** | Inline autocomplete in VS Code. |
| **📖 Knowledge Base** | **NotebookLM** | Persistent project memory and Q&A. |
| **📖 Auditor** | **Gemini CLI** | Pre-deployment security & hygiene review. |

---

## 🔑 2. The File-Based Handshake Protocol

1. **Plan**: YOU → Run Gemini CLI as Architect → writes `ARCHITECT_PLAN.md`.
2. **Build**: YOU → Paste to IDE Builder (AntiGravity) → writes code + `BUILD_REPORT.md`.
3. **Review**: YOU → Run Gemini CLI Audit → outputs `REVIEW_REPORT.md`.
4. **Deploy**: If ✅ PASS → git push → Cloudflare auto-deploys.

---

## 🤖 3. Jules Integration Strategy
- **How to use:** Connect the repo to [jules.google.com](https://jules.google.com).
- **Tasks:** repetitive fixes, boilerplate, unit tests.
- **Safety:** Jules opens **Draft PRs**; never merges autonomously.

---

## 🔁 4. Automation Checklist (Deferred)
- [ ] Connect Jules to `Ashwyn-Mangalampalli/SKD-Frame2Frame`.
- [ ] Set API Keys in `.env.local` (`GEMINI_API_KEY`, `JULES_API_KEY`).
- [ ] Deploy Cloudflare Keep-Alive worker.

---
*Confidential Internal Specification - Never push to public GIT.*
