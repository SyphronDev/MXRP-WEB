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

export default function Dashboard() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [alertsData, setAlertsData] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [economyLoading, setEconomyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
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
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-md">
              <div
                key={currentAlertIndex}
                className="flex items-center gap-3 animate-slide-in"
                style={{
                  animation: "slideInFromRight 0.5s ease-out",
                }}
              >
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Bell className="h-5 w-5 text-red-400 animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold">
                    Servidor {alertsData[currentAlertIndex]?.servidor}
                  </div>
                  <div className="text-red-300 text-sm">
                    {alertsData[currentAlertIndex]?.alerta}
                  </div>
                </div>
                <div className="text-red-400 text-xs">
                  {alertsData.filter((alert) => !alert.sended).length} alertas
                  activas
                </div>
              </div>
            </div>
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
                <p className="text-white/60 text-lg">Panel de economía MXRP</p>
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
                {economyData.cuentas.corriente.activa ? "Activa" : "Inactiva"}
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
                      {new Date(item.fechaCompra).toLocaleDateString("es-MX")}
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
                Los artículos aparecerán aquí cuando los obtengas en el servidor
              </p>
            </div>
          )}
        </div>

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
                {alertsData.map((alert, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      alert.sended
                        ? "bg-gray-500/10 border-gray-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          alert.sended ? "bg-gray-500/20" : "bg-red-500/20"
                        }`}
                      >
                        <Bell
                          className={`h-4 w-4 ${
                            alert.sended ? "text-gray-400" : "text-red-400"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          Servidor {alert.servidor}
                        </h3>
                        <p
                          className={`text-sm ${
                            alert.sended ? "text-gray-400" : "text-red-300"
                          }`}
                        >
                          {alert.alerta}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.sended
                          ? "bg-gray-500/20 text-gray-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {alert.sended ? "Enviada" : "Pendiente"}
                    </span>
                  </div>
                ))}
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
