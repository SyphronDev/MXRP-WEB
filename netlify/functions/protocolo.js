const { connectDB } = require("./utils/database");
const ProtocoloSchema = require("./models/ProtocoloSchema");

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

    const protocoloData = await ProtocoloSchema.findOne({
      GuildId: guildId,
    });

    if (
      !protocoloData ||
      !protocoloData.Server ||
      protocoloData.Server.length === 0
    ) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, protocolos: [] }),
      };
    }

    const protocolos = protocoloData.Server.map((server) => ({
      servidor: server.Servidor,
      protocolo: server.Protocolo,
      vc: server.VC,
      sended: server.Sended,
    }));

    console.log(`Successfully retrieved protocol data for guild ${guildId}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, protocolos }),
    };
  } catch (error) {
    console.error("Protocolo error:", error);
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
