import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDates(dates: string[]): string {
  return (dates ?? [])
    .map((d) => formatDate(d))
    .join(", ");
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  // Handle names with "&" (Couples)
  if (name.includes("&")) {
    const parts = name.split("&").map(p => p.trim());
    if (parts.length >= 2) {
      const firstInitial = parts[0][0] || "";
      const secondInitial = parts[1][0] || "";
      return `${firstInitial}&${secondInitial}`.toUpperCase();
    }
  }

  // Standard First Last logic
  const words = name.split(" ").filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return (words[0]?.slice(0, 2) || "").toUpperCase();
}

export function getPaidStatusColor(status: string): string {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-700";
    case "Overpaid":
      return "bg-emerald-100 text-emerald-700";
    case "Partial":
      return "bg-orange-100 text-orange-700";
    case "Unpaid":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function getEventTypeColor(type: string): string {
  switch (type) {
    case "Wedding":
      return "bg-pink-100 text-pink-700";
    case "Pre-Wedding":
      return "bg-purple-100 text-purple-700";
    case "Engagement":
      return "bg-rose-100 text-rose-700";
    case "Birthday":
      return "bg-orange-100 text-orange-700";
    case "Anniversary":
      return "bg-teal-100 text-teal-700";
    case "Maternity":
      return "bg-sky-100 text-sky-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function round(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export function calcBalance(total: number, paid: number) {
  const rTotal = round(total);
  const rPaid = round(paid);
  const balance = round(rTotal - rPaid);

  let status: "Unpaid" | "Partial" | "Paid" | "Overpaid" = "Unpaid";

  if (rTotal <= 0) {
    status = rPaid > 0 ? "Overpaid" : "Paid";
    return { balance, status };
  }

  if (rPaid === 0) {
    status = "Unpaid";
  } else if (rPaid < rTotal) {
    status = "Partial";
  } else if (rPaid === rTotal) {
    status = "Paid";
  } else if (rPaid > rTotal) {
    status = "Overpaid";
  }

  return { balance, status };
}
