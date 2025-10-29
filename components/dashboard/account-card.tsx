"use client";

import { CardModern } from "@/components/ui/card-modern";
import { formatCurrency } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AccountCardProps {
  title: string;
  balance: number;
  isActive?: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  subtitle?: string;
  index?: number;
  balanceVisible?: boolean;
}

export function AccountCard({
  title,
  balance,
  isActive = true,
  icon: Icon,
  iconColor,
  iconBg,
  subtitle,
  index = 0,
  balanceVisible = true,
}: AccountCardProps) {
  return (
    <CardModern 
      variant="glass" 
      hover={true}
      className="p-4 sm:p-6 animate-scale-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${iconBg} rounded-lg`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
          }`}
        >
          {isActive ? "Activa" : "Inactiva"}
        </span>
      </div>
      
      <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
        {title}
      </h3>
      
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
        {balanceVisible ? formatCurrency(balance) : "••••••"}
      </p>
      
      {subtitle && (
        <p className="text-white/40 text-xs">{subtitle}</p>
      )}
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </CardModern>
  );
}