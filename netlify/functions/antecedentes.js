const { connectDB } = require("./utils/database");
const AntecedentesSchema = require("./models/AntecedentesSchema");

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

    let discordId;
    try {
      const body = JSON.parse(event.body);
      discordId = body.discordId;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Invalid request body",
          message: "Request body must be valid JSON",
        }),
      };
    }

    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Discord ID is required" }),
      };
    }

    const guildId = process.env.GUILD_ID;

    // Buscar antecedentes del usuario
    const antecedentesData = await AntecedentesSchema.findOne({
      GuildId: guildId,
      UserId: discordId,
    });

    if (!antecedentesData) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          antecedentes: null,
          estadisticas: {
            totalArrestos: 0,
            arrestosActivos: 0,
            arrestosUltimoMes: 0,
            esUsuarioPeligroso: false,
            fechaUltimoArresto: null,
          },
        }),
      };
    }

    // Preparar los datos de respuesta
    const responseData = {
      success: true,
      antecedentes: {
        userId: antecedentesData.UserId,
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
          canal: antecedente.Canal,
          duracion: antecedente.Duracion,
          activo: antecedente.Activo,
        })),
      },
      estadisticas: antecedentesData.getEstadisticas(),
    };

    console.log(
      `Successfully retrieved antecedentes data for user ${discordId}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData),
    };
  } catch (error) {
    console.error("Antecedentes error:", error);
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

