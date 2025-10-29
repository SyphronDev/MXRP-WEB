const { connectDB } = require("./utils/database");
const SolicitudEmpresaSchema = require("./models/SolicitudEmpresaSchema");
const { authenticateRequest } = require("./utils/jwt");

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  try {
    await connectDB();

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

    const { action, guildId } = JSON.parse(event.body || "{}");

    if (!guildId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "GuildId es requerido",
        }),
      };
    }

    switch (action) {
      case "crearSolicitud":
        return await crearSolicitud(
          discordId,
          authResult.user.username,
          authResult.user.email,
          JSON.parse(event.body),
          headers
        );

      case "obtenerSolicitudesUsuario":
        return await obtenerSolicitudesUsuario(discordId, guildId, headers);

      case "obtenerSolicitudesPendientes":
        return await obtenerSolicitudesPendientes(discordId, guildId, headers);

      case "aprobarSolicitud":
        return await aprobarSolicitud(
          discordId,
          authResult.user.username,
          JSON.parse(event.body),
          headers
        );

      case "denegarSolicitud":
        return await denegarSolicitud(
          discordId,
          authResult.user.username,
          JSON.parse(event.body),
          headers
        );

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "Acción no válida",
          }),
        };
    }
  } catch (error) {
    console.error("Error en solicitudes-empresa:", error);
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

// Crear nueva solicitud
async function crearSolicitud(discordId, username, email, data, headers) {
  const {
    guildId,
    nombreEmpresa,
    dueno,
    funcion,
    tipo,
    colorRol,
    imagenBanner,
    linkDiscord,
  } = data;

  // Validar campos requeridos
  if (
    !nombreEmpresa ||
    !dueno ||
    !funcion ||
    !tipo ||
    !colorRol ||
    !imagenBanner ||
    !linkDiscord
  ) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Todos los campos son requeridos",
      }),
    };
  }

  // Verificar si el usuario ya tiene una solicitud pendiente
  const tienePendiente = await SolicitudEmpresaSchema.tieneSolicitudPendiente(
    discordId,
    guildId
  );
  if (tienePendiente) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message:
          "Ya tienes una solicitud pendiente. Espera a que sea revisada antes de crear otra.",
      }),
    };
  }

  // Obtener información del usuario desde Discord
  let userTag = username;
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
      userTag = userData.global_name || userData.username || username;
    }
  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error);
  }

  // Crear la solicitud
  const solicitud = new SolicitudEmpresaSchema({
    userId: discordId,
    username: username,
    userTag: userTag,
    nombreEmpresa: nombreEmpresa.trim(),
    dueno: dueno.trim(),
    funcion: funcion.trim(),
    tipo: tipo,
    colorRol: colorRol,
    imagenBanner: imagenBanner.trim(),
    linkDiscord: linkDiscord.trim(),
    guildId: guildId,
  });

  await solicitud.save();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message:
        "Solicitud creada exitosamente. Será revisada por el equipo administrativo.",
      solicitud: {
        id: solicitud._id,
        nombreEmpresa: solicitud.nombreEmpresa,
        estado: solicitud.estado,
        fechaCreacion: solicitud.fechaCreacion,
      },
    }),
  };
}

// Obtener solicitudes del usuario
async function obtenerSolicitudesUsuario(discordId, guildId, headers) {
  const solicitudes = await SolicitudEmpresaSchema.obtenerSolicitudesUsuario(
    discordId,
    guildId
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      solicitudes: solicitudes.map((s) => ({
        id: s._id,
        nombreEmpresa: s.nombreEmpresa,
        tipo: s.tipo,
        estado: s.estado,
        fechaCreacion: s.fechaCreacion,
        fechaRevision: s.fechaRevision,
        motivoAprobacion: s.motivoAprobacion,
        motivoDenegacion: s.motivoDenegacion,
        revisadoPor: s.revisadoPor,
      })),
    }),
  };
}

// Obtener solicitudes pendientes (solo para administradores)
async function obtenerSolicitudesPendientes(discordId, guildId, headers) {
  // Verificar permisos administrativos
  const tienePermisos = await verificarPermisosAdministrativos(
    discordId,
    guildId
  );
  if (!tienePermisos) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        success: false,
        message: "No tienes permisos para ver solicitudes pendientes",
      }),
    };
  }

  const solicitudes = await SolicitudEmpresaSchema.obtenerSolicitudesPendientes(
    guildId
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      solicitudes: solicitudes.map((s) => ({
        id: s._id,
        userId: s.userId,
        username: s.username,
        userTag: s.userTag,
        nombreEmpresa: s.nombreEmpresa,
        dueno: s.dueno,
        funcion: s.funcion,
        tipo: s.tipo,
        colorRol: s.colorRol,
        imagenBanner: s.imagenBanner,
        linkDiscord: s.linkDiscord,
        fechaCreacion: s.fechaCreacion,
      })),
    }),
  };
}

// Aprobar solicitud
async function aprobarSolicitud(discordId, username, data, headers) {
  const { solicitudId, motivo, guildId } = data;

  if (!solicitudId || !motivo) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: "ID de solicitud y motivo son requeridos",
      }),
    };
  }

  // Verificar permisos administrativos
  const permisos = await verificarPermisosAdministrativos(discordId, guildId);
  if (!permisos.tienePermisos) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        success: false,
        message: "No tienes permisos para aprobar solicitudes",
      }),
    };
  }

  // Buscar la solicitud
  const solicitud = await SolicitudEmpresaSchema.findById(solicitudId);
  if (!solicitud) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Solicitud no encontrada",
      }),
    };
  }

  if (solicitud.estado !== "pendiente") {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Esta solicitud ya fue procesada",
      }),
    };
  }

  // Aprobar la solicitud
  await solicitud.aprobar(discordId, username, permisos.rol, motivo.trim());

  // Enviar DM al usuario
  await enviarDMNotificacion(
    solicitud.userId,
    "aprobada",
    solicitud.nombreEmpresa,
    solicitud.tipo,
    username,
    motivo.trim()
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: "Solicitud aprobada exitosamente",
    }),
  };
}

// Denegar solicitud
async function denegarSolicitud(discordId, username, data, headers) {
  const { solicitudId, motivo, guildId } = data;

  if (!solicitudId || !motivo) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: "ID de solicitud y motivo son requeridos",
      }),
    };
  }

  // Verificar permisos administrativos
  const permisos = await verificarPermisosAdministrativos(discordId, guildId);
  if (!permisos.tienePermisos) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({
        success: false,
        message: "No tienes permisos para denegar solicitudes",
      }),
    };
  }

  // Buscar la solicitud
  const solicitud = await SolicitudEmpresaSchema.findById(solicitudId);
  if (!solicitud) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Solicitud no encontrada",
      }),
    };
  }

  if (solicitud.estado !== "pendiente") {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Esta solicitud ya fue procesada",
      }),
    };
  }

  // Denegar la solicitud (elimina el documento)
  const resultadoDenegacion = await solicitud.denegar(
    discordId,
    username,
    permisos.rol,
    motivo.trim()
  );

  // Enviar DM al usuario con la información guardada antes de eliminar
  await enviarDMNotificacion(
    resultadoDenegacion.userId,
    "denegada",
    resultadoDenegacion.nombreEmpresa,
    resultadoDenegacion.tipo,
    resultadoDenegacion.revisorInfo.username,
    resultadoDenegacion.motivo
  );

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: "Solicitud denegada exitosamente",
    }),
  };
}

// Verificar permisos administrativos
async function verificarPermisosAdministrativos(discordId, guildId) {
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

    if (!guildMemberResponse.ok) {
      return { tienePermisos: false };
    }

    const memberData = await guildMemberResponse.json();
    const userRoles = memberData.roles || [];

    // Verificar roles administrativos
    const rolesAdmin = [
      process.env.Administrador,
      process.env.DepartamentoRol,
      process.env.SupervisorRol,
    ].filter(Boolean);

    const tieneRolAdmin = userRoles.some((role) => rolesAdmin.includes(role));

    if (tieneRolAdmin) {
      let rol = "Administrador";
      if (userRoles.includes(process.env.DepartamentoRol)) {
        rol = "Departamento";
      } else if (userRoles.includes(process.env.SupervisorRol)) {
        rol = "Supervisor";
      }

      return { tienePermisos: true, rol };
    }

    return { tienePermisos: false };
  } catch (error) {
    console.error("Error verificando permisos administrativos:", error);
    return { tienePermisos: false };
  }
}

// Enviar notificación DM
async function enviarDMNotificacion(
  userId,
  estado,
  nombreEmpresa,
  tipo,
  revisadoPor,
  motivo
) {
  try {
    // Crear canal DM con el usuario
    const dmResponse = await fetch(
      "https://discord.com/api/v10/users/@me/channels",
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: userId,
        }),
      }
    );

    if (!dmResponse.ok) {
      console.error("Error creando canal DM:", await dmResponse.text());
      return;
    }

    const dmChannel = await dmResponse.json();

    // Crear embed para la notificación
    const embed = {
      title:
        estado === "aprobada"
          ? "✅ Solicitud Aprobada"
          : "❌ Solicitud Denegada",
      description: `Tu solicitud ha sido ${
        estado === "aprobada" ? "aprobada" : "denegada"
      }.`,
      color: estado === "aprobada" ? 0x00ff00 : 0xff0000,
      fields: [
        {
          name: "📋 Detalles de la Solicitud",
          value: `**Nombre:** ${nombreEmpresa}\n**Tipo:** ${tipo}`,
          inline: false,
        },
        {
          name: "👤 Revisado por",
          value: revisadoPor,
          inline: true,
        },
        {
          name:
            estado === "aprobada"
              ? "✅ Motivo de Aprobación"
              : "❌ Motivo de Denegación",
          value: motivo,
          inline: false,
        },
      ],
      footer: {
        text: "MXRP - Sistema de Solicitudes",
      },
      timestamp: new Date().toISOString(),
    };

    // Enviar mensaje DM
    await fetch(
      `https://discord.com/api/v10/channels/${dmChannel.id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      }
    );

    // DM sent to user
  } catch (error) {
    console.error("Error enviando DM:", error);
  }
}
