# Recent Updates (Changelog)

This document tracks the most recent updates that have been pushed to the repository. For a full historical record, see [HISTORY.md](file:///c:/Users/IamMr/OneDrive/Documents/SKD/SKD-frame2frame/frame2frame/Projects/SKD%20Photo%20Studio%20-%20Frame2Frame/docs/HISTORY.md).

---

### v2.3.4 (2026-04-22 | 02:25 PM IST)
- **Production Push**: Finalized premium UI and branding for live environment.
- **UI Branding**: Redesigned Frame2Frame title with "Outfit" font and custom frame icon.
- **UI Improvements**: Reorganized login hierarchy and updated SKD logo scaling.
- **Branding Consistency**: Renamed "Tenant Logo" to "Company Logo" in Settings.
- **Stability**: Fixed hydration errors and conditional hook issues in Sidebar/ClientShell.
- **Login Experience**: Redesigned login screen with premium photography equipment background and lighter aesthetic.
- **Branding**: Implemented public tenant info fetching so the logo appears on the login screen.
- **Security**: Added password visibility toggle to the login form.
- **UI State Sync**: Fixed issue where logo/admin info didn't update on login/logout (added auth state listeners).
- **Layout Logic**: Hidden sidebar on login screen for a cleaner first impression.

### v2.3.2 (2026-04-22 | 01:30 PM IST)
- **Management Hardening**: Created separate "Administrators" section in Settings.
- **Team View Cleanup**: Excluded Admins from the Team view.
- **Personalization**: Implemented `/api/me` for dynamic profile names/emails in Sidebar.
- **Safety**: Added logout confirmation dialog.

---

## Versioning Rules
- **X.0.0.0**: Total Overhaul (e.g. v3.0.0.0)
- **0.X.0.0**: Major Changes (e.g. v2.4.0.0)
- **0.0.X.0**: Production/Live Push (e.g. v2.3.4.0)
- **0.0.0.X**: Local Refinements/Builds (e.g. v2.3.3.1)
