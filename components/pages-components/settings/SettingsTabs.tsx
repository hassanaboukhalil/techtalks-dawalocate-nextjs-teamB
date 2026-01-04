import { ReactNode } from "react";
import { User, Shield } from "lucide-react";

type TabKey = "account" | "security";

interface TabConfig {
  key: TabKey;
  label: string;
  icon: ReactNode;
}

interface SettingsTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs: TabConfig[] = [
    { key: "account", label: "Account Info", icon: <User className="w-4 h-4" /> },
    { key: "security", label: "Security", icon: <Shield className="w-4 h-4" /> }
  ];

  return (
    <div className="w-full animate-fade-in-up animation-delay-200">
      <div className="relative w-full max-w-md mx-auto">
        {/* Background with animated gradient */}
        <div className="absolute inset-0 rounded-2xl opacity-30 animate-pulse-slow" style={{ backgroundColor: "#2699b2" }}></div>

        {/* Main container */}
        <div className="relative grid grid-cols-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl">
          {/* Sliding indicator */}
          <div
            className={`absolute top-1.5 h-[calc(100%-12px)] rounded-xl shadow-lg transition-all duration-500 ease-out transform pointer-events-none ${
              activeTab === "account"
                ? "left-1.5 translate-x-0"
                : "left-1.5 translate-x-full"
            }`}
            style={{
              width: "calc(50% - 6px)",
              backgroundColor: "#2699b2"
            }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-xl"></div>

            {/* Ripple effect on active tab */}
            <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse opacity-50"></div>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`relative z-20 py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 group ${
                activeTab === tab.key
                  ? "text-white transform scale-105"
                  : "text-slate-600 hover:text-slate-800"
              }`}
              style={activeTab !== tab.key ? { transform: "scale(1.02)" } : undefined}
              onMouseEnter={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.key) {
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                  activeTab === tab.key
                    ? "bg-white/20 text-white shadow-lg"
                    : "text-slate-700"
                }`} style={activeTab !== tab.key ? { backgroundColor: "var(--color-primary-hover)" } : undefined}>
                  {tab.icon}
                </div>
                <span className="relative">
                  {tab.label}
                  {/* Hover underline effect */}
                  <div className={`absolute -bottom-1 left-0 h-0.5 bg-white/60 transition-all duration-300 ${
                    activeTab === tab.key ? "w-full" : "w-0 group-hover:w-full"
                  }`}></div>
                </span>
              </div>

              {/* Floating particles effect */}
              {activeTab === tab.key && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1 right-2 w-1 h-1 bg-white/60 rounded-full animate-bounce animation-delay-100"></div>
                  <div className="absolute bottom-2 left-3 w-0.5 h-0.5 bg-white/40 rounded-full animate-bounce animation-delay-300"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Ambient glow effect */}
        <div className="absolute -inset-2 rounded-3xl blur-xl opacity-20 transition-all duration-500 pointer-events-none" style={{ backgroundColor: "#2699b2" }}></div>
      </div>
    </div>
  );
}
