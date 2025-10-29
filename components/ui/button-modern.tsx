"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  gradient?: boolean;
  glow?: boolean;
}

const ButtonModern = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    gradient = false,
    glow = false,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group";
    
    const variants = {
      primary: gradient 
        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 focus:ring-purple-500"
        : "bg-purple-600 hover:bg-purple-700 text-white border border-purple-600 hover:border-purple-700 focus:ring-purple-500",
      secondary: gradient
        ? "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white border-0 focus:ring-gray-500"
        : "bg-gray-600 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-700 focus:ring-gray-500",
      success: gradient
        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 focus:ring-green-500"
        : "bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700 focus:ring-green-500",
      danger: gradient
        ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 focus:ring-red-500"
        : "bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700 focus:ring-red-500",
      warning: gradient
        ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 focus:ring-yellow-500"
        : "bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-600 hover:border-yellow-700 focus:ring-yellow-500",
      ghost: "bg-transparent hover:bg-white/10 text-white border border-white/20 hover:border-white/40 focus:ring-white/50",
      outline: "bg-transparent hover:bg-purple-600/10 text-purple-400 border border-purple-500/50 hover:border-purple-500 focus:ring-purple-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
      md: "px-4 py-2.5 text-sm rounded-lg gap-2",
      lg: "px-6 py-3 text-base rounded-xl gap-2.5",
      xl: "px-8 py-4 text-lg rounded-xl gap-3",
    };

    const glowStyles = glow ? {
      primary: "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
      secondary: "shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40",
      success: "shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
      danger: "shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
      warning: "shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40",
      ghost: "shadow-lg shadow-white/10 hover:shadow-white/20",
      outline: "shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40",
    } : {};

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          glow && glowStyles[variant],
          "transform hover:scale-105 active:scale-95",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
        
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        
        {!loading && icon && iconPosition === "left" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {children && (
          <span className={loading ? "opacity-0" : ""}>{children}</span>
        )}
        
        {!loading && icon && iconPosition === "right" && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

ButtonModern.displayName = "ButtonModern";

export { ButtonModern };