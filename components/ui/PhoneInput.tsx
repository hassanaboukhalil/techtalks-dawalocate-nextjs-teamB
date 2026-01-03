"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import lebanonFlag from "@/public/images/Lebanon.jpeg";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  label = "Phone Number",
  placeholder = "70123456",
  className = "",
  required = false,
}: PhoneInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none z-10">
          <Image
            src={lebanonFlag}
            alt="Lebanon"
            className="w-6 h-4 object-cover rounded-sm"
            width={20}
            height={20}
          />
          <span className="text-gray-900 font-medium text-sm">
            +961
          </span>
          <span className="text-gray-300">|</span>
        </div>
        <Input
          type="tel"
          value={value}
          onChange={(e) => {
            const inputValue = e.target.value.replace(/\D/g, "");
            if (inputValue.length <= 8) {
              onChange(inputValue);
            }
          }}
          pattern="^\d{8}$"
          className={`h-11 rounded-lg border-gray-300 focus:border-primary focus:ring-primary text-gray-900 pl-[110px] ${className}`}
          placeholder={placeholder}
          required={required}
          minLength={8}
          maxLength={8}
          title="Please enter exactly 8 digits (e.g., 70123456)"
        />
      </div>
    </div>
  );
}
