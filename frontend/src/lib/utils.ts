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

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPaidStatusColor(status: string): string {
  switch (status) {
    case "Paid":
      return "bg-emerald-100 text-emerald-700";
    case "Partial":
      return "bg-amber-100 text-amber-700";
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
