"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "neon";
  hover?: boolean;
  glow?: boolean;
}

const CardModern = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = true, glow = false, children, ...props }, ref) => {
    const baseStyles = "rounded-xl border transition-all duration-300 relative overflow-hidden";
    
    const variants = {
      default: "bg-black/40 backdrop-blur-md border-white/20",
      glass: "bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl",
      gradient: "bg-gradient-to-br from-purple-900/20 via-black/40 to-blue-900/20 backdrop-blur-md border-purple-500/20",
      neon: "bg-black/60 backdrop-blur-md border-cyan-500/30 shadow-lg shadow-cyan-500/10",
    };

    const hoverStyles = hover ? "hover:scale-[1.02] hover:shadow-2xl" : "";
    const glowStyles = glow ? "shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30" : "";

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          glowStyles,
          className
        )}
        {...props}
      >
        {/* Animated border gradient */}
        {variant === "neon" && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-300 -z-10" />
        )}
        
        {children}
      </div>
    );
  }
);

CardModern.displayName = "CardModern";

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight text-white", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-white/60", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export { CardModern, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };