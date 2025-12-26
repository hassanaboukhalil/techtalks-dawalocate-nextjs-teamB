"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Pharmacy {
    id: number;
    name: string;
    city: string | null;
}

interface PharmacyAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect?: (pharmacy: Pharmacy) => void;
    placeholder?: string;
    className?: string;
}

export function PharmacyAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Search pharmacy name",
    className,
}: PharmacyAutocompleteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setSearchTerm(value);
    }, [value]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPharmacies(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchPharmacies = async (query: string) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/global/pharmacies?query=${encodeURIComponent(query)}`);
            if (res.data.success) {
                setPharmacies(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch pharmacies", error);
        } finally {
            setLoading(false);
        }
    };

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

    const handleSelect = (pharmacy: Pharmacy) => {
        onChange(pharmacy.name);
        setSearchTerm(pharmacy.name);
        setIsOpen(false);
        if (onSelect) {
            onSelect(pharmacy);
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
                    className={cn(
                        "flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin text-gray-400" /> : <ChevronDown className="h-4 w-4 opacity-50" />}
                </div>
            </div>

            {isOpen && (pharmacies.length > 0 || loading) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {pharmacies.map((pharmacy) => (
                        <button
                            key={pharmacy.id}
                            onClick={() => handleSelect(pharmacy)}
                            className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors flex items-center justify-between group"
                        >
                            <div className="flex-1">
                                <div className="font-medium text-sm text-gray-900">{pharmacy.name}</div>
                                {pharmacy.city && (
                                    <div className="text-xs text-gray-500">{pharmacy.city}</div>
                                )}
                            </div>
                            <Check className={cn("w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2", searchTerm === pharmacy.name && 'opacity-100')} />
                        </button>
                    ))}
                    {!loading && pharmacies.length === 0 && searchTerm && (
                        <div className="p-3 text-sm text-gray-500 text-center">No pharmacies found</div>
                    )}
                </div>
            )}
        </div>
    );
}
