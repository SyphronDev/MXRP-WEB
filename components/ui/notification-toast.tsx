"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends Toast {
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: {
    bg: "bg-green-500/10 border-green-500/30",
    icon: "text-green-400",
    title: "text-green-300",
    message: "text-green-200/80",
  },
  error: {
    bg: "bg-red-500/10 border-red-500/30",
    icon: "text-red-400",
    title: "text-red-300",
    message: "text-red-200/80",
  },
  info: {
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: "text-blue-400",
    title: "text-blue-300",
    message: "text-blue-200/80",
  },
  warning: {
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: "text-yellow-400",
    title: "text-yellow-300",
    message: "text-yellow-200/80",
  },
};

function ToastComponent({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const Icon = icons[type];
  const style = styles[type];

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [id, onClose]);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <div
      className={cn(
        "transform transition-all duration-300 ease-out",
        isVisible && !isExiting
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
    >
      <div
        className={cn(
          "max-w-sm w-full backdrop-blur-md border rounded-xl shadow-lg p-4",
          style.bg
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("flex-shrink-0 p-1", style.icon)}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={cn("text-sm font-semibold", style.title)}>
              {title}
            </h4>
            {message && (
              <p className={cn("text-sm mt-1", style.message)}>
                {message}
              </p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className={cn(
                  "text-sm font-medium mt-2 hover:underline",
                  style.title
                )}
              >
                {action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast container
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: "success", title, message, ...options });
  };

  const error = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: "error", title, message, ...options });
  };

  const info = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: "info", title, message, ...options });
  };

  const warning = (title: string, message?: string, options?: Partial<Toast>) => {
    addToast({ type: "warning", title, message, ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}