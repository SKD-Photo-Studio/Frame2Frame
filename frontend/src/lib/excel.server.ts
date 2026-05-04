import * as XLSX from "xlsx";

export class ExcelService {
  static readonly SHEETS = {
    CLIENTS: "Clients",
    TEAM: "Team",
    EVENTS: "Events",
    PAYMENTS: "Payments",
    ARTIST_EXPENSES: "Artist Expenses",
    OUTPUT_EXPENSES: "Output Expenses",
  };

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
    const eventHeaders = [["Display ID", "Client Name", "Event Type", "Venue", "City", "Package Value", "Dates", "Client Balance", "Team Balance", "Status"]];
    const eventData = data?.[this.SHEETS.EVENTS] || [];
    const wsEvents = XLSX.utils.aoa_to_sheet([...eventHeaders, ...eventData]);
    XLSX.utils.book_append_sheet(wb, wsEvents, this.SHEETS.EVENTS);

    // 4. Payments
    const paymentHeaders = [["Record ID", "Event Display ID", "Type", "Amount", "Method", "Transaction ID", "Date"]];
    const paymentData = data?.[this.SHEETS.PAYMENTS] || [];
    const wsPayments = XLSX.utils.aoa_to_sheet([...paymentHeaders, ...paymentData]);
    XLSX.utils.book_append_sheet(wb, wsPayments, this.SHEETS.PAYMENTS);

    // 5. Artist Expenses
    const artistHeaders = [["Record ID", "Event Display ID", "User Name", "Role", "Pay Type", "Start Date", "End Date", "Days", "Rate", "Total", "Advance", "Status"]];
    const artistData = data?.[this.SHEETS.ARTIST_EXPENSES] || [];
    const wsArtist = XLSX.utils.aoa_to_sheet([...artistHeaders, ...artistData]);
    XLSX.utils.book_append_sheet(wb, wsArtist, this.SHEETS.ARTIST_EXPENSES);

    // 6. Output Expenses
    const outputHeaders = [["Record ID", "Event Display ID", "User Name", "Role", "Deliverable", "Quantity", "Total", "Advance", "Status"]];
    const outputData = data?.[this.SHEETS.OUTPUT_EXPENSES] || [];
    const wsOutput = XLSX.utils.aoa_to_sheet([...outputHeaders, ...outputData]);
    XLSX.utils.book_append_sheet(wb, wsOutput, this.SHEETS.OUTPUT_EXPENSES);

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }

  static parseUploadedFile(data: any) {
    const uint8 = data instanceof ArrayBuffer ? new Uint8Array(data) : (data instanceof Uint8Array ? data : new Uint8Array(Buffer.from(data)));
    const wb = XLSX.read(uint8, { type: "array" });
    const result: { [sheetName: string]: any[] } = {};

    wb.SheetNames.forEach((name) => {
      const ws = wb.Sheets[name];
      result[name] = XLSX.utils.sheet_to_json(ws);
    });

    return result;
  }
}
