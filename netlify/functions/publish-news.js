const { connectDB } = require("./utils/database");
const NoticiasSchema = require("./models/NoticiasSchema");

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

    const {
      discordId,
      guildId,
      titulo,
      descripcion,
      imagenUrl,
      fields,
      color,
      footerText,
      webhookIconUrl,
      webhookUsername,
      thumbnailUrl,
    } = JSON.parse(event.body);

    if (!discordId || !guildId || !titulo || !descripcion) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Faltan parámetros requeridos",
        }),
      };
    }

    // Verificar permisos de periodista usando variables de entorno
    const periodistaRoleId = process.env.PERIODISTAS;

    if (!periodistaRoleId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
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
          statusCode: 403,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Error al verificar membresía del servidor",
          }),
        };
      }
    } catch (error) {
      console.error("Error in Discord API call:", error);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Error de conexión con Discord",
        }),
      };
    }

    // Verificar que el usuario esté en el servidor
    if (!isInGuild) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Usuario no está en el servidor",
        }),
      };
    }

    // Verificar si el usuario tiene el rol de periodista
    const hasPeriodistaAccess = userRoles.includes(periodistaRoleId);
    if (!hasPeriodistaAccess) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: "No tienes el rol de periodista",
        }),
      };
    }

    // Obtener información real del usuario desde Discord
    let username = "Usuario";
    let avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/avatar.png`;

    try {
      const userResponse = await fetch(
        `https://discord.com/api/v10/users/${discordId}`,
        {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        username = userData.global_name || userData.username || "Usuario";

        if (userData.avatar) {
          const avatarHash = userData.avatar;
          const isAnimated = avatarHash.startsWith("a_");
          avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.${
            isAnimated ? "gif" : "png"
          }`;
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }

    // Función para procesar Markdown y saltos de línea
    const processMarkdown = (text) => {
      return text
        .replace(/\n/g, "\n") // Mantener saltos de línea
        .replace(/\*\*(.*?)\*\*/g, "**$1**") // Mantener **bold**
        .replace(/\*(.*?)\*/g, "*$1*") // Mantener *italic*
        .replace(/__(.*?)__/g, "**$1**") // Convertir __bold__ a **bold**
        .replace(/_(.*?)_/g, "*$1*") // Convertir _italic_ a *italic*
        .replace(/~~(.*?)~~/g, "~~$1~~") // Mantener ~~strikethrough~~
        .replace(/`(.*?)`/g, "`$1`"); // Mantener `code`
    };

    // Procesar Markdown en campos
    const processedFields = fields
      ? fields.map((field) => ({
          ...field,
          value: processMarkdown(field.value),
        }))
      : [];

    // Obtener información del bot desde Discord API
    let botIconUrl = thumbnailUrl;

    if (!botIconUrl) {
      try {
        // Obtener información del bot usando el bot token
        const botResponse = await fetch(
          "https://discord.com/api/v10/users/@me",
          {
            headers: {
              Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (botResponse.ok) {
          const botData = await botResponse.json();
          if (botData.avatar) {
            const avatarHash = botData.avatar;
            const isAnimated = avatarHash.startsWith("a_");
            botIconUrl = `https://cdn.discordapp.com/avatars/${
              botData.id
            }/${avatarHash}.${isAnimated ? "gif" : "png"}`;
          }
        } else {
          console.warn("Could not fetch bot info, using CLIENT_ID fallback");
          // Fallback a CLIENT_ID si la API falla
          if (process.env.CLIENT_ID) {
            botIconUrl = `https://cdn.discordapp.com/app-icons/${process.env.CLIENT_ID}/icon.png`;
          }
        }
      } catch (error) {
        console.error("Error fetching bot avatar:", error);
        // Fallback a CLIENT_ID
        if (process.env.CLIENT_ID) {
          botIconUrl = `https://cdn.discordapp.com/app-icons/${process.env.CLIENT_ID}/icon.png`;
        }
      }
    }

    // Crear el embed para Discord
    const embed = {
      title: titulo,
      description: processMarkdown(descripcion),
      color: color ? parseInt(color.replace("#", ""), 16) : 0x5865f2, // Discord blue por defecto
      thumbnail: botIconUrl
        ? {
            url: botIconUrl,
          }
        : undefined,
      image: imagenUrl ? { url: imagenUrl } : undefined,
      fields: processedFields,
      footer: {
        text: footerText || "Noticias MXRP",
        icon_url: webhookIconUrl || botIconUrl || avatarUrl,
      },
      timestamp: new Date().toISOString(),
    };

    console.log("Bot Icon URL:", botIconUrl);
    console.log("Embed thumbnail:", embed.thumbnail);

    // Enviar al webhook
    const webhookUrl = process.env.WEBHOOK_PERIODICO;
    if (!webhookUrl) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Webhook no configurado",
        }),
      };
    }

    const webhookPayload = {
      embeds: [embed],
    };

    // Agregar username e icono del webhook si se proporcionaron
    if (webhookUsername) {
      webhookPayload.username = webhookUsername;
    }
    if (webhookIconUrl || botIconUrl) {
      webhookPayload.avatar_url = webhookIconUrl || botIconUrl;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      console.error(`Webhook failed: ${webhookResponse.status}`, errorText);
      throw new Error(
        `Webhook failed: ${webhookResponse.status} - ${errorText}`
      );
    }

    // Intentar obtener el JSON de respuesta, pero manejar respuestas vacías
    let messageId = null;
    try {
      const responseText = await webhookResponse.text();
      if (responseText.trim()) {
        const webhookData = JSON.parse(responseText);
        messageId = webhookData.id;
      }
    } catch (parseError) {
      console.warn(
        "Webhook response is not valid JSON or is empty:",
        parseError.message
      );
      // Si no podemos parsear el JSON, generamos un ID temporal
      messageId = `temp_${Date.now()}`;
    }

    // Guardar la noticia en la base de datos
    const noticia = new NoticiasSchema({
      userId: discordId,
      username: username,
      avatarUrl: avatarUrl,
      titulo: titulo,
      descripcion: descripcion,
      imagenUrl: imagenUrl,
      fields: fields || [],
      color: color,
      enviada: true,
      messageId: messageId,
    });

    await noticia.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Noticia publicada exitosamente",
        messageId: messageId,
      }),
    };
  } catch (error) {
    console.error("Error publishing news:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Error al publicar la noticia",
      }),
    };
  }
};
