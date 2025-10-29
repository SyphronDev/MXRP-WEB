"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Newspaper } from "lucide-react";
import Image from "next/image";
import NewsPanel from "../../components/NewsPanel";
import AdminLayout from "@/components/layout/admin-layout";
import { LoadingModern } from "@/components/ui/loading-modern";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { AlertCircle } from "lucide-react";

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

  // Funciones para manejar JWT
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    const authToken = getAuthToken();

    if (!savedUser || !authToken) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    checkNewsAccess();
  }, [router]);

  const checkNewsAccess = async () => {
    try {
      const response = await fetch(
        "/.netlify/functions/periodista-permissions",
        {
          method: "POST",
          headers: getAuthHeaders(),
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
      <LoadingModern
        variant="pulse"
        size="lg"
        text="Verificando permisos de periodista..."
        fullScreen={true}
      />
    );
  }

  if (!hasNewsAccess || !user) {
    return (
      <AdminLayout
        title="Sin Acceso"
        subtitle="Permisos de periodista requeridos"
        user={user}
        showBackButton={true}
        backUrl="/dashboard"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <CardModern variant="glass" className="p-8 text-center max-w-md mx-auto">
            <Newspaper className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-white/80 mb-6">
              No tienes permisos para acceder al Panel de Noticias.
            </p>
            <ButtonModern
              variant="primary"
              size="md"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Volver al Dashboard
            </ButtonModern>
          </CardModern>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Panel de Noticias"
      subtitle="Gestión de contenido y publicaciones"
      user={user}
      showBackButton={true}
      backUrl="/dashboard"
    >
      <Suspense
        fallback={
          <LoadingModern
            variant="pulse"
            size="lg"
            text="Cargando panel de noticias..."
            fullScreen={false}
          />
        }
      >
        <NewsPanel
          user={user}
          guildId={process.env.NEXT_PUBLIC_GUILD_ID || ""}
        />
      </Suspense>
    </AdminLayout>
  );
}
