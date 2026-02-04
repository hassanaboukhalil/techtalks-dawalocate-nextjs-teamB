"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Charity {
  id: number;
  name: string;
  city?: string | null;
  phone?: string | null;
  email: string;
}

interface CharityAutocompleteProps {
  charities: Charity[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (charity: Charity) => void;
  placeholder?: string;
  className?: string;
}

export function CharityAutocomplete({
  charities,
  value,
  onChange,
  onSelect,
  placeholder = "Search charity name",
  className,
}: CharityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredCharities = charities.filter(
    (charity) =>
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (charity.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (charity: Charity) => {
    onChange(charity.name);
    setSearchTerm(charity.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(charity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={cn("relative group", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#119abf] transition-colors pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 h-12 rounded-xl border border-slate-200 bg-white shadow-sm text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf]",
            "hover:border-slate-300",
          )}
        />

        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform duration-200 cursor-pointer hover:text-slate-600",
            isOpen && "rotate-180 text-[#119abf]",
          )}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) inputRef.current?.focus();
          }}
        />
      </div>

      {isOpen && filteredCharities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-80 overflow-y-auto w-full animate-in fade-in zoom-in-95 duration-100">
          {filteredCharities.map((charity) => (
            <button
              key={charity.id}
              onClick={() => handleSelect(charity)}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start justify-between group"
            >
              <div className="flex-1 min-w-0 pr-2">
                <div className="font-medium text-sm text-slate-900 truncate group-hover:text-[#119abf] transition-colors">
                  {charity.name}
                </div>
                {charity.city && (
                  <div className="text-xs text-slate-500">{charity.city}</div>
                )}
              </div>
              <Check className="w-4 h-4 text-[#119abf] mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredCharities.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] p-4 text-sm text-slate-500">
          No charities found for "{searchTerm}"
        </div>
      )}
    </div>
  );
}
