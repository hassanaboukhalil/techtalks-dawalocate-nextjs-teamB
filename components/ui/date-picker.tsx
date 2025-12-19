"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  value?: Date;
  onChange: (date?: Date) => void;
  placeholder?: string;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  fromYear = 1900,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-500" />
            {value ? format(value, "PPP") : placeholder}
          </span>
          <span className="text-slate-400 text-xs">▼</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        className="p-0 w-auto rounded-xl shadow-xl border bg-white z-[99999]"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          disabled={(date) => date > new Date()}
          classNames={{
            caption: "flex justify-center gap-2 py-2",
            caption_label: "hidden",
            dropdown:
              "px-2 py-1 rounded-md border text-sm bg-white hover:bg-slate-50",
            nav_button: "h-7 w-7 bg-transparent hover:bg-slate-100",
            day_selected:
              "bg-[#119abf] text-white hover:bg-[#0e8cae]",
            day_today:
              "border border-[#119abf] text-[#119abf]",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
