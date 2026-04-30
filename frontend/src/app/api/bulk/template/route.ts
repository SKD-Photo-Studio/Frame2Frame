import { NextResponse } from "next/server";
import { ExcelService } from "@/lib/excel.server";

export async function GET() {
  try {
    const buffer = ExcelService.generateMasterFile();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": "attachment; filename=Frame2Frame_Bulk_Template.xlsx",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
