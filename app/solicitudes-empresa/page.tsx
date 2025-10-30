"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  User,
  Briefcase,
  Tag,
  Palette,
  Image as ImageIcon,
  Link,
  CheckCircle,
  Eye,
  Clock,
  XCircle,
  FileText,
  Send,
  Calendar,
} from "lucide-react";
import MobileLayout from "@/components/layout/mobile-layout";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { MobileTabs } from "@/components/ui/mobile-tabs";
import { formatDate } from "@/lib/utils";

interface DiscordUser {
  username: string;
  discriminator: string;
  avatar: string;
  avatarUrl: string;
}

interface SolicitudEmpresa {
  id: string;
  nombreEmpresa: string;
  dueno: string;
  funcion: string;
  tipo: string;
  colorRol: string;
  imagenBanner: string;
  linkDiscord: string;
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

function SolicitudesEmpresaContent() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudEmpresa[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"solicitudes" | "nueva" | "historial">("solicitudes");
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudEmpresa | null>(null);
  const router = useRouter();
  const toast = useToast();

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
        console.log("Solicitudes recibidas:", data.solicitudes);
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
      toast.addToast({
        type: "error",
        title: "Campos requeridos",
        message: "Todos los campos son obligatorios",
        duration: 4000,
      });
      return;
    }

    setSubmitting(true);

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
        toast.addToast({
          type: "success",
          title: "Solicitud enviada",
          message: data.message,
          duration: 5000,
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
        setActiveTab("solicitudes");
        cargarSolicitudes();
      } else {
        toast.addToast({
          type: "error",
          title: "Error al enviar",
          message: data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error enviando solicitud:", error);
      toast.addToast({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo enviar la solicitud",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingModern
        variant="pulse"
        size="lg"
        text="Cargando solicitudes de empresa..."
        fullScreen={true}
      />
    );
  }

  // Filtrar solicitudes por estado
  const solicitudesPendientes = solicitudes.filter(s => s.estado === "pendiente");
  const solicitudesAprobadas = solicitudes.filter(s => s.estado === "aprobada");
  const solicitudesDenegadas = solicitudes.filter(s => s.estado === "denegada");

  return (
    <MobileLayout
      user={user}
      showBackButton={true}
      backUrl="/dashboard"
      title="Solicitudes Empresa"
      subtitle="Gestiona tus solicitudes"
    >
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Solicitudes Stats */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6} className="mb-8">
        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Total Solicitudes</h3>
              <p className="text-2xl font-bold text-blue-400">{solicitudes.length}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Clock className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Pendientes</h3>
              <p className="text-2xl font-bold text-orange-400">{solicitudesPendientes.length}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Aprobadas</h3>
              <p className="text-2xl font-bold text-green-400">{solicitudesAprobadas.length}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Denegadas</h3>
              <p className="text-2xl font-bold text-red-400">{solicitudesDenegadas.length}</p>
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
                id: "solicitudes",
                label: "Mis Solicitudes",
                icon: <FileText className="h-4 w-4" />,
                badge: solicitudes.length.toString(),
              },
              {
                id: "nueva",
                label: "Nueva",
                icon: <Building2 className="h-4 w-4" />,
                badge: "Crear",
              },
              {
                id: "historial",
                label: "Historial",
                icon: <Calendar className="h-4 w-4" />,
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
          />
        </div>

        <div className="hidden lg:block">
          <NavigationTabs
            tabs={[
              {
                id: "solicitudes",
                label: "Mis Solicitudes",
                icon: <FileText className="h-4 w-4" />,
                badge: `${solicitudes.length} Total`,
              },
              {
                id: "nueva",
                label: "Nueva Solicitud",
                icon: <Building2 className="h-4 w-4" />,
                badge: "Crear",
              },
              {
                id: "historial",
                label: "Historial Completo",
                icon: <Calendar className="h-4 w-4" />,
                badge: "Ver Todo",
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            variant="default"
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "solicitudes" && (
        <div className="space-y-6">
          {solicitudes.length > 0 ? (
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
              {solicitudes.map((solicitud) => (
                <CardModern key={solicitud.id} variant="glass" className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {solicitud.nombreEmpresa}
                        </h3>
                        <p className="text-white/60 text-sm">{solicitud.tipo}</p>
                      </div>
                    </div>
                    <StatusBadge
                      status={
                        solicitud.estado === "aprobada" ? "success" :
                        solicitud.estado === "denegada" ? "error" : "warning"
                      }
                      text={solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                      size="sm"
                    />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Dueño:</span>
                      <span className="text-white text-sm">{solicitud.dueno || "No especificado"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Función:</span>
                      <span className="text-white text-sm">{solicitud.funcion || "No especificada"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60 text-sm">Fecha:</span>
                      <span className="text-white text-sm">{formatDate(solicitud.fechaCreacion)}</span>
                    </div>
                  </div>

                  {solicitud.colorRol && (
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-white/60 text-sm">Color:</span>
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: solicitud.colorRol }}
                      />
                      <span className="text-white/80 text-sm font-mono">{solicitud.colorRol}</span>
                    </div>
                  )}

                  <ButtonModern
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSolicitud(solicitud)}
                    icon={<Eye className="h-4 w-4" />}
                    className="w-full"
                  >
                    Ver Detalles
                  </ButtonModern>
                </CardModern>
              ))}
            </ResponsiveGrid>
          ) : (
            <CardModern variant="glass" className="p-12 text-center">
              <Building2 className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-white font-semibold text-xl mb-2">
                No tienes solicitudes
              </h3>
              <p className="text-white/60 mb-6">
                Crea tu primera solicitud de empresa o facción
              </p>
              <ButtonModern
                variant="primary"
                size="md"
                onClick={() => setActiveTab("nueva")}
                icon={<Building2 className="h-4 w-4" />}
              >
                Crear Nueva Solicitud
              </ButtonModern>
            </CardModern>
          )}
        </div>
      )}

      {activeTab === "nueva" && (
        <CardModern variant="glass" className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Building2 className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Nueva Solicitud de Empresa
              </h2>
              <p className="text-white/60 text-sm">
                Completa todos los campos para enviar tu solicitud
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={6}>
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  name="nombreEmpresa"
                  value={formData.nombreEmpresa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Ej: Empresa de Transporte MXRP"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dueño de la Empresa *
                </label>
                <input
                  type="text"
                  name="dueno"
                  value={formData.dueno}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Nombre del dueño"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Función de la Empresa *
                </label>
                <input
                  type="text"
                  name="funcion"
                  value={formData.funcion}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  placeholder="Ej: Transporte de mercancías"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-white font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tipo de Organización *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                >
                  <option value="Empresa Legal">Empresa Legal</option>
                  <option value="Organización Criminal">Organización Criminal</option>
                  <option value="Facción">Facción</option>
                  <option value="Negocio">Negocio</option>
                </select>
              </div>
            </ResponsiveGrid>

            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color del Rol
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="colorRol"
                  value={formData.colorRol}
                  onChange={handleInputChange}
                  className="w-16 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  name="colorRol"
                  value={formData.colorRol}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all font-mono"
                  placeholder="#5865F2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                URL del Banner *
              </label>
              <input
                type="url"
                name="imagenBanner"
                value={formData.imagenBanner}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder="https://ejemplo.com/banner.jpg"
                required
              />
              {formData.imagenBanner && (
                <div className="mt-2">
                  <img
                    src={formData.imagenBanner}
                    alt="Preview del banner"
                    className="w-full max-w-md h-32 object-cover rounded-lg border border-white/20"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium flex items-center gap-2">
                <Link className="h-4 w-4" />
                Link de Discord *
              </label>
              <input
                type="url"
                name="linkDiscord"
                value={formData.linkDiscord}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                placeholder="https://discord.gg/ejemplo"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10">
              <ButtonModern
                type="button"
                variant="outline"
                size="md"
                onClick={() => setActiveTab("solicitudes")}
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </ButtonModern>
              
              <ButtonModern
                type="submit"
                variant="success"
                size="md"
                icon={<Send className="h-4 w-4" />}
                loading={submitting}
                className="flex-1"
                gradient={true}
                glow={true}
              >
                {submitting ? "Enviando..." : "Enviar Solicitud"}
              </ButtonModern>
            </div>
          </form>
        </CardModern>
      )}

      {activeTab === "historial" && (
        <div className="space-y-6">
          <CardModern variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">
                Historial Completo
              </h3>
            </div>

            {solicitudes.length > 0 ? (
              <div className="space-y-4">
                {solicitudes.map((solicitud) => (
                  <div key={solicitud.id} className="p-4 bg-black/20 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{solicitud.nombreEmpresa}</h4>
                      <StatusBadge
                        status={
                          solicitud.estado === "aprobada" ? "success" :
                          solicitud.estado === "denegada" ? "error" : "warning"
                        }
                        text={solicitud.estado.charAt(0).toUpperCase() + solicitud.estado.slice(1)}
                        size="sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-white/60">Tipo:</span>
                        <p className="text-white">{solicitud.tipo}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Dueño:</span>
                        <p className="text-white">{solicitud.dueno || "No especificado"}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Función:</span>
                        <p className="text-white">{solicitud.funcion || "No especificada"}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Creada:</span>
                        <p className="text-white">{formatDate(solicitud.fechaCreacion)}</p>
                      </div>
                      {solicitud.fechaRevision && (
                        <div>
                          <span className="text-white/60">Revisada:</span>
                          <p className="text-white">{formatDate(solicitud.fechaRevision)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No hay historial disponible</p>
              </div>
            )}
          </CardModern>
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedSolicitud && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <CardModern variant="glass" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Building2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedSolicitud.nombreEmpresa}
                    </h2>
                    <p className="text-white/60">{selectedSolicitud.tipo}</p>
                  </div>
                </div>
                <ButtonModern
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSolicitud(null)}
                  icon={<XCircle className="h-4 w-4" />}
                />
              </div>

              <div className="space-y-4">
                <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap={4}>
                  <div>
                    <label className="text-white/70 text-sm">Dueño:</label>
                    <p className="text-white font-medium">{selectedSolicitud.dueno || "No especificado"}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Función:</label>
                    <p className="text-white font-medium">{selectedSolicitud.funcion || "No especificada"}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Estado:</label>
                    <StatusBadge
                      status={
                        selectedSolicitud.estado === "aprobada" ? "success" :
                        selectedSolicitud.estado === "denegada" ? "error" : "warning"
                      }
                      text={selectedSolicitud.estado.charAt(0).toUpperCase() + selectedSolicitud.estado.slice(1)}
                      size="sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Fecha de Creación:</label>
                    <p className="text-white/80">{formatDate(selectedSolicitud.fechaCreacion)}</p>
                  </div>
                </ResponsiveGrid>

                {selectedSolicitud.colorRol && (
                  <div>
                    <label className="text-white/70 text-sm">Color del Rol:</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedSolicitud.colorRol }}
                      />
                      <span className="text-white font-mono text-sm">{selectedSolicitud.colorRol}</span>
                    </div>
                  </div>
                )}

                {selectedSolicitud.imagenBanner && (
                  <div>
                    <label className="text-white/70 text-sm">Banner:</label>
                    <img
                      src={selectedSolicitud.imagenBanner}
                      alt="Banner de empresa"
                      className="w-full max-w-md h-32 object-cover rounded-lg border border-white/20 mt-2"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {selectedSolicitud.linkDiscord && (
                  <div>
                    <label className="text-white/70 text-sm">Link de Discord:</label>
                    <a
                      href={selectedSolicitud.linkDiscord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all block mt-1"
                    >
                      {selectedSolicitud.linkDiscord}
                    </a>
                  </div>
                )}

                {(selectedSolicitud.motivoAprobacion || selectedSolicitud.motivoDenegacion) && (
                  <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                    <label className="text-white/70 text-sm">
                      {selectedSolicitud.motivoAprobacion ? "Motivo de Aprobación:" : "Motivo de Denegación:"}
                    </label>
                    <p className="text-white mt-1">
                      {selectedSolicitud.motivoAprobacion || selectedSolicitud.motivoDenegacion}
                    </p>
                    {selectedSolicitud.revisadoPor && (
                      <p className="text-white/60 text-sm mt-2">
                        Revisado por: {selectedSolicitud.revisadoPor.username} ({selectedSolicitud.revisadoPor.rol})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardModern>
        </div>
      )}
    </MobileLayout>
  );
}

export default function SolicitudesEmpresaPage() {
  return (
    <Suspense
      fallback={
        <LoadingModern
          variant="pulse"
          size="lg"
          text="Cargando solicitudes de empresa..."
          fullScreen={true}
        />
      }
    >
      <SolicitudesEmpresaContent />
    </Suspense>
  );
}