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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      {/* Scanning effect overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent animate-scan"></div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-black/40 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 sm:p-6 shadow-lg shadow-blue-500/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Logo y título */}
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <Image
                    src="/images/Icon.png"
                    alt="MXRP"
                    width={48}
                    height={48}
                    className="rounded-md sm:w-14 sm:h-14"
                  />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">
                    Base de Datos Policial
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <p className="text-white/60 text-sm sm:text-base">
                      Sistema de consulta de antecedentes
                    </p>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 animate-pulse w-fit">
                      SISTEMA ACTIVO
                    </span>
                  </div>
                </div>
              </div>

              {/* Botón de regreso */}
              <Button
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200 w-full sm:w-auto justify-center"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm sm:text-base">
                  Volver al Dashboard
                </span>
              </Button>
            </div>
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
        <div className="mb-4 sm:mb-6">
          <Card className="bg-black/40 backdrop-blur-md border-blue-500/20 shadow-lg shadow-blue-500/10">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchAntecedentes()
                    }
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm sm:text-base"
                    placeholder="Buscar por ID o username..."
                  />
                </div>
                <Button
                  onClick={handleSearchAntecedentes}
                  disabled={searchLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 text-sm sm:text-base"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-lg p-3 sm:p-4 shadow-lg shadow-blue-500/10 gap-3 sm:gap-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">
                    Resultados de Búsqueda
                  </h3>
                  <p className="text-white/40 text-xs sm:text-sm">
                    {searchResults.length}{" "}
                    {searchResults.length === 1
                      ? "usuario encontrado"
                      : "usuarios encontrados"}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30 w-fit">
                {searchResults.length}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {searchResults.map((result, index) => (
                <Card
                  key={result.userId}
                  className={`bg-black/40 backdrop-blur-md hover:bg-black/50 transition-all duration-300 animate-fadeInUp hover:shadow-lg ${
                    result.usuarioPeligroso
                      ? "border-red-500/40 hover:border-red-500/60 hover:shadow-red-500/20"
                      : "border-white/20 hover:border-blue-500/40 hover:shadow-blue-500/20"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">
                          {result.username || "Usuario Desconocido"}
                        </h3>
                        <p className="text-white/40 text-xs sm:text-sm truncate">
                          ID: {result.userId}
                        </p>
                      </div>
                      {result.usuarioPeligroso && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse flex-shrink-0 ml-2">
                          ⚠ PELIGROSO
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-xs sm:text-sm">
                          Total Arrestos
                        </span>
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {result.totalArrestos}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-xs sm:text-sm">
                          Arrestos Activos
                        </span>
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {result.estadisticas.arrestosActivos}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60 text-xs sm:text-sm">
                          Último Mes
                        </span>
                        <span className="text-white font-semibold text-sm sm:text-base">
                          {result.estadisticas.arrestosUltimoMes}
                        </span>
                      </div>
                      {result.fechaUltimoArresto && (
                        <div className="pt-2 border-t border-white/10">
                          <span className="text-white/40 text-xs">
                            Último Arresto:
                          </span>
                          <p className="text-white/80 text-xs sm:text-sm">
                            {formatDate(result.fechaUltimoArresto)}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleViewDetails(result.userId)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-blue-500/40 rounded-xl w-full max-w-6xl my-4 sm:my-8 shadow-2xl shadow-blue-500/20 animate-fadeInUp">
              <div className="p-4 sm:p-6">
                {/* Header del Modal */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-4 border-b border-white/10 gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <Image
                        src="/images/Icon.png"
                        alt="MXRP"
                        width={40}
                        height={40}
                        className="rounded-md sm:w-12 sm:h-12"
                      />
                      {selectedUser.usuarioPeligroso && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">
                          {selectedUser.username || "Usuario Desconocido"}
                        </h2>
                        {selectedUser.usuarioPeligroso && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 animate-pulse w-fit">
                            ⚠ PELIGROSO
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs sm:text-sm truncate">
                        ID: {selectedUser.userId}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedUser(null)}
                    className="bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200 w-full sm:w-auto justify-center"
                  >
                    Cerrar
                  </Button>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Card className="bg-black/40 backdrop-blur-md border-red-500/20 shadow-lg shadow-red-500/10 hover:border-red-500/40 transition-all duration-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                        </div>
                        <span className="text-white/60 text-xs sm:text-sm">
                          Total Arrestos
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {selectedUser.totalArrestos}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-yellow-500/20 shadow-lg shadow-yellow-500/10 hover:border-yellow-500/40 transition-all duration-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-yellow-500/20 rounded-lg">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                        </div>
                        <span className="text-white/60 text-xs sm:text-sm">
                          Arrestos Activos
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosActivos}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/40 backdrop-blur-md border-blue-500/20 shadow-lg shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-200">
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        </div>
                        <span className="text-white/60 text-xs sm:text-sm">
                          Último Mes
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosUltimoMes}
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className={`backdrop-blur-md shadow-lg transition-all duration-200 ${
                      selectedUser.usuarioPeligroso
                        ? "bg-red-500/10 border-red-500/40 shadow-red-500/20 hover:border-red-500/60"
                        : "bg-green-500/10 border-green-500/40 shadow-green-500/20 hover:border-green-500/60"
                    }`}
                  >
                    <CardContent className="p-3 sm:p-4 lg:p-6">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div
                          className={`p-1.5 sm:p-2 rounded-lg ${
                            selectedUser.usuarioPeligroso
                              ? "bg-red-500/20"
                              : "bg-green-500/20"
                          }`}
                        >
                          <Shield
                            className={`h-4 w-4 sm:h-5 sm:w-5 ${
                              selectedUser.usuarioPeligroso
                                ? "text-red-400"
                                : "text-green-400"
                            }`}
                          />
                        </div>
                        <span className="text-white/60 text-xs sm:text-sm">
                          Estado
                        </span>
                      </div>
                      <p
                        className={`text-lg sm:text-xl lg:text-2xl font-bold ${
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
                <Card className="bg-black/40 backdrop-blur-md border-blue-500/20 shadow-lg shadow-blue-500/10">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                          Historial de Antecedentes
                        </h3>
                      </div>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30 w-fit">
                        {selectedUser.antecedentes.length} registros
                      </span>
                    </div>

                    {selectedUser.antecedentes.length === 0 ? (
                      <div className="text-center py-8">
                        <Shield className="h-12 w-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">
                          No hay antecedentes registrados
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                        {selectedUser.antecedentes.map((antecedente, index) => (
                          <div
                            key={index}
                            className={`p-3 sm:p-4 rounded-lg border ${
                              antecedente.activo
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-white/5 border-white/10"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">
                                  {antecedente.motivo}
                                </h4>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/60">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {formatDate(antecedente.fecha)}
                                  </span>
                                </div>
                              </div>
                              {antecedente.activo && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30 w-fit">
                                  ACTIVO
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-3 border-t border-white/10">
                              <div>
                                <span className="text-white/40 text-xs">
                                  Arrestado por:
                                </span>
                                <p className="text-white text-xs sm:text-sm font-medium truncate">
                                  {antecedente.arrestadoPorTag}
                                </p>
                              </div>
                              <div>
                                <span className="text-white/40 text-xs">
                                  Duración:
                                </span>
                                <p className="text-white text-xs sm:text-sm font-medium">
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
