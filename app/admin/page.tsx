"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  Clock,
  Star,
  AlertTriangle,
  FileText,
  TrendingUp,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  Award,
  Activity,
  BarChart3,
  ArrowLeft,
  Building2,
} from "lucide-react";
import Image from "next/image";
import AdminLayout from "@/components/layout/admin-layout";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { ResponsiveGrid, ResponsiveContainer } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { MobileTabs } from "@/components/ui/mobile-tabs";
import { formatDate } from "@/lib/utils";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
  avatarUrl: string;
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

interface Permissions {
  highRoles: string[];
  mediumRoles: string[];
  specialPerm: string[];
  highEnd: string[];
  characterKill: string[];
}

export default function AdminPanel() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [hasSolicitudesAccess, setHasSolicitudesAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "statistics" | "solicitudes"
  >("profile");
  const router = useRouter();

  // Función helper para obtener el token JWT
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  // Función helper para crear headers con autenticación
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

  const checkPermissions = useCallback(
    async (discordId: string) => {
      try {
        setLoading(true);

        // Verificar permisos administrativos
        const permissionsResponse = await fetch(
          "/.netlify/functions/admin-permissions",
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              guildId: process.env.NEXT_PUBLIC_GUILD_ID,
            }),
          }
        );

        const permissionsData = await permissionsResponse.json();

        if (permissionsResponse.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem("discord_user");
          localStorage.removeItem("auth_token");
          router.push("/");
          return;
        }

        if (permissionsData.success && permissionsData.hasAdminAccess) {
          setHasAccess(true);
          setPermissions(permissionsData.permissions);

          // Verificar permisos específicos para solicitudes
          const rolesSolicitudes = [
            process.env.Administrador,
            process.env.DepartamentoRol,
            process.env.SupervisorRol,
          ].filter(Boolean);

          const tieneRolSolicitudes = permissionsData.permissions?.roles?.some(
            (role: string) => rolesSolicitudes.includes(role)
          );

          setHasSolicitudesAccess(!!tieneRolSolicitudes);
          fetchProfile(discordId);
        } else {
          setError("No tienes permisos para acceder al panel administrativo.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setError("Error al verificar permisos.");
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    const authToken = getAuthToken();

    if (!savedUser || !authToken) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    // Ya no pasamos el ID, el backend lo extrae del JWT
    checkPermissions("");
  }, [router, checkPermissions]);

  const fetchProfile = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/admin-profiles", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          action: "get",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
      } else {
        setError(data.message || "Error al cargar el perfil");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getPerformanceColor = (rendimiento: string) => {
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

  const toast = useToast();

  if (loading) {
    return (
      <LoadingModern
        variant="pulse"
        size="lg"
        text="Verificando permisos administrativos..."
        fullScreen={true}
      />
    );
  }

  if (error) {
    return (
      <AdminLayout
        title="Acceso Denegado"
        subtitle="No tienes permisos para acceder"
        user={user}
        showBackButton={true}
        backUrl="/dashboard"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <CardModern variant="glass" className="p-8 text-center max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-white/80 mb-6">{error}</p>
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

  if (!hasAccess || !profile) {
    return (
      <AdminLayout
        title="Sin Acceso"
        subtitle="Permisos insuficientes"
        user={user}
        showBackButton={true}
        backUrl="/dashboard"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <CardModern variant="glass" className="p-8 text-center max-w-md mx-auto">
            <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Sin Acceso</h2>
            <p className="text-white/80 mb-6">
              No tienes permisos para acceder al panel administrativo.
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
      title="Panel Administrativo"
      subtitle="Gestión y estadísticas del servidor"
      user={user}
      showBackButton={true}
      backUrl="/dashboard"
    >
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Admin Stats Cards */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6} className="mb-8">
        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Tier Actual</h3>
              <p className="text-2xl font-bold text-red-400">{profile.tier}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Tiempo Total</h3>
              <p className="text-2xl font-bold text-blue-400">{profile.tiempoHoras}h</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Tickets</h3>
              <p className="text-2xl font-bold text-green-400">{profile.ticketsAtendidos}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Estado</h3>
              <StatusBadge
                status={profile.cumpleHoras ? "success" : "warning"}
                text={profile.cumpleHoras ? "Cumple" : "No Cumple"}
                size="sm"
              />
            </div>
          </div>
        </CardModern>
      </ResponsiveGrid>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="lg:hidden">
          <MobileTabs
            tabs={[
              {
                id: "profile",
                label: "Perfil",
                icon: <User className="h-4 w-4" />,
                badge: profile.cumpleHoras ? "✅" : "⚠️",
              },
              {
                id: "statistics",
                label: "Estadísticas",
                icon: <BarChart3 className="h-4 w-4" />,
                badge: profile.ticketsAtendidos.toString(),
              },
              ...(hasSolicitudesAccess ? [{
                id: "solicitudes" as const,
                label: "Solicitudes",
                icon: <Building2 className="h-4 w-4" />,
                badge: "Admin",
              }] : []),
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          />
        </div>

        <div className="hidden lg:block">
          <NavigationTabs
            tabs={[
              {
                id: "profile",
                label: "Perfil de Staff",
                icon: <User className="h-4 w-4" />,
                badge: profile.cumpleHoras ? "Activo" : "Inactivo",
              },
              {
                id: "statistics",
                label: "Estadísticas",
                icon: <BarChart3 className="h-4 w-4" />,
                badge: `${profile.ticketsAtendidos} tickets`,
              },
              ...(hasSolicitudesAccess ? [{
                id: "solicitudes" as const,
                label: "Gestión de Solicitudes",
                icon: <Building2 className="h-4 w-4" />,
                badge: "Admin",
              }] : []),
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            variant="default"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          {/* Profile Status Card */}
          <CardModern variant="gradient" className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-white">
                    {user?.username}
                  </h2>
                  <StatusBadge
                    status={profile.cumpleHoras ? "success" : "warning"}
                    text={profile.cumpleHoras ? "Cumple Horas" : "No Cumple"}
                    size="md"
                  />
                </div>
                <p className="text-white/60 text-sm lg:text-base">
                  {profile.cumpleHoras
                    ? "🎉 Cumple con las 14 horas semanales requeridas"
                    : "⚠️ No cumple con las 14 horas semanales requeridas"}
                </p>
              </div>
              <div className="p-4 bg-red-500/20 rounded-xl">
                <Shield className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </CardModern>

          {/* Profile Information Grid */}
          <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={4}>
            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Award className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Tier Actual
                  </h3>
                  <p className="text-xl font-bold text-white">{profile.tier}</p>
                </div>
              </div>
            </CardModern>

            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Tiempo Semanal
                  </h3>
                  <p className="text-xl font-bold text-white">{profile.tiempoHoras}h</p>
                </div>
              </div>
            </CardModern>

            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Calificación
                  </h3>
                  <p className="text-xl font-bold text-white">{profile.calificacionEstrellas || "⭐⭐⭐⭐⭐"}</p>
                </div>
              </div>
            </CardModern>

            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Tickets Atendidos
                  </h3>
                  <p className="text-xl font-bold text-white">{profile.ticketsAtendidos}</p>
                </div>
              </div>
            </CardModern>
          </ResponsiveGrid>

          {/* Additional Information */}
          <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap={4}>
            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Tiempo Contratado
                  </h3>
                  <p className="text-lg font-semibold text-white">
                    {formatDate(profile.tiempoContratado)}
                  </p>
                </div>
              </div>
            </CardModern>

            <CardModern variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Activity className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Rendimiento
                  </h3>
                  <p className="text-lg font-semibold text-white">
                    {profile.rendimientoGeneral || "Excelente"}
                  </p>
                </div>
              </div>
            </CardModern>
          </ResponsiveGrid>
        </div>
      )}

      {activeTab === "statistics" && (
        <div className="space-y-6">
          <CardModern variant="glass" className="p-8 text-center">
            <BarChart3 className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">
              Estadísticas Detalladas
            </h3>
            <p className="text-white/60 mb-6">
              Las estadísticas detalladas estarán disponibles próximamente
            </p>
            <ButtonModern
              variant="outline"
              size="md"
              onClick={() => setActiveTab("profile")}
            >
              Ver Perfil
            </ButtonModern>
          </CardModern>
        </div>
      )}

      {activeTab === "solicitudes" && hasSolicitudesAccess && (
        <div className="space-y-6">
          <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap={6}>
            <CardModern variant="glass" className="p-6">
              <div className="text-center">
                <div className="p-4 bg-blue-500/20 rounded-xl w-fit mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Gestionar Solicitudes
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Revisar y gestionar solicitudes de empresas y facciones
                </p>
                <ButtonModern
                  variant="primary"
                  size="md"
                  onClick={() => router.push("/admin/solicitudes")}
                  className="w-full"
                >
                  Ir a Solicitudes
                </ButtonModern>
              </div>
            </CardModern>

            <CardModern variant="glass" className="p-6">
              <div className="text-center">
                <div className="p-4 bg-green-500/20 rounded-xl w-fit mx-auto mb-4">
                  <FileText className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  Nueva Solicitud
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Crear una nueva solicitud de empresa o facción
                </p>
                <ButtonModern
                  variant="outline"
                  size="md"
                  onClick={() => router.push("/solicitudes-empresa")}
                  className="w-full"
                >
                  Crear Solicitud
                </ButtonModern>
              </div>
            </CardModern>
          </ResponsiveGrid>
        </div>
      )}
    </AdminLayout>
  );
}
