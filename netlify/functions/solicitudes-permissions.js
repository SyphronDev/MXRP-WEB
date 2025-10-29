const { authenticateRequest } = require("./utils/jwt");

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
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
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
          hasSolicitudesAccess: false,
        }),
      };
    }

    // Extraer el userId del usuario autenticado
    const discordId = authResult.user.userId;

    const { guildId } = JSON.parse(event.body || "{}");

    if (!guildId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "guildId es requerido",
        }),
      };
    }

    // Obtener los roles administrativos desde variables de entorno
    const rolesSolicitudes = [
      process.env.Administrador,
      process.env.DepartamentoRol,
      process.env.SupervisorRol,
    ].filter(Boolean);

    if (rolesSolicitudes.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasSolicitudesAccess: false,
          message:
            "Variables de roles administrativos no configuradas en Netlify",
        }),
      };
    }

    // Verificar si el usuario está en el servidor y tiene alguno de los roles
    let userRoles = [];
    let isInGuild = false;

    try {
      // Verificar si el usuario está en el servidor
      const guildMemberResponse = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (guildMemberResponse.ok) {
        const memberData = await guildMemberResponse.json();
        isInGuild = true;
        userRoles = memberData.roles || [];
      } else if (guildMemberResponse.status === 404) {
        // Usuario no está en el servidor
        isInGuild = false;
      } else {
        console.error(
          "Error fetching guild member:",
          guildMemberResponse.status
        );
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Error al verificar membresía del servidor",
            hasSolicitudesAccess: false,
          }),
        };
      }
    } catch (error) {
      console.error("Error in Discord API call:", error);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Error de conexión con Discord",
          hasSolicitudesAccess: false,
        }),
      };
    }

    // Verificar que el usuario esté en el servidor
    if (!isInGuild) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Usuario no está en el servidor",
          hasSolicitudesAccess: false,
        }),
      };
    }

    // Verificar si el usuario tiene alguno de los roles administrativos
    const hasSolicitudesAccess = userRoles.some((roleId) =>
      rolesSolicitudes.includes(roleId)
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasSolicitudesAccess,
        rolesSolicitudes: rolesSolicitudes,
        userRoles: userRoles,
        message: hasSolicitudesAccess
          ? "Usuario tiene acceso para gestionar solicitudes"
          : "Usuario no tiene los roles necesarios para gestionar solicitudes",
      }),
    };
  } catch (error) {
    console.error("Error checking solicitudes access:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Error interno del servidor",
        hasSolicitudesAccess: false,
      }),
    };
  }
};
