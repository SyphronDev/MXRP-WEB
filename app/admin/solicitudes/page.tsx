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
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Filter,
  Search,
  FileText,
  Calendar,
  AlertCircle,
  Users,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { ResponsiveGrid, ResponsiveContainer } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { MobileTabs } from "@/components/ui/mobile-tabs";
import { formatDate } from "@/lib/utils";

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

function AdminSolicitudesContent() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState<SolicitudPendiente[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudPendiente | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"aprobar" | "denegar" | null>(null);
  const [motivo, setMotivo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const router = useRouter();
  const toast = useToast();

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
        console.log("Admin - Solicitudes recibidas:", data.solicitudes);
        setSolicitudes(data.solicitudes);
      } else {
        console.log("Admin - Error:", data);
        toast.addToast({
          type: "error",
          title: "Error al cargar",
          message: data.message || "Error cargando solicitudes",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      toast.addToast({
        type: "error",
        title: "Error de conexión",
        message: "No se pudieron cargar las solicitudes",
        duration: 4000,
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
      toast.addToast({
        type: "error",
        title: "Campo requerido",
        message: "El motivo es obligatorio",
        duration: 3000,
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/.netlify/functions/solicitudes-empresa", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: action === "aprobar" ? "aprobarSolicitud" : "denegarSolicitud",
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
        toast.addToast({
          type: "success",
          title: action === "aprobar" ? "Solicitud aprobada" : "Solicitud denegada",
          message: data.message,
          duration: 4000,
        });
        setShowModal(false);
        setSelectedSolicitud(null);
        setAction(null);
        setMotivo("");
        cargarSolicitudes();
      } else {
        toast.addToast({
          type: "error",
          title: "Error al procesar",
          message: data.message,
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error procesando solicitud:", error);
      toast.addToast({
        type: "error",
        title: "Error de conexión",
        message: "No se pudo procesar la solicitud",
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

  // Filtrar solicitudes según búsqueda y filtros
  const filteredSolicitudes = solicitudes.filter((solicitud) => {
    const matchesSearch = 
      solicitud.nombreEmpresa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solicitud.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      solicitud.dueno.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === "all" || solicitud.tipo === filterType;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout
      title="Gestionar Solicitudes"
      subtitle="Administración de solicitudes de empresa"
      user={user}
      showBackButton={true}
      backUrl="/admin"
    >
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* Solicitudes Stats */}
      <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={6} className="mb-8">
        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <FileText className="h-6 w-6 text-blue-400" />
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
              <p className="text-2xl font-bold text-orange-400">{filteredSolicitudes.length}</p>
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Estado</h3>
              <StatusBadge status="success" text="Sistema Activo" size="sm" />
            </div>
          </div>
        </CardModern>

        <CardModern variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Administrador</h3>
              <p className="text-2xl font-bold text-purple-400">Activo</p>
            </div>
          </div>
        </CardModern>
      </ResponsiveGrid>

      {/* Search and Filters */}
      <CardModern variant="glass" className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Search className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold text-lg">Buscar y Filtrar</h3>
        </div>
        
        <ResponsiveGrid cols={{ default: 1, lg: 2 }} gap={4}>
          <div className="space-y-2">
            <label className="text-white/70 text-sm">Buscar solicitudes:</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por empresa, usuario o dueño..."
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/70 text-sm">Filtrar por tipo:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="all">Todos los tipos</option>
              <option value="Empresa Legal">Empresa Legal</option>
              <option value="Facción Ilegal">Facción Ilegal</option>
              <option value="Organización Criminal">Organización Criminal</option>
              <option value="Negocio">Negocio</option>
              <option value="Facción">Facción</option>
            </select>
          </div>
        </ResponsiveGrid>
      </CardModern>

      {/* Solicitudes Table */}
      {filteredSolicitudes.length > 0 ? (
        <CardModern variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Building2 className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">
                Solicitudes Pendientes ({filteredSolicitudes.length})
              </h3>
              <p className="text-white/60 text-sm">
                Solo se muestran las solicitudes pendientes de aprobación
              </p>
            </div>
          </div>

          <ResponsiveTable
            data={filteredSolicitudes}
            columns={[
              {
                key: "nombreEmpresa",
                label: "Empresa",
                render: (value, row) => (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Building2 className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{value}</p>
                      <p className="text-white/60 text-sm">{row.tipo}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "username",
                label: "Solicitante",
                render: (value, row) => (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-white/60" />
                    <div>
                      <p className="text-white font-medium">{value}</p>
                      <p className="text-white/60 text-sm">{row.userTag}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "dueno",
                label: "Dueño",
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-white/60" />
                    <span className="text-white">{value}</span>
                  </div>
                ),
              },
              {
                key: "fechaCreacion",
                label: "Fecha",
                render: (value) => (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <span className="text-white/80 text-sm">{formatDate(value)}</span>
                  </div>
                ),
              },
            ]}
            actions={[
              {
                label: "Ver Detalles",
                icon: <Eye className="h-4 w-4" />,
                onClick: (row) => {
                  setSelectedSolicitud(row);
                  setShowModal(true);
                  setAction(null);
                },
                variant: "default",
              },
              {
                label: "Aprobar",
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: (row) => handleAprobar(row),
                variant: "default",
              },
              {
                label: "Denegar",
                icon: <XCircle className="h-4 w-4" />,
                onClick: (row) => handleDenegar(row),
                variant: "warning",
              },
            ]}
          />
        </CardModern>
      ) : (
        <CardModern variant="glass" className="p-12 text-center">
          <Building2 className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-white font-semibold text-xl mb-2">
            No hay solicitudes
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery || filterType !== "all" 
              ? "No se encontraron solicitudes que coincidan con los filtros"
              : "No hay solicitudes pendientes en este momento"
            }
          </p>
          {(searchQuery || filterType !== "all") && (
            <ButtonModern
              variant="outline"
              size="md"
              onClick={() => {
                setSearchQuery("");
                setFilterType("all");
              }}
            >
              Limpiar Filtros
            </ButtonModern>
          )}
        </CardModern>
      )}

      {/* Modal de Detalles/Acción */}
      {showModal && selectedSolicitud && (
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
                      {action ? (action === "aprobar" ? "Aprobar Solicitud" : "Denegar Solicitud") : "Detalles de Solicitud"}
                    </h2>
                    <p className="text-white/60">{selectedSolicitud.nombreEmpresa}</p>
                  </div>
                </div>
                <ButtonModern
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSolicitud(null);
                    setAction(null);
                    setMotivo("");
                  }}
                  icon={<XCircle className="h-4 w-4" />}
                />
              </div>

              {/* Detalles de la solicitud */}
              <div className="space-y-6 mb-6">
                <ResponsiveGrid cols={{ default: 1, sm: 2 }} gap={4}>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Nombre de la Empresa:</label>
                    <p className="text-white font-medium">{selectedSolicitud.nombreEmpresa}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Tipo:</label>
                    <StatusBadge 
                      status="info" 
                      text={selectedSolicitud.tipo} 
                      size="sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Dueño:</label>
                    <p className="text-white font-medium">{selectedSolicitud.dueno}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Función:</label>
                    <p className="text-white font-medium">{selectedSolicitud.funcion}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Solicitante:</label>
                    <p className="text-white font-medium">{selectedSolicitud.username}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Fecha de Solicitud:</label>
                    <p className="text-white/80">{formatDate(selectedSolicitud.fechaCreacion)}</p>
                  </div>
                </ResponsiveGrid>

                {selectedSolicitud.colorRol && (
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Color del Rol:</label>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-white/20"
                        style={{ backgroundColor: selectedSolicitud.colorRol }}
                      />
                      <span className="text-white font-mono text-sm">{selectedSolicitud.colorRol}</span>
                    </div>
                  </div>
                )}

                {selectedSolicitud.imagenBanner && (
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Banner de la Empresa:</label>
                    <img
                      src={selectedSolicitud.imagenBanner}
                      alt="Banner de empresa"
                      className="w-full max-w-md h-32 object-cover rounded-lg border border-white/20"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {selectedSolicitud.linkDiscord && (
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">Link de Discord:</label>
                    <a
                      href={selectedSolicitud.linkDiscord}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline break-all"
                    >
                      {selectedSolicitud.linkDiscord}
                    </a>
                  </div>
                )}
              </div>

              {/* Formulario de acción */}
              {action && (
                <div className="space-y-4 mb-6 p-4 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2">
                    {action === "aprobar" ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <h3 className={`font-semibold ${action === "aprobar" ? "text-green-400" : "text-red-400"}`}>
                      {action === "aprobar" ? "Aprobar Solicitud" : "Denegar Solicitud"}
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-white/70 text-sm">
                      Motivo {action === "aprobar" ? "de aprobación" : "de denegación"} *
                    </label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder={`Escribe el motivo de ${action === "aprobar" ? "aprobación" : "denegación"}...`}
                      rows={3}
                      className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!action ? (
                  <>
                    <ButtonModern
                      variant="success"
                      size="md"
                      onClick={() => setAction("aprobar")}
                      icon={<CheckCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Aprobar Solicitud
                    </ButtonModern>
                    <ButtonModern
                      variant="danger"
                      size="md"
                      onClick={() => setAction("denegar")}
                      icon={<XCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      Denegar Solicitud
                    </ButtonModern>
                  </>
                ) : (
                  <>
                    <ButtonModern
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setAction(null);
                        setMotivo("");
                      }}
                      className="flex-1 sm:flex-none"
                    >
                      Cancelar
                    </ButtonModern>
                    <ButtonModern
                      variant={action === "aprobar" ? "success" : "danger"}
                      size="md"
                      onClick={handleSubmitAction}
                      loading={submitting}
                      icon={action === "aprobar" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      className="flex-1"
                    >
                      {submitting 
                        ? `${action === "aprobar" ? "Aprobando" : "Denegando"}...` 
                        : `${action === "aprobar" ? "Confirmar Aprobación" : "Confirmar Denegación"}`
                      }
                    </ButtonModern>
                  </>
                )}
              </div>
            </div>
          </CardModern>
        </div>
      )}
    </AdminLayout>
  );
}

export default function AdminSolicitudesPage() {
  return (
    <Suspense
      fallback={
        <LoadingModern
          variant="pulse"
          size="lg"
          text="Cargando gestión de solicitudes..."
          fullScreen={true}
        />
      }
    >
      <AdminSolicitudesContent />
    </Suspense>
  );
}