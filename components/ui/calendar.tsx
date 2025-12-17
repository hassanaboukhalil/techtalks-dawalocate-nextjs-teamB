"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button:
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",

        table: "w-full border-collapse space-y-1",

        // ✅ THIS IS THE KEY FIX
        head_row: "grid grid-cols-7",
        head_cell:
          "text-slate-500 rounded-md w-9 font-normal text-[0.8rem] text-center",

        row: "grid grid-cols-7 mt-2",

        cell: "relative h-9 w-9 text-center text-sm p-0",

        day: cn(
          "h-9 w-9 p-0 font-normal rounded-md",
          "hover:bg-slate-100 focus:bg-slate-100"
        ),
        day_selected:
          "bg-[#119abf] text-white hover:bg-[#0e8cae] focus:bg-[#0e8cae]",
        day_today: "border border-[#119abf]",
        day_outside: "text-slate-400 opacity-50",
        day_disabled: "text-slate-400 opacity-50",

        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
