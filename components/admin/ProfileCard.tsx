import React from "react";

interface ProfileCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "purple" | "orange" | "pink" | "red";
}

const colorClasses = {
  blue: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    icon: "text-blue-400",
  },
  green: {
    bg: "bg-green-500/20",
    text: "text-green-400",
    icon: "text-green-400",
  },
  yellow: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    icon: "text-yellow-400",
  },
  purple: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    icon: "text-purple-400",
  },
  orange: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    icon: "text-orange-400",
  },
  pink: {
    bg: "bg-pink-500/20",
    text: "text-pink-400",
    icon: "text-pink-400",
  },
  red: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    icon: "text-red-400",
  },
};

export default function ProfileCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: ProfileCardProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 ${colors.bg} rounded-lg`}>
          <div className={colors.icon}>{icon}</div>
        </div>
        <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
        {value}
      </p>
      {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
    </div>
  );
}
