"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Shield,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  FileText,
  Filter,
  Download,
} from "lucide-react";
import AdminLayout from "@/components/layout/admin-layout";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { ResponsiveGrid, ResponsiveContainer } from "@/components/ui/responsive-grid";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { formatDate } from "@/lib/utils";

interface AntecedenteDetalle {
  fecha: string;
  motivo: string;
  arrestadoPor: string;
  arrestadoPorTag: string;
  duracion: number;
  activo: boolean;
}

interface AntecedentesCompletos {
  userId: string;
  username?: string;
  userTag?: string;
  totalArrestos: number;
  usuarioPeligroso: boolean;
  fechaUltimoArresto: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  antecedentes: AntecedenteDetalle[];
  estadisticas: {
    totalArrestos: number;
    arrestosActivos: number;
    arrestosUltimoMes: number;
    esUsuarioPeligroso: boolean;
    fechaUltimoArresto: string | null;
  };
}

interface AntecedenteUsuario {
  userId: string;
  username?: string;
  userTag?: string;
  totalArrestos: number;
  usuarioPeligroso: boolean;
  fechaUltimoArresto: string | null;
  estadisticas: {
    totalArrestos: number;
    arrestosActivos: number;
    arrestosUltimoMes: number;
    esUsuarioPeligroso: boolean;
    fechaUltimoArresto: string | null;
  };
}

function PoliceDatabaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const guildId = searchParams.get("guildId") || process.env.NEXT_PUBLIC_GUILD_ID;
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AntecedenteUsuario[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<AntecedentesCompletos | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  const handleViewDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "getAntecedentesDetails",
          guildId,
          userId,
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
        setSelectedUser(data.antecedentes);
        setError(null);
      } else {
        setError(data.message || "Error al obtener los detalles");
        toast.error("Error", data.message || "No se pudieron cargar los detalles");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
      setError("Error de conexión");
      toast.error("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleSearchAntecedentes = useCallback(async () => {
    try {
      setSearchLoading(true);
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "searchAntecedentes",
          guildId,
          query: searchQuery.trim() || undefined,
          limit: 50,
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
        setSearchResults(data.resultados);
      } else {
        setError(data.message || "Error en la búsqueda");
      }
    } catch (error) {
      console.error("Error searching antecedentes:", error);
      setError("Error de conexión");
    } finally {
      setSearchLoading(false);
    }
  }, [guildId, searchQuery, router]);

  useEffect(() => {
    if (guildId && searchResults.length === 0) {
      handleSearchAntecedentes();
    }
  }, [guildId, searchResults.length, handleSearchAntecedentes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Debug info
  console.log("Police Database - guildId from URL:", searchParams.get("guildId"));
  console.log("Police Database - guildId from env:", process.env.NEXT_PUBLIC_GUILD_ID);
  console.log("Police Database - final guildId:", guildId);

  if (!guildId) {
    return (
      <AdminLayout
        title="Acceso Denegado"
        subtitle="Parámetros insuficientes"
        showBackButton={true}
        backUrl="/dashboard"
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <CardModern variant="glass" className="p-8 text-center max-w-md mx-auto">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-4">Acceso Denegado</h2>
            <p className="text-white/60 mb-6">
              No se proporcionaron los parámetros necesarios para acceder a la
              base de datos policial. Verifica que la variable NEXT_PUBLIC_GUILD_ID esté configurada.
            </p>
            <div className="text-left text-xs text-white/40 mb-4 p-3 bg-black/20 rounded">
              <p>Debug info:</p>
              <p>URL guildId: {searchParams.get("guildId") || "null"}</p>
              <p>Env guildId: {process.env.NEXT_PUBLIC_GUILD_ID || "null"}</p>
            </div>
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
      title="Base de Datos Policial"
      subtitle="Sistema de consulta de antecedentes"
      showBackButton={true}
      backUrl="/dashboard"
    >
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

      {/* System Status */}
      <div className="mb-6">
        <CardModern variant="neon" className="p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Shield className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1">
                Sistema de Base de Datos Policial
              </h2>
              <div className="flex items-center gap-2">
                <StatusBadge status="success" text="SISTEMA ACTIVO" size="sm" />
                <span className="text-white/60 text-sm">
                  Consulta de antecedentes en tiempo real
                </span>
              </div>
            </div>
          </div>
        </CardModern>
      </div>

      {error && (
        <div className="mb-6">
          <CardModern variant="glass" className="p-4 border-red-500/30 bg-red-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-400 mb-2">{error}</p>
                <ButtonModern
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Cerrar
                </ButtonModern>
              </div>
            </div>
          </CardModern>
        </div>
      )}

      {/* Search Section */}
      <div className="mb-8">
        <CardModern variant="glass" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Search className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              Búsqueda de Antecedentes
            </h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre de usuario o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchAntecedentes()}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
            </div>
            <ButtonModern
              variant="primary"
              size="md"
              icon={<Search className="h-4 w-4" />}
              onClick={handleSearchAntecedentes}
              loading={searchLoading}
              className="sm:w-auto"
            >
              Buscar
            </ButtonModern>
          </div>
        </CardModern>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mb-8">
          <ResponsiveTable
            data={searchResults}
            columns={[
              {
                key: "username",
                label: "Usuario",
                render: (value, row) => (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-white/60" />
                    <span className="font-medium">{value || "Usuario desconocido"}</span>
                  </div>
                ),
              },
              {
                key: "userTag",
                label: "Tag",
                render: (value) => (
                  <span className="text-white/80 font-mono text-sm">
                    {value || "N/A"}
                  </span>
                ),
              },
              {
                key: "totalArrestos",
                label: "Total Arrestos",
                render: (value) => (
                  <span className="font-semibold text-orange-400">{value}</span>
                ),
              },
              {
                key: "usuarioPeligroso",
                label: "Estado",
                render: (value) => (
                  <StatusBadge
                    status={value ? "warning" : "success"}
                    text={value ? "Peligroso" : "Normal"}
                    size="sm"
                  />
                ),
              },
              {
                key: "fechaUltimoArresto",
                label: "Último Arresto",
                render: (value) => (
                  <span className="text-white/80 text-sm">
                    {value ? formatDate(value) : "Nunca"}
                  </span>
                ),
              },
            ]}
            actions={[
              {
                label: "Ver Detalles",
                icon: <FileText className="h-4 w-4" />,
                onClick: (row) => handleViewDetails(row.userId),
              },
            ]}
            searchable={false}
            emptyMessage="No se encontraron resultados"
            loading={searchLoading}
          />
        </div>
      )}

      {/* User Details */}
      {selectedUser && (
        <div className="space-y-6">
          <CardModern variant="gradient" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Detalles de {selectedUser.username || "Usuario"}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={selectedUser.usuarioPeligroso ? "warning" : "success"}
                    text={selectedUser.usuarioPeligroso ? "Usuario Peligroso" : "Usuario Normal"}
                    size="md"
                  />
                  <span className="text-white/60 text-sm">
                    ID: {selectedUser.userId}
                  </span>
                </div>
              </div>
              <ButtonModern
                variant="outline"
                size="md"
                icon={<Download className="h-4 w-4" />}
                onClick={() => {
                  // Implementar descarga de reporte
                  toast.info("Función próximamente", "La descarga de reportes estará disponible pronto");
                }}
              >
                Descargar Reporte
              </ButtonModern>
            </div>

            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={4}>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {selectedUser.totalArrestos}
                </div>
                <div className="text-white/60 text-sm">Total Arrestos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {selectedUser.estadisticas.arrestosActivos}
                </div>
                <div className="text-white/60 text-sm">Arrestos Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {selectedUser.estadisticas.arrestosUltimoMes}
                </div>
                <div className="text-white/60 text-sm">Último Mes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {selectedUser.estadisticas.fechaUltimoArresto 
                    ? formatDate(selectedUser.estadisticas.fechaUltimoArresto)
                    : "Nunca"
                  }
                </div>
                <div className="text-white/60 text-sm">Último Arresto</div>
              </div>
            </ResponsiveGrid>
          </CardModern>

          {/* Antecedentes List */}
          <CardModern variant="glass" className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">
              Historial de Antecedentes ({selectedUser.antecedentes.length})
            </h4>
            
            {selectedUser.antecedentes.length > 0 ? (
              <ResponsiveTable
                data={selectedUser.antecedentes}
                columns={[
                  {
                    key: "fecha",
                    label: "Fecha",
                    render: (value) => (
                      <span className="text-white/80 text-sm">
                        {formatDate(value)}
                      </span>
                    ),
                  },
                  {
                    key: "motivo",
                    label: "Motivo",
                    render: (value) => (
                      <span className="text-white font-medium">{value}</span>
                    ),
                  },
                  {
                    key: "arrestadoPorTag",
                    label: "Arrestado Por",
                    render: (value, row) => (
                      <span className="text-white/80 text-sm">
                        {value || row.arrestadoPor}
                      </span>
                    ),
                  },
                  {
                    key: "duracion",
                    label: "Duración",
                    render: (value) => (
                      <span className="text-orange-400 font-medium">
                        {value} min
                      </span>
                    ),
                  },
                  {
                    key: "activo",
                    label: "Estado",
                    render: (value) => (
                      <StatusBadge
                        status={value ? "warning" : "success"}
                        text={value ? "Activo" : "Cumplido"}
                        size="sm"
                      />
                    ),
                  },
                ]}
                searchable={true}
                searchPlaceholder="Buscar en antecedentes..."
                itemsPerPage={10}
                emptyMessage="No hay antecedentes registrados"
              />
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">No hay antecedentes registrados</p>
              </div>
            )}
          </CardModern>
        </div>
      )}
    </AdminLayout>
  );
}

export default function PoliceDatabasePage() {
  return (
    <Suspense
      fallback={
        <LoadingModern
          variant="pulse"
          size="lg"
          text="Cargando base de datos policial..."
          fullScreen={true}
        />
      }
    >
      <PoliceDatabaseContent />
    </Suspense>
  );
}
