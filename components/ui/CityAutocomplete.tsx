"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CityAutocompleteProps {
  cities: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CityAutocomplete({
  cities,
  value,
  onChange,
  placeholder = "Select a city",
  className,
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full group" data-city-dropdown>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-white shadow-sm px-3 py-2 text-sm text-slate-900 transition-all",
          "hover:bg-white-[#119abf] hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf]",
          !value && "text-slate-500",
          isOpen && "bg-white border-slate-200 border-[#119abf] ring-2 ring-[#119abf]/20",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className={cn(
            "w-4 h-4 transition-colors",
            value ? "text-[#119abf]" : "text-slate-400 group-hover:text-slate-500"
          )} />
          <span className="truncate">{value || placeholder}</span>
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180 text-[#119abf]"
          )} 
        />
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 rounded-xl border border-slate-100 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          
          {/* Internal Search Input */}
          <div className="border-b border-slate-100 p-2 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="Type to filter..."
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-[#119abf] focus:outline-none focus:ring-1 focus:ring-[#119abf] placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-[250px] overflow-y-auto p-1.5">
            {filteredCities.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-900">No city found</p>
                <p className="text-xs text-slate-500 mt-1">Try a different spelling.</p>
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(city);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
                    value === city 
                      ? "bg-slate-50 text-[#119abf] font-medium" 
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <span>{city}</span>
                  {value === city && <Check className="h-4 w-4 text-[#119abf]" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}