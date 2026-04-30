# Future Roadmap: RBAC Readiness & Data Optimization Plan

This document outlines the architectural changes required to transition the Studio Management Suite from a single-tenant MVP to a fully secure, scalable, multi-role (RBAC) platform.

## Background Context
Currently, the platform is secured for a single-tenant environment where only Admins log in. The Next.js middleware successfully blocks unauthenticated users. 

However, as per your roadmap, when **Clients** and **Team Members** are allowed to log in, the current backend architecture poses a severe security risk. The API routes currently use `supabaseAdmin` (Service Role Key) which bypasses all permissions. If a Client logs in today, the backend does not check their role and would grant them full Admin privileges.

Additionally, as the studio's database grows (thousands of events and expenses), fetching all rows into memory to calculate dashboard totals will cause performance bottlenecks.

---

## User Review Required

> [!WARNING]
> **Major Security Gap for RBAC**: Currently, any authenticated user has full read/write access to the entire backend. If you add Clients or Team Members to the authentication pool before fixing this, they will be able to see and modify everything.

> [!TIP]
> **Scalability**: The dashboard currently downloads all financial rows to calculate sums. For long-term performance, we should push this calculation to the database layer (PostgreSQL).

## Open Questions

1.  **Do you want to implement the RBAC API security foundation *now* before launching?** (This involves refactoring all API routes to check the caller's JWT session and role instead of using a global admin override).
2.  **Do you want to optimize the dashboard aggregation *now*?** (This involves creating SQL Views/RPCs in Supabase, which requires SQL access or executing SQL through the API).

---

## Proposed Changes

### Phase 1: Securing the Backend for RBAC (Authorization)

Instead of relying on `getDefaultTenantId()`, the backend must derive context from the user making the request.

#### [MODIFY] `frontend/src/lib/supabase.server.ts`
- Create a new helper `getAuthenticatedContext(request)` that reads the Authorization header/cookies.
- Verify the user's JWT token using `supabase.auth.getUser()`.
- Query `workspace_memberships` to retrieve their `role` (ADMIN, MEMBER, CLIENT).
- Return the secure `tenantId`, `userId`, and `role`.

#### [MODIFY] `frontend/src/app/api/**/*.ts` (All API Routes)
- Replace `getDefaultTenantId()` with the new `getAuthenticatedContext()`.
- Add role-based checks. Example:
  ```typescript
  const { tenantId, role } = await getAuthenticatedContext(request);
  if (role !== 'ADMIN') return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  ```
- *Note: For Clients, we would restrict the `.eq("client_id", userId)` in their specific data fetching routes.*

### Phase 2: Database-Level Aggregations (Scalability)

#### [NEW] Supabase SQL RPC / Views
- We cannot do this entirely in Next.js. We need to create a Postgres Function (RPC) in Supabase called `get_dashboard_stats(p_tenant_id)`.
- This function will run `SUM()` and `COUNT()` directly on the database using SQL, returning a single JSON object.

#### [MODIFY] `frontend/src/app/api/dashboard/route.ts`
- Replace the 7 parallel `.select('*')` queries with a single `.rpc('get_dashboard_stats', { p_tenant_id: tenantId })`.
- This reduces network payload from megabytes (in a large DB) to just a few bytes, making the dashboard load instantly regardless of scale.

## Verification Plan

### Automated Tests
- Test API routes using a mock "Client" JWT token to ensure it returns `403 Forbidden` for Admin routes.
- Test API routes using an "Admin" JWT token to ensure full access.

### Manual Verification
- Log in locally with a standard test account and attempt to hit the `/api/dashboard` endpoint directly to verify unauthorized blocks.
- Verify that the dashboard loads accurately via the new RPC functions by comparing numbers against the Excel exports.
