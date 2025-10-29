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
  ShoppingCart,
  Store,
  Settings,
  Newspaper,
  Building2,
  ArrowUp,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { ButtonModern } from "@/components/ui/button-modern";
import { CardModern } from "@/components/ui/card-modern";
import { NavigationTabs } from "@/components/ui/navigation-tabs";
import { LoadingModern } from "@/components/ui/loading-modern";
import { ToastContainer, useToast } from "@/components/ui/notification-toast";
import { useScrollToTop } from "@/components/ui/smooth-scroll";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AccountCard } from "@/components/dashboard/account-card";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { StatusBadge } from "@/components/ui/status-badge";

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
  unidad: string;
  cantidadFormateada: string;
  identificador: string;
  fechaCompra: string;
  precioCompra: number;
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

interface TiendaItem {
  articulo: string;
  cantidad: number;
  unidad: string;
  cantidadFormateada: string;
  precio: number;
  identificador: string;
  fechaAgregado: string;
}

interface TiendaData {
  tipo: string;
  inventario: TiendaItem[];
  totalItems: number;
  totalValue: number;
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
  const [tiendaData, setTiendaData] = useState<TiendaData[]>([]);
  const [isComprando, setIsComprando] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    articulo: string;
    unidad: string;
    tipoTienda: string;
  } | null>(null);
  const [cantidadCompra, setCantidadCompra] = useState<string>("1");
  const [unidadCompra, setUnidadCompra] = useState<string>("x");
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
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [, setCheckingAdminAccess] = useState(true);
  const [hasPoliceAccess, setHasPoliceAccess] = useState(false);
  const [hasNewsAccess, setHasNewsAccess] = useState(false);
  const [hasSolicitudesAccess, setHasSolicitudesAccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "economy" | "inventory" | "documents" | "antecedentes" | "tienda"
  >("economy");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  const router = useRouter();
  const toast = useToast();
  const scrollToTop = useScrollToTop();

  // Función helper para obtener el token JWT
  const getAuthToken = () => {
    return localStorage.getItem("auth_token");
  };

  // Función helper para crear headers con autenticación
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

    // Los datos del usuario en localStorage ya no tienen ID ni email (solo UI)
    // El ID real se obtiene del JWT en el backend
    const userData = JSON.parse(savedUser);
    setUser(userData);

    // Ya no necesitamos pasar el ID, el backend lo extrae del JWT
    fetchEconomyData("");
    fetchInventoryData("");
    fetchAlertsData();
    fetchProtocoloData();
    fetchAntecedentesData("");
    fetchUsuariosPeligrosos();
    fetchTiendaData();
    fetchIneData("");
    fetchPasaporteData("");
    checkAdminAccess("");
    checkPoliceAccess("");
    checkNewsAccess("");
    checkSolicitudesAccess("");
  }, [router]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        headers: getAuthHeaders(),
        body: JSON.stringify({}), // Ya no enviamos discordId, el backend lo obtiene del token
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setEconomyData(data.user);
      } else {
        if (response.status === 401) {
          // Token inválido o expirado, redirigir al login
          localStorage.removeItem("discord_user");
          localStorage.removeItem("auth_token");
          router.push("/");
          return;
        }
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
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
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

  const fetchTiendaData = async () => {
    try {
      const response = await fetch("/.netlify/functions/tienda", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Tienda data recibida:", data.tiendas);
        setTiendaData(data.tiendas || []);
      } else {
        console.error("Error fetching tienda data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching tienda data:", error);
    }
  };

  const comprarArticulo = async (
    articulo: string,
    cantidad: number,
    unidad: string,
    tipoTienda: string
  ) => {
    if (!user) return;

    setIsComprando(true);
    try {
      const response = await fetch("/.netlify/functions/comprar", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          // Ya no enviamos discordId, el backend lo obtiene del token
          articulo,
          cantidad,
          unidad,
          tipoTienda,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          "¡Compra exitosa!",
          `Compraste ${cantidad}${unidad} ${articulo} por ${formatCurrency(
            data.compra.costoTotal
          )}`
        );
        // Recargar datos
        fetchEconomyData(user.id);
        fetchInventoryData(user.id);
        fetchTiendaData();
      } else {
        toast.error("Error en la compra", data.message);
      }
    } catch (error) {
      console.error("Error comprando artículo:", error);
      toast.error("Error de conexión", "No se pudo realizar la compra");
    } finally {
      setIsComprando(false);
    }
  };

  const handleComprarClick = (item: TiendaItem, tipoTienda: string) => {
    setSelectedItem({
      articulo: item.articulo,
      unidad: item.unidad,
      tipoTienda: tipoTienda,
    });
    setCantidadCompra("1");
    setUnidadCompra(item.unidad);
  };

  // Función para calcular cantidad máxima disponible
  const getCantidadMaxima = (item: TiendaItem, unidadSeleccionada: string) => {
    if (item.unidad === unidadSeleccionada) {
      return item.cantidad;
    }

    // Convertir a gramos para comparación
    let cantidadEnGramos = item.cantidad;
    if (item.unidad === "kg") cantidadEnGramos = item.cantidad * 1000;
    if (item.unidad === "mg") cantidadEnGramos = item.cantidad / 1000;

    // Convertir de gramos a la unidad seleccionada
    if (unidadSeleccionada === "kg") return cantidadEnGramos / 1000;
    if (unidadSeleccionada === "mg") return cantidadEnGramos * 1000;
    if (unidadSeleccionada === "g") return cantidadEnGramos;

    return item.cantidad; // Para unidades (x)
  };

  const handleConfirmarCompra = () => {
    if (!selectedItem) return;

    const cantidad = parseFloat(cantidadCompra);
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.warning("Cantidad inválida", "Por favor ingresa una cantidad válida");
      return;
    }

    // Buscar el artículo en la tienda para obtener la cantidad máxima
    const tienda = tiendaData.find((t) => t.tipo === selectedItem.tipoTienda);
    const item = tienda?.inventario.find(
      (i) => i.articulo === selectedItem.articulo
    );

    if (item) {
      const cantidadMaxima = getCantidadMaxima(item, unidadCompra);
      if (cantidad > cantidadMaxima) {
        toast.warning(
          "Stock insuficiente",
          `Máximo disponible: ${cantidadMaxima}${unidadCompra}`
        );
        return;
      }
    }

    comprarArticulo(
      selectedItem.articulo,
      cantidad,
      unidadCompra,
      selectedItem.tipoTienda
    );

    setSelectedItem(null);
  };

  const getUnidadesDisponibles = (tipoTienda: string) => {
    if (tipoTienda === "legal") {
      return ["x"];
    }
    return ["x", "g", "kg", "mg"];
  };

  const fetchIneData = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/ine", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
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
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
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

  const checkAdminAccess = async (discordId: string) => {
    try {
      setCheckingAdminAccess(true);
      const response = await fetch("/.netlify/functions/admin-permissions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
        }),
      });

      const data = await response.json();

      if (data.success && data.hasAdminAccess) {
        setHasAdminAccess(true);
      } else {
        setHasAdminAccess(false);
      }
    } catch (error) {
      console.error("Error checking admin access:", error);
      setHasAdminAccess(false);
    } finally {
      setCheckingAdminAccess(false);
    }
  };

  const checkPoliceAccess = async (discordId: string) => {
    try {
      const response = await fetch("/.netlify/functions/police-database", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: "checkAccess",
          guildId: process.env.NEXT_PUBLIC_GUILD_ID,
        }),
      });

      const data = await response.json();

      if (data.success && data.hasAccess) {
        setHasPoliceAccess(true);
      } else {
        setHasPoliceAccess(false);
      }
    } catch (error) {
      console.error("Error checking police access:", error);
      setHasPoliceAccess(false);
    }
  };

  const checkNewsAccess = async (discordId: string) => {
    try {
      const response = await fetch(
        "/.netlify/functions/periodista-permissions",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          }),
        }
      );

      const data = await response.json();

      // Debug temporal
      console.log("🔍 News access check response:", data);
      console.log("👤 Discord ID:", discordId);
      console.log("🏠 Guild ID:", process.env.NEXT_PUBLIC_GUILD_ID);

      if (data.success && data.hasPeriodistaAccess) {
        setHasNewsAccess(true);
        console.log(
          "✅ Usuario tiene acceso de periodista - Botón debería aparecer"
        );
      } else {
        setHasNewsAccess(false);
        console.log("❌ Usuario NO tiene acceso de periodista:", data.message);
        console.log("🔧 Rol ID configurado:", data.periodistaRoleId);
      }
    } catch (error) {
      console.error("Error checking news access:", error);
      setHasNewsAccess(false);
    }
  };

  const checkSolicitudesAccess = async (discordId: string) => {
    try {
      const response = await fetch(
        "/.netlify/functions/solicitudes-permissions",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            guildId: process.env.NEXT_PUBLIC_GUILD_ID,
          }),
        }
      );

      const data = await response.json();

      // Debug temporal
      console.log("🔍 Solicitudes access check response:", data);
      console.log("👤 Discord ID:", discordId);
      console.log("🏠 Guild ID:", process.env.NEXT_PUBLIC_GUILD_ID);

      if (data.success && data.hasSolicitudesAccess) {
        setHasSolicitudesAccess(true);
        console.log(
          "✅ Usuario tiene acceso para gestionar solicitudes - Botón debería aparecer"
        );
      } else {
        setHasSolicitudesAccess(false);
        console.log(
          "❌ Usuario NO tiene acceso para gestionar solicitudes:",
          data.message
        );
        console.log("🔧 Roles configurados:", data.rolesSolicitudes);
      }
    } catch (error) {
      console.error("Error checking solicitudes access:", error);
      setHasSolicitudesAccess(false);
    }
  };

  const generateIneImage = async (discordId: string) => {
    try {
      setIsGeneratingImage(true);
      const response = await fetch("/.netlify/functions/generate-ine-image", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({}),
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
      <LoadingModern
        variant="spinner"
        size="lg"
        text="Cargando tu dashboard..."
        fullScreen={true}
      />
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
      <LoadingModern
        variant="pulse"
        size="lg"
        text="Cargando datos de economía..."
        fullScreen={true}
      />
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
      {/* Toast Container */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <ButtonModern
          variant="primary"
          size="md"
          icon={<ArrowUp className="h-4 w-4" />}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 shadow-lg shadow-purple-500/25"
          glow={true}
        />
      )}

      {/* Background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Animated Alerts Banner */}
        {alertsData.length > 0 && (
          <div className="mb-4 sm:mb-6 overflow-hidden">
            {(() => {
              const currentAlert = alertsData[currentAlertIndex];
              const colors = getAlertColor(currentAlert?.alerta || "");

              return (
                <div
                  className={`${colors.bg} ${colors.border} rounded-lg p-3 sm:p-4 backdrop-blur-md`}
                >
                  <div
                    key={currentAlertIndex}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 animate-slide-in"
                    style={{
                      animation: "slideInFromRight 0.5s ease-out",
                    }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`p-1.5 sm:p-2 ${colors.iconBg} rounded-lg flex-shrink-0`}
                      >
                        <Bell
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.iconColor} animate-pulse`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm sm:text-base">
                          {currentAlert?.servidor}
                          {getServerProtocolo(currentAlert?.servidor || "") && (
                            <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 text-white/80 text-xs rounded">
                              Protocolo{" "}
                              {getServerProtocolo(currentAlert?.servidor || "")}
                            </span>
                          )}
                        </div>
                        <div
                          className={`${colors.textColor} text-xs sm:text-sm break-words`}
                        >
                          {currentAlert?.alerta}
                        </div>
                      </div>
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
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <Image
                  src={user.avatarUrl}
                  alt={user.username}
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-discord/50 sm:w-16 sm:h-16"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                  ¡Bienvenido, {user?.username}!
                </h1>
                <p className="text-white/60 text-sm sm:text-base md:text-lg">
                  Panel General MXRP ER:LC
                </p>
              </div>
            </div>

            {/* Admin Panel Button */}
            {hasAdminAccess && (
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 transition-all duration-200 self-start sm:self-auto"
              >
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Panel Admin</span>
              </button>
            )}

            {/* Police Database Button */}
            {hasPoliceAccess && (
              <button
                onClick={() =>
                  router.push(
                    `/police-database?discordId=${user?.id}&guildId=${process.env.NEXT_PUBLIC_GUILD_ID}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-200 self-start sm:self-auto"
              >
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Base de Datos Policial
                </span>
              </button>
            )}

            {/* News Panel Button */}
            {hasNewsAccess && (
              <button
                onClick={() => (window.location.href = "/news-panel")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-lg hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 self-start sm:self-auto"
              >
                <Newspaper className="h-4 w-4" />
                <span className="text-sm font-medium">Panel Noticias</span>
              </button>
            )}

            {/* Admin Solicitudes Button - Solo para roles específicos */}
            {hasSolicitudesAccess && (
              <button
                onClick={() => router.push("/admin/solicitudes")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-200 self-start sm:self-auto"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Gestionar Solicitudes
                </span>
              </button>
            )}

            {/* MXRP Logo */}
            <div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity self-start sm:self-auto"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              <Image
                src="/images/Icon.png"
                alt="MXRP"
                width={32}
                height={32}
                className="rounded-md sm:w-12 sm:h-12"
              />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                MXRP
              </h2>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 md:mb-8">
          <NavigationTabs
            tabs={[
              {
                id: "economy",
                label: "Economía",
                icon: <Wallet className="h-4 w-4" />,
                badge: economyData ? formatCurrency(totalBalance) : undefined,
              },
              {
                id: "inventory",
                label: "Inventario",
                icon: <Package className="h-4 w-4" />,
                badge: inventoryData.length > 0 ? inventoryData.length : undefined,
              },
              {
                id: "documents",
                label: "Documentos",
                icon: <IdCard className="h-4 w-4" />,
                badge: (ineData?.aprobada || pasaporteData?.aprobada) ? "✓" : undefined,
              },
              {
                id: "antecedentes",
                label: "Antecedentes",
                icon: <Scale className="h-4 w-4" />,
                badge: antecedentesData?.totalArrestos || undefined,
              },
              {
                id: "tienda",
                label: "Tienda",
                icon: <Store className="h-4 w-4" />,
                badge: tiendaData.length > 0 ? "Nuevo" : undefined,
              },
            ]}
            activeTab={activeTab}
            onTabChange={(tabId) => setActiveTab(tabId as typeof activeTab)}
            variant="default"
            className="animate-slide-in-left"
          />
          
          {/* Solicitudes Button */}
          <div className="mt-4">
            <ButtonModern
              variant="outline"
              size="md"
              icon={<Building2 className="h-4 w-4" />}
              onClick={() => router.push("/solicitudes-empresa")}
              className="w-full sm:w-auto"
            >
              Solicitudes de Empresa
            </ButtonModern>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "economy" && (
          <>
            {/* Total Balance Card */}
            <div className="mb-6 md:mb-8 animate-scale-in">
              <CardModern variant="gradient" glow={true} className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider">
                        Balance Total
                      </h2>
                      <ButtonModern
                        variant="ghost"
                        size="sm"
                        icon={balanceVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        onClick={() => setBalanceVisible(!balanceVisible)}
                        className="p-1 h-6 w-6"
                      />
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                      {balanceVisible ? formatCurrency(totalBalance) : "••••••"}
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      Última actualización: {formatDate(economyData.lastCobro)}
                    </p>
                  </div>
                  <div className="p-3 md:p-4 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                    <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-purple-400" />
                  </div>
                </div>
              </CardModern>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 md:mb-8">
              <AccountCard
                title="Cuenta de Salario"
                balance={economyData.cuentas.salario.balance}
                isActive={economyData.cuentas.salario.activa}
                icon={Wallet}
                iconColor="text-green-400"
                iconBg="bg-green-500/20"
                subtitle={`Tipo: ${economyData.tipoCuenta}`}
                index={0}
                balanceVisible={balanceVisible}
              />
              
              <AccountCard
                title="Cuenta Corriente"
                balance={economyData.cuentas.corriente.balance}
                isActive={economyData.cuentas.corriente.activa}
                icon={CreditCard}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/20"
                subtitle="Cuenta principal"
                index={1}
                balanceVisible={balanceVisible}
              />
              
              <AccountCard
                title="Efectivo"
                balance={economyData.efectivo}
                isActive={true}
                icon={Banknote}
                iconColor="text-yellow-400"
                iconBg="bg-yellow-500/20"
                subtitle="Dinero en mano"
                index={2}
                balanceVisible={balanceVisible}
              />
              
              <AccountCard
                title="Dinero Negro"
                balance={economyData.dineroNegro}
                isActive={true}
                icon={Coins}
                iconColor="text-red-400"
                iconBg="bg-red-500/20"
                subtitle="Fondos no declarados"
                index={3}
                balanceVisible={balanceVisible}
              />
            </div>

            {/* Additional Stats */}
            <StatsGrid economyData={economyData} />

            {/* Status Badges */}
            <div className="mt-8 flex flex-wrap gap-4 animate-slide-in-left">
              {economyData.sat && (
                <StatusBadge
                  status="success"
                  text="SAT Registrado"
                  size="md"
                />
              )}
              {economyData.empresarial && (
                <StatusBadge
                  status="info"
                  text="Cuenta Empresarial"
                  size="md"
                />
              )}
            </div>
          </>
        )}
        {activeTab === "inventory" && (
          <>
            {/* Inventory Section */}
            <div className="mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                    <Package className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Inventario
                  </h2>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {inventoryData.length} artículos
                </span>
              </div>

              {inventoryData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventoryData.map((item, index) => (
                    <div
                      key={index}
                      className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 shadow-xl hover:bg-black/50 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold text-sm sm:text-base break-words">
                          {item.articulo}
                        </h3>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                          {item.cantidadFormateada}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/60 text-xs sm:text-sm">
                          <span className="font-medium">ID:</span>{" "}
                          <span className="truncate">{item.identificador}</span>
                        </p>
                        <p className="text-white/60 text-xs sm:text-sm">
                          <span className="font-medium">Comprado:</span>{" "}
                          {new Date(item.fechaCompra).toLocaleDateString(
                            "es-MX"
                          )}
                        </p>
                        {item.precioCompra > 0 && (
                          <p className="text-white/40 text-xs">
                            <span className="font-medium">Precio:</span>
                            {formatCurrency(item.precioCompra)}
                          </p>
                        )}
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
                        <Image
                          src={generatedImageUrl || ineData.imageUrl}
                          alt="INE Generada"
                          width={400}
                          height={400}
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
              <div className="mb-6 md:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Total de Arrestos */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                        Total Arrestos
                      </h3>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      {estadisticasAntecedentes.totalArrestos}
                    </div>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {estadisticasAntecedentes.totalArrestos === 0
                        ? "Sin antecedentes"
                        : `${estadisticasAntecedentes.arrestosActivos} activos`}
                    </p>
                  </div>

                  {/* Arrestos Activos */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-lg">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                        Activos
                      </h3>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      {estadisticasAntecedentes.arrestosActivos}
                    </div>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {estadisticasAntecedentes.arrestosActivos === 0
                        ? "Sin arrestos activos"
                        : "Arrestos vigentes"}
                    </p>
                  </div>

                  {/* Arrestos Último Mes */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                        Último Mes
                      </h3>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                      {estadisticasAntecedentes.arrestosUltimoMes}
                    </div>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {estadisticasAntecedentes.arrestosUltimoMes === 0
                        ? "Sin arrestos recientes"
                        : "Arrestos recientes"}
                    </p>
                  </div>

                  {/* Estado de Peligrosidad */}
                  <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div
                        className={`p-2 sm:p-3 rounded-lg ${
                          estadisticasAntecedentes.esUsuarioPeligroso
                            ? "bg-red-500/20"
                            : "bg-green-500/20"
                        }`}
                      >
                        <Shield
                          className={`h-5 w-5 sm:h-6 sm:w-6 ${
                            estadisticasAntecedentes.esUsuarioPeligroso
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        />
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white">
                        Estado
                      </h3>
                    </div>
                    <div
                      className={`text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2 ${
                        estadisticasAntecedentes.esUsuarioPeligroso
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {estadisticasAntecedentes.esUsuarioPeligroso
                        ? "PELIGROSO"
                        : "SEGURO"}
                    </div>
                    <p className="text-white/60 text-xs sm:text-sm">
                      {estadisticasAntecedentes.esUsuarioPeligroso
                        ? "Más de 3 arrestos"
                        : "Menos de 3 arrestos"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Antecedentes */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-orange-500/20 rounded-lg">
                    <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Historial de Antecedentes
                  </h2>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {antecedentesData?.antecedentes.length || 0} registros
                </span>
              </div>

              {antecedentesData && antecedentesData.antecedentes.length > 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                  <div className="space-y-3 sm:space-y-4">
                    {antecedentesData.antecedentes.map((antecedente, index) => (
                      <div
                        key={index}
                        className={`p-3 sm:p-4 rounded-lg border ${
                          antecedente.activo
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-gray-500/10 border-gray-500/30"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-start gap-2 sm:gap-3 mb-2">
                              <div
                                className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
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
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold text-sm sm:text-base break-words">
                                  {antecedente.motivo}
                                </h3>
                                <p className="text-white/60 text-xs sm:text-sm break-words">
                                  Arrestado por: {antecedente.arrestadoPor} (
                                  {antecedente.arrestadoPorTag})
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mt-2 sm:mt-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                                <span className="text-white/80 text-xs sm:text-sm">
                                  {formatDate(antecedente.fecha)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white/60 flex-shrink-0" />
                                <span className="text-white/80 text-xs sm:text-sm">
                                  Duración: {antecedente.duracion} min
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
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
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 text-center">
                  <Scale className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Sin antecedentes registrados
                  </h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    No tienes antecedentes en tu historial
                  </p>
                </div>
              )}
            </div>

            {/* Lista de Usuarios Peligrosos */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg">
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Usuarios Peligrosos
                  </h2>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {usuariosPeligrosos.length} usuarios
                </span>
              </div>

              {usuariosPeligrosos.length > 0 ? (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
                  <div className="space-y-3 sm:space-y-4">
                    {usuariosPeligrosos.map((usuario, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 rounded-lg border bg-red-500/10 border-red-500/30"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-white font-semibold text-sm sm:text-base">
                                Usuario {usuario.userId}
                              </h3>
                              <p className="text-white/60 text-xs sm:text-sm">
                                {usuario.totalArrestos} arrestos totales
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-red-400 font-semibold text-sm sm:text-base">
                              {usuario.antecedentesActivos} activos
                            </div>
                            <div className="text-white/60 text-xs sm:text-sm">
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
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 text-center">
                  <Users className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    No hay usuarios peligrosos
                  </h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    Todos los usuarios están en buen estado
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Tienda Tab */}
        {activeTab === "tienda" && (
          <>
            {/* Tienda Section */}
            <div className="mt-8 sm:mt-12">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                    <Store className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                    Tienda MXRP
                  </h2>
                </div>
                <span className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
                  {tiendaData.reduce(
                    (sum, tienda) => sum + tienda.totalItems,
                    0
                  )}{" "}
                  artículos
                </span>
              </div>

              {tiendaData.length > 0 ? (
                <div className="space-y-8">
                  {/* Tienda Legal */}
                  {tiendaData.find((t) => t.tipo === "legal") && (
                    <div className="bg-black/40 backdrop-blur-md border border-blue-500/20 rounded-xl p-4 sm:p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <ShoppingCart className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-xl sm:text-2xl">
                            Tienda Legal
                          </h3>
                          <p className="text-white/60 text-sm">
                            Productos legales • Solo unidades
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiendaData
                          .find((t) => t.tipo === "legal")
                          ?.inventario.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="bg-white/5 border border-blue-500/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-semibold text-sm sm:text-base break-words">
                                  {item.articulo}
                                </h4>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  {item.cantidadFormateada}
                                </span>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                  <span className="text-white/60 text-xs sm:text-sm">
                                    Precio:
                                  </span>
                                  <span className="text-white text-xs sm:text-sm font-semibold">
                                    {formatCurrency(item.precio)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60 text-xs sm:text-sm">
                                    ID:
                                  </span>
                                  <span className="text-white text-xs sm:text-sm truncate">
                                    {item.identificador}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleComprarClick(item, "legal")
                                  }
                                  disabled={isComprando || item.cantidad < 1}
                                  className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                    isComprando || item.cantidad < 1
                                      ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                      : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                  }`}
                                >
                                  {isComprando ? "Comprando..." : "Comprar"}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Mercado Ilegal */}
                  {tiendaData.find((t) => t.tipo === "ilegal") && (
                    <div className="bg-black/40 backdrop-blur-md border border-red-500/20 rounded-xl p-4 sm:p-6 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                          <ShoppingCart className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-xl sm:text-2xl">
                            Mercado Ilegal
                          </h3>
                          <p className="text-white/60 text-sm">
                            Productos ilegales • Gramos, Kilos, Miligramos
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tiendaData
                          .find((t) => t.tipo === "ilegal")
                          ?.inventario.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="bg-white/5 border border-red-500/20 rounded-lg p-4 hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-semibold text-sm sm:text-base break-words">
                                  {item.articulo}
                                </h4>
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                                  {item.cantidadFormateada}
                                </span>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                  <span className="text-white/60 text-xs sm:text-sm">
                                    Precio:
                                  </span>
                                  <span className="text-white text-xs sm:text-sm font-semibold">
                                    {formatCurrency(item.precio)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/60 text-xs sm:text-sm">
                                    ID:
                                  </span>
                                  <span className="text-white text-xs sm:text-sm truncate">
                                    {item.identificador}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleComprarClick(item, "ilegal")
                                  }
                                  disabled={isComprando || item.cantidad < 1}
                                  className={`flex-1 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                    isComprando || item.cantidad < 1
                                      ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                  }`}
                                >
                                  {isComprando ? "Comprando..." : "Comprar"}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 text-center">
                  <Store className="h-12 w-12 sm:h-16 sm:w-16 text-white/40 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                    Tienda vacía
                  </h3>
                  <p className="text-white/60 text-sm sm:text-base">
                    No hay artículos disponibles en la tienda
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de Compra */}
        {selectedItem &&
          (() => {
            const tienda = tiendaData.find(
              (t) => t.tipo === selectedItem.tipoTienda
            );
            const item = tienda?.inventario.find(
              (i) => i.articulo === selectedItem.articulo
            );
            const cantidadMaxima = item
              ? getCantidadMaxima(item, unidadCompra)
              : 0;

            return (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      Comprar {selectedItem.articulo}
                    </h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={cantidadCompra}
                        onChange={(e) => setCantidadCompra(e.target.value)}
                        min="0.1"
                        max={cantidadMaxima}
                        step="0.1"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-discord"
                        placeholder="Ingresa la cantidad"
                      />
                      <p className="text-white/60 text-xs mt-1">
                        Máximo disponible: {cantidadMaxima}
                        {unidadCompra}
                      </p>
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm mb-2">
                        Unidad
                      </label>
                      <select
                        value={unidadCompra}
                        onChange={(e) => {
                          setUnidadCompra(e.target.value);
                          // Resetear cantidad cuando cambie la unidad
                          const nuevaCantidadMaxima = item
                            ? getCantidadMaxima(item, e.target.value)
                            : 0;
                          if (
                            parseFloat(cantidadCompra) > nuevaCantidadMaxima
                          ) {
                            setCantidadCompra(nuevaCantidadMaxima.toString());
                          }
                        }}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-discord"
                      >
                        {getUnidadesDisponibles(selectedItem.tipoTienda).map(
                          (unidad) => (
                            <option
                              key={unidad}
                              value={unidad}
                              className="bg-black text-white"
                            >
                              {unidad === "x"
                                ? "Unidades"
                                : unidad.toUpperCase()}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmarCompra}
                        disabled={isComprando}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isComprando
                            ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                            : selectedItem.tipoTienda === "legal"
                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                      >
                        {isComprando ? "Comprando..." : "Confirmar Compra"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Server Alerts Section */}
        <div className="mt-8 sm:mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                Alertas de Servidores
              </h2>
            </div>
            <span className="px-2 sm:px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs sm:text-sm font-medium self-start sm:self-auto">
              {alertsData.filter((alert) => !alert.sended).length} activas
            </span>
          </div>

          {alertsData.length > 0 ? (
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 shadow-xl">
              <div className="space-y-3 sm:space-y-4">
                {alertsData.map((alert, index) => {
                  const colors = getAlertColor(alert.alerta);
                  const isSent = alert.sended;

                  return (
                    <div
                      key={index}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg border gap-3 ${
                        isSent
                          ? "bg-gray-500/10 border-gray-500/30"
                          : `${colors.bg} ${colors.border}`
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div
                          className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                            isSent ? "bg-gray-500/20" : colors.iconBg
                          }`}
                        >
                          <Bell
                            className={`h-4 w-4 ${
                              isSent ? "text-gray-400" : colors.iconColor
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm sm:text-base">
                            {alert.servidor}
                            {getServerProtocolo(alert.servidor) && (
                              <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/10 text-white/80 text-xs rounded">
                                Protocolo {getServerProtocolo(alert.servidor)}
                              </span>
                            )}
                          </h3>
                          <p
                            className={`text-xs sm:text-sm break-words ${
                              isSent ? "text-gray-400" : colors.textColor
                            }`}
                          >
                            {alert.alerta}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
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
            <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-6 sm:p-8 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-white/40 mx-auto mb-3 sm:mb-4" />
              <p className="text-white/60 text-base sm:text-lg">
                No hay alertas activas
              </p>
              <p className="text-white/40 text-xs sm:text-sm mt-2">
                Las alertas de servidores aparecerán aquí cuando sea necesario
              </p>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
