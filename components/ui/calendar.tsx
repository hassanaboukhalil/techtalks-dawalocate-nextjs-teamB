"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout="dropdown"
      fromYear={2000}
      toYear={2040}
      className={cn(
        "relative rounded-[1.75rem] bg-white p-5",
        "border border-slate-200 shadow-[0_20px_40px_rgba(0,0,0,0.08)]",
        className
      )}
      classNames={{
        /* ───────── MONTH CONTAINER ───────── */
        months: "flex flex-col gap-4",
        month: "space-y-4",

        /* ───────── HEADER ───────── */
        caption: "flex flex-col items-center gap-3",
        caption_label: "hidden",

        caption_dropdowns:
          "flex gap-3 items-center justify-center",

        dropdown:
          cn(
            "appearance-none rounded-full px-4 py-1.5 text-sm font-extrabold",
            "bg-gradient-to-r from-indigo-50 to-violet-50",
            "border border-indigo-200 text-indigo-800",
            "shadow-sm hover:shadow-md",
            "hover:from-indigo-100 hover:to-violet-100",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
            "transition-all cursor-pointer"
          ),

        dropdown_month: "min-w-[130px] text-center",
        dropdown_year: "min-w-[90px] text-center",

        /* ❌ NO ARROWS */
        nav: "hidden",

        /* ───────── TABLE ───────── */
        table: "w-full table-fixed border-collapse",

        head_row: "",
        head_cell:
          "w-10 h-[30px] text-[0.7rem] uppercase tracking-widest font-bold text-slate-400 pb-2 flex items-center justify-center mx-auto",
        row: "",

        /* ───────── DAY CELLS ───────── */
        cell:
          "h-11 w-[44px] p-0 text-center align-middle",

        day:
          cn(
            "h-10 w-10 pl-3 mx-auto rounded-xl font-semibold text-slate-700",
            "transition-all duration-200",
            "hover:bg-indigo-0 hover:text-indigo-40 hover:scale-130",
            "active:scale-95"
          ),

        day_selected:
          cn(
            
            "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white",
            "shadow-lg shadow-indigo-500/40 scale-105 font-bold"
          ),

        day_today:
          "border-2 border-indigo-500 text-indigo-600 bg-indigo-50 font-bold",

        day_outside:
          "text-slate-300 opacity-40",

        day_disabled:
          "text-slate-300 opacity-30",

        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
