import { z } from "zod";

// Helper to coerce empty strings or whitespaces to undefined
const emptyToUndefined = z.preprocess((val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
}, z.string().optional().nullable());

// Helper to coerce email addresses safely
const emailSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed === "" ? undefined : trimmed;
  }
  return val;
}, z.string().email("Invalid email format").optional().nullable());

// Coerces and validates positive numbers (defaulting to 0)
const positiveNumber = z.preprocess((val) => {
  if (val === null || val === undefined || String(val).trim() === "") return 0;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
}, z.coerce.number().min(0, "Must be greater than or equal to 0"));

// Coerces and validates quantities (defaulting to 1)
const quantityNumber = z.preprocess((val) => {
  if (val === null || val === undefined || String(val).trim() === "") return 1;
  const parsed = Number(val);
  return isNaN(parsed) ? val : parsed;
}, z.coerce.number().min(1, "Must be at least 1"));

export const TeamRowSchema = z.object({
  "Display ID": z.string().min(1, "Display ID is required").transform(s => s.trim()),
  "Full Name": z.string().min(1, "Full Name is required").transform(s => s.trim()),
  "Email": emailSchema,
  "Phone": emptyToUndefined,
  "Usual Role": emptyToUndefined,
});

export const ClientRowSchema = z.object({
  "Display ID": z.string().min(1, "Display ID is required").transform(s => s.trim()),
  "Client Name": z.string().min(1, "Client Name is required").transform(s => s.trim()),
  "Phone": emptyToUndefined,
  "Email": emailSchema,
  "Notes": emptyToUndefined,
});

export const EventRowSchema = z.object({
  "Display ID": z.string().min(1, "Display ID is required").transform(s => s.trim()),
  "Client Name": z.string().min(1, "Client Name is required").transform(s => s.trim()),
  "Event Type": z.string().min(1, "Event Type is required").transform(s => s.trim()),
  "Venue": emptyToUndefined,
  "City": emptyToUndefined,
  "Package Value": positiveNumber,
  "Dates": emptyToUndefined,
});

export const PaymentRowSchema = z.object({
  "Event Display ID": z.string().min(1, "Event Display ID is required").transform(s => s.trim()),
  "Type": z.string().min(1, "Payment Type/Installment is required").transform(s => s.trim()),
  "Amount": positiveNumber,
  "Method": z.string().default("Cash").transform(s => s.trim()),
  "Transaction ID": emptyToUndefined,
  "Date": emptyToUndefined,
});

export const ArtistExpenseRowSchema = z.object({
  "Event Display ID": z.string().min(1, "Event Display ID is required").transform(s => s.trim()),
  "User Name": z.string().min(1, "Artist Name is required").transform(s => s.trim()),
  "Role": z.string().min(1, "Assignment Role is required").transform(s => s.trim()),
  "Pay Type": z.string().min(1, "Pay Type is required").transform(s => s.trim()),
  "Start Date": emptyToUndefined,
  "End Date": emptyToUndefined,
  "Days": quantityNumber,
  "Rate": positiveNumber,
  "Total": positiveNumber,
  "Advance": positiveNumber,
});

export const OutputExpenseRowSchema = z.object({
  "Event Display ID": z.string().min(1, "Event Display ID is required").transform(s => s.trim()),
  "User Name": z.string().min(1, "Editor Name is required").transform(s => s.trim()),
  "Role": z.string().default("Editor").transform(s => s.trim()),
  "Deliverable": z.string().min(1, "Deliverable name is required").transform(s => s.trim()),
  "Quantity": quantityNumber,
  "Total": positiveNumber,
  "Advance": positiveNumber,
});

export interface BulkValidationResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

/**
 * Validates a sheet array of rows against a given Zod schema,
 * returning highly informative error strings referencing rows.
 */
export function validateSheetRows<T>(
  sheetName: string,
  rows: any[],
  schema: z.ZodSchema<T>
): BulkValidationResult<T> {
  const validatedRows: T[] = [];

  for (let i = 0; i < rows.length; i++) {
    // Row numbers are 2-indexed in spreadsheets (Row 1 is the header)
    const rowNum = i + 2; 
    const result = schema.safeParse(rows[i]);

    if (!result.success) {
      const issue = result.error.issues[0];
      const field = issue.path.join(".");
      const errorMsg = `Sheet "${sheetName}", Row ${rowNum}: Field "${field}" - ${issue.message}`;
      return { success: false, error: errorMsg };
    }

    validatedRows.push(result.data);
  }

  return { success: true, data: validatedRows };
}
