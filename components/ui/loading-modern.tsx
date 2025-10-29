"use client";

import { Loader2, Sparkles } from "lucide-react";

interface LoadingModernProps {
  variant?: "spinner" | "dots" | "pulse" | "skeleton";
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingModern({
  variant = "spinner",
  size = "md",
  text,
  fullScreen = false,
  className = "",
}: LoadingModernProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Loader2 className={`${sizes[size]} animate-spin text-purple-400`} />
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 opacity-20 animate-pulse" />
      </div>
      {text && (
        <p className={`${textSizes[size]} text-white/80 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  const LoadingDots = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="flex space-x-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'} bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-bounce`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
      {text && (
        <p className={`${textSizes[size]} text-white/80`}>
          {text}
        </p>
      )}
    </div>
  );

  const LoadingPulse = () => (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Sparkles className={`${sizes[size]} text-purple-400 animate-pulse`} />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full animate-ping" />
      </div>
      {text && (
        <p className={`${textSizes[size]} text-white/80 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-4 w-full max-w-md">
      <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded animate-pulse" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded animate-pulse w-3/4" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded animate-pulse w-1/2" />
    </div>
  );

  const renderLoading = () => {
    switch (variant) {
      case "dots":
        return <LoadingDots />;
      case "pulse":
        return <LoadingPulse />;
      case "skeleton":
        return <LoadingSkeleton />;
      default:
        return <LoadingSpinner />;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {renderLoading()}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {renderLoading()}
    </div>
  );
}

// Skeleton components for specific use cases
export function SkeletonCard() {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gradient-to-r from-white/10 to-white/20 rounded w-3/4" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded" />
      <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded w-5/6" />
      <div className="h-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded w-1/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4 animate-pulse">
          <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded flex-1" />
          <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded w-24" />
          <div className="h-4 bg-gradient-to-r from-white/10 to-white/20 rounded w-16" />
        </div>
      ))}
    </div>
  );
}