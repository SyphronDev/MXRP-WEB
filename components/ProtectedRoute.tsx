"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const authToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("discord_user");

        if (!authToken || !savedUser) {
          router.push("/");
          return;
        }

        // Verificar permisos específicos para solicitudes
        const response = await fetch(
          "/.netlify/functions/solicitudes-permissions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              guildId: process.env.NEXT_PUBLIC_GUILD_ID,
            }),
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("discord_user");
          localStorage.removeItem("auth_token");
          router.push("/");
          return;
        }

        if (data.success && data.hasSolicitudesAccess) {
          setIsAuthorized(true);
        } else {
          // Redirigir al dashboard si no tiene permisos
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error verificando autorización:", error);
        router.push("/");
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Acceso Denegado
          </h1>
          <p className="text-white/60 mb-4">
            No tienes permisos para acceder a esta sección.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

