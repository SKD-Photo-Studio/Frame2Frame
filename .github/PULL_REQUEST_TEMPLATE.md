## 📋 PR Context

- **Blueprint Addressed:** [Link to ARCHITECT_PLAN.md or specific issue]
- **Summary of Changes:** 
  - (Jules, list the files you changed and why here)

## 🔐 Security & Guardrails Checklist

Jules, you **MUST** ensure the following are checked before opening this PR:

- [ ] **No Secret Leaks:** I have not committed any raw API keys, JWTs (`eyJ...`), or Supabase Service Role keys.
- [ ] **No Client-Side Secrets:** No keys intended for the server have been prefixed with `NEXT_PUBLIC_`.
- [ ] **Auth Middleware:** All new API routes are covered by the Next.js Auth Middleware check.
- [ ] **Edge Compatibility:** I have not used `fs`, `path`, or `child_process` in any Edge Runtime routes.
- [ ] **Zero Disk Privilege:** I have not written any logic that saves sensitive data to the local disk.

## 🧪 Testing

- [ ] Playwright tests have been added/updated if this is a new feature.
- [ ] I have verified that standard CRUD operations still function as expected.

---
*Note: This PR will automatically be tested by Playwright and audited by the Gemini CLI Reviewer.*
