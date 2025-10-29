const { connectDB } = require("./utils/database");
const AlertasSchema = require("./models/AlertasSchema");

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
    // Validar variables de entorno
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI environment variable is not set");
      return {
        statusCode: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Server configuration error",
          message: "Database connection not configured",
        }),
      };
    }

    if (!process.env.GUILD_ID) {
      console.error("GUILD_ID environment variable is not set");
      return {
        statusCode: 500,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Server configuration error",
          message: "Guild ID not configured",
        }),
      };
    }

    // Conectar a la base de datos
    await connectDB();

    const guildId = process.env.GUILD_ID;

    // Buscar las alertas del servidor
    const alertsData = await AlertasSchema.findOne({
      GuildId: guildId,
    });

    if (!alertsData) {
      // No alerts data found
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: true,
          alerts: [],
          totalAlerts: 0,
        }),
      };
    }

    // Preparar los datos de respuesta
    const alertsResponse = {
      success: true,
      alerts: alertsData.Status.map((alert) => ({
        servidor: alert.Servidor,
        alerta: alert.Alerta,
        messageId: alert.MessageId,
        sended: alert.Sended,
      })),
      totalAlerts: alertsData.Status.length,
      activeAlerts: alertsData.Status.filter((alert) => !alert.Sended).length,
      panel: alertsData.Panel,
      notify: alertsData.Notify,
    };

    // Alerts data retrieved successfully

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alertsResponse),
    };
  } catch (error) {
    console.error("Alerts error:", error);
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
