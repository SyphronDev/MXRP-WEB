const { connectDB } = require("./utils/database");
const PermisosSchema = require("./models/PermisosSchema");

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

const TTL_PERMISSIONS = 1800; // 30 minutos

class PermisosManager {
  constructor(guildId) {
    this.guildId = guildId;
    this.permisosData = null;

    // categorías originales
    this.highRoles = [];
    this.mediumRoles = [];
    this.JornadaRoles = [];
    this.CharacterKill = [];
    this.HighEnd = [];
    this.SpecialPerm = [];
    this.InePerms = [];

    // nuevas categorías para warns
    this.WarnManagePerms = [];
    this.WarnAddPerms = [];

    // categoría para Robux (todos excepto Trial)
    this.RobuxPerms = [];
  }

  async loadPermisos() {
    try {
      // Intentar obtener desde caché Redis primero
      const cachedPermisos = await redisClient.get(
        `permissions:${this.guildId}`
      );
      if (cachedPermisos) {
        console.log(
          `📦 [PERMISOS] Cargados desde caché Redis para guild ${this.guildId}`
        );
        this.permisosData = JSON.parse(cachedPermisos);
        this.processPermisos();
        return { loaded: true, embed: null };
      }

      // Si no hay caché, cargar desde BD
      await connectDB();
      this.permisosData = await PermisosSchema.findOne({
        GuildId: this.guildId,
      });

      if (!this.permisosData) {
        return {
          loaded: false,
          embed: "No se encontraron permisos configurados.",
        };
      }

      // Guardar en caché Redis
      await redisClient.setEx(
        `permissions:${this.guildId}`,
        TTL_PERMISSIONS,
        JSON.stringify(this.permisosData)
      );
      console.log(
        `💾 [PERMISOS] Guardados en caché Redis para guild ${this.guildId}`
      );

      this.processPermisos();
      return { loaded: true, embed: null };
    } catch (error) {
      console.error("Error loading permissions:", error);
      return { loaded: false, embed: "Error al cargar permisos." };
    }
  }

  processPermisos() {
    // --- todas las categorías originales ---
    this.highRoles = [
      this.permisosData.Comite,
      this.permisosData.Developer,
      this.permisosData.OficinaAdm,
      this.permisosData.Administrador,
      this.permisosData.ProyectManager,
      this.permisosData.ARH,
      this.permisosData.AI,
      this.permisosData.HeadStaff,
      this.permisosData.SupervisorEtica,
      this.permisosData.RH,
      this.permisosData.DepartamentoEtica,
      this.permisosData.Vinculacion,
      this.permisosData.Tesoreria,
      this.permisosData.AuditorTesoreria,
      this.permisosData.DRVinculacion,
      this.permisosData.DirectorSoporte,
      this.permisosData.ControlFac,
      this.permisosData.CommunitySupport,
      this.permisosData.CommunityManager,
    ].filter(Boolean);

    this.SpecialPerm = [
      this.permisosData.Auditor,
      this.permisosData.Tesoreria,
      this.permisosData.AuditorTesoreria,
    ].filter(Boolean);

    this.InePerms = [this.permisosData.INE].filter(Boolean);

    this.mediumRoles = [
      this.permisosData.Moderador,
      this.permisosData.HeadStaff,
      this.permisosData.SoporteTecnico,
      this.permisosData.ProyectManager,
      this.permisosData.AI,
      this.permisosData.RH,
      this.permisosData.Trial,
      this.permisosData.EquipoAdministrativo,
    ].filter(Boolean);

    this.JornadaRoles = [
      this.permisosData.Comite,
      this.permisosData.Developer,
      this.permisosData.OficinaAdm,
      this.permisosData.AI,
      this.permisosData.RH,
    ].filter(Boolean);

    this.HighEnd = [
      this.permisosData.Comite,
      this.permisosData.DRVinculacion,
      this.permisosData.Vinculacion,
      this.permisosData.AI,
      this.permisosData.HeadStaff,
      this.permisosData.OficinaAdm,
    ].filter(Boolean);

    this.CharacterKill = [
      this.permisosData.Comite,
      this.permisosData.Developer,
      this.permisosData.OficinaAdm,
      this.permisosData.Administrador,
      this.permisosData.HeadStaff,
      this.permisosData.Vinculacion,
      this.permisosData.AI,
      this.permisosData.RH,
    ].filter(Boolean);

    // --- nuevas categorías de warns ---
    this.WarnManagePerms = [
      this.permisosData.Comite,
      this.permisosData.OficinaAdm,
      this.permisosData.HeadStaff,
      this.permisosData.AI,
      this.permisosData.Administrador,
      this.permisosData.RH,
    ].filter(Boolean);

    this.WarnAddPerms = [
      this.permisosData.Comite,
      this.permisosData.OficinaAdm,
      this.permisosData.HeadStaff,
      this.permisosData.AI,
      this.permisosData.Administrador,
      this.permisosData.RH,
      this.permisosData.Moderador,
    ].filter(Boolean);

    // Permisos para Robux (todos los roles excepto Trial)
    this.RobuxPerms = [
      this.permisosData.Comite,
      this.permisosData.Developer,
      this.permisosData.OficinaAdm,
      this.permisosData.Administrador,
      this.permisosData.ProyectManager,
      this.permisosData.ARH,
      this.permisosData.AI,
      this.permisosData.HeadStaff,
      this.permisosData.SupervisorEtica,
      this.permisosData.RH,
      this.permisosData.DepartamentoEtica,
      this.permisosData.Vinculacion,
      this.permisosData.Tesoreria,
      this.permisosData.AuditorTesoreria,
      this.permisosData.DRVinculacion,
      this.permisosData.DirectorSoporte,
      this.permisosData.ControlFac,
      this.permisosData.CommunitySupport,
      this.permisosData.CommunityManager,
      this.permisosData.Moderador,
      this.permisosData.SoporteTecnico,
      this.permisosData.EquipoAdministrativo,
      this.permisosData.Auditor,
      this.permisosData.INE,
    ].filter(Boolean);
  }

  checkPermissions(userRoles, levels = []) {
    const allowedRoles = [];

    // originales
    if (levels.includes("high")) allowedRoles.push(...this.highRoles);
    if (levels.includes("medium")) allowedRoles.push(...this.mediumRoles);
    if (levels.includes("jornada")) allowedRoles.push(...this.JornadaRoles);
    if (levels.includes("HighEnd")) allowedRoles.push(...this.HighEnd);
    if (levels.includes("SpecialPerm")) allowedRoles.push(...this.SpecialPerm);
    if (levels.includes("InePerms")) allowedRoles.push(...this.InePerms);
    if (levels.includes("CharacterKill"))
      allowedRoles.push(...this.CharacterKill);

    // warns
    if (levels.includes("warnmanage"))
      allowedRoles.push(...this.WarnManagePerms);
    if (levels.includes("warnadd")) allowedRoles.push(...this.WarnAddPerms);

    // Robux
    if (levels.includes("robux")) allowedRoles.push(...this.RobuxPerms);

    const tienePermiso = userRoles.some((roleId) =>
      allowedRoles.includes(roleId)
    );

    return { allowed: tienePermiso };
  }

  getEquipoAdministrativoRole() {
    return this.permisosData?.EquipoAdministrativo || null;
  }
}

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
    const { discordId, guildId } = JSON.parse(event.body);

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

    // Aquí normalmente harías una llamada a la API de Discord para obtener los roles del usuario
    // Por ahora simularemos que tenemos los roles del usuario
    // En producción, necesitarías hacer una llamada a Discord API con el token del bot

    const permisosManager = new PermisosManager(guildId);
    const permisoStatus = await permisosManager.loadPermisos();

    if (!permisoStatus.loaded) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: permisoStatus.embed,
          hasAdminAccess: false,
        }),
      };
    }

    // Simular verificación de permisos - en producción necesitarías los roles reales del usuario
    // Por ahora retornamos true para usuarios con cualquier rol administrativo
    const hasAdminAccess = true; // Cambiar por verificación real de roles

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasAdminAccess,
        permissions: {
          highRoles: permisosManager.highRoles,
          mediumRoles: permisosManager.mediumRoles,
          specialPerm: permisosManager.SpecialPerm,
          highEnd: permisosManager.HighEnd,
          characterKill: permisosManager.CharacterKill,
        },
      }),
    };
  } catch (error) {
    console.error("Error in admin-permissions:", error);
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
