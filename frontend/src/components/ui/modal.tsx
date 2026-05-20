"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = "lg",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-start justify-center overflow-y-auto sm:py-8 sm:px-4">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative z-10 w-full max-h-[92vh] sm:max-h-none flex flex-col ${sizeClasses[size] || "max-w-lg"} ${className || ""} rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5 dark:ring-white/10`}>
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 text-gray-700 dark:text-gray-300 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
