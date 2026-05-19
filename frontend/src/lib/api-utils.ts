import { NextResponse } from "next/server";
import { getDefaultTenantId } from "@/lib/supabase.server";

type ApiHandler<T = any> = (
  tenantId: string,
  request: Request,
  context?: any
) => Promise<NextResponse<T> | T>;

/**
 * Standardized API Wrapper for Frame2Frame Studio.
 * Handles tenant_id extraction, standardizes try-catch loops,
 * and format-checks responses and errors.
 */
export function withApiWrapper<T = any>(handler: ApiHandler<T>) {
  return async (request: Request, context: any = {}) => {
    try {
      const tenantId = await getDefaultTenantId();
      const result = await handler(tenantId, request, context);

      if (result instanceof Response) {
        return result;
      }

      return NextResponse.json(result);
    } catch (err: any) {
      console.error("API Route Error:", err);
      const status = err.status || 500;
      return NextResponse.json(
        { error: err.message || "Internal Server Error" },
        { status }
      );
    }
  };
}
