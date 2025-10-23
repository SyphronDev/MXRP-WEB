const { connectDB } = require("./utils/database");
const InventarioUsuario = require("./models/InventarioUsuario");
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
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Unauthorized",
          message: authResult.message,
        }),
      };
    }

    // Extraer el userId del usuario autenticado
    const discordId = authResult.user.userId;

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

    // Función para formatear cantidad con unidad
    const formatQuantity = (amount, unit) => {
      if (!unit || unit === "x") {
        return `${Math.round(amount)}x`;
      }
      if (unit === "kg") {
        return `${amount}kg`;
      }
      if (unit === "mg") {
        return `${amount}mg`;
      }
      if (unit === "g") {
        return `${amount}g`;
      }
      return `${Math.round(amount)}x`;
    };

    // Preparar los datos de respuesta
    const inventoryResponse = {
      success: true,
      inventory: inventoryData.Inventario.map((item) => ({
        articulo: item.Articulo,
        cantidad: item.Cantidad,
        unidad: item.Unidad || "x",
        cantidadFormateada: formatQuantity(item.Cantidad, item.Unidad),
        identificador: item.Identificador,
        fechaCompra: item.FechaCompra,
        precioCompra: item.PrecioCompra || 0,
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
