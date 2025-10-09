"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Server, Wifi, WifiOff, AlertCircle } from "lucide-react";

interface ServerData {
  name: string;
  players: number;
  maxPlayers: number;
  status: "online" | "offline" | "error";
  error?: string;
  lastUpdated?: string;
}

export default function ServersSection() {
  const [servers, setServers] = useState<ServerData[]>([
    {
      name: "MXRP",
      players: 0,
      maxPlayers: 40,
      status: "offline",
    },
    {
      name: "MXRP B",
      players: 0,
      maxPlayers: 40,
      status: "offline",
    },
    {
      name: "MXRP C",
      players: 0,
      maxPlayers: 40,
      status: "offline",
    },
  ]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchServerData = async () => {
    try {
      const response = await fetch("/.netlify/functions/servers");
      const data = await response.json();

      if (data.success) {
        setServers(data.servers);
        setLastUpdate(data.timestamp);
      }
    } catch (error) {
      console.error("Error fetching server data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerData();

    // Update every 30 seconds
    const interval = setInterval(fetchServerData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Wifi className="h-4 w-4 text-green-400" />;
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-400" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "En línea";
      case "offline":
        return "Cerrado";
      case "error":
        return "Error";
      default:
        return "Cerrado";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-red-500";
      case "error":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  const getStatusMessage = (server: ServerData) => {
    if (server.status === "online") {
      return `Servidor activo con ${server.players} jugadores conectados.`;
    } else if (server.status === "error") {
      return "Error al conectar con el servidor. Revisa la configuración.";
    } else {
      return "El servidor está temporalmente cerrado. Únete a nuestro Discord para recibir notificaciones cuando esté disponible.";
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Nuestros Servidores
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Conecta con la comunidad MXRP en cualquiera de nuestros servidores
          </p>
        </div>

        {/* Server cards grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {servers.map((server, index) => (
            <Card
              key={index}
              className="bg-black/80 backdrop-blur-md border-white/20 hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-primary/20">
                  <Server className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-white">
                  {server.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white mb-2">
                    {loading ? "..." : `${server.players}/${server.maxPlayers}`}
                  </div>
                  <div className="text-sm text-white/80">
                    Jugadores conectados
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6">
                  <div
                    className={`w-2 h-2 ${getStatusColor(
                      server.status
                    )} rounded-full`}
                  ></div>
                  <span className="text-sm text-white/80">
                    {getStatusText(server.status)}
                  </span>
                  {getStatusIcon(server.status)}
                </div>

                <CardDescription className="text-center text-white/90">
                  {getStatusMessage(server)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Last update info */}
        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm">
            {lastUpdate &&
              `Última actualización: ${new Date(
                lastUpdate
              ).toLocaleTimeString()}`}
          </p>
          <p className="text-white/60 text-xs mt-2">
            Los datos se actualizan automáticamente cada 30 segundos
          </p>
        </div>
      </div>
    </section>
  );
}
