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

export interface EventTheme {
  badge: string;
  avatar: string;
}

export function getEventTheme(type: string): EventTheme {
  const cleanType = (type || "").trim().toLowerCase();

  // High-contrast, premium glowing theme templates
  const themes: EventTheme[] = [
    { // Index 0: Pink/Rose (Wedding)
      badge: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 dark:border dark:border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.2)]",
      avatar: "bg-gradient-to-br from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20 text-pink-600 dark:text-pink-300 border-pink-200/40 dark:border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.18)]"
    },
    { // Index 1: Emerald/Teal-Green (Pre-Wedding - Beautiful Premium High-Contrast)
      badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border dark:border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      avatar: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-200/40 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.18)]"
    },
    { // Index 2: Rose/Red (Engagement)
      badge: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:border dark:border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
      avatar: "bg-gradient-to-br from-rose-500/10 to-red-500/10 dark:from-rose-500/20 dark:to-red-500/20 text-rose-600 dark:text-rose-300 border-rose-200/40 dark:border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.18)]"
    },
    { // Index 3: Orange/Amber (Birthday)
      badge: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 dark:border dark:border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
      avatar: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 text-amber-600 dark:text-amber-300 border-amber-200/40 dark:border-amber-500/30 shadow-[0_0_15px_rgba(249,115,22,0.18)]"
    },
    { // Index 4: Teal/Cyan (Anniversary)
      badge: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 dark:border dark:border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]",
      avatar: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-200/40 dark:border-emerald-500/30 shadow-[0_0_15px_rgba(20,184,166,0.18)]"
    },
    { // Index 5: Sky Blue (Maternity)
      badge: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 dark:border dark:border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]",
      avatar: "bg-gradient-to-br from-sky-500/10 to-blue-500/10 dark:from-sky-500/20 dark:to-blue-500/20 text-sky-600 dark:text-sky-300 border-sky-200/40 dark:border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.18)]"
    },
    { // Index 6: Violet/Indigo (Custom Fallback 1)
      badge: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300 dark:border dark:border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]",
      avatar: "bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20 text-violet-600 dark:text-violet-300 border-violet-200/40 dark:border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.18)]"
    },
    { // Index 7: Yellow/Gold (Custom Fallback 2)
      badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border dark:border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
      avatar: "bg-gradient-to-br from-yellow-500/10 to-amber-500/10 dark:from-yellow-500/20 dark:to-amber-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-200/40 dark:border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.18)]"
    }
  ];

  switch (cleanType) {
    case "wedding":
      return themes[0];
    case "pre-wedding":
      return themes[1]; // Emerald Green (Upgraded for high contrast)
    case "engagement":
      return themes[2];
    case "birthday":
      return themes[3];
    case "anniversary":
      return themes[4];
    case "maternity":
      return themes[5];
    default: {
      // Deterministic hash based on custom event type name to automatically select one of our premium themes
      let hash = 0;
      for (let i = 0; i < cleanType.length; i++) {
        hash = cleanType.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % themes.length;
      return themes[index];
    }
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

export function getEventTypeColor(type: string): string {
  return getEventTheme(type).badge;
}


