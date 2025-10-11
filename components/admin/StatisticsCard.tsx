import React from "react";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  percentage?: number;
  trend?: "up" | "down" | "neutral";
  color: "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "red";
  showProgressBar?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    icon: "text-blue-400",
    progress: "bg-blue-500",
  },
  green: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    icon: "text-green-400",
    progress: "bg-green-500",
  },
  yellow: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    icon: "text-yellow-400",
    progress: "bg-yellow-500",
  },
  purple: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    icon: "text-purple-400",
    progress: "bg-purple-500",
  },
  orange: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    icon: "text-orange-400",
    progress: "bg-orange-500",
  },
  pink: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    icon: "text-pink-400",
    progress: "bg-pink-500",
  },
  red: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    icon: "text-red-400",
    progress: "bg-red-500",
  },
};

export default function StatisticsCard({
  title,
  value,
  subtitle,
  percentage,
  trend = "neutral",
  color,
  showProgressBar = false,
}: StatisticsCardProps) {
  const colors = colorClasses[color];

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${colors.bg} rounded-lg`}>
          <BarChart3 className={`h-5 w-5 sm:h-6 sm:w-6 ${colors.icon}`} />
        </div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </h3>
        {trend !== "neutral" && <div className="ml-auto">{getTrendIcon()}</div>}
      </div>

      <div className="flex items-end justify-between mb-2">
        <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
          {value}
        </p>
        {percentage !== undefined && (
          <span className={`text-sm font-medium ${colors.text}`}>
            {percentage}%
          </span>
        )}
      </div>

      {showProgressBar && percentage !== undefined && (
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className={`${colors.progress} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          ></div>
        </div>
      )}

      {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
    </div>
  );
}







