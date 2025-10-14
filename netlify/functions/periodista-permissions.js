const { connectDB } = require("./utils/database");
const PermisosSchema = require("./models/PermisosSchema");

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
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };
  }

  try {
    await connectDB();

    const { discordId, guildId } = JSON.parse(event.body);

    if (!discordId || !guildId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Faltan parámetros requeridos",
        }),
      };
    }

    // Obtener permisos del servidor
    const permisos = await PermisosSchema.findOne({ GuildId: guildId });

    if (!permisos) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPeriodistaAccess: false,
          message: "No se encontraron permisos para este servidor",
        }),
      };
    }

    // Verificar si el usuario tiene el rol de periodista
    const periodistaRoleId = permisos.Periodista;

    if (!periodistaRoleId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPeriodistaAccess: false,
          message: "Rol de periodista no configurado",
        }),
      };
    }

    // Aquí necesitarías verificar si el usuario tiene el rol en Discord
    // Por ahora, asumimos que el usuario tiene acceso si el rol está configurado
    // En una implementación real, harías una llamada a la API de Discord

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasPeriodistaAccess: true,
        periodistaRoleId: periodistaRoleId,
        message: "Usuario tiene acceso de periodista",
      }),
    };
  } catch (error) {
    console.error("Error checking periodista access:", error);
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
