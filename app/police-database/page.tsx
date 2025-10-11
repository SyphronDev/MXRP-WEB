"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CargoCriminal {
  id: string;
  nombre: string;
  descripcion: string;
  severidad: "Leve" | "Moderado" | "Grave" | "Muy Grave";
  tiempoMinimo: number;
  tiempoMaximo: number;
  multaMinima: number;
  multaMaxima: number;
  creadoPor: string;
  fechaCreacion: string;
}

interface AntecedenteUsuario {
  userId: string;
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

interface AntecedenteDetalle {
  fecha: string;
  motivo: string;
  arrestadoPor: string;
  arrestadoPorTag: string;
  canal: string;
  duracion: number;
  activo: boolean;
}

interface AntecedentesCompletos {
  userId: string;
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

function PoliceDatabaseContent() {
  const searchParams = useSearchParams();
  const discordId = searchParams.get("discordId");
  const guildId = searchParams.get("guildId");

  const [activeTab, setActiveTab] = useState<"cargos" | "buscar">("cargos");
  const [cargos, setCargos] = useState<CargoCriminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para gestión de cargos
  const [showAddCargo, setShowAddCargo] = useState(false);
  const [newCargo, setNewCargo] = useState<{
    nombre: string;
    descripcion: string;
    severidad: "Leve" | "Moderado" | "Grave" | "Muy Grave";
    tiempoMinimo: string;
    tiempoMaximo: string;
    multaMinima: string;
    multaMaxima: string;
  }>({
    nombre: "",
    descripcion: "",
    severidad: "Leve",
    tiempoMinimo: "",
    tiempoMaximo: "",
    multaMinima: "",
    multaMaxima: "",
  });

  // Estados para búsqueda de antecedentes
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AntecedenteUsuario[]>([]);
  const [selectedUser, setSelectedUser] =
    useState<AntecedentesCompletos | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const loadCargos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "getCargos",
          discordId,
          guildId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCargos(data.cargos);
      } else {
        setError(data.message || "Error al cargar cargos");
      }
    } catch (error) {
      console.error("Error loading cargos:", error);
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [discordId, guildId]);

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
          query: searchQuery.trim() || undefined, // Si no hay query, buscar todos
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
    if (discordId && guildId) {
      loadCargos();
    }
  }, [discordId, guildId, loadCargos]);

  // Cargar todos los usuarios con antecedentes cuando se cambia a la pestaña de búsqueda
  useEffect(() => {
    if (
      activeTab === "buscar" &&
      discordId &&
      guildId &&
      searchResults.length === 0
    ) {
      handleSearchAntecedentes();
    }
  }, [
    activeTab,
    discordId,
    guildId,
    searchResults.length,
    handleSearchAntecedentes,
  ]);

  const handleAddCargo = async () => {
    try {
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "addCargo",
          discordId,
          guildId,
          ...newCargo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCargos([...cargos, data.cargo]);
        setNewCargo({
          nombre: "",
          descripcion: "",
          severidad: "Leve",
          tiempoMinimo: "",
          tiempoMaximo: "",
          multaMinima: "",
          multaMaxima: "",
        });
        setShowAddCargo(false);
      } else {
        setError(data.message || "Error al agregar cargo");
      }
    } catch (error) {
      console.error("Error adding cargo:", error);
      setError("Error de conexión");
    }
  };

  const handleViewUserDetails = async (userId: string) => {
    try {
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
        // Asegurar que las estadísticas estén presentes
        const antecedentes = data.antecedentes;
        if (antecedentes && !antecedentes.estadisticas) {
          // Si no hay estadísticas, crear unas por defecto
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
      console.error("Error getting user details:", error);
      setError("Error de conexión");
    }
  };

  const getSeverityColor = (severidad: string) => {
    switch (severidad) {
      case "Leve":
        return "text-green-400 bg-green-400/10";
      case "Moderado":
        return "text-yellow-400 bg-yellow-400/10";
      case "Grave":
        return "text-orange-400 bg-orange-400/10";
      case "Muy Grave":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!discordId || !guildId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400">Acceso Denegado</CardTitle>
            <CardDescription>
              No se proporcionaron los parámetros necesarios para acceder a la
              base de datos policial.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Base de Datos Policial</h1>
          <p className="text-gray-400">
            Sistema de gestión de cargos criminales y antecedentes
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab("cargos")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "cargos"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Gestión de Cargos
            </button>
            <button
              onClick={() => setActiveTab("buscar")}
              className={`pb-2 px-1 border-b-2 transition-colors ${
                activeTab === "buscar"
                  ? "border-blue-400 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              Buscar Antecedentes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "cargos" && (
          <div className="space-y-6">
            {/* Header con botón agregar */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Cargos Criminales</h2>
              <Button
                onClick={() => setShowAddCargo(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Agregar Cargo
              </Button>
            </div>

            {/* Formulario para agregar cargo */}
            {showAddCargo && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    Nuevo Cargo Criminal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Nombre del Cargo
                      </label>
                      <input
                        type="text"
                        value={newCargo.nombre}
                        onChange={(e) =>
                          setNewCargo({ ...newCargo, nombre: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="Ej: Robo a mano armada"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Severidad
                      </label>
                      <select
                        value={newCargo.severidad}
                        onChange={(e) =>
                          setNewCargo({
                            ...newCargo,
                            severidad: e.target.value as
                              | "Leve"
                              | "Moderado"
                              | "Grave"
                              | "Muy Grave",
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      >
                        <option value="Leve">Leve</option>
                        <option value="Moderado">Moderado</option>
                        <option value="Grave">Grave</option>
                        <option value="Muy Grave">Muy Grave</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newCargo.descripcion}
                      onChange={(e) =>
                        setNewCargo({
                          ...newCargo,
                          descripcion: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                      rows={3}
                      placeholder="Descripción detallada del cargo..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tiempo Mínimo (minutos)
                      </label>
                      <input
                        type="number"
                        value={newCargo.tiempoMinimo}
                        onChange={(e) =>
                          setNewCargo({
                            ...newCargo,
                            tiempoMinimo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Tiempo Máximo (minutos)
                      </label>
                      <input
                        type="number"
                        value={newCargo.tiempoMaximo}
                        onChange={(e) =>
                          setNewCargo({
                            ...newCargo,
                            tiempoMaximo: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="120"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Multa Mínima ($)
                      </label>
                      <input
                        type="number"
                        value={newCargo.multaMinima}
                        onChange={(e) =>
                          setNewCargo({
                            ...newCargo,
                            multaMinima: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Multa Máxima ($)
                      </label>
                      <input
                        type="number"
                        value={newCargo.multaMaxima}
                        onChange={(e) =>
                          setNewCargo({
                            ...newCargo,
                            multaMaxima: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                        placeholder="5000"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddCargo}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Agregar Cargo
                    </Button>
                    <Button
                      onClick={() => setShowAddCargo(false)}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de cargos */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Cargando cargos...</p>
              </div>
            ) : cargos.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-8">
                  <p className="text-gray-400">
                    No hay cargos criminales registrados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cargos.map((cargo) => (
                  <Card key={cargo.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-white text-lg">
                          {cargo.nombre}
                        </CardTitle>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                            cargo.severidad
                          )}`}
                        >
                          {cargo.severidad}
                        </span>
                      </div>
                      <CardDescription className="text-gray-300">
                        {cargo.descripcion}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Tiempo:</span>
                          <span className="text-white">
                            {formatTime(cargo.tiempoMinimo)} -{" "}
                            {formatTime(cargo.tiempoMaximo)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Multa:</span>
                          <span className="text-white">
                            ${cargo.multaMinima.toLocaleString()} - $
                            {cargo.multaMaxima.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Creado por:</span>
                          <span className="text-white">{cargo.creadoPor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fecha:</span>
                          <span className="text-white">
                            {formatDate(cargo.fechaCreacion)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "buscar" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Buscar Antecedentes</h2>

            {/* Barra de búsqueda */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchAntecedentes()
                    }
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="Buscar por ID de usuario (dejar vacío para ver todos)..."
                  />
                  <Button
                    onClick={handleSearchAntecedentes}
                    disabled={searchLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {searchLoading
                      ? "Buscando..."
                      : searchQuery.trim()
                      ? "Buscar"
                      : "Ver Todos"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resultados de búsqueda */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Resultados ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((result) => (
                    <Card
                      key={result.userId}
                      className="bg-gray-800 border-gray-700"
                    >
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>ID: {result.userId}</span>
                          {result.usuarioPeligroso && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              PELIGROSO
                            </span>
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Total Arrestos:
                            </span>
                            <span className="text-white">
                              {result.totalArrestos}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">
                              Arrestos Activos:
                            </span>
                            <span className="text-white">
                              {result.estadisticas.arrestosActivos}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Último Mes:</span>
                            <span className="text-white">
                              {result.estadisticas.arrestosUltimoMes}
                            </span>
                          </div>
                          {result.fechaUltimoArresto && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">
                                Último Arresto:
                              </span>
                              <span className="text-white">
                                {formatDate(result.fechaUltimoArresto)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleViewUserDetails(result.userId)}
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                        >
                          Ver Detalles
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Detalles del usuario seleccionado */}
            {selectedUser && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">
                      Antecedentes Detallados - ID: {selectedUser.userId}
                    </CardTitle>
                    <Button
                      onClick={() => setSelectedUser(null)}
                      variant="outline"
                      size="sm"
                    >
                      Cerrar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {selectedUser.totalArrestos}
                      </div>
                      <div className="text-gray-400">Total Arrestos</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosActivos}
                      </div>
                      <div className="text-gray-400">Arrestos Activos</div>
                    </div>
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-white">
                        {selectedUser.estadisticas.arrestosUltimoMes}
                      </div>
                      <div className="text-gray-400">Último Mes</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">
                      Historial de Antecedentes
                    </h4>
                    {selectedUser.antecedentes.length === 0 ? (
                      <p className="text-gray-400">
                        No hay antecedentes registrados
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedUser.antecedentes.map((antecedente, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              antecedente.activo
                                ? "bg-red-500/10 border-red-500/20"
                                : "bg-gray-700 border-gray-600"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">
                                {antecedente.motivo}
                              </div>
                              <div className="flex items-center space-x-2">
                                {antecedente.activo && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                                    ACTIVO
                                  </span>
                                )}
                                <span className="text-gray-400 text-sm">
                                  {formatDate(antecedente.fecha)}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-300">
                              <div>
                                <span className="text-gray-400">
                                  Arrestado por:
                                </span>{" "}
                                {antecedente.arrestadoPorTag}
                              </div>
                              <div>
                                <span className="text-gray-400">Canal:</span>{" "}
                                {antecedente.canal}
                              </div>
                              <div>
                                <span className="text-gray-400">Duración:</span>{" "}
                                {formatTime(antecedente.duracion)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
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
