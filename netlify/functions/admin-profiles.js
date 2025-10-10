const { connectDB } = require("./utils/database");
const PerfilStaffSchema = require("./models/PerfilStaffSchema");

// Redis connection
const redis = require("redis");
const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URL,
    port: Number(process.env.REDIS_PORT),
    tls: {},
  },
});

redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("connect", () => console.log("Connected to Redis"));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

const TTL_USER_DATA = 300; // 5 minutos

const getStarRating = (rating) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  return (
    "⭐".repeat(fullStars) +
    (halfStar ? "⭐" : "") +
    "☆".repeat(5 - fullStars - (halfStar ? 1 : 0))
  );
};

const formatMinutes = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const secondsToMinutes = (seconds) => {
  return Math.floor(seconds / 60);
};

const fetchOrCreateProfile = async (guildId, userId) => {
  try {
    await connectDB();

    let perfilData = await PerfilStaffSchema.findOne({
      GuildId: guildId,
      "Perfiles.UserId": userId,
    });

    if (!perfilData) {
      const now = new Date();
      perfilData = new PerfilStaffSchema({
        GuildId: guildId,
        Perfiles: [
          {
            UserId: userId,
            TiempoTotal: 0,
            Tier: "No asignado",
            TiempoContratado: now,
            TicketsAtendidos: 0,
            Invitados: 0,
            Inactividad: "No",
            Ticket: 0,
            TiempoTotalHoy: 0,
            TiempoTotalBackup: 0,
            TicketsTotales: 0,
            Calificacion: 0,
            RobuxReclamados: null,
            NotaAdministrativa: [],
            WarnAdministrativo: [],
          },
        ],
      });
      await perfilData.save();
    }

    return perfilData.Perfiles.find((p) => p.UserId === userId);
  } catch (error) {
    console.error("Error fetching or creating profile:", error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" }),
    };
  }

  try {
    const { discordId, guildId, action } = JSON.parse(event.body);

    if (!discordId || !guildId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "discordId y guildId son requeridos",
        }),
      };
    }

    // Verificar caché Redis primero
    const cacheKey = `admin_profile:${guildId}:${discordId}`;
    const cachedProfile = await redisClient.get(cacheKey);

    if (cachedProfile && action === "get") {
      console.log(
        `📦 [ADMIN_PROFILE] Cargado desde caché Redis para usuario ${discordId}`
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          profile: JSON.parse(cachedProfile),
          fromCache: true,
        }),
      };
    }

    const perfil = await fetchOrCreateProfile(guildId, discordId);

    if (!perfil) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Perfil no encontrado",
        }),
      };
    }

    // Calcular estadísticas
    const tiempoActual = perfil.TiempoTotal || 0;
    const tiempoBackup = perfil.TiempoTotalBackup || 0;
    const tiempoParaMostrar =
      tiempoActual === 0 && tiempoBackup > 0 ? tiempoBackup : tiempoActual;

    const tiempoHoras = Math.floor(tiempoParaMostrar / 3600);
    const cumpleHoras = tiempoHoras >= 14;

    // Formatear datos del perfil
    const profileData = {
      userId: perfil.UserId,
      tiempoTotal: tiempoParaMostrar,
      tiempoHoras,
      cumpleHoras,
      tier: perfil.Tier || "No asignado",
      tiempoContratado: perfil.TiempoContratado,
      ticketsAtendidos: perfil.TicketsAtendidos || 0,
      invitados: perfil.Invitados || 0,
      inactividad: perfil.Inactividad || "No",
      ticket: perfil.Ticket || 0,
      tiempoTotalHoy: perfil.TiempoTotalHoy || 0,
      calificacion: perfil.Calificacion || 0,
      calificacionEstrellas: getStarRating(perfil.Calificacion || 0),
      notasAdministrativas: perfil.NotaAdministrativa || [],
      warnsAdministrativos: perfil.WarnAdministrativo || [],
      robuxReclamados: perfil.RobuxReclamados,
      // Estadísticas calculadas
      progresoSemanal: Math.min(100, Math.round((tiempoHoras / 14) * 100)),
      eficiencia:
        perfil.Ticket > 0
          ? Math.round((perfil.TicketsAtendidos / perfil.Ticket) * 100)
          : 0,
      rendimientoGeneral:
        cumpleHoras && perfil.Calificacion >= 4
          ? "Excelente"
          : cumpleHoras || perfil.Calificacion >= 3
          ? "Bueno"
          : "Necesita mejorar",
    };

    // Guardar en caché Redis
    await redisClient.setEx(
      cacheKey,
      TTL_USER_DATA,
      JSON.stringify(profileData)
    );
    console.log(
      `💾 [ADMIN_PROFILE] Guardado en caché Redis para usuario ${discordId}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        profile: profileData,
        fromCache: false,
      }),
    };
  } catch (error) {
    console.error("Error in admin-profiles:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Error interno del servidor",
      }),
    };
  }
};
