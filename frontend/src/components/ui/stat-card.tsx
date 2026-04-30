import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "teal" | "emerald" | "green" | "amber" | "red" | "orange" | "brand" | "indigo";
  className?: string;
}

const colorVariants = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  teal: "bg-teal-50 text-teal-600",
  emerald: "bg-emerald-50 text-emerald-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  brand: "bg-brand-50 text-brand-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({ label, value, icon, color, className }: StatCardProps) {
  return (
    <div className={cn("stat-card flex items-center gap-2.5", className)}>
      <div className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10", 
        colorVariants[color],
        "dark:bg-opacity-10 dark:text-opacity-90"
      )}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide opacity-60 sm:text-xs">
          {label}
        </p>
        <p className="mt-0.5 truncate text-base font-bold sm:text-lg lg:text-xl">
          {value}
        </p>
      </div>
    </div>
  );
}

export function FinanceCard({ label, value, icon, color, className }: StatCardProps) {
  // Alias for backward compatibility during transition or specific semantic usage
  return <StatCard label={label} value={value} icon={icon} color={color} className={className} />;
}
