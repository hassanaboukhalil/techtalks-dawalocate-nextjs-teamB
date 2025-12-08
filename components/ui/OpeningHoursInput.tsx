"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "./button";

interface TimeSlot {
  id: string;
  days: string[];
  openTime: string;
  closeTime: string;
}

interface OpeningHoursInputProps {
  value: string;
  onChange: (value: string) => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function OpeningHoursInput({ value, onChange }: OpeningHoursInputProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() => {
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return [
          {
            id: "1",
            days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            openTime: "09:00",
            closeTime: "18:00",
          },
        ];
      }
    }
    return [
      {
        id: "1",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        openTime: "09:00",
        closeTime: "18:00",
      },
    ];
  });

  const updateParent = (slots: TimeSlot[]) => {
    onChange(JSON.stringify(slots));
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      days: [],
      openTime: "09:00",
      closeTime: "18:00",
    };
    const updated = [...timeSlots, newSlot];
    setTimeSlots(updated);
    updateParent(updated);
  };

  const removeTimeSlot = (id: string) => {
    const updated = timeSlots.filter((slot) => slot.id !== id);
    setTimeSlots(updated);
    updateParent(updated);
  };

  const updateTimeSlot = (
    id: string,
    field: keyof TimeSlot,
    value: string | string[]
  ) => {
    const updated = timeSlots.map((slot) =>
      slot.id === id ? { ...slot, [field]: value } : slot
    );
    setTimeSlots(updated);
    updateParent(updated);
  };

  const toggleDay = (slotId: string, day: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot) return;

    const days = slot.days.includes(day)
      ? slot.days.filter((d) => d !== day)
      : [...slot.days, day];

    updateTimeSlot(slotId, "days", days);
  };

  const formatDisplay = (): string => {
    if (timeSlots.length === 0) return "";
    return timeSlots
      .map((slot) => {
        if (slot.days.length === 0) return "";
        const daysStr =
          slot.days.length === 7
            ? "Every day"
            : slot.days.length === 5 &&
              ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) =>
                slot.days.includes(d)
              )
            ? "Mon-Fri"
            : slot.days.join(", ");
        return `${daysStr}: ${slot.openTime} - ${slot.closeTime}`;
      })
      .filter(Boolean)
      .join(" | ");
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-gray-500">
        {formatDisplay() || "Add opening hours"}
      </div>

      {timeSlots.map((slot, index) => (
        <div
          key={slot.id}
          className="p-4 border border-gray-200 rounded-lg space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Time Slot {index + 1}
            </span>
            {timeSlots.length > 1 && (
              <button
                type="button"
                onClick={() => removeTimeSlot(slot.id)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-600 mb-2 block">Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(slot.id, day)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    slot.days.includes(day)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Open</label>
              <input
                type="time"
                value={slot.openTime}
                onChange={(e) =>
                  updateTimeSlot(slot.id, "openTime", e.target.value)
                }
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Close</label>
              <input
                type="time"
                value={slot.closeTime}
                onChange={(e) =>
                  updateTimeSlot(slot.id, "closeTime", e.target.value)
                }
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addTimeSlot}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Time Slot
      </Button>
    </div>
  );
}
