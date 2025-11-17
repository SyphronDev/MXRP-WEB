"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw, LogOut } from "lucide-react";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { decodeJWT } from "@/lib/utils/jwt-client";

interface SessionExpiryWarningProps {
  warningThreshold?: number; // segundos antes de expirar para mostrar advertencia
}

export function SessionExpiryWarning({
  warningThreshold = 172800, // 2 días por defecto
}: SessionExpiryWarningProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("discord_user");
    localStorage.removeItem("auth_token");
    router.push("/?session=expired");
  }, [router]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const token = localStorage.getItem("auth_token");

    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await fetch("/.netlify/functions/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("auth_token", data.token);
        setShowWarning(false);
        // Recargar la página para aplicar el nuevo token
        window.location.reload();
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error renovando token:", error);
      handleLogout();
    } finally {
      setIsRefreshing(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const checkExpiry = () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const decoded = decodeJWT(token);
      if (!decoded) return;

      const now = Math.floor(Date.now() / 1000);
      const remaining = decoded.exp - now;

      setTimeRemaining(remaining);

      // Mostrar advertencia si está dentro del umbral
      if (remaining > 0 && remaining <= warningThreshold) {
        setShowWarning(true);
      } else if (remaining <= 0) {
        // Token expirado, intentar renovar automáticamente
        handleRefresh();
      } else {
        setShowWarning(false);
      }
    };

    // Verificar inmediatamente
    checkExpiry();

    // Verificar cada 30 segundos
    const interval = setInterval(checkExpiry, 30000);

    return () => clearInterval(interval);
  }, [warningThreshold, handleRefresh]);

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <CardModern variant="glass" className="p-4 border-2 border-orange-500/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-500/20 rounded-lg">
            <Clock className="h-5 w-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1">
              Sesión por expirar
            </h3>
            <p className="text-white/70 text-sm mb-3">
              Tu sesión expirará en{" "}
              <span className="text-orange-400 font-bold">
                {formatTime(timeRemaining)}
              </span>
            </p>
            <div className="flex gap-2">
              <ButtonModern
                variant="primary"
                size="sm"
                onClick={handleRefresh}
                icon={<RefreshCw className="h-4 w-4" />}
                loading={isRefreshing}
                className="flex-1"
              >
                {isRefreshing ? "Renovando..." : "Renovar Sesión"}
              </ButtonModern>
              <ButtonModern
                variant="outline"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="h-4 w-4" />}
                disabled={isRefreshing}
              >
                Cerrar
              </ButtonModern>
            </div>
          </div>
        </div>
      </CardModern>
    </div>
  );
}
