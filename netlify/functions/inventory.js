const { connectDB } = require("./utils/database");
const InventarioUsuario = require("./models/InventarioUsuario");

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

    // Parsear el cuerpo de la petición
    let discordId;
    try {
      const body = JSON.parse(event.body);
      discordId = body.discordId;
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return {
        statusCode: 400,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Invalid request body",
          message: "Request body must be valid JSON",
        }),
      };
    }

    if (!discordId) {
      console.error("Missing discordId in request");
      return {
        statusCode: 400,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Discord ID is required",
        }),
      };
    }

    const guildId = process.env.GUILD_ID;

    // Buscar el inventario del usuario
    const inventoryData = await InventarioUsuario.findOne({
      GuildId: guildId,
      UserId: discordId,
    });

    if (!inventoryData) {
      console.log(
        `No inventory data found for user ${discordId} in guild ${guildId}`
      );
      return {
        statusCode: 200,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: true,
          inventory: [],
          totalItems: 0,
        }),
      };
    }

    // Preparar los datos de respuesta
    const inventoryResponse = {
      success: true,
      inventory: inventoryData.Inventario.map((item) => ({
        articulo: item.Articulo,
        cantidad: item.Cantidad,
        identificador: item.Identificador,
        fechaCompra: item.FechaCompra,
      })),
      totalItems: inventoryData.Inventario.length,
      totalQuantity: inventoryData.Inventario.reduce(
        (sum, item) => sum + item.Cantidad,
        0
      ),
    };

    console.log(
      `Successfully retrieved inventory data for user ${discordId}: ${inventoryResponse.totalItems} items`
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inventoryResponse),
    };
  } catch (error) {
    console.error("Inventory error:", error);
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
