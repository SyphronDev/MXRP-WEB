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

export default function Dashboard() {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  }, [router]);

  const fetchEconomyData = async (discordId: string) => {
    try {
      setLoading(true);
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
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
      </div>
    </div>
  );
}
