"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
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
      (charity.city?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
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
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 h-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {isOpen && filteredCharities.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {filteredCharities.map((charity) => (
            <button
              key={charity.id}
              onClick={() => handleSelect(charity)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{charity.name}</div>
                {charity.city && (
                  <div className="text-xs text-gray-500">{charity.city}</div>
                )}
              </div>
              <Check className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm && filteredCharities.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 p-3 text-sm text-gray-500">
          No charities found for &quot;{searchTerm}&quot;
        </div>
      )}
    </div>
  );
}
