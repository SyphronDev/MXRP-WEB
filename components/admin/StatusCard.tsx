import React from "react";
import { Shield, TrendingUp } from "lucide-react";

interface StatusCardProps {
  title: string;
  status: string;
  description: string;
  isPositive: boolean;
  icon?: React.ReactNode;
}

export default function StatusCard({
  title,
  status,
  description,
  isPositive,
  icon,
}: StatusCardProps) {
  const getStatusColor = () => {
    if (isPositive) {
      return {
        text: "text-green-400",
        bg: "bg-green-500/20",
        border: "border-green-500/30",
        iconBg: "bg-gradient-to-br from-green-500/20 to-blue-500/20",
      };
    } else {
      return {
        text: "text-red-400",
        bg: "bg-red-500/20",
        border: "border-red-500/30",
        iconBg: "bg-gradient-to-br from-red-500/20 to-orange-500/20",
      };
    }
  };

  const colors = getStatusColor();

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {status}
            </p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
            >
              {isPositive ? "Cumple" : "No Cumple"}
            </span>
          </div>
          <p className="text-white/60 text-sm mt-2">{description}</p>
        </div>
        <div
          className={`p-2 sm:p-3 md:p-4 ${colors.iconBg} rounded-lg md:rounded-xl`}
        >
          {icon || (
            <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
          )}
        </div>
      </div>
    </div>
  );
}
