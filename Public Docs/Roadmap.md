# 🗺️ Frame2Frame Roadmap

**Current Priority:** SKD Photo Studio Launch (Admin Suite)

## Phase 1: Launch & Polish (Active)
- [x] **Unified Architecture**: Backend merged into Frontend.
- [x] **Cloudflare Migration**: Move hosting to Cloudflare Pages.
- [ ] **Live Deployment**: Finish setting up Cloudflare build pipeline.
- [x] **Data Sync**: Accurate master migration data successfully connected to Supabase.

## Phase 2: RBAC & Operations
- [ ] **Client Login**: Secure portal for clients to see balance.
- [ ] **Team Portal**: Mobile-optimized view for freelancers.
- [ ] **Cloudflare R2**: Move all image assets to R2 buckets.
- [ ] **Office PIN Lock**: Auto-timeout glassmorphic PIN shield for secure office desktops.

---

---

## 🕒 Pending Updates (Awaiting Push)
- **Architecture**: Stable Next.js 16.2.4 and React 19 on Node 22.x Edge runtime (Build Verified ✅).
- **Analytics**: PostHog tracking integration configured.
- **Security**: Tenant isolation and token preservation fully hardened.
- **Optimization**: High-performance O(N) event rendering and database calculations.

---

## ⚠️ Security Caution
- **Multi-Tenant Scaling**: Current `getDefaultTenantId()` logic is optimized for a single studio (SKD). If expanding to a second tenant, the tenant lookup must be refactored from a database-first fallback to a session-based or hostname-based lookup to prevent data leakage.
