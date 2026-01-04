import { ReactNode } from "react";
import { Pencil } from "lucide-react";
import Image from "next/image";
import lebanonFlag from "@/public/images/Lebanon.jpeg";

interface EditableFieldProps {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onToggleEdit: () => void;
  placeholder?: string;
  type?: "text" | "textarea";
  rows?: number;
  helperText?: string;
  isPhoneField?: boolean;
}

export default function EditableField({
  label,
  icon,
  value,
  onChange,
  isEditing,
  onToggleEdit,
  placeholder = "",
  type = "text",
  rows = 3,
  helperText,
  isPhoneField = false
}: EditableFieldProps) {
  return (
    <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        {icon}
        {label}
      </label>

      <div className="flex items-center gap-3 group">
        <div className="flex-1 relative">
          {isPhoneField ? (
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
          ) : null}

          {type === "textarea" ? (
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={!isEditing}
              rows={rows}
              className={[
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-300 resize-none",
                "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50",
                "hover:shadow-md transform hover:scale-[1.01]",
                !isEditing ? "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700" : "bg-white shadow-lg",
              ].join(" ")}
              style={isPhoneField ? { paddingLeft: '110px' } : {}}
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => {
                if (isPhoneField) {
                  const inputValue = e.target.value.replace(/\D/g, "");
                  if (inputValue.length <= 8) {
                    onChange(inputValue);
                  }
                } else {
                  onChange(e.target.value);
                }
              }}
              disabled={!isEditing}
              className={[
                "w-full h-12 rounded-xl border px-4 text-sm outline-none transition-all duration-300",
                "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50",
                "hover:shadow-md transform hover:scale-[1.01]",
                !isEditing ? "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700" : "bg-white shadow-lg",
              ].join(" ")}
              style={isPhoneField ? { paddingLeft: '110px' } : {}}
              placeholder={placeholder}
            />
          )}

          {!isEditing && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleEdit}
          className={`h-12 w-12 rounded-xl text-white flex items-center justify-center shadow-lg shadow-blue-200 transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${type === "textarea" ? "self-start mt-1" : ""}`}
          style={{ backgroundColor: "#2699b2" }}
          aria-label={`Edit ${label.toLowerCase()}`}
        >
          <Pencil className="w-5 h-5 transition-transform duration-200 group-hover:rotate-45" />
        </button>
      </div>

      {helperText && (
        <p className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-blue-400 inline-block"></span>
          {helperText}
        </p>
      )}
    </div>
  );
}
