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

    // Obtener el rol de periodista desde variables de entorno
    const periodistaRoleId = process.env.PERIODISTAS;

    if (!periodistaRoleId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          hasPeriodistaAccess: false,
          message: "Variable PERIODISTAS no configurada en Netlify",
        }),
      };
    }

    // Verificar si el usuario está en el servidor y tiene el rol de periodista
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
            hasPeriodistaAccess: false,
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
          hasPeriodistaAccess: false,
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
          hasPeriodistaAccess: false,
        }),
      };
    }

    // Verificar si el usuario tiene el rol de periodista
    const hasPeriodistaAccess = userRoles.includes(periodistaRoleId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasPeriodistaAccess,
        periodistaRoleId: periodistaRoleId,
        message: hasPeriodistaAccess
          ? "Usuario tiene acceso de periodista"
          : "Usuario no tiene el rol de periodista",
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
