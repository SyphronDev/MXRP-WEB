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
} from "lucide-react";
import Image from "next/image";

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  email: string;
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
  }>;
  warnsAdministrativos: Array<{
    Warn: Array<{
      Warn: string;
      Aplicador: string;
      Aplicado: string;
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
  const [activeTab, setActiveTab] = useState<"profile" | "statistics">(
    "profile"
  );
  const router = useRouter();

  const checkPermissions = useCallback(async (discordId: string) => {
    try {
      setLoading(true);

      // Verificar permisos administrativos
      const permissionsResponse = await fetch(
        "/.netlify/functions/admin-permissions",
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

      const permissionsData = await permissionsResponse.json();

      if (permissionsData.success && permissionsData.hasAdminAccess) {
        setHasAccess(true);
        setPermissions(permissionsData.permissions);
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
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    if (!savedUser) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    checkPermissions(userData.id);
  }, [router, checkPermissions]);

  const fetchProfile = async (discordId: string) => {
    try {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Acceso Denegado
          </h1>
          <p className="text-white/80 mb-6">{error}</p>
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

  if (!hasAccess || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Sin Acceso</h1>
          <p className="text-white/80 mb-6">
            No tienes permisos para acceder al panel administrativo.
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
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-white/60" />
              </button>
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
                  Panel Administrativo
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg">
                  Gestión de Staff MXRP ER:LC
                </p>
              </div>
            </div>

            {/* MXRP Logo */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity self-start sm:self-auto"
              onClick={() => {
                window.location.href = "/";
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

        {/* Navigation Tabs */}
        <div className="mb-6 md:mb-8">
          <div className="overflow-x-auto">
            <div className="flex space-x-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-1 min-w-max">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "profile"
                    ? "bg-discord text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <User className="h-4 w-4" />
                <span className="text-sm sm:text-base">Perfil</span>
              </button>
              <button
                onClick={() => setActiveTab("statistics")}
                className={`flex-shrink-0 px-3 sm:px-6 py-2 sm:py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === "statistics"
                    ? "bg-discord text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm sm:text-base">Estadísticas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <>
            {/* Profile Status Card */}
            <div className="mb-6 md:mb-8">
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
                      Estado del Perfil
                    </h2>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {profile.cumpleHoras ? "✅" : "❌"} {user?.username}
                      </p>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile.cumpleHoras
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {profile.cumpleHoras ? "Cumple Horas" : "No Cumple"}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      {profile.cumpleHoras
                        ? "🎉 Cumple con las 14 horas semanales requeridas"
                        : "⚠️ No cumple con las 14 horas semanales requeridas"}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-discord/20 to-blue-500/20 rounded-lg md:rounded-xl">
                    <Shield className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
              {/* Tier */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                    <Award className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Tier Actual
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.tier}
                </p>
              </div>

              {/* Tiempo Total */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Tiempo Semanal
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {formatTime(profile.tiempoTotal)}
                </p>
                <p className="text-white/60 text-xs">
                  ({profile.tiempoHoras} horas)
                </p>
              </div>

              {/* Calificación */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Calificación
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.calificacionEstrellas}
                </p>
                <p className="text-white/60 text-xs">
                  ({profile.calificacion}/5)
                </p>
              </div>

              {/* Tickets Atendidos */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Usuarios Atendidos
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.ticketsAtendidos}
                </p>
              </div>

              {/* Tickets Procesados */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Tickets Procesados
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.ticket}
                </p>
              </div>

              {/* Invitados */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-pink-500/20 rounded-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-pink-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Personas Invitadas
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.invitados}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Tiempo de Contratación */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Tiempo de Contratación
                  </h3>
                </div>
                <p className="text-base sm:text-lg font-semibold text-white">
                  {formatDate(profile.tiempoContratado)}
                </p>
              </div>

              {/* Estado de Inactividad */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Estado de Inactividad
                  </h3>
                </div>
                <p className="text-base sm:text-lg font-semibold text-white">
                  {profile.inactividad}
                </p>
              </div>
            </div>

            {/* Warns y Notas Administrativas */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Warns Administrativos */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Warns Administrativos
                  </h3>
                </div>
                {profile.warnsAdministrativos.length > 0 &&
                profile.warnsAdministrativos[0]?.Warn?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.warnsAdministrativos[0].Warn.map((warn, index) => (
                      <div
                        key={index}
                        className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold">
                            Warn #{index + 1}
                          </h4>
                          <span className="text-red-400 text-sm">
                            {formatDate(warn.Aplicado)}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-2">
                          {warn.Warn}
                        </p>
                        <p className="text-white/60 text-xs">
                          Aplicado por: {warn.Aplicador}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">
                    No hay warns administrativos registrados
                  </p>
                )}
              </div>

              {/* Notas Administrativas */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Notas Administrativas
                  </h3>
                </div>
                {profile.notasAdministrativas.length > 0 ? (
                  <div className="space-y-3">
                    {profile.notasAdministrativas.map((nota, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold">
                            Nota #{index + 1}
                          </h4>
                          <span className="text-blue-400 text-sm">
                            {formatDate(nota.Aplicado)}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm mb-2">
                          {nota.Nota}
                        </p>
                        <p className="text-white/60 text-xs">
                          Aplicado por: {nota.Aplicador}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">
                    No hay notas administrativas registradas
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <>
            {/* Statistics Overview */}
            <div className="mb-6 md:mb-8">
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-1 sm:mb-2">
                      Rendimiento General
                    </h2>
                    <p
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold ${getPerformanceColor(
                        profile.rendimientoGeneral
                      )}`}
                    >
                      {profile.rendimientoGeneral}
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Basado en horas cumplidas y calificación promedio
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg md:rounded-xl">
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
              {/* Progreso Semanal */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Progreso Semanal
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  {profile.progresoSemanal}%
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${profile.progresoSemanal}%` }}
                  ></div>
                </div>
                <p className="text-white/60 text-xs mt-2">
                  {profile.cumpleHoras
                    ? "Meta alcanzada"
                    : `Faltan ${14 - profile.tiempoHoras}h`}
                </p>
              </div>

              {/* Eficiencia */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Eficiencia
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  {profile.eficiencia}%
                </p>
                <p className="text-white/60 text-xs">
                  {profile.ticket > 0 ? "Resolución de tickets" : "Sin datos"}
                </p>
              </div>

              {/* Tiempo Total Hoy */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Tiempo Hoy
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {formatTime(profile.tiempoTotalHoy * 60)}
                </p>
              </div>

              {/* Robux Status */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                    <Star className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  </div>
                  <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                    Robux
                  </h3>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {profile.robuxReclamados === null
                    ? "N/A"
                    : profile.robuxReclamados
                    ? "✅"
                    : "❌"}
                </p>
                <p className="text-white/60 text-xs">
                  {profile.robuxReclamados === null
                    ? "Sin estado"
                    : profile.robuxReclamados
                    ? "Reclamados"
                    : "No reclamados"}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
