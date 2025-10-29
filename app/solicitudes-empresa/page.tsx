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
  AlertCircle,
} from "lucide-react";

interface DiscordUser {
  username: string;
  discriminator: string;
  avatar: string;
  avatarUrl: string;
}

interface SolicitudEmpresa {
  id: string;
  nombreEmpresa: string;
  tipo: string;
  estado: string;
  fechaCreacion: string;
  fechaRevision?: string;
  motivoAprobacion?: string;
  motivoDenegacion?: string;
  revisadoPor?: {
    username: string;
    rol: string;
  };
}

export default function SolicitudesEmpresaPage() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudEmpresa[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const router = useRouter();

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    dueno: "",
    funcion: "",
    tipo: "Empresa Legal",
    colorRol: "#5865F2",
    imagenBanner: "",
    linkDiscord: "",
  });

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
          action: "obtenerSolicitudesUsuario",
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
        console.error("Error cargando solicitudes:", data.message);
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.nombreEmpresa.trim() ||
      !formData.dueno.trim() ||
      !formData.funcion.trim() ||
      !formData.imagenBanner.trim() ||
      !formData.linkDiscord.trim()
    ) {
      setMessage({
        type: "error",
        text: "Todos los campos son obligatorios",
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
          action: "crearSolicitud",
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          ...formData,
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
        setFormData({
          nombreEmpresa: "",
          dueno: "",
          funcion: "",
          tipo: "Empresa Legal",
          colorRol: "#5865F2",
          imagenBanner: "",
          linkDiscord: "",
        });
        setShowForm(false);
        cargarSolicitudes();
      } else {
        setMessage({
          type: "error",
          text: data.message,
        });
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error);
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30";
      case "aprobada":
        return "text-green-400 bg-green-500/20 border-green-500/30";
      case "denegada":
        return "text-red-400 bg-red-500/20 border-red-500/30";
      default:
        return "text-gray-400 bg-gray-500/20 border-gray-500/30";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <AlertCircle className="h-4 w-4" />;
      case "aprobada":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
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
                  Solicitudes de Empresas/Facciones
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg">
                  Crea y gestiona tus solicitudes de empresas y facciones
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
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Dashboard</span>
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

        {/* Botón para crear nueva solicitud */}
        {!showForm && (
          <div className="mb-6">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg shadow-blue-500/20 transition-all duration-200"
            >
              <Building2 className="h-5 w-5 mr-2" />
              Crear Nueva Solicitud
            </Button>
          </div>
        )}

        {/* Formulario de solicitud */}
        {showForm && (
          <Card className="mb-6 bg-black/40 backdrop-blur-md border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  Nueva Solicitud de Empresa/Facción
                </h2>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre de la empresa/facción */}
                  <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Nombre de la Empresa/Facción *
                    </label>
                    <input
                      type="text"
                      name="nombreEmpresa"
                      value={formData.nombreEmpresa}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Ej: Empresa de Transportes MX"
                      maxLength={100}
                    />
                  </div>

                  {/* Dueño */}
                  <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dueño *
                    </label>
                    <input
                      type="text"
                      name="dueno"
                      value={formData.dueno}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="Ej: Juan Pérez"
                      maxLength={100}
                    />
                  </div>

                  {/* Función */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Función *
                    </label>
                    <textarea
                      name="funcion"
                      value={formData.funcion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      placeholder="Describe la función principal de tu empresa/facción..."
                      rows={3}
                      maxLength={200}
                    />
                  </div>

                  {/* Tipo */}
                  <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tipo *
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <option value="Empresa Legal">Empresa Legal</option>
                      <option value="Empresa Ilegal">Empresa Ilegal</option>
                      <option value="Facción Legal">Facción Legal</option>
                      <option value="Facción Ilegal">Facción Ilegal</option>
                    </select>
                  </div>

                  {/* Color del rol */}
                  <div className="space-y-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Color del Rol *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        name="colorRol"
                        value={formData.colorRol}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg border border-white/10 cursor-pointer"
                      />
                      <input
                        type="text"
                        name="colorRol"
                        value={formData.colorRol}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="#5865F2"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                  </div>

                  {/* Imagen del banner */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Imagen del Banner *
                    </label>
                    <input
                      type="url"
                      name="imagenBanner"
                      value={formData.imagenBanner}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="https://ejemplo.com/banner.png"
                    />
                    {formData.imagenBanner && (
                      <div className="mt-2">
                        <img
                          src={formData.imagenBanner}
                          alt="Preview"
                          className="w-full max-w-md h-32 object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Link al servidor de Discord */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-white font-medium flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Link al Servidor de Discord *
                    </label>
                    <input
                      type="url"
                      name="linkDiscord"
                      value={formData.linkDiscord}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="https://discord.gg/ejemplo"
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-medium shadow-lg shadow-blue-500/20 transition-all duration-200"
                  >
                    {submitting ? "Enviando..." : "Enviar Solicitud"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    variant="outline"
                    className="px-6 py-3"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de solicitudes */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Mis Solicitudes</h2>

          {solicitudes.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-md border-white/20">
              <CardContent className="text-center py-12">
                <Building2 className="h-16 w-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No tienes solicitudes
                </h3>
                <p className="text-white/60">
                  Crea tu primera solicitud de empresa o facción
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {solicitudes.map((solicitud) => (
                <Card
                  key={solicitud.id}
                  className="bg-black/40 backdrop-blur-md border-white/20 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {solicitud.nombreEmpresa}
                        </h3>
                        <p className="text-white/60 text-sm truncate">
                          {solicitud.tipo}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full border flex items-center gap-1 ${getEstadoColor(
                          solicitud.estado
                        )}`}
                      >
                        {getEstadoIcon(solicitud.estado)}
                        {solicitud.estado.toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Creada:</span>
                        <span className="text-white">
                          {formatDate(solicitud.fechaCreacion)}
                        </span>
                      </div>
                      {solicitud.fechaRevision && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Revisada:</span>
                          <span className="text-white">
                            {formatDate(solicitud.fechaRevision)}
                          </span>
                        </div>
                      )}
                      {solicitud.revisadoPor && (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Revisado por:</span>
                          <span className="text-white">
                            {solicitud.revisadoPor.username} (
                            {solicitud.revisadoPor.rol})
                          </span>
                        </div>
                      )}
                    </div>

                    {(solicitud.motivoAprobacion ||
                      solicitud.motivoDenegacion) && (
                      <div className="pt-3 border-t border-white/10">
                        <p className="text-white/60 text-xs mb-1">Motivo:</p>
                        <p className="text-white text-sm">
                          {solicitud.motivoAprobacion ||
                            solicitud.motivoDenegacion}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
