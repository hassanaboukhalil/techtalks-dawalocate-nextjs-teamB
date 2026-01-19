"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search, Pill, AlertCircle } from "lucide-react";
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
    : medicines;

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
    if (hasInteracted || searchTerm.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputClick = () => {
    setHasInteracted(true);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={cn("relative group", className)}>
      <div className="relative">
        {/* Leading Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#119abf] transition-colors pointer-events-none">
          {isOpen ? <Search className="w-4 h-4" /> : <Pill className="w-4 h-4" />}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onClick={handleInputClick}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 h-12 rounded-xl  border border-slate-200  bg-white shadow-sm text-sm font-medium text-slate-700 placeholder:text-slate-400 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-[#119abf]/20 focus:border-[#119abf]",
            "hover:border-slate-300"
          )}
          
        />
        
        {/* Trailing Chevron */}
        <ChevronDown
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-transform duration-200 cursor-pointer hover:text-slate-600",
            isOpen && "rotate-180 text-[#119abf]"
          )}
          onClick={() => {
            setHasInteracted(true);
            setIsOpen(!isOpen);
            if (!isOpen) inputRef.current?.focus();
          }}
        />
      </div>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-[100] max-h-80 overflow-y-auto w-full animate-in fade-in zoom-in-95 duration-100">
          {filteredMedicines.length > 0 ? (
            <div className="p-1.5 space-y-0.5">
              {filteredMedicines.map((medicine) => (
                <button
                  key={medicine.id}
                  onClick={() => handleSelect(medicine)}
                  className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors flex items-start justify-between group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-semibold text-sm text-slate-900 truncate group-hover:text-[#119abf] transition-colors">
                      {medicine.name}
                    </div>
                    {(medicine.genericName || medicine.strength) && (
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        {medicine.genericName && (
                          <span className="truncate">{medicine.genericName}</span>
                        )}
                        {medicine.genericName && medicine.strength && (
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                        )}
                        {medicine.strength && (
                          <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {medicine.strength} {medicine.form}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {searchTerm === medicine.name && (
                    <Check className="w-4 h-4 text-[#119abf] mt-1" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2">
                <AlertCircle className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-900">No medicines found</p>
              <p className="text-xs text-slate-500 mt-1">Try checking the spelling or generic name.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}