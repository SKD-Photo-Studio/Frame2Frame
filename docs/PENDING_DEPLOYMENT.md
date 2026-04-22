# Deployment Status (Production)

This document tracks the synchronization status between the local development environment and the production Vercel deployment.

---

## Current Live Version: `v2.3.2`
## Local Development Status: ✅ Synchronized with Live

### 📝 Recently Pushed (v2.3.1 & v2.3.2)
- [x] **Bulk Operations**: Added "Download Report" and "Bulk Upload" to Dashboard.
- [x] **Branding Hardening**: Global rename to "SKD Photo Studio".
- [x] **Management Separation**: Excluded Admins from Team view (Only Team members listed).
- [x] **Admin Management**: Created a separate "Administrators" section in Settings.
- [x] **Personalization**: Dynamic sidebar profile names/emails via `/api/me`.
- [x] **Safety**: Added logout confirmation dialog.

---

## How to Deploy
1. Ensure all local changes are committed and pushed:
   `git add .`
   `git commit -m "Release v2.3.2: Management hardening and branding finalization"`
   `git push origin main`
2. Vercel will automatically trigger a build if the GitHub hook is active.
3. If automatic deployments are disabled, trigger a manual deployment from the `main` branch.

---
*Last Updated: 2026-04-22 | 01:30 PM IST*
