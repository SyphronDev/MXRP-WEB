"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

interface MobileTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function MobileTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: MobileTabsProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);

  const scrollTabs = (direction: 'left' | 'right') => {
    const container = document.getElementById('mobile-tabs-container');
    if (!container) return;

    const scrollAmount = 120;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
    setScrollPosition(newPosition);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Scroll buttons for mobile */}
      <div className="flex items-center">
        <button
          onClick={() => scrollTabs('left')}
          className="flex-shrink-0 p-2 text-white/60 hover:text-white transition-colors lg:hidden"
          disabled={scrollPosition <= 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Tabs container */}
        <div
          id="mobile-tabs-container"
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex space-x-1 p-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-xl min-w-max">
            {tabs.map((tab, index) => {
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && onTabChange(tab.id)}
                  disabled={tab.disabled}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                      : "text-white/60 hover:text-white hover:bg-white/10",
                    tab.disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 animate-pulse" />
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
                    
                    <span>{tab.label}</span>
                    
                    {tab.badge && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-full text-xs font-medium",
                        isActive 
                          ? "bg-white/20 text-white" 
                          : "bg-purple-500/20 text-purple-400"
                      )}>
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => scrollTabs('right')}
          className="flex-shrink-0 p-2 text-white/60 hover:text-white transition-colors lg:hidden"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Active tab indicator for mobile */}
      <div className="mt-2 lg:hidden">
        <div className="flex justify-center space-x-1">
          {tabs.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 w-6 rounded-full transition-all duration-200",
                index === activeIndex 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500" 
                  : "bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}