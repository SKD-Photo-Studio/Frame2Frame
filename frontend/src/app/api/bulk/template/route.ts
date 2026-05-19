import { ExcelService } from "@/lib/excel.server";
import { withApiWrapper } from "@/lib/api-utils";

export const runtime = 'edge';

export const GET = withApiWrapper(async () => {
  const buffer = ExcelService.generateMasterFile();
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=Frame2Frame_Bulk_Template.xlsx",
    },
  });
});
