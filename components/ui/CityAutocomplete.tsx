"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
          !value && "text-gray-500",
          className
        )}
      >
        <span>{value || placeholder}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Search Input */}
          <div className="border-b border-gray-200 p-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cities..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Cities List */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredCities.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                No city found.
              </div>
            ) : (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className={cn(
                    "flex w-full items-center rounded-sm px-3 py-2 text-sm text-gray-900 hover:bg-primary-hover cursor-pointer transition-colors",
                    value === city && "bg-primary-hover"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
