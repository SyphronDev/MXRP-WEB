"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle, AlertTriangle, Info } from "lucide-react";

interface StatusBadgeProps {
  status: "success" | "pending" | "error" | "warning" | "info";
  text: string;
  icon?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusConfig = {
  success: {
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: CheckCircle,
  },
  pending: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    icon: Clock,
  },
  error: {
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: XCircle,
  },
  warning: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: AlertTriangle,
  },
  info: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: Info,
  },
};

const sizes = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
};

export function StatusBadge({
  status,
  text,
  icon = true,
  size = "md",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border backdrop-blur-sm",
        config.bg,
        config.border,
        config.text,
        sizes[size],
        className
      )}
    >
      {icon && <Icon className="h-3 w-3" />}
      {text}
    </span>
  );
}