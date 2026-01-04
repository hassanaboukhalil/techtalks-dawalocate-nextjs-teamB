"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Medicine {
  id: number;
  name: string;
  genericName?: string | null;
  strength?: string | null;
  form?: string | null;
  synonyms?: string | null;
}

interface MedicineAutocompleteProps {
  medicines: Medicine[];
  value: string;
  onChange: (value: string) => void;
  onSelect?: (medicine: Medicine) => void;
  placeholder?: string;
  className?: string;
}

export function MedicineAutocomplete({
  medicines,
  value,
  onChange,
  onSelect,
  placeholder = "Search medicine name",
  className,
}: MedicineAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Show all medicines when search term is empty, filter when user types
  const filteredMedicines = searchTerm.trim()
    ? medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (medicine.genericName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false) ||
          (medicine.synonyms
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ??
            false)
      )
    : medicines; // Show all medicines when search term is empty

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHasInteracted(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (medicine: Medicine) => {
    onChange(medicine.name);
    setSearchTerm(medicine.name);
    setIsOpen(false);
    setHasInteracted(false);
    if (onSelect) {
      onSelect(medicine);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setHasInteracted(true);
    setIsOpen(true);
  };

  const handleFocus = () => {
    // Only open dropdown on focus if user has interacted or there's existing text
    // This prevents auto-opening when dialog opens and auto-focuses the input
    if (hasInteracted || searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    setHasInteracted(true);
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
          onFocus={handleFocus}
          onClick={handleInputClick}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform cursor-pointer",
            isOpen && "rotate-180"
          )}
          onClick={() => {
            setHasInteracted(true);
            setIsOpen(!isOpen);
          }}
        />
      </div>

      {isOpen && (
        <>
          {filteredMedicines.length > 0 ? (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto w-full max-w-md">
              {filteredMedicines.map((medicine) => (
                <button
                  key={medicine.id}
                  onClick={() => handleSelect(medicine)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {medicine.name}
                    </div>
                    {medicine.genericName && (
                      <div className="text-xs text-gray-500 truncate">
                        {medicine.genericName}
                      </div>
                    )}
                    {medicine.strength && (
                      <div className="text-xs text-gray-400 truncate">
                        {medicine.strength}
                        {medicine.form && ` - ${medicine.form}`}
                      </div>
                    )}
                  </div>
                  <Check className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 p-3 text-sm text-gray-500 w-full max-w-md">
              No medicines found for &quot;{searchTerm}&quot;
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
