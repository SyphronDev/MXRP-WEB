const { connectDB } = require("./utils/database");
const NoticiasSchema = require("./models/NoticiasSchema");
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

    // Verificar permisos de periodista
    const permisos = await PermisosSchema.findOne({ GuildId: guildId });
    if (!permisos || !permisos.Periodista) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: "No tienes permisos de periodista",
        }),
      };
    }

    // Obtener información del usuario (simulado)
    const username = "Usuario"; // En una implementación real, obtendrías esto de Discord
    const avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/avatar.png`;

    // Procesar Markdown en campos
    const processedFields = fields
      ? fields.map((field) => ({
          ...field,
          value: field.value
            .replace(/\*\*(.*?)\*\*/g, "**$1**") // Mantener **bold**
            .replace(/\*(.*?)\*/g, "*$1*") // Mantener *italic*
            .replace(/__(.*?)__/g, "**$1**") // Convertir __bold__ a **bold**
            .replace(/_(.*?)_/g, "*$1*") // Convertir _italic_ a *italic*
            .replace(/~~(.*?)~~/g, "~~$1~~") // Mantener ~~strikethrough~~
            .replace(/`(.*?)`/g, "`$1`"), // Mantener `code`
        }))
      : [];

    // Crear el embed para Discord
    const embed = {
      title: titulo,
      description: descripcion
        .replace(/\*\*(.*?)\*\*/g, "**$1**") // Mantener **bold**
        .replace(/\*(.*?)\*/g, "*$1*") // Mantener *italic*
        .replace(/__(.*?)__/g, "**$1**") // Convertir __bold__ a **bold**
        .replace(/_(.*?)_/g, "*$1*") // Convertir _italic_ a *italic*
        .replace(/~~(.*?)~~/g, "~~$1~~") // Mantener ~~strikethrough~~
        .replace(/`(.*?)`/g, "`$1`"), // Mantener `code`
      color: color ? parseInt(color.replace("#", ""), 16) : 0x5865f2, // Discord blue por defecto
      thumbnail: {
        url: avatarUrl,
      },
      image: imagenUrl ? { url: imagenUrl } : undefined,
      fields: processedFields,
      footer: {
        text: `Publicado por ${username} • MXRP Noticias`,
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
