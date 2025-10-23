const { connectDB } = require("./utils/database");
const InesSchema = require("./models/InesSchema");
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

    // Buscar el INE del usuario usando el método estático
    const ineData = await InesSchema.findIneByUserId(guildId, discordId);

    if (!ineData || !ineData.Bucket || ineData.Bucket.length === 0) {
      return {
        statusCode: 200, // Return 200 with null if no data, not 404
        headers,
        body: JSON.stringify({ success: true, ine: null }),
      };
    }

    const ine = ineData.Bucket[0]; // El método estático ya filtra por userId

    // Preparar los datos de respuesta
    const responseData = {
      success: true,
      ine: {
        userId: ine.UserId,
        robloxName: ine.RobloxName,
        nombre: ine.Nombre,
        apellido: ine.Apellido,
        edad: ine.Edad,
        estado: ine.Estado,
        municipio: ine.Municipio,
        curp: ine.Curp,
        seccion: ine.Seccion,
        localidad: ine.Localidad,
        fechaNacimiento: ine.FechaNacimiento,
        creada: ine.Creada,
        imageUrl: ine.ImageURL,
        number: ine.Number,
        type: ine.Type,
        pendiente: ine.Pendiente,
        sended: ine.Sended,
        aprobada: ine.Aprobada,
        aprobadaPor: ine.AprobadaPor,
        aprobadaEn: ine.AprobadaEn,
        canGenerateImage: ine.Aprobada && !ine.Pendiente, // Solo puede generar imagen si está aprobada
      },
    };

    console.log(`Successfully retrieved INE data for user ${discordId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("INE error:", error);
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
