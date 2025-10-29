"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Building2,
  User,
  Briefcase,
  Tag,
  Palette,
  Image as ImageIcon,
  Link,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
} from "lucide-react";

interface DiscordUser {
  username: string;
  discriminator: string;
  avatar: string;
  avatarUrl: string;
}

interface SolicitudPendiente {
  id: string;
  userId: string;
  username: string;
  userTag: string;
  nombreEmpresa: string;
  dueno: string;
  funcion: string;
  tipo: string;
  colorRol: string;
  imagenBanner: string;
  linkDiscord: string;
  fechaCreacion: string;
}

export default function AdminSolicitudesPage() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<SolicitudPendiente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"aprobar" | "denegar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
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
    cargarSolicitudes();
  }, [router]);

  const cargarSolicitudes = async () => {
    try {
      const response = await fetch("/.netlify/functions/solicitudes-empresa", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "obtenerSolicitudesPendientes",
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("discord_user");
        localStorage.removeItem("auth_token");
        router.push("/");
        return;
      }

      if (data.success) {
        setSolicitudes(data.solicitudes);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Error cargando solicitudes",
        });
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = (solicitud: SolicitudPendiente) => {
    setSelectedSolicitud(solicitud);
    setAction("aprobar");
    setMotivo("");
    setShowModal(true);
  };

  const handleDenegar = (solicitud: SolicitudPendiente) => {
    setSelectedSolicitud(solicitud);
    setAction("denegar");
    setMotivo("");
    setShowModal(true);
  };

  const handleSubmitAction = async () => {
    if (!selectedSolicitud || !motivo.trim()) {
      setMessage({
        type: "error",
        text: "El motivo es obligatorio",
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/.netlify/functions/solicitudes-empresa", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action:
            action === "aprobar" ? "aprobarSolicitud" : "denegarSolicitud",
          solicitudId: selectedSolicitud.id,
          motivo: motivo.trim(),
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("discord_user");
        localStorage.removeItem("auth_token");
        router.push("/");
        return;
      }

      if (data.success) {
        setMessage({
          type: "success",
          text: data.message,
        });
        setShowModal(false);
        setSelectedSolicitud(null);
        setAction(null);
        setMotivo("");
        cargarSolicitudes();
      } else {
        setMessage({
          type: "error",
          text: data.message,
        });
      }
    } catch (error) {
      console.error("Error procesando solicitud:", error);
      setMessage({
        type: "error",
        text: "Error de conexión. Intenta nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white/80 text-lg">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                  className="rounded-full border-2 border-blue-500/50 sm:w-16 sm:h-16"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                  Panel de Administración
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg">
                  Revisar y gestionar solicitudes de empresas/facciones
                </p>
              </div>
            </div>

            {/* MXRP Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
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

          {/* Botón de regreso */}
          <Button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Panel Admin</span>
          </Button>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg backdrop-blur-md border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            <p>{message.text}</p>
            <Button
              onClick={() => setMessage(null)}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-black/40 backdrop-blur-md border-yellow-500/20 shadow-lg shadow-yellow-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-white/60 text-sm">Pendientes</p>
                  <p className="text-2xl font-bold text-white">
                    {solicitudes.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de solicitudes pendientes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Solicitudes Pendientes
          </h2>

          {solicitudes.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-md border-white/20">
              <CardContent className="text-center py-12">
                <Building2 className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No hay solicitudes pendientes
                </h3>
                <p className="text-white/60">
                  Todas las solicitudes han sido procesadas
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {solicitudes.map((solicitud) => (
                <Card
                  key={solicitud.id}
                  className="bg-black/40 backdrop-blur-md border-white/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {solicitud.nombreEmpresa}
                        </h3>
                        <p className="text-white/60 text-sm truncate">
                          {solicitud.tipo}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full border text-yellow-400 bg-yellow-500/20 border-yellow-500/30 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        PENDIENTE
                      </span>
                    </div>

                    {/* Información del solicitante */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Solicitante:</span>
                        <span className="text-white">{solicitud.userTag}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Dueño:</span>
                        <span className="text-white">{solicitud.dueno}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Fecha:</span>
                        <span className="text-white">
                          {formatDate(solicitud.fechaCreacion)}
                        </span>
                      </div>
                    </div>

                    {/* Función */}
                    <div className="mb-4">
                      <p className="text-white/60 text-xs mb-1">Función:</p>
                      <p className="text-white text-sm">{solicitud.funcion}</p>
                    </div>

                    {/* Banner preview */}
                    {solicitud.imagenBanner && (
                      <div className="mb-4">
                        <img
                          src={solicitud.imagenBanner}
                          alt="Banner"
                          className="w-full h-24 object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAprobar(solicitud)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        onClick={() => handleDenegar(solicitud)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Denegar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-blue-500/40 shadow-2xl shadow-blue-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {action === "aprobar"
                    ? "Aprobar Solicitud"
                    : "Denegar Solicitud"}
                </h3>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  size="sm"
                >
                  ✕
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-white/80 mb-2">
                  {action === "aprobar"
                    ? `¿Estás seguro de que quieres aprobar la solicitud de "${selectedSolicitud.nombreEmpresa}"?`
                    : `¿Estás seguro de que quieres denegar la solicitud de "${selectedSolicitud.nombreEmpresa}"?`}
                </p>
                <p className="text-white/60 text-sm">
                  {action === "aprobar"
                    ? "Se creará el rol correspondiente y se notificará al usuario."
                    : "Se notificará al usuario con el motivo de la denegación."}
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Motivo *
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  placeholder={
                    action === "aprobar"
                      ? "Ej: Cumple con todos los requisitos establecidos..."
                      : "Ej: No cumple con los requisitos mínimos..."
                  }
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitAction}
                  disabled={submitting || !motivo.trim()}
                  className={`flex-1 ${
                    action === "aprobar"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  } text-white`}
                >
                  {submitting
                    ? "Procesando..."
                    : action === "aprobar"
                    ? "Aprobar"
                    : "Denegar"}
                </Button>
                <Button
                  onClick={() => setShowModal(false)}
                  variant="outline"
                  className="px-6"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
