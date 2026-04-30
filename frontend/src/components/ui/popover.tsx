"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export default function Popover({ 
  trigger, 
  children, 
  className,
  align = "left" 
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2"
  };

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 min-w-[280px] rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] p-2 shadow-xl animate-in fade-in zoom-in-95 duration-200",
            alignmentClasses[align],
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
