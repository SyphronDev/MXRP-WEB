"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Suspense } from "react";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  avatarUrl: string;
}

function VerifyPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "discord-auth" | "roblox-auth" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [processedCode, setProcessedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();

  const handleDiscordLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "/.netlify/functions/auth-discord?redirectPath=verify"
      );
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setStatus("error");
      setMessage("Error al conectar con Discord");
      setIsLoading(false);
    }
  }, []);

  const handleRobloxVerification = useCallback(
    async (code: string) => {
      if (!discordUser) {
        setStatus("error");
        setMessage("Error: Usuario de Discord no encontrado");
        return;
      }

      // Obtener el token JWT
      const authToken = localStorage.getItem("auth_token");
      if (!authToken) {
        setStatus("error");
        setMessage(
          "Error: No se encontró token de autenticación. Por favor, inicia sesión nuevamente."
        );
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/.netlify/functions/roblox-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            code,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
          // Iniciar countdown para redirección automática
          startCountdown();
        } else {
          setStatus("error");
          setMessage(data.message);
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexión. Intenta nuevamente.");
      } finally {
        setIsLoading(false);
      }
    },
    [discordUser]
  );

  const startCountdown = useCallback(() => {
    setCountdown(5);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startRobloxVerification = useCallback(async () => {
    if (!discordUser) {
      setStatus("error");
      setMessage("Error: Usuario de Discord no encontrado");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/.netlify/functions/roblox-auth", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch {
      setStatus("error");
      setMessage("Error al iniciar la verificación con Roblox");
      setIsLoading(false);
    }
  }, [discordUser]);

  useEffect(() => {
    // Verificar si hay usuario de Discord guardado primero
    const savedUser = localStorage.getItem("discord_user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setDiscordUser(userData);
        setStatus("roblox-auth");
        return;
      } catch (error) {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem("discord_user");
      }
    }

    // Si no hay usuario guardado, verificar si viene de Discord con código
    const code = searchParams.get("code");
    if (code && !processedCode) {
      // Usuario viene de Discord con código de autorización
      setIsLoading(true);
      handleDiscordAuth(code);
    } else {
      // No hay código ni usuario guardado, mostrar login
      setStatus("discord-auth");
    }
  }, []);

  const handleDiscordAuth = async (code: string) => {
    try {
      const response = await fetch("/.netlify/functions/auth-discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectPath: "verify" }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        // Guardar usuario en localStorage
        localStorage.setItem("discord_user", JSON.stringify(data.user));
        setDiscordUser(data.user);
        setStatus("roblox-auth");
        setProcessedCode(code);

        // Limpiar el código de la URL
        window.history.replaceState({}, document.title, "/verify");
      } else {
        // Si el código es inválido, limpiar la URL y mostrar error
        window.history.replaceState({}, document.title, "/verify");
        setStatus("error");
        setMessage(
          data.message ||
            "Error al autenticar con Discord. El código puede haber expirado."
        );
      }
    } catch (error) {
      console.error("Error during Discord authentication:", error);
      // Limpiar la URL en caso de error
      window.history.replaceState({}, document.title, "/verify");
      setStatus("error");
      setMessage("Error de conexión. Intenta iniciar sesión nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Este efecto maneja la redirección desde Roblox
    // Solo si ya tenemos un usuario de Discord y el código no ha sido procesado
    const code = searchParams.get("code");
    if (
      code &&
      discordUser &&
      code !== processedCode &&
      status === "roblox-auth"
    ) {
      setProcessedCode(code);
      handleRobloxVerification(code);
    }
  }, [
    searchParams,
    discordUser,
    handleRobloxVerification,
    processedCode,
    startCountdown,
    status,
  ]);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleLogout = () => {
    localStorage.removeItem("discord_user");
    setDiscordUser(null);
    setStatus("discord-auth");
    setMessage("");
    setProcessedCode(null);
    setCountdown(5);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-orange-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-black/50 border-white/20">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Verificación MXRP</h1>
            <p className="text-gray-300">
              Verifica tu identidad conectando Discord y Roblox
            </p>
          </div>

          {/* Estado: Requiere autenticación con Discord */}
          {status === "discord-auth" && (
            <div className="space-y-4">
              <div className="text-blue-400 text-6xl">🔐</div>
              <p className="text-gray-300">
                Primero necesitas autenticarte con Discord para identificar tu
                cuenta
              </p>
              <Button
                onClick={handleDiscordLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? "Conectando..." : "Iniciar Sesión con Discord"}
              </Button>
            </div>
          )}

          {/* Estado: Usuario autenticado con Discord, listo para Roblox */}
          {status === "roblox-auth" && discordUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-green-400 text-4xl">✅</div>
                <p className="text-green-400 font-semibold">
                  Discord conectado: {discordUser.username}
                </p>
                <p className="text-gray-300 text-sm">
                  Ahora conecta tu cuenta de Roblox para completar la
                  verificación
                </p>
              </div>

              <Button
                onClick={startRobloxVerification}
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isLoading ? "Conectando..." : "Verificar con Roblox"}
              </Button>

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cambiar cuenta de Discord
              </Button>
            </div>
          )}

          {/* Estado: Verificación exitosa */}
          {status === "success" && (
            <div className="space-y-4">
              <div className="text-green-400 text-6xl">🎉</div>
              <p className="text-green-400 font-semibold">{message}</p>
              <p className="text-gray-300 text-sm">
                Ya puedes regresar a Discord y disfrutar del servidor
              </p>
              <div className="space-y-2">
                <p className="text-gray-400 text-xs">
                  Redirigiendo automáticamente en {countdown} segundos...
                </p>
                <Button
                  onClick={handleGoHome}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Regresar a la Web Principal
                </Button>
              </div>
            </div>
          )}

          {/* Estado: Error */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="text-red-400 text-6xl">❌</div>
              <p className="text-red-400 font-semibold">{message}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    if (discordUser) {
                      setStatus("roblox-auth");
                    } else {
                      setStatus("discord-auth");
                    }
                    setMessage("");
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Intentar Nuevamente
                </Button>
                {!discordUser && (
                  <Button
                    onClick={() => {
                      setMessage("");
                      setStatus("discord-auth");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Iniciar Sesión con Discord
                  </Button>
                )}
                {discordUser && (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cambiar cuenta de Discord
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-gray-300">
                {status === "discord-auth"
                  ? "Conectando con Discord..."
                  : status === "roblox-auth"
                  ? "Conectando con Roblox..."
                  : "Procesando verificación..."}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-orange-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 bg-black/50 border-white/20">
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto"></div>
              <p className="text-gray-300">Cargando...</p>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
