const { connectDB } = require("./utils/database");
const PerfilStaffSchema = require("./models/PerfilStaffSchema");
const { authenticateRequest } = require("./utils/jwt");

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
redisClient.on("connect", () => {});

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
})();

const TTL_USER_DATA = 300; // 5 minutos

// Función para obtener información de usuario desde Discord API
const getUserInfo = async (userId) => {
  try {
    // Intentar obtener desde caché Redis primero
    const cachedUser = await redisClient.get(`user:${userId}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    // Si no hay caché, obtener desde Discord API
    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const userData = await response.json();
      const userInfo = {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        tag: `${userData.username}${
          userData.discriminator !== "0" ? `#${userData.discriminator}` : ""
        }`,
        avatar: userData.avatar,
        avatarUrl: userData.avatar
          ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=512`
          : `https://cdn.discordapp.com/embed/avatars/${
              parseInt(userData.discriminator) % 5
            }.png`,
      };

      // Guardar en caché Redis
      await redisClient.setEx(
        `user:${userId}`,
        TTL_USER_DATA,
        JSON.stringify(userInfo)
      );

      return userInfo;
    } else {
      console.error(`Error fetching user ${userId}:`, response.status);
      return {
        id: userId,
        username: "Usuario desconocido",
        discriminator: "0000",
        tag: "Usuario desconocido",
        avatar: null,
        avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
      };
    }
  } catch (error) {
    console.error(`Error in getUserInfo for ${userId}:`, error);
    return {
      id: userId,
      username: "Usuario desconocido",
      discriminator: "0000",
      tag: "Usuario desconocido",
      avatar: null,
      avatarUrl: "https://cdn.discordapp.com/embed/avatars/0.png",
    };
  }
};

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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
    // Validar JWT - obtener usuario autenticado del token
    const authResult = authenticateRequest(event);
    if (authResult.error) {
      return {
        statusCode: authResult.statusCode,
        headers,
        body: JSON.stringify({
          success: false,
          message: authResult.message,
        }),
      };
    }

    // Extraer el userId del usuario autenticado
    const discordId = authResult.user.userId;

    const { guildId, action } = JSON.parse(event.body || "{}");

    if (!guildId) {
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
      // Perfil cargado desde caché
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

    // Procesar notas administrativas con información de usuario
    const notasConUsuarios = await Promise.all(
      (perfil.NotaAdministrativa || []).map(async (nota) => {
        const aplicadorInfo = await getUserInfo(nota.Aplicador);
        return {
          Nota: nota.Nota,
          Aplicado: nota.Aplicado,
          Aplicador: nota.Aplicador,
          AplicadorInfo: aplicadorInfo,
        };
      })
    );

    // Procesar warns administrativos con información de usuario
    const warnsConUsuarios = await Promise.all(
      (perfil.WarnAdministrativo || []).map(async (warnGroup) => {
        const warnsProcesados = await Promise.all(
          (warnGroup.Warn || []).map(async (warn) => {
            const aplicadorInfo = await getUserInfo(warn.Aplicador);
            return {
              Warn: warn.Warn,
              Aplicador: warn.Aplicador,
              Aplicado: warn.Aplicado,
              AplicadorInfo: aplicadorInfo,
            };
          })
        );
        return {
          Warn: warnsProcesados,
        };
      })
    );

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
      notasAdministrativas: notasConUsuarios,
      warnsAdministrativos: warnsConUsuarios,
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
    // Perfil guardado en caché

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
