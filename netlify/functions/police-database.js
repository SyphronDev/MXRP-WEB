const { connectDB } = require("./utils/database");
const AntecedentesSchema = require("./models/AntecedentesSchema");
const { authenticateRequest } = require("./utils/jwt");

// Schema para cargos criminales
const mongoose = require("mongoose");

const CargoCriminalSchema = new mongoose.Schema({
  GuildId: {
    type: String,
    required: true,
  },
  Nombre: {
    type: String,
    required: true,
  },
  Descripcion: {
    type: String,
    required: true,
  },
  Severidad: {
    type: String,
    enum: ["Leve", "Moderado", "Grave", "Muy Grave"],
    required: true,
  },
  TiempoMinimo: {
    type: Number, // en minutos
    required: true,
  },
  TiempoMaximo: {
    type: Number, // en minutos
    required: true,
  },
  MultaMinima: {
    type: Number,
    default: 0,
  },
  MultaMaxima: {
    type: Number,
    default: 0,
  },
  Activo: {
    type: Boolean,
    default: true,
  },
  CreadoPor: {
    type: String,
    required: true,
  },
  FechaCreacion: {
    type: Date,
    default: Date.now,
  },
  FechaActualizacion: {
    type: Date,
    default: Date.now,
  },
});

// Índices
CargoCriminalSchema.index({ GuildId: 1, Activo: 1 });
CargoCriminalSchema.index({ GuildId: 1, Severidad: 1 });

// Middleware para actualizar fecha de modificación
CargoCriminalSchema.pre("save", function (next) {
  this.FechaActualizacion = new Date();
  next();
});

const CargoCriminal = mongoose.model("CargoCriminal", CargoCriminalSchema);

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // Validar JWT - obtener usuario autenticado del token
    const authResult = authenticateRequest(event);
    if (authResult.error) {
      return {
        statusCode: authResult.statusCode,
        headers,
        body: JSON.stringify({
          error: "Unauthorized",
          message: authResult.message,
        }),
      };
    }

    // Extraer el userId del usuario autenticado
    const discordId = authResult.user.userId;

    if (!process.env.MONGO_URI || !process.env.GUILD_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Server configuration error",
          message: "Database or Guild ID not configured",
        }),
      };
    }

    await connectDB();

    const guildId = process.env.GUILD_ID;
    let requestBody;

    try {
      requestBody = JSON.parse(event.body || "{}");
    } catch (parseError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid JSON in request body",
        }),
      };
    }

    const { action, ...data } = requestBody;

    // Verificar permisos policiales solo para acciones que lo requieren
    const actionsRequiringPermission = [
      "getCargos",
      "addCargo",
      "updateCargo",
      "deleteCargo",
      "searchAntecedentes",
      "getUserAntecedentes",
    ];

    if (actionsRequiringPermission.includes(action)) {
      const hasPolicePermission = await checkPolicePermissions(discordId);
      if (!hasPolicePermission) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error: "Access denied",
            message:
              "No tienes permisos para acceder a la base de datos policial",
          }),
        };
      }
    }

    switch (action) {
      case "checkAccess":
        return await checkAccess(discordId, headers);

      case "getCargos":
        return await getCargos(guildId, headers);

      case "addCargo":
        return await addCargo(guildId, data, discordId, headers);

      case "updateCargo":
        return await updateCargo(guildId, data, headers);

      case "deleteCargo":
        return await deleteCargo(guildId, data.cargoId, headers);

      case "searchAntecedentes":
        return await searchAntecedentes(guildId, data, headers);

      case "getUserAntecedentes":
        return await getUserAntecedentes(guildId, data.userId, headers);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: "Invalid action",
            message: "Acción no válida",
          }),
        };
    }
  } catch (error) {
    console.error("Police database error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};

// Función para verificar permisos policiales
async function checkPolicePermissions(discordId) {
  if (!discordId) return false;

  const policeRoles = [
    process.env.PermisoCaptura,
    process.env.PermisoArrestar,
    process.env.PermisoAñadirCargo,
    process.env.PermisoConfiscarDrogas,
  ].filter(Boolean);

  if (policeRoles.length === 0) return false;

  try {
    // Aquí deberías verificar los roles del usuario en Discord
    // Por ahora, asumimos que si tiene uno de estos roles, tiene acceso
    // En una implementación real, necesitarías hacer una llamada a la API de Discord
    return true; // Temporal - implementar verificación real de roles
  } catch (error) {
    console.error("Error checking police permissions:", error);
    return false;
  }
}

// Función para verificar acceso (sin verificar permisos internamente)
async function checkAccess(discordId, headers) {
  try {
    const hasAccess = await checkPolicePermissions(discordId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        hasAccess,
      }),
    };
  } catch (error) {
    console.error("Error checking access:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al verificar acceso",
        message: error.message,
      }),
    };
  }
}

// Obtener todos los cargos criminales
async function getCargos(guildId, headers) {
  try {
    const cargos = await CargoCriminal.find({
      GuildId: guildId,
      Activo: true,
    }).sort({ Severidad: 1, Nombre: 1 });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        cargos: cargos.map((cargo) => ({
          id: cargo._id,
          nombre: cargo.Nombre,
          descripcion: cargo.Descripcion,
          severidad: cargo.Severidad,
          creadoPor: cargo.CreadoPor,
          fechaCreacion: cargo.FechaCreacion,
        })),
      }),
    };
  } catch (error) {
    console.error("Error getting cargos:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al obtener cargos",
        message: error.message,
      }),
    };
  }
}

// Agregar nuevo cargo criminal
async function addCargo(guildId, cargoData, creadoPor, headers) {
  try {
    const { nombre, descripcion, severidad } = cargoData;

    if (!nombre || !descripcion || !severidad) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Datos incompletos",
          message: "Todos los campos obligatorios deben ser completados",
        }),
      };
    }

    const nuevoCargo = new CargoCriminal({
      GuildId: guildId,
      Nombre: nombre,
      Descripcion: descripcion,
      Severidad: severidad,
      TiempoMinimo: 0,
      TiempoMaximo: 0,
      MultaMinima: 0,
      MultaMaxima: 0,
      CreadoPor: creadoPor,
    });

    await nuevoCargo.save();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Cargo criminal agregado exitosamente",
        cargo: {
          id: nuevoCargo._id,
          nombre: nuevoCargo.Nombre,
          descripcion: nuevoCargo.Descripcion,
          severidad: nuevoCargo.Severidad,
          creadoPor: nuevoCargo.CreadoPor,
          fechaCreacion: nuevoCargo.FechaCreacion,
        },
      }),
    };
  } catch (error) {
    console.error("Error adding cargo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al agregar cargo",
        message: error.message,
      }),
    };
  }
}

// Actualizar cargo criminal
async function updateCargo(guildId, cargoData, headers) {
  try {
    const { id, ...updateData } = cargoData;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "ID requerido",
          message: "Se requiere el ID del cargo para actualizar",
        }),
      };
    }

    const cargo = await CargoCriminal.findOneAndUpdate(
      { _id: id, GuildId: guildId },
      updateData,
      { new: true }
    );

    if (!cargo) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Cargo no encontrado",
          message: "El cargo especificado no existe",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Cargo actualizado exitosamente",
        cargo: {
          id: cargo._id,
          nombre: cargo.Nombre,
          descripcion: cargo.Descripcion,
          severidad: cargo.Severidad,
          tiempoMinimo: cargo.TiempoMinimo,
          tiempoMaximo: cargo.TiempoMaximo,
          multaMinima: cargo.MultaMinima,
          multaMaxima: cargo.MultaMaxima,
        },
      }),
    };
  } catch (error) {
    console.error("Error updating cargo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al actualizar cargo",
        message: error.message,
      }),
    };
  }
}

// Eliminar cargo criminal (marcar como inactivo)
async function deleteCargo(guildId, cargoId, headers) {
  try {
    if (!cargoId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "ID requerido",
          message: "Se requiere el ID del cargo para eliminar",
        }),
      };
    }

    const cargo = await CargoCriminal.findOneAndUpdate(
      { _id: cargoId, GuildId: guildId },
      { Activo: false },
      { new: true }
    );

    if (!cargo) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "Cargo no encontrado",
          message: "El cargo especificado no existe",
        }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Cargo eliminado exitosamente",
      }),
    };
  } catch (error) {
    console.error("Error deleting cargo:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al eliminar cargo",
        message: error.message,
      }),
    };
  }
}

// Buscar usuarios con antecedentes
async function searchAntecedentes(guildId, searchData, headers) {
  try {
    const { query, limit = 50 } = searchData;

    let searchFilter = { GuildId: guildId };

    if (query) {
      // Buscar por ID de usuario
      searchFilter.UserId = { $regex: query, $options: "i" };
    }

    const antecedentes = await AntecedentesSchema.find(searchFilter)
      .sort({ FechaUltimoArresto: -1 })
      .limit(parseInt(limit));

    // Obtener información de usuarios de Discord
    const resultsWithUsernames = await Promise.all(
      antecedentes.map(async (antecedente) => {
        const userInfo = await fetchDiscordUser(antecedente.UserId);
        return {
          userId: antecedente.UserId,
          username: userInfo?.username || "Usuario Desconocido",
          userTag: userInfo?.tag || antecedente.UserId,
          totalArrestos: antecedente.TotalArrestos,
          usuarioPeligroso: antecedente.UsuarioPeligroso,
          fechaUltimoArresto: antecedente.FechaUltimoArresto,
          estadisticas: antecedente.getEstadisticas(),
        };
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        resultados: resultsWithUsernames,
        total: resultsWithUsernames.length,
      }),
    };
  } catch (error) {
    console.error("Error searching antecedentes:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al buscar antecedentes",
        message: error.message,
      }),
    };
  }
}

// Función auxiliar para obtener información del usuario de Discord
async function fetchDiscordUser(userId) {
  try {
    if (!process.env.DISCORD_BOT_TOKEN) {
      return null;
    }

    const response = await fetch(
      `https://discord.com/api/v10/users/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (response.ok) {
      const userData = await response.json();
      return {
        username: userData.username,
        discriminator: userData.discriminator,
        tag:
          userData.discriminator === "0"
            ? userData.username
            : `${userData.username}#${userData.discriminator}`,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching Discord user:", error);
    return null;
  }
}

// Obtener antecedentes específicos de un usuario
async function getUserAntecedentes(guildId, userId, headers) {
  try {
    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "ID de usuario requerido",
          message: "Se requiere el ID del usuario",
        }),
      };
    }

    const antecedentesData = await AntecedentesSchema.findOne({
      GuildId: guildId,
      UserId: userId,
    });

    if (!antecedentesData) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          antecedentes: null,
          message: "Usuario sin antecedentes",
        }),
      };
    }

    // Obtener información del usuario de Discord
    const userInfo = await fetchDiscordUser(userId);

    const responseData = {
      success: true,
      antecedentes: {
        userId: antecedentesData.UserId,
        username: userInfo?.username || "Usuario Desconocido",
        userTag: userInfo?.tag || userId,
        totalArrestos: antecedentesData.TotalArrestos,
        usuarioPeligroso: antecedentesData.UsuarioPeligroso,
        fechaUltimoArresto: antecedentesData.FechaUltimoArresto,
        fechaCreacion: antecedentesData.FechaCreacion,
        fechaActualizacion: antecedentesData.FechaActualizacion,
        antecedentes: antecedentesData.Antecedentes.map((antecedente) => ({
          fecha: antecedente.Fecha,
          motivo: antecedente.Motivo,
          arrestadoPor: antecedente.ArrestadoPor,
          arrestadoPorTag: antecedente.ArrestadoPorTag,
          duracion: antecedente.Duracion,
          activo: antecedente.Activo,
        })),
      },
      estadisticas: antecedentesData.getEstadisticas(),
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Error getting user antecedentes:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Error al obtener antecedentes del usuario",
        message: error.message,
      }),
    };
  }
}
