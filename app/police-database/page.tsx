"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  ArrowLeft,
  Search,
  Shield,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";

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
  const discordId = searchParams.get("discordId");
  const guildId = searchParams.get("guildId");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AntecedenteUsuario[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] =
    useState<AntecedentesCompletos | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const handleSearchAntecedentes = useCallback(async () => {
    try {
      setSearchLoading(true);
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "searchAntecedentes",
          discordId,
          guildId,
          query: searchQuery.trim() || undefined,
          limit: 50,
        }),
      });

      const data = await response.json();

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
  }, [discordId, guildId, searchQuery]);

  useEffect(() => {
    if (discordId && guildId && searchResults.length === 0) {
      handleSearchAntecedentes();
    }
  }, [discordId, guildId, searchResults.length, handleSearchAntecedentes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = async (userId: string) => {
    try {
      setDetailsLoading(true);
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getUserAntecedentes",
          discordId,
          guildId,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const antecedentes = data.antecedentes;
        if (antecedentes && !antecedentes.estadisticas) {
          antecedentes.estadisticas = {
            totalArrestos: antecedentes.totalArrestos || 0,
            arrestosActivos:
              antecedentes.antecedentes?.filter(
                (a: AntecedenteDetalle) => a.activo
              ).length || 0,
            arrestosUltimoMes: 0,
            esUsuarioPeligroso: antecedentes.usuarioPeligroso || false,
            fechaUltimoArresto: antecedentes.fechaUltimoArresto,
          };
        }
        setSelectedUser(antecedentes);
      } else {
        setError(data.message || "Error al obtener detalles");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      setError("Error de conexión");
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!discordId || !guildId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="text-center">
              <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Acceso Denegado
              </h1>
              <p className="text-white/60">
                No se proporcionaron los parámetros necesarios para acceder a la
                base de datos policial.
              </p>
            </div>
          </CardContent>
        </Card>
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {/* Logo y título */}
            <div className="flex items-center gap-4">
              <Image
                src="/images/Icon.png"
                alt="MXRP"
                width={48}
                height={48}
                className="rounded-md"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Base de Datos Policial
                </h1>
                <p className="text-white/60">
                  Sistema de consulta de antecedentes
                </p>
              </div>
            </div>

            {/* Botón de regreso */}
            <Button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al Dashboard</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg backdrop-blur-md">
            <p className="text-red-400">{error}</p>
            <Button
              onClick={() => setError(null)}
              className="mt-2"
              variant="outline"
              size="sm"
            >
              Cerrar
            </Button>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <Card className="bg-black/40 backdrop-blur-md border-white/20">
            <CardContent className="p-4">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchAntecedentes()
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-discord transition-colors"
                    placeholder="Buscar por ID o username (dejar vacío para ver todos)..."
                  />
                </div>
                <Button
                  onClick={handleSearchAntecedentes}
                  disabled={searchLoading}
                  className="bg-discord hover:bg-discord/80 text-white px-6"
                >
                  {searchLoading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultados */}
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">
              Resultados ({searchResults.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <Card
                  key={result.userId}
                  className="bg-black/40 backdrop-blur-md border-white/20 hover:bg-black/50 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {result.username || "Usuario Desconocido"}
                        </h3>
                        <p className="text-white/40 text-sm">
                          ID: {result.userId}
                        </p>
                      </div>
                      {result.usuarioPeligroso && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                          PELIGROSO
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">
                          Total Arrestos
                        </span>
                        <span className="text-white font-semibold">
                          {result.totalArrestos}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">
                          Arrestos Activos
                        </span>
                        <span className="text-white font-semibold">
                          {result.estadisticas.arrestosActivos}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-sm">
                          Último Mes
                        </span>
                        <span className="text-white font-semibold">
                          {result.estadisticas.arrestosUltimoMes}
                        </span>
                      </div>
                      {result.fechaUltimoArresto && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-white/40 text-xs">
                            Último Arresto:
                          </span>
                          <p className="text-white/80 text-sm">
                            {formatDate(result.fechaUltimoArresto)}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleViewDetails(result.userId)}
                      className="w-full bg-discord hover:bg-discord/80"
                    >
                      Ver Detalles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : searchLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord mx-auto mb-4"></div>
            <p className="text-white/60">Buscando usuarios...</p>
          </div>
        ) : (
          <Card className="bg-black/40 backdrop-blur-md border-white/20">
            <CardContent className="text-center py-12">
              <Shield className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-white/60">
                Intenta con otro término de búsqueda o deja el campo vacío para
                ver todos los usuarios
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de Detalles del Usuario */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-xl w-full max-w-6xl my-8">
              <div className="p-6">
                {/* Header del Modal */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Image
                      src="/images/Icon.png"
                      alt="MXRP"
                      width={48}
                      height={48}
                      className="rounded-md"
                    />
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {selectedUser.username || "Usuario Desconocido"}
                      </h2>
                      <p className="text-white/60">ID: {selectedUser.userId}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedUser(null)}
                    className="bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-white/10"
                  >
                    Cerrar
                  </Button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="bg-black/40 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        <span className="text-white/60 text-sm">
                          Total Arrestos
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {selectedUser.totalArrestos}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <Clock className="h-5 w-5 text-yellow-400" />
                        </div>
                        <span className="text-white/60 text-sm">
                          Arrestos Activos
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosActivos}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-white/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-white/60 text-sm">
                          Último Mes
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosUltimoMes}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`backdrop-blur-md ${
                      selectedUser.usuarioPeligroso
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-green-500/10 border-green-500/30"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedUser.usuarioPeligroso
                              ? "bg-red-500/20"
                              : "bg-green-500/20"
                          }`}
                        >
                          <Shield
                            className={`h-5 w-5 ${
                              selectedUser.usuarioPeligroso
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          />
                        </div>
                        <span className="text-white/60 text-sm">Estado</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${
                          selectedUser.usuarioPeligroso
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {selectedUser.usuarioPeligroso ? "PELIGROSO" : "SEGURO"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Historial de Antecedentes */}
                <Card className="bg-black/40 backdrop-blur-md border-white/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">
                      Historial de Antecedentes
                    </h3>

                    {selectedUser.antecedentes.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">
                          No hay antecedentes registrados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedUser.antecedentes.map((antecedente, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              antecedente.activo
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="text-white font-semibold mb-1">
                                  {antecedente.motivo}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatDate(antecedente.fecha)}</span>
                                </div>
                              </div>
                              {antecedente.activo && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                  ACTIVO
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                              <div>
                                <span className="text-white/40 text-xs">
                                  Arrestado por:
                                </span>
                                <p className="text-white text-sm font-medium">
                                  {antecedente.arrestadoPorTag}
                                </p>
                              </div>
                              <div>
                                <span className="text-white/40 text-xs">
                                  Duración:
                                </span>
                                <p className="text-white text-sm font-medium">
                                  {formatTime(antecedente.duracion)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay para detalles */}
        {detailsLoading && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-discord mx-auto mb-4"></div>
              <p className="text-white/80 text-lg">Cargando detalles...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PoliceDatabasePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white/80 text-lg">
              Cargando base de datos policial...
            </p>
          </div>
        </div>
      }
    >
      <PoliceDatabaseContent />
    </Suspense>
  );
}
