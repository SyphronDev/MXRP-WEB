"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import NewsPanel from "../../components/NewsPanel";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  avatarUrl: string;
}

export default function NewsPanelPage() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewsAccess, setHasNewsAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    if (!savedUser) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    checkNewsAccess(userData.id);
  }, [router]);

  const checkNewsAccess = async (discordId: string) => {
    try {
      const response = await fetch(
        "/.netlify/functions/periodista-permissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discordId,
            guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.hasPeriodistaAccess) {
        setHasNewsAccess(true);
      } else {
        setHasNewsAccess(false);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error checking news access:", error);
      setHasNewsAccess(false);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!hasNewsAccess || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Newspaper className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-white/80 mb-6">
            No tienes permisos para acceder al Panel de Noticias.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-discord hover:bg-discord/80 text-white rounded-lg transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-discord/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-discord/50 sm:w-16 sm:h-16"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                  Panel de Noticias MXRP
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg">
                  Crea y publica noticias para la comunidad
                </p>
              </div>
            </div>

            {/* MXRP Logo */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity self-start sm:self-auto"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
            >
              <Image
                src="/images/Icon.png"
                alt="MXRP"
                width={32}
                height={32}
                className="rounded-md sm:w-12 sm:h-12"
              />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                MXRP
              </h2>
            </div>
          </div>
        </div>

        {/* News Panel */}
        <NewsPanel
          user={user}
          guildId={process.env.NEXT_PUBLIC_GUILD_ID || ""}
        />
      </div>
    </div>
  );
}
