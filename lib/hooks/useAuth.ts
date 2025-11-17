"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isTokenExpired, decodeJWT } from "@/lib/utils/jwt-client";

interface UseAuthOptions {
  redirectOnExpire?: boolean;
  checkInterval?: number; // en milisegundos
  onTokenExpired?: () => void;
}

export function useAuth(options: UseAuthOptions = {}) {
  const {
    redirectOnExpire = true,
    checkInterval = 60000, // Verificar cada minuto por defecto
    onTokenExpired,
  } = options;

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem("discord_user");
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    if (redirectOnExpire) {
      router.push("/?session=expired");
    }
  }, [router, redirectOnExpire]);

  const refreshToken = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return false;

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
        console.log("✅ Token renovado exitosamente");
        return true;
      } else if (data.requiresLogin) {
        // Token demasiado antiguo, requiere login
        logout();
        return false;
      }

      return false;
    } catch (error) {
      console.error("Error renovando token:", error);
      return false;
    }
  }, [logout]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("discord_user");

    if (!token || !user) {
      setIsAuthenticated(false);
      setIsLoading(false);
      if (redirectOnExpire) {
        router.push("/");
      }
      return false;
    }

    // Verificar si el token ha expirado
    if (isTokenExpired()) {
      console.log("⚠️ Token expirado, intentando renovar...");
      const renewed = await refreshToken();

      if (!renewed) {
        console.log("❌ No se pudo renovar el token, cerrando sesión...");
        if (onTokenExpired) {
          onTokenExpired();
        }
        logout();
        return false;
      }
    }

    // Calcular tiempo restante hasta la expiración
    const decoded = decodeJWT(token);
    if (decoded) {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = decoded.exp - now;
      setTokenExpiresIn(expiresIn);

      // Si el token expira en menos de 2 días, renovarlo automáticamente
      const twoDaysInSeconds = 2 * 24 * 60 * 60;
      if (expiresIn < twoDaysInSeconds && expiresIn > 0) {
        console.log(
          `🔄 Token expirará en ${Math.floor(
            expiresIn / 86400
          )} días, renovando...`
        );
        await refreshToken();
      }
    }

    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  }, [router, redirectOnExpire, onTokenExpired, logout, refreshToken]);

  useEffect(() => {
    // Verificar autenticación al montar
    checkAuth();

    // Configurar verificación periódica
    const interval = setInterval(() => {
      checkAuth();
    }, checkInterval);

    return () => clearInterval(interval);
  }, [checkAuth, checkInterval]);

  return {
    isAuthenticated,
    isLoading,
    tokenExpiresIn,
    logout,
    checkAuth,
    refreshToken,
  };
}
