# 🗺️ Frame2Frame Roadmap

**Current Priority:** SKD Photo Studio Launch (Admin Suite)

## Phase 1: Launch & Polish (Active)
- [x] **Unified Architecture**: Backend merged into Frontend.
- [x] **Cloudflare Migration**: Move hosting to Cloudflare Pages.
- [ ] **Live Deployment**: Finish setting up Cloudflare build pipeline.
- [ ] **Data Sync**: Connect initial guest/client data to Supabase.

## Phase 2: RBAC & Operations
- [ ] **Client Login**: Secure portal for clients to see balance.
- [ ] **Team Portal**: Mobile-optimized view for freelancers.
- [ ] **Cloudflare R2**: Move all image assets to R2 buckets.

---

---

## 🕒 Pending Updates (Awaiting Push)
- **Architecture**: Move to Next.js 15 and Node 22.x.
- **Analytics**: PostHog integration ready for activation.
- **Security**: Tenant-id validation enforced on all destructive API calls.
- **Optimization**: O(N) event aggregation logic.

---

## ⚠️ Security Caution
- **Multi-Tenant Scaling**: Current `getDefaultTenantId()` logic is optimized for a single studio (SKD). If expanding to a second tenant, the tenant lookup must be refactored from a database-first fallback to a session-based or hostname-based lookup to prevent data leakage.
