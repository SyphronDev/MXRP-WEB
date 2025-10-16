const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "https://mxrp.site";
const REDIRECT_URI_VERIFY =
  process.env.REDIRECT_URI_VERIFY || "https://mxrp.site/verify";

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Validar variables de entorno
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("Missing environment variables:", {
      CLIENT_ID: !!CLIENT_ID,
      CLIENT_SECRET: !!CLIENT_SECRET,
    });
    return {
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Server configuration error",
        message: "Missing Discord OAuth credentials",
      }),
    };
  }

  try {
    if (event.httpMethod === "GET") {
      // Obtener el parámetro redirectPath de la query string
      const redirectPath =
        event.queryStringParameters?.redirectPath || "dashboard";

      // Determinar qué redirect URI usar
      const redirectUri =
        redirectPath === "verify" ? REDIRECT_URI_VERIFY : REDIRECT_URI;

      // Generar URL de autorización de Discord
      const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&scope=guilds%20identify%20email%20connections`;

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authUrl: discordAuthUrl,
        }),
      };
    }

    if (event.httpMethod === "POST") {
      let code, redirectPath;
      try {
        const body = JSON.parse(event.body);
        code = body.code;
        redirectPath = body.redirectPath || "dashboard";
      } catch (parseError) {
        console.error("Failed to parse request body:", parseError);
        return {
          statusCode: 400,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            error: "Invalid request body",
            message: "Request body must be valid JSON",
          }),
        };
      }

      if (!code) {
        console.error("Missing authorization code");
        return {
          statusCode: 400,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            error: "Authorization code is required",
          }),
        };
      }

      // Determinar qué redirect URI usar basándose en el redirectPath
      const redirectUri =
        redirectPath === "verify" ? REDIRECT_URI_VERIFY : REDIRECT_URI;

      // Intercambiar código por token de acceso
      const tokenResponse = await fetch(
        "https://discord.com/api/oauth2/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri,
          }),
        }
      );

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Token exchange failed:", {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          error: errorText,
        });

        // Manejar específicamente códigos expirados o inválidos
        if (tokenResponse.status === 400) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error === "invalid_grant") {
              return {
                statusCode: 400,
                headers: {
                  ...headers,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  error: "Invalid or expired authorization code",
                  message:
                    "El código de autorización ha expirado o es inválido. Por favor, intenta iniciar sesión nuevamente.",
                }),
              };
            }
          } catch (parseError) {
            // Si no podemos parsear el error, continuar con el error original
          }
        }

        throw new Error(
          `Failed to exchange code for token: ${tokenResponse.status} ${tokenResponse.statusText}`
        );
      }

      const tokenData = await tokenResponse.json();

      // Obtener información del usuario
      const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error("User data fetch failed:", {
          status: userResponse.status,
          statusText: userResponse.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch user data: ${userResponse.status} ${userResponse.statusText}`
        );
      }

      const userData = await userResponse.json();

      // Verificar membresía al servidor específico
      const guildId = process.env.GUILD_ID || "1193021133981765632";
      const guildsResponse = await fetch(
        "https://discord.com/api/users/@me/guilds",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      if (!guildsResponse.ok) {
        const errorText = await guildsResponse.text();
        console.error("Guilds fetch failed:", {
          status: guildsResponse.status,
          statusText: guildsResponse.statusText,
          error: errorText,
        });
        throw new Error(
          `Failed to fetch user guilds: ${guildsResponse.status} ${guildsResponse.statusText}`
        );
      }

      const guilds = await guildsResponse.json();
      const isMember = guilds.some((guild) => guild.id === guildId);

      if (!isMember) {
        console.log(`User ${userData.id} is not a member of guild ${guildId}`);
        return {
          statusCode: 403,
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            error: "Guild membership required",
            message:
              "Debes ser miembro del servidor MXRP para acceder a esta aplicación.",
          }),
        };
      }

      console.log(
        `User ${userData.id} successfully authenticated and verified guild membership`
      );

      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: true,
          user: {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar,
            email: userData.email,
            avatarUrl: userData.avatar
              ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
              : `https://cdn.discordapp.com/embed/avatars/${
                  userData.discriminator % 5
                }.png`,
          },
          accessToken: tokenData.access_token,
        }),
      };
    }

    return {
      statusCode: 405,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      statusCode: 500,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
