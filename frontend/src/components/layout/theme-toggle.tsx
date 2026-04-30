"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full",
        "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <>
          <Sun className="h-5 w-5 flex-shrink-0" />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="h-5 w-5 flex-shrink-0" />
          <span>Dark Mode</span>
        </>
      )}
    </button>
  );
}
