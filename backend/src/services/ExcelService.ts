import * as XLSX from "xlsx";
import { supabase } from "../DB/supabase";

export interface BulkUploadRow {
  [key: string]: any;
}

export class ExcelService {
  static readonly SHEETS = {
    CLIENTS: "Clients",
    TEAM: "Team",
    EVENTS: "Events",
    PAYMENTS: "Payments",
    ARTIST_EXPENSES: "Artist Expenses",
    OUTPUT_EXPENSES: "Output Expenses",
  };

  /**
   * Generates a workbook with specific sheets and headers.
   * If data is provided, it populates the sheets.
   */
  static generateMasterFile(data?: { [sheetName: string]: any[] }) {
    const wb = XLSX.utils.book_new();

    // 1. Clients
    const clientHeaders = [["Display ID", "Client Name", "Phone", "Email", "Notes"]];
    const clientData = data?.[this.SHEETS.CLIENTS] || [];
    const wsClients = XLSX.utils.aoa_to_sheet([...clientHeaders, ...clientData]);
    XLSX.utils.book_append_sheet(wb, wsClients, this.SHEETS.CLIENTS);

    // 2. Team
    const teamHeaders = [["Display ID", "Full Name", "Email", "Phone", "Usual Role"]];
    const teamData = data?.[this.SHEETS.TEAM] || [];
    const wsTeam = XLSX.utils.aoa_to_sheet([...teamHeaders, ...teamData]);
    XLSX.utils.book_append_sheet(wb, wsTeam, this.SHEETS.TEAM);

    // 3. Events
    const eventHeaders = [["Display ID", "Client Name", "Event Type", "Venue", "City", "Package Value", "Dates"]];
    const eventData = data?.[this.SHEETS.EVENTS] || [];
    const wsEvents = XLSX.utils.aoa_to_sheet([...eventHeaders, ...eventData]);
    XLSX.utils.book_append_sheet(wb, wsEvents, this.SHEETS.EVENTS);

    // 4. Payments
    const paymentHeaders = [["Event Display ID", "Type", "Amount", "Method", "Transaction ID", "Date"]];
    const paymentData = data?.[this.SHEETS.PAYMENTS] || [];
    const wsPayments = XLSX.utils.aoa_to_sheet([...paymentHeaders, ...paymentData]);
    XLSX.utils.book_append_sheet(wb, wsPayments, this.SHEETS.PAYMENTS);

    // 5. Artist Expenses
    const artistHeaders = [["Event Display ID", "User Name", "Role", "Pay Type", "Days", "Rate", "Total", "Advance", "Status"]];
    const artistData = data?.[this.SHEETS.ARTIST_EXPENSES] || [];
    const wsArtist = XLSX.utils.aoa_to_sheet([...artistHeaders, ...artistData]);
    XLSX.utils.book_append_sheet(wb, wsArtist, this.SHEETS.ARTIST_EXPENSES);

    // 6. Output Expenses
    const outputHeaders = [["Event Display ID", "User Name", "Role", "Deliverable", "Quantity", "Total", "Advance", "Status"]];
    const outputData = data?.[this.SHEETS.OUTPUT_EXPENSES] || [];
    const wsOutput = XLSX.utils.aoa_to_sheet([...outputHeaders, ...outputData]);
    XLSX.utils.book_append_sheet(wb, wsOutput, this.SHEETS.OUTPUT_EXPENSES);

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  /**
   * Parses an uploaded workbook and returns an object with sheet data.
   */
  static parseUploadedFile(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const result: { [sheetName: string]: any[] } = {};

    wb.SheetNames.forEach((name) => {
      const ws = wb.Sheets[name];
      result[name] = XLSX.utils.sheet_to_json(ws);
    });

    return result;
  }
}
