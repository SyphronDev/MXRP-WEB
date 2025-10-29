"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface NavigationTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function NavigationTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  className,
}: NavigationTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const baseStyles = "relative flex transition-all duration-200";
  
  const containerVariants = {
    default: "bg-black/20 backdrop-blur-md border border-white/20 rounded-xl p-1",
    pills: "bg-transparent space-x-2",
    underline: "bg-transparent border-b border-white/20",
  };

  const tabVariants = {
    default: {
      base: "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm",
      active: "bg-purple-600 text-white shadow-lg shadow-purple-500/25",
      inactive: "text-white/60 hover:text-white hover:bg-white/10",
    },
    pills: {
      base: "flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium text-sm",
      active: "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25",
      inactive: "bg-black/40 backdrop-blur-md border border-white/20 text-white/60 hover:text-white hover:bg-white/10",
    },
    underline: {
      base: "flex items-center justify-center gap-2 px-6 py-4 transition-all duration-200 font-medium text-sm relative",
      active: "text-purple-400 border-b-2 border-purple-400",
      inactive: "text-white/60 hover:text-white border-b-2 border-transparent hover:border-white/20",
    },
  };



  return (
    <div className={cn(baseStyles, containerVariants[variant], className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isHovered = hoveredTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            onMouseEnter={() => setHoveredTab(tab.id)}
            onMouseLeave={() => setHoveredTab(null)}
            disabled={tab.disabled}
            className={cn(
              tabVariants[variant].base,
              isActive ? tabVariants[variant].active : tabVariants[variant].inactive,
              tab.disabled && "opacity-50 cursor-not-allowed",
              variant === "default" && "flex-1",
              "group relative overflow-hidden"
            )}
          >
            {/* Hover effect */}
            {variant === "default" && isHovered && !isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg" />
            )}
            
            {/* Content */}
            <div className="relative z-10 flex items-center gap-2">
              {tab.icon && (
                <span className={cn(
                  "transition-transform duration-200",
                  isActive && "scale-110"
                )}>
                  {tab.icon}
                </span>
              )}
              
              <span className="whitespace-nowrap">{tab.label}</span>
              
              {tab.badge && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  isActive 
                    ? "bg-white/20 text-white" 
                    : "bg-purple-500/20 text-purple-400"
                )}>
                  {tab.badge}
                </span>
              )}
            </div>

            {/* Active indicator for underline variant */}
            {variant === "underline" && isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}