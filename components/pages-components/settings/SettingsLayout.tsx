import { ReactNode } from "react";

interface SettingsLayoutProps {
  title: string;
  description: string;
  breadcrumb?: string[];
  children: ReactNode;
}

export default function SettingsLayout({ title, description, breadcrumb = ["Dashboard", "Settings"], children }: SettingsLayoutProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Breadcrumb */}
      <div className="text-xs text-slate-500 flex items-center gap-2 animate-fade-in">
        {breadcrumb.map((item, index) => (
          <span key={index} className={index > 0 ? "flex items-center gap-2" : ""}>
            {index > 0 && <span className="opacity-50">/</span>}
            {item}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          <p className="text-slate-500 mt-1">
            {description}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}
