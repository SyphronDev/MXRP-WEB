const RBX_CLIENT_ID = process.env.RBX_CLIENT_ID;
const RBX_CLIENT_SECRET = process.env.RBX_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.SITE_URL}/verify`;

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (!RBX_CLIENT_ID || !RBX_CLIENT_SECRET) {
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Missing Roblox OAuth credentials",
      }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      // Generar URL de autorización de Roblox (URL correcta v2)
      const robloxAuthUrl = `https://www.roblox.com/oauth/v2/authorize?client_id=${RBX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
        REDIRECT_URI
      )}&scope=openid%20profile`;

      return {
        statusCode: 200,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ authUrl: robloxAuthUrl }),
      };
    }

    if (event.httpMethod === "POST") {
      const { code, discordId } = JSON.parse(event.body);

      if (!code || !discordId) {
        return {
          statusCode: 400,
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Missing code or discordId" }),
        };
      }

      // Intercambiar código por token de acceso
      const tokenResponse = await fetch("https://apis.roblox.com/oauth/v2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: RBX_CLIENT_ID,
          client_secret: RBX_CLIENT_SECRET,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error("Token exchange failed:", errorData);
        throw new Error("Failed to exchange code for token");
      }

      const tokenData = await tokenResponse.json();

      // Obtener información del usuario de Roblox
      const userResponse = await fetch(
        "https://apis.roblox.com/oauth/v2/userinfo",
        {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        }
      );

      if (!userResponse.ok) {
        const errorData = await userResponse.text();
        console.error("User info failed:", errorData);
        throw new Error("Failed to get user info");
      }

      const robloxUser = await userResponse.json();

      // Verificar usuario en Discord y asignar roles
      const verificationResult = await verifyDiscordUser(discordId, robloxUser);

      return {
        statusCode: 200,
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(verificationResult),
      };
    }
  } catch (error) {
    console.error("Roblox auth error:", error);
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

async function verifyDiscordUser(discordId, robloxUser) {
  try {
    // Verificar que el usuario esté en el servidor Discord
    const guildMemberResponse = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members/${discordId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!guildMemberResponse.ok) {
      return {
        success: false,
        message:
          "Usuario no encontrado en el servidor Discord. Asegúrate de estar en el servidor MXRP.",
      };
    }

    const memberData = await guildMemberResponse.json();

    // Preparar roles para asignar/quitar según las variables de entorno
    const rolesToAdd = [
      process.env.ROLES_CIUDADANO,
      process.env.ROLES__ESTADO,
      process.env.ROLES_INDOCUMENTADO,
    ].filter(Boolean);

    const rolesToRemove = [
      process.env.ROLES_UNVERIFY,
      process.env.ROLES_WHITELIST,
    ].filter(Boolean);

    // Actualizar roles del usuario
    const updateRolesResponse = await fetch(
      `https://discord.com/api/v10/guilds/${process.env.GUILD_ID}/members/${discordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roles: [
            ...memberData.roles.filter((role) => !rolesToRemove.includes(role)),
            ...rolesToAdd.filter((role) => !memberData.roles.includes(role)),
          ],
          nick: robloxUser.preferred_username || robloxUser.name,
        }),
      }
    );

    if (!updateRolesResponse.ok) {
      const errorData = await updateRolesResponse.text();
      console.error("Role update failed:", errorData);
      return {
        success: false,
        message:
          "Error al actualizar roles en Discord. Contacta a un administrador.",
      };
    }

    return {
      success: true,
      message: `¡Verificación exitosa! Bienvenido ${
        robloxUser.preferred_username || robloxUser.name
      }`,
      robloxUser: {
        id: robloxUser.sub,
        username: robloxUser.preferred_username || robloxUser.name,
        displayName: robloxUser.name,
      },
    };
  } catch (error) {
    console.error("Discord verification error:", error);
    return {
      success: false,
      message: "Error interno del servidor. Intenta más tarde.",
    };
  }
}
