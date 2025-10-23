const { connectDB } = require("./utils/database");
const PasaporteSchema = require("./models/PasaporteSchema");
const { authenticateRequest } = require("./utils/jwt");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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

    // Buscar el Pasaporte del usuario
    const pasaporteData = await PasaporteSchema.findOne({
      GuildID: guildId,
      "Bucket.UserId": discordId,
    });

    if (
      !pasaporteData ||
      !pasaporteData.Bucket ||
      pasaporteData.Bucket.length === 0
    ) {
      return {
        statusCode: 200, // Return 200 with null if no data, not 404
        headers,
        body: JSON.stringify({ success: true, pasaporte: null }),
      };
    }

    // Encontrar el pasaporte específico del usuario
    const pasaporte = pasaporteData.Bucket.find(
      (item) => item.UserId === discordId
    );

    if (!pasaporte) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, pasaporte: null }),
      };
    }

    // Preparar los datos de respuesta
    const responseData = {
      success: true,
      pasaporte: {
        userId: pasaporte.UserId,
        robloxName: pasaporte.RobloxName,
        nombre: pasaporte.Nombre,
        apellido: pasaporte.Apellido,
        edad: pasaporte.Edad,
        fechaNacimiento: pasaporte.FechaNacimiento,
        creada: pasaporte.Creada,
        pais: pasaporte.Pais,
        number: pasaporte.Number,
        type: pasaporte.Type,
        pendiente: pasaporte.Pendiente,
        sended: pasaporte.Sended,
        aprobada: pasaporte.Aprobada,
        // Note: Image es Buffer, no lo incluimos en la respuesta por seguridad
      },
    };

    console.log(`Successfully retrieved Pasaporte data for user ${discordId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Pasaporte error:", error);
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
