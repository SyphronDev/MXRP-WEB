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

    // Crear el embed para Discord
    const embed = {
      title: titulo,
      description: processMarkdown(descripcion),
      color: color ? parseInt(color.replace("#", ""), 16) : 0x5865f2, // Discord blue por defecto
      thumbnail: {
        url: avatarUrl,
      },
      image: imagenUrl ? { url: imagenUrl } : undefined,
      fields: processedFields,
      footer: {
        text: `Publicado por ${username}`,
        icon_url: avatarUrl,
      },
      timestamp: new Date().toISOString(),
    };

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

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook failed: ${webhookResponse.status}`);
    }

    const webhookData = await webhookResponse.json();
    const messageId = webhookData.id;

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
