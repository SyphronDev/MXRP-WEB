"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  CreditCard,
  Banknote,
  AlertCircle,
  Loader2,
  TrendingUp,
  DollarSign,
  Coins,
  Package,
  Clock,
  Bell,
  IdCard,
  FileText,
  User,
  MapPin,
  Calendar,
  Hash,
  Image as ImageIcon,
  Download,
  Shield,
  AlertTriangle,
  Users,
  Scale,
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

interface EconomyData {
  userId: string;
  tipoCuenta: string;
  cuentas: {
    salario: {
      balance: number;
      activa: boolean;
    };
    corriente: {
      balance: number;
      activa: boolean;
    };
    gobierno: {
      balance: number;
      activa: boolean;
    };
    empresa: {
      balance: number;
      activa: boolean;
    };
  };
  efectivo: number;
  dineroNegro: number;
  deuda: number;
  divisas: {
    usd: number;
    btc: number;
  };
  sat: boolean;
  empresarial: boolean;
  lastCobro: string | null;
}

interface InventoryItem {
  articulo: string;
  cantidad: number;
  identificador: string;
  fechaCompra: string;
}

interface AlertItem {
  servidor: string;
  alerta: string;
  messageId: string;
  sended: boolean;
}

interface ProtocoloItem {
  servidor: string;
  protocolo: number;
  vc: string;
  sended: boolean;
}

interface AntecedenteItem {
  fecha: string;
  motivo: string;
  arrestadoPor: string;
  arrestadoPorTag: string;
  canal: string;
  duracion: number;
  activo: boolean;
}

interface AntecedentesData {
  userId: string;
  totalArrestos: number;
  usuarioPeligroso: boolean;
  fechaUltimoArresto: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  antecedentes: AntecedenteItem[];
}

interface EstadisticasAntecedentes {
  totalArrestos: number;
  arrestosActivos: number;
  arrestosUltimoMes: number;
  esUsuarioPeligroso: boolean;
  fechaUltimoArresto: string | null;
}

interface UsuarioPeligroso {
  userId: string;
  totalArrestos: number;
  fechaUltimoArresto: string | null;
  fechaCreacion: string;
  antecedentesActivos: number;
  estadisticas: EstadisticasAntecedentes;
}

interface IneData {
  userId: string;
  robloxName: string;
  nombre: string;
  apellido: string;
  edad: number;
  estado: string;
  municipio: string;
  curp: string;
  seccion: string;
  localidad: string;
  fechaNacimiento: string;
  creada: string;
  imageUrl: string;
  number: number;
  type: string;
  pendiente: boolean;
  sended: boolean;
  aprobada: boolean;
  aprobadaPor: string | null;
  aprobadaEn: string | null;
  canGenerateImage: boolean;
}

interface PasaporteData {
  userId: string;
  robloxName: string;
  nombre: string;
  apellido: string;
  edad: number;
  fechaNacimiento: string;
  creada: string;
  pais: string;
  number: number;
  type: string;
  pendiente: boolean;
  sended: boolean;
  aprobada: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [alertsData, setAlertsData] = useState<AlertItem[]>([]);
  const [protocoloData, setProtocoloData] = useState<ProtocoloItem[]>([]);
  const [antecedentesData, setAntecedentesData] =
    useState<AntecedentesData | null>(null);
  const [estadisticasAntecedentes, setEstadisticasAntecedentes] =
    useState<EstadisticasAntecedentes | null>(null);
  const [usuariosPeligrosos, setUsuariosPeligrosos] = useState<
    UsuarioPeligroso[]
  >([]);
  const [ineData, setIneData] = useState<IneData | null>(null);
  const [pasaporteData, setPasaporteData] = useState<PasaporteData | null>(
    null
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [economyLoading, setEconomyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "economy" | "inventory" | "documents" | "antecedentes"
  >("economy");
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("discord_user");
    if (!savedUser) {
      router.push("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setUser(userData);
    fetchEconomyData(userData.id);
    fetchInventoryData(userData.id);
    fetchAlertsData();
    fetchProtocoloData();
    fetchAntecedentesData(userData.id);
    fetchUsuariosPeligrosos();
    fetchIneData(userData.id);
    fetchPasaporteData(userData.id);
  }, [router]);

  // Efecto para rotar las alertas cada 3 minutos
  useEffect(() => {
    if (alertsData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentAlertIndex((prevIndex) => (prevIndex + 1) % alertsData.length);
    }, 3 * 60 * 1000); // 3 minutos

    return () => clearInterval(interval);
  }, [alertsData.length]);

  const fetchEconomyData = async (discordId: string) => {
    try {
      setEconomyLoading(true);
      const response = await fetch("/.netlify/functions/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEconomyData(data.user);
      } else {
        setError(data.message || "Error al cargar los datos de economía");
      }
    } catch (error) {
      console.error("Error fetching economy data:", error);
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setEconomyLoading(false);
    }
  };

  const fetchInventoryData = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setInventoryData(data.inventory);
      } else {
        console.error("Error fetching inventory data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error);
    }
  };

  const fetchAlertsData = async () => {
    try {
      const response = await fetch("/.netlify/functions/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertsData(data.alerts);
      } else {
        console.error("Error fetching alerts data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching alerts data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProtocoloData = async () => {
    try {
      const response = await fetch("/.netlify/functions/protocolo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Protocolos recibidos:", data.protocolos);
        setProtocoloData(data.protocolos || []);
      } else {
        console.error("Error fetching protocolo data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching protocolo data:", error);
    }
  };

  const fetchAntecedentesData = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/antecedentes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Antecedentes recibidos:", data.antecedentes);
        setAntecedentesData(data.antecedentes);
        setEstadisticasAntecedentes(data.estadisticas);
      } else {
        console.error("Error fetching antecedentes data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching antecedentes data:", error);
    }
  };

  const fetchUsuariosPeligrosos = async () => {
    try {
      const response = await fetch("/.netlify/functions/usuarios-peligrosos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Usuarios peligrosos recibidos:", data.usuariosPeligrosos);
        setUsuariosPeligrosos(data.usuariosPeligrosos || []);
      } else {
        console.error("Error fetching usuarios peligrosos data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching usuarios peligrosos data:", error);
    }
  };

  const fetchIneData = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/ine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIneData(data.ine);
      } else {
        console.error("Error fetching INE data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching INE data:", error);
    }
  };

  const fetchPasaporteData = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/pasaporte", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasaporteData(data.pasaporte);
      } else {
        console.error("Error fetching Pasaporte data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching Pasaporte data:", error);
    }
  };

  const generateIneImage = async (discordId: string) => {
    try {
      setIsGeneratingImage(true);
      const response = await fetch("/.netlify/functions/generate-ine-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setGeneratedImageUrl(data.imageUrl);
        // Actualizar los datos de INE para incluir la nueva URL
        if (ineData) {
          setIneData({ ...ineData, imageUrl: data.imageUrl });
        }
      } else {
        console.error("Error generating INE image:", data.message);
        alert(data.message || "Error al generar la imagen del INE");
      }
    } catch (error) {
      console.error("Error generating INE image:", error);
      alert("Error de conexión. Intenta nuevamente.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getAlertColor = (alerta: string) => {
    const alertaLower = alerta.toLowerCase();

    // Alertas rojas
    if (alertaLower.includes("roja") || alertaLower.includes("rojo")) {
      return {
        bg: "bg-red-500/10",
        border: "border-red-500/30",
        iconBg: "bg-red-500/20",
        iconColor: "text-red-400",
        textColor: "text-red-300",
        badgeBg: "bg-red-500/20",
        badgeText: "text-red-400",
      };
    }

    // Alertas amarillas
    if (alertaLower.includes("amarilla") || alertaLower.includes("amarillo")) {
      return {
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30",
        iconBg: "bg-yellow-500/20",
        iconColor: "text-yellow-400",
        textColor: "text-yellow-300",
        badgeBg: "bg-yellow-500/20",
        badgeText: "text-yellow-400",
      };
    }

    // Alertas verdes
    if (alertaLower.includes("verde")) {
      return {
        bg: "bg-green-500/10",
        border: "border-green-500/30",
        iconBg: "bg-green-500/20",
        iconColor: "text-green-400",
        textColor: "text-green-300",
        badgeBg: "bg-green-500/20",
        badgeText: "text-green-400",
      };
    }

    // Por defecto, alertas azules
    return {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      textColor: "text-blue-300",
      badgeBg: "bg-blue-500/20",
      badgeText: "text-blue-400",
    };
  };

  const getServerProtocolo = (servidor: string) => {
    // Buscar el protocolo que coincida con el servidor
    const protocolo = protocoloData.find((p) => p.servidor === servidor);
    console.log(
      `Buscando protocolo para servidor: ${servidor}, encontrado:`,
      protocolo
    );
    return protocolo ? protocolo.protocolo : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 text-lg">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-white/80 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-discord hover:bg-discord/80 text-white rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (economyLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80 text-lg">Cargando datos de economía...</p>
          <p className="text-white/60 text-sm mt-2">
            Conectando con la base de datos
          </p>
        </div>
      </div>
    );
  }

  if (!economyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Sin datos</h1>
          <p className="text-white/80 mb-6">
            No tienes datos de economía registrados. Contacta a un
            administrador.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-discord hover:bg-discord/80 text-white rounded-lg transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const totalBalance =
    economyData.cuentas.salario.balance +
    economyData.cuentas.corriente.balance +
    economyData.cuentas.gobierno.balance +
    economyData.cuentas.empresa.balance +
    economyData.efectivo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-discord/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Animated Alerts Banner */}
        {alertsData.length > 0 && (
          <div className="mb-6 overflow-hidden">
            {(() => {
              const currentAlert = alertsData[currentAlertIndex];
              const colors = getAlertColor(currentAlert?.alerta || "");

              return (
                <div
                  className={`${colors.bg} ${colors.border} rounded-lg p-4 backdrop-blur-md`}
                >
                  <div
                    key={currentAlertIndex}
                    className="flex items-center gap-3 animate-slide-in"
                    style={{
                      animation: "slideInFromRight 0.5s ease-out",
                    }}
                  >
                    <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                      <Bell
                        className={`h-5 w-5 ${colors.iconColor} animate-pulse`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">
                        {currentAlert?.servidor}
                        {getServerProtocolo(currentAlert?.servidor || "") && (
                          <span className="ml-2 px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                            Protocolo{" "}
                            {getServerProtocolo(currentAlert?.servidor || "")}
                          </span>
                        )}
                      </div>
                      <div className={`${colors.textColor} text-sm`}>
                        {currentAlert?.alerta}
                      </div>
                    </div>
                    <div className={`${colors.badgeText} text-xs`}>
                      {alertsData.filter((alert) => !alert.sended).length}{" "}
                      alertas activas
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* CSS for slide animation */}
        <style jsx>{`
          @keyframes slideInFromRight {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {user && (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-discord/50"
                />
              )}
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  ¡Bienvenido, {user?.username}!
                </h1>
                <p className="text-white/60 text-lg">
                  Panel General MXRP ER:LC
                </p>
              </div>
            </div>

            {/* MXRP Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <Image
                src="/images/Icon.png"
                alt="MXRP"
                width={48}
                height={48}
                className="rounded-md"
              />
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">
                MXRP
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 backdrop-blur-md border border-white/20 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("economy")}
              className={`flex-1 px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "economy"
                  ? "bg-discord text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Economía
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "inventory"
                  ? "bg-discord text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Package className="h-4 w-4" />
              Inventario
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`flex-1 px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "documents"
                  ? "bg-discord text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <IdCard className="h-4 w-4" />
              Documentos
            </button>
            <button
              onClick={() => setActiveTab("antecedentes")}
              className={`flex-1 px-6 py-3 rounded-md transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "antecedentes"
                  ? "bg-discord text-white shadow-lg"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Scale className="h-4 w-4" />
              Antecedentes
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "economy" && (
          <>
            {/* Total Balance Card */}
            <div className="mb-8">
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white/60 text-sm uppercase tracking-wider mb-2">
                      Balance Total
                    </h2>
                    <p className="text-4xl font-bold text-white">
                      {formatCurrency(totalBalance)}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-discord/20 to-blue-500/20 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Cuenta de Salario */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Wallet className="h-6 w-6 text-green-400" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      economyData.cuentas.salario.activa
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {economyData.cuentas.salario.activa ? "Activa" : "Inactiva"}
                  </span>
                </div>
                <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">
                  Cuenta de Salario
                </h3>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(economyData.cuentas.salario.balance)}
                </p>
                <p className="text-white/40 text-xs">
                  Tipo: {economyData.tipoCuenta}
                </p>
              </div>

              {/* Cuenta Corriente */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <CreditCard className="h-6 w-6 text-blue-400" />
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      economyData.cuentas.corriente.activa
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {economyData.cuentas.corriente.activa
                      ? "Activa"
                      : "Inactiva"}
                  </span>
                </div>
                <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">
                  Cuenta Corriente
                </h3>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(economyData.cuentas.corriente.balance)}
                </p>
                <p className="text-white/40 text-xs">Cuenta principal</p>
              </div>

              {/* Efectivo */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Banknote className="h-6 w-6 text-yellow-400" />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">
                    Disponible
                  </span>
                </div>
                <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">
                  Efectivo
                </h3>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(economyData.efectivo)}
                </p>
                <p className="text-white/40 text-xs">Dinero en mano</p>
              </div>

              {/* Dinero Negro */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl hover:bg-black/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-500/20 rounded-lg">
                    <Coins className="h-6 w-6 text-red-400" />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                    Oculto
                  </span>
                </div>
                <h3 className="text-white/60 text-sm uppercase tracking-wider mb-2">
                  Dinero Negro
                </h3>
                <p className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(economyData.dineroNegro)}
                </p>
                <p className="text-white/40 text-xs">Fondos no declarados</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Deuda */}
              {economyData.deuda > 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-red-500/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-red-500/20 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-red-400" />
                    </div>
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Deuda Pendiente
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(economyData.deuda)}
                  </p>
                </div>
              )}

              {/* Divisa USD */}
              {economyData.divisas.usd > 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-green-500/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Divisa USD
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${economyData.divisas.usd.toFixed(2)} USD
                  </p>
                </div>
              )}

              {/* Divisa BTC */}
              {economyData.divisas.btc > 0 && (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg">
                      <Coins className="h-6 w-6 text-orange-400" />
                    </div>
                    <h3 className="text-white/60 text-sm uppercase tracking-wider">
                      Divisa BTC
                    </h3>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₿{economyData.divisas.btc.toFixed(8)} BTC
                  </p>
                </div>
              )}

              {/* Last Payment */}
              <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-white/60 text-sm uppercase tracking-wider">
                    Último Cobro
                  </h3>
                </div>
                <p className="text-lg font-semibold text-white">
                  {formatDate(economyData.lastCobro)}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="mt-8 flex flex-wrap gap-4">
              {economyData.sat && (
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                  ✓ SAT Registrado
                </span>
              )}
              {economyData.empresarial && (
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                  ✓ Cuenta Empresarial
                </span>
              )}
            </div>
          </>
        )}

        {/* Inventory Tab */}
        {activeTab === "inventory" && (
          <>
            {/* Inventory Section */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Package className="h-6 w-6 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Inventario</h2>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                  {inventoryData.length} artículos
                </span>
              </div>

              {inventoryData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryData.map((item, index) => (
                    <div
                      key={index}
                      className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl hover:bg-black/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-lg">
                          {item.articulo}
                        </h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          x{item.cantidad}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/60 text-sm">
                          <span className="font-medium">ID:</span>{" "}
                          {item.identificador}
                        </p>
                        <p className="text-white/60 text-sm">
                          <span className="font-medium">Comprado:</span>{" "}
                          {new Date(item.fechaCompra).toLocaleDateString(
                            "es-MX"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
                  <Package className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60 text-lg">
                    No tienes artículos en tu inventario
                  </p>
                  <p className="text-white/40 text-sm mt-2">
                    Los artículos aparecerán aquí cuando los obtengas en el
                    servidor
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <>
            {/* Documents Section */}
            <div className="space-y-8">
              {/* Mostrar solo INE o Pasaporte, no ambos */}
              {ineData ? (
                /* INE Section */
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <IdCard className="h-6 w-6 text-green-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">INE</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ineData?.aprobada
                            ? "bg-green-500/20 text-green-400"
                            : ineData?.pendiente
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {ineData?.aprobada
                          ? "Aprobada"
                          : ineData?.pendiente
                          ? "Pendiente"
                          : "No registrada"}
                      </span>
                    </div>

                    {/* Botón para generar imagen */}
                    {ineData.canGenerateImage && (
                      <button
                        onClick={() => generateIneImage(user?.id || "")}
                        disabled={isGeneratingImage}
                        className="flex items-center gap-2 px-4 py-2 bg-discord hover:bg-discord/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4" />
                        )}
                        {isGeneratingImage ? "Generando..." : "Generar Imagen"}
                      </button>
                    )}
                  </div>

                  {/* Datos del INE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Nombre Completo
                          </p>
                          <p className="text-white font-semibold">
                            {ineData.nombre} {ineData.apellido}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Fecha de Nacimiento
                          </p>
                          <p className="text-white font-semibold">
                            {ineData.fechaNacimiento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">CURP</p>
                          <p className="text-white font-semibold font-mono text-sm">
                            {ineData.curp}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Estado</p>
                          <p className="text-white font-semibold">
                            {ineData.estado}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Municipio</p>
                          <p className="text-white font-semibold">
                            {ineData.municipio}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Número de INE</p>
                          <p className="text-white font-semibold">
                            {ineData.number}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Imagen generada */}
                  {(generatedImageUrl || ineData.imageUrl) && (
                    <div className="mt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <ImageIcon className="h-5 w-5 text-white/60" />
                        <h3 className="text-lg font-semibold text-white">
                          Imagen del INE
                        </h3>
                        <a
                          href={generatedImageUrl || ineData.imageUrl}
                          download={`INE_${user?.username}.png`}
                          className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Descargar
                        </a>
                      </div>
                      <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <img
                          src={generatedImageUrl || ineData.imageUrl}
                          alt="INE Generada"
                          className="max-w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: "400px" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : pasaporteData ? (
                /* Pasaporte Section */
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Pasaporte</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        pasaporteData?.aprobada
                          ? "bg-green-500/20 text-green-400"
                          : pasaporteData?.pendiente
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {pasaporteData?.aprobada
                        ? "Aprobado"
                        : pasaporteData?.pendiente
                        ? "Pendiente"
                        : "No registrado"}
                    </span>
                  </div>

                  {/* Datos del Pasaporte */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Nombre Completo
                          </p>
                          <p className="text-white font-semibold">
                            {pasaporteData.nombre} {pasaporteData.apellido}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Fecha de Nacimiento
                          </p>
                          <p className="text-white font-semibold">
                            {pasaporteData.fechaNacimiento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">País</p>
                          <p className="text-white font-semibold">
                            {pasaporteData.pais}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Hash className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Número de Pasaporte
                          </p>
                          <p className="text-white font-semibold">
                            {pasaporteData.number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">
                            Fecha de Creación
                          </p>
                          <p className="text-white font-semibold">
                            {formatDate(pasaporteData.creada)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-white/60" />
                        <div>
                          <p className="text-white/60 text-sm">Tipo</p>
                          <p className="text-white font-semibold">
                            {pasaporteData.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* No hay documentos */
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl text-center">
                  <IdCard className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No tienes documentos registrados
                  </h3>
                  <p className="text-white/60">
                    Solicita tu INE o Pasaporte en el servidor para verlos aquí
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Antecedentes Tab */}
        {activeTab === "antecedentes" && (
          <>
            {/* Estadísticas de Antecedentes */}
            {estadisticasAntecedentes && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total de Arrestos */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Total Arrestos
                      </h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {estadisticasAntecedentes.totalArrestos}
                    </div>
                    <p className="text-white/60 text-sm">
                      {estadisticasAntecedentes.totalArrestos === 0
                        ? "Sin antecedentes"
                        : `${estadisticasAntecedentes.arrestosActivos} activos`}
                    </p>
                  </div>

                  {/* Arrestos Activos */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-yellow-500/20 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Activos
                      </h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {estadisticasAntecedentes.arrestosActivos}
                    </div>
                    <p className="text-white/60 text-sm">
                      {estadisticasAntecedentes.arrestosActivos === 0
                        ? "Sin arrestos activos"
                        : "Arrestos vigentes"}
                    </p>
                  </div>

                  {/* Arrestos Último Mes */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Último Mes
                      </h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                      {estadisticasAntecedentes.arrestosUltimoMes}
                    </div>
                    <p className="text-white/60 text-sm">
                      {estadisticasAntecedentes.arrestosUltimoMes === 0
                        ? "Sin arrestos recientes"
                        : "Arrestos recientes"}
                    </p>
                  </div>

                  {/* Estado de Peligrosidad */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`p-3 rounded-lg ${
                          estadisticasAntecedentes.esUsuarioPeligroso
                            ? "bg-red-500/20"
                            : "bg-green-500/20"
                        }`}
                      >
                        <Shield
                          className={`h-6 w-6 ${
                            estadisticasAntecedentes.esUsuarioPeligroso
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        />
                      </div>
                      <h3 className="text-lg font-semibold text-white">
                        Estado
                      </h3>
                    </div>
                    <div
                      className={`text-2xl font-bold mb-2 ${
                        estadisticasAntecedentes.esUsuarioPeligroso
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {estadisticasAntecedentes.esUsuarioPeligroso
                        ? "PELIGROSO"
                        : "SEGURO"}
                    </div>
                    <p className="text-white/60 text-sm">
                      {estadisticasAntecedentes.esUsuarioPeligroso
                        ? "Más de 3 arrestos"
                        : "Menos de 3 arrestos"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Antecedentes */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-orange-500/20 rounded-lg">
                  <Scale className="h-6 w-6 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Historial de Antecedentes
                </h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium">
                  {antecedentesData?.antecedentes.length || 0} registros
                </span>
              </div>

              {antecedentesData && antecedentesData.antecedentes.length > 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                  <div className="space-y-4">
                    {antecedentesData.antecedentes.map((antecedente, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          antecedente.activo
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-gray-500/10 border-gray-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className={`p-2 rounded-lg ${
                                  antecedente.activo
                                    ? "bg-red-500/20"
                                    : "bg-gray-500/20"
                                }`}
                              >
                                <AlertTriangle
                                  className={`h-4 w-4 ${
                                    antecedente.activo
                                      ? "text-red-400"
                                      : "text-gray-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">
                                  {antecedente.motivo}
                                </h3>
                                <p className="text-white/60 text-sm">
                                  Arrestado por: {antecedente.arrestadoPor} (
                                  {antecedente.arrestadoPorTag})
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-white/60" />
                                <span className="text-white/80 text-sm">
                                  {formatDate(antecedente.fecha)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-white/60" />
                                <span className="text-white/80 text-sm">
                                  Canal: {antecedente.canal}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-white/60" />
                                <span className="text-white/80 text-sm">
                                  Duración: {antecedente.duracion} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              antecedente.activo
                                ? "bg-red-500/20 text-red-400"
                                : "bg-gray-500/20 text-gray-400"
                            }`}
                          >
                            {antecedente.activo ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
                  <Scale className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Sin antecedentes registrados
                  </h3>
                  <p className="text-white/60">
                    No tienes antecedentes en tu historial
                  </p>
                </div>
              )}
            </div>

            {/* Lista de Usuarios Peligrosos */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Usuarios Peligrosos
                </h2>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
                  {usuariosPeligrosos.length} usuarios
                </span>
              </div>

              {usuariosPeligrosos.length > 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
                  <div className="space-y-4">
                    {usuariosPeligrosos.map((usuario, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-red-500/10 border-red-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold">
                                Usuario {usuario.userId}
                              </h3>
                              <p className="text-white/60 text-sm">
                                {usuario.totalArrestos} arrestos totales
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-400 font-semibold">
                              {usuario.antecedentesActivos} activos
                            </div>
                            <div className="text-white/60 text-sm">
                              Último:{" "}
                              {usuario.fechaUltimoArresto
                                ? formatDate(usuario.fechaUltimoArresto)
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
                  <Users className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No hay usuarios peligrosos
                  </h3>
                  <p className="text-white/60">
                    Todos los usuarios están en buen estado
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Server Alerts Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-500/20 rounded-lg">
              <Bell className="h-6 w-6 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Alertas de Servidores
            </h2>
            <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-medium">
              {alertsData.filter((alert) => !alert.sended).length} activas
            </span>
          </div>

          {alertsData.length > 0 ? (
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 shadow-xl">
              <div className="space-y-4">
                {alertsData.map((alert, index) => {
                  const colors = getAlertColor(alert.alerta);
                  const isSent = alert.sended;

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isSent
                          ? "bg-gray-500/10 border-gray-500/30"
                          : `${colors.bg} ${colors.border}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSent ? "bg-gray-500/20" : colors.iconBg
                          }`}
                        >
                          <Bell
                            className={`h-4 w-4 ${
                              isSent ? "text-gray-400" : colors.iconColor
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {alert.servidor}
                            {getServerProtocolo(alert.servidor) && (
                              <span className="ml-2 px-2 py-1 bg-white/10 text-white/80 text-xs rounded">
                                Protocolo {getServerProtocolo(alert.servidor)}
                              </span>
                            )}
                          </h3>
                          <p
                            className={`text-sm ${
                              isSent ? "text-gray-400" : colors.textColor
                            }`}
                          >
                            {alert.alerta}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isSent
                            ? "bg-gray-500/20 text-gray-400"
                            : `${colors.badgeBg} ${colors.badgeText}`
                        }`}
                      >
                        {isSent ? "Enviada" : "Pendiente"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-8 text-center">
              <Bell className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No hay alertas activas</p>
              <p className="text-white/40 text-sm mt-2">
                Las alertas de servidores aparecerán aquí cuando sea necesario
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
