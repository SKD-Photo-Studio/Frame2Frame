"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  freeText?: boolean;
}

export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  onAddNew,
  addNewLabel,
  freeText = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      if (!freeText) {
        const matched = options.find((o) => o.value === value);
        setQuery(matched ? matched.label : "");
      } else {
        setQuery(value);
      }
    }
  }, [value, options, freeText, open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = query === "" 
    ? options 
    : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 pr-8"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (freeText) {
              onChange(val);
            }
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <div 
          className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm overflow-hidden flex flex-col">
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.length === 0 && !freeText ? (
              <div className="relative cursor-default select-none py-2 px-4 text-sm text-gray-500">
                No results found.
              </div>
            ) : null}

            {filteredOptions.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-900 dark:hover:text-brand-400 text-gray-900 dark:text-gray-300 text-sm",
                  value === option.value && "bg-brand-50 dark:bg-brand-900/30 font-medium text-brand-900 dark:text-brand-400"
                )}
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setOpen(false);
                }}
              >
                <span className="block truncate">{option.label}</span>
              </div>
            ))}
          </div>

          {onAddNew && (
            <div
              className="border-t border-gray-100 dark:border-gray-800 flex items-center cursor-pointer select-none py-2.5 px-3 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 font-semibold bg-gray-50/50 dark:bg-gray-800/50"
              onClick={() => {
                setOpen(false);
                onAddNew();
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {addNewLabel || "Add New"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
