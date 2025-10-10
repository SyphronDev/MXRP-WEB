import { useState, useEffect } from "react";

interface AdminPermissions {
  hasAdminAccess: boolean;
  permissions: {
    highRoles: string[];
    mediumRoles: string[];
    specialPerm: string[];
    highEnd: string[];
    characterKill: string[];
  } | null;
  loading: boolean;
  error: string | null;
}

interface UserInfo {
  id: string;
  username: string;
  discriminator: string;
  tag: string;
  avatar: string | null;
  avatarUrl: string;
}

interface AdminProfile {
  userId: string;
  tiempoTotal: number;
  tiempoHoras: number;
  cumpleHoras: boolean;
  tier: string;
  tiempoContratado: string;
  ticketsAtendidos: number;
  invitados: number;
  inactividad: string;
  ticket: number;
  tiempoTotalHoy: number;
  calificacion: number;
  calificacionEstrellas: string;
  notasAdministrativas: Array<{
    Nota: string;
    Aplicado: string;
    Aplicador: string;
    AplicadorInfo: UserInfo;
  }>;
  warnsAdministrativos: Array<{
    Warn: Array<{
      Warn: string;
      Aplicador: string;
      Aplicado: string;
      AplicadorInfo: UserInfo;
    }>;
  }>;
  robuxReclamados: boolean | null;
  progresoSemanal: number;
  eficiencia: number;
  rendimientoGeneral: string;
}

export function useAdminPermissions(discordId: string | null, guildId: string) {
  const [permissions, setPermissions] = useState<AdminPermissions>({
    hasAdminAccess: false,
    permissions: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!discordId) {
      setPermissions({
        hasAdminAccess: false,
        permissions: null,
        loading: false,
        error: "No Discord ID provided",
      });
      return;
    }

    const checkPermissions = async () => {
      try {
        setPermissions((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch("/.netlify/functions/admin-permissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discordId,
            guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setPermissions({
            hasAdminAccess: data.hasAdminAccess,
            permissions: data.permissions,
            loading: false,
            error: null,
          });
        } else {
          setPermissions({
            hasAdminAccess: false,
            permissions: null,
            loading: false,
            error: data.message || "Error checking permissions",
          });
        }
      } catch (error) {
        console.error("Error checking admin permissions:", error);
        setPermissions({
          hasAdminAccess: false,
          permissions: null,
          loading: false,
          error: "Network error",
        });
      }
    };

    checkPermissions();
  }, [discordId, guildId]);

  return permissions;
}

export function useAdminProfile(discordId: string | null, guildId: string) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!discordId) {
      setLoading(false);
      setError("No Discord ID provided");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/.netlify/functions/admin-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            discordId,
            guildId: process.env.NEXT_PUBLIC_GUILD_ID,
            action: "get",
          }),
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.profile);
        } else {
          setError(data.message || "Error loading profile");
        }
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [discordId, guildId]);

  const refetch = async () => {
    if (!discordId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/.netlify/functions/admin-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          discordId,
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          action: "refresh",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || "Error refreshing profile");
      }
    } catch (error) {
      console.error("Error refreshing admin profile:", error);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, refetch };
}

// Utility functions
export const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDate = (dateString: string | null) => {
  if (!dateString) return "No disponible";
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getPerformanceColor = (rendimiento: string) => {
  switch (rendimiento) {
    case "Excelente":
      return "text-green-400";
    case "Bueno":
      return "text-blue-400";
    case "Necesita mejorar":
      return "text-yellow-400";
    default:
      return "text-gray-400";
  }
};
