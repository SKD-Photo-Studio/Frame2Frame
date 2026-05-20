import { NextResponse } from "next/server";
import { ExcelService } from "@/lib/excel.server";
import { supabaseAdmin } from "@/lib/supabase.server";
import { withApiWrapper } from "@/lib/api-utils";
import {
  validateSheetRows,
  TeamRowSchema,
  ClientRowSchema,
  EventRowSchema,
  PaymentRowSchema,
  ArtistExpenseRowSchema,
  OutputExpenseRowSchema
} from "@/lib/bulk-validation";

export const runtime = 'edge';

export const POST = withApiWrapper<any>(async (tenantId, request) => {
  let sheets: Record<string, any[]> = {};

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    sheets = {
      [ExcelService.SHEETS.TEAM]: body.team || [],
      [ExcelService.SHEETS.CLIENTS]: body.clients || [],
      [ExcelService.SHEETS.EVENTS]: body.events || [],
      [ExcelService.SHEETS.PAYMENTS]: body.payments || [],
      [ExcelService.SHEETS.ARTIST_EXPENSES]: body.artistExpenses || [],
      [ExcelService.SHEETS.OUTPUT_EXPENSES]: body.outputExpenses || [],
    };
  } else {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    sheets = ExcelService.parseUploadedFile(arrayBuffer);
  }

  // 1. Zod-Powered Schema Validation
  let parsedTeam: any[] = [];
  let parsedClients: any[] = [];
  let parsedEvents: any[] = [];
  let parsedPayments: any[] = [];
  let parsedArtists: any[] = [];
  let parsedOutputs: any[] = [];

  // Team
  if (sheets[ExcelService.SHEETS.TEAM]) {
    const res = validateSheetRows(ExcelService.SHEETS.TEAM, sheets[ExcelService.SHEETS.TEAM], TeamRowSchema);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedTeam = res.data || [];
  }

  // Clients
  if (sheets[ExcelService.SHEETS.CLIENTS]) {
    const res = validateSheetRows(ExcelService.SHEETS.CLIENTS, sheets[ExcelService.SHEETS.CLIENTS], ClientRowSchema);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedClients = res.data || [];
  }

  // Events
  if (sheets[ExcelService.SHEETS.EVENTS]) {
    const res = validateSheetRows(ExcelService.SHEETS.EVENTS, sheets[ExcelService.SHEETS.EVENTS], EventRowSchema);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedEvents = res.data || [];
  }

  // Payments
  if (sheets[ExcelService.SHEETS.PAYMENTS]) {
    const res = validateSheetRows(ExcelService.SHEETS.PAYMENTS, sheets[ExcelService.SHEETS.PAYMENTS], PaymentRowSchema);
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedPayments = res.data || [];
  }

  // Artist Expenses
  if (sheets[ExcelService.SHEETS.ARTIST_EXPENSES]) {
    const res = validateSheetRows(
      ExcelService.SHEETS.ARTIST_EXPENSES,
      sheets[ExcelService.SHEETS.ARTIST_EXPENSES],
      ArtistExpenseRowSchema
    );
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedArtists = res.data || [];
  }

  // Output Expenses
  if (sheets[ExcelService.SHEETS.OUTPUT_EXPENSES]) {
    const res = validateSheetRows(
      ExcelService.SHEETS.OUTPUT_EXPENSES,
      sheets[ExcelService.SHEETS.OUTPUT_EXPENSES],
      OutputExpenseRowSchema
    );
    if (!res.success) {
      return NextResponse.json({ error: res.error }, { status: 400 });
    }
    parsedOutputs = res.data || [];
  }

  // Clean up existing event child tables (payments, crew, deliverables) on update to allow fresh recreation
  if (parsedEvents.length > 0) {
    for (const ev of parsedEvents) {
      const displayId = ev["Display ID"];
      if (displayId) {
        const { data: existingEvent } = await supabaseAdmin
          .from("events_master")
          .select("id")
          .eq("display_id", displayId)
          .eq("tenant_id", tenantId)
          .maybeSingle();

        if (existingEvent) {
          await supabaseAdmin.from("client_payments").delete().eq("event_id", existingEvent.id).eq("tenant_id", tenantId);
          await supabaseAdmin.from("artist_expenses").delete().eq("event_id", existingEvent.id).eq("tenant_id", tenantId);
          await supabaseAdmin.from("output_expenses").delete().eq("event_id", existingEvent.id).eq("tenant_id", tenantId);
        }
      }
    }
  }

  // 2. Atomic Database Transaction via RPC
  const { data: stats, error } = await supabaseAdmin.rpc("bulk_import_data", {
    p_tenant_id: tenantId,
    p_team_rows: parsedTeam,
    p_client_rows: parsedClients,
    p_event_rows: parsedEvents,
    p_payment_rows: parsedPayments,
    p_artist_rows: parsedArtists,
    p_output_rows: parsedOutputs
  });

  if (error) {
    return NextResponse.json({ error: `Database Transaction Failed: ${error.message}` }, { status: 400 });
  }

  return NextResponse.json({
    message: "Data bulk ingestion processed and hardened successfully!",
    stats
  });
});
