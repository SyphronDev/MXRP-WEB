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

    const guildId = process.env.GUILD_ID;

    // Buscar todos los usuarios peligrosos
    const usuariosPeligrosos = await AntecedentesSchema.find({
      GuildId: guildId,
      UsuarioPeligroso: true,
    }).sort({ TotalArrestos: -1, FechaUltimoArresto: -1 });

    const usuariosPeligrososData = usuariosPeligrosos.map((usuario) => ({
      userId: usuario.UserId,
      totalArrestos: usuario.TotalArrestos,
      fechaUltimoArresto: usuario.FechaUltimoArresto,
      fechaCreacion: usuario.FechaCreacion,
      antecedentesActivos: usuario.getAntecedentesActivos().length,
      estadisticas: usuario.getEstadisticas(),
    }));

    console.log(
      `Successfully retrieved ${usuariosPeligrososData.length} dangerous users for guild ${guildId}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        usuariosPeligrosos: usuariosPeligrososData,
        totalUsuariosPeligrosos: usuariosPeligrososData.length,
      }),
    };
  } catch (error) {
    console.error("Usuarios peligrosos error:", error);
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
