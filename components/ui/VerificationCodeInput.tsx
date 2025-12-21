"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function VerificationCodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
  className,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(
    autoFocus ? 0 : null
  );

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow numbers
    const sanitized = newValue.replace(/\D/g, "");
    if (!sanitized) return;

    const digit = sanitized[sanitized.length - 1]; // Take last digit
    const newCode = value.split("");
    newCode[index] = digit;

    const finalCode = newCode.join("").slice(0, length);
    onChange(finalCode);

    // Move to next input
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newCode = value.split("");

      if (value[index]) {
        // Clear current digit
        newCode[index] = "";
        onChange(newCode.join(""));
      } else if (index > 0) {
        // Move to previous and clear
        newCode[index - 1] = "";
        onChange(newCode.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Delete") {
      e.preventDefault();
      const newCode = value.split("");
      newCode[index] = "";
      onChange(newCode.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain");
    const sanitized = pastedData.replace(/\D/g, "").slice(0, length);

    if (sanitized) {
      onChange(sanitized);
      // Focus last filled input or last input
      const nextIndex = Math.min(sanitized.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select text on focus for easier editing
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  return (
    <div className={cn("flex gap-2 justify-center", className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            error
              ? "border-red-300 bg-red-50 text-red-900 focus:border-red-500 focus:ring-red-500"
              : focusedIndex === index
              ? "border-primary bg-primary/5 text-gray-900 focus:border-primary focus:ring-primary"
              : value[index]
              ? "border-gray-300 bg-white text-gray-900"
              : "border-gray-300 bg-white text-gray-900",
            disabled && "opacity-50 cursor-not-allowed bg-gray-100",
            "sm:w-14 sm:h-16 sm:text-3xl"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
