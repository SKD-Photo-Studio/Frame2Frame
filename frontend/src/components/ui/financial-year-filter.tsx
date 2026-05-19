"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { useTransition } from "react";

export default function FinancialYearFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentFY = searchParams.get("fy") || "all";

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "all") {
      params.delete("fy");
    } else {
      params.set("fy", val);
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div 
      className={`relative flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
        isPending ? 'opacity-50' : 'opacity-90 hover:opacity-100'
      }`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
    >
      <Calendar className="h-4 w-4 text-brand-600" />
      <span className="text-xs text-gray-400 font-normal mr-1 hidden sm:inline">FY:</span>
      <select
        value={currentFY}
        onChange={handleChange}
        suppressHydrationWarning={true}
        className="bg-transparent pr-8 py-0.5 text-sm font-medium focus:outline-none cursor-pointer appearance-none relative z-10"
        style={{ color: 'var(--foreground)' }}
      >
        <option value="all" className="bg-white dark:bg-zinc-900" style={{ color: 'var(--foreground)' }}>All Years</option>
        <option value="2026" className="bg-white dark:bg-zinc-900" style={{ color: 'var(--foreground)' }}>FY: April 2026 - March 2027</option>
        <option value="2025" className="bg-white dark:bg-zinc-900" style={{ color: 'var(--foreground)' }}>FY: April 2025 - March 2026</option>
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 z-0">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
