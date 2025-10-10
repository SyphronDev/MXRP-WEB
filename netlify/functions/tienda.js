const { connectDB } = require("./utils/database");
const TiendaSchema = require("./models/TiendaSchema");

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

    // Buscar todas las tiendas del servidor
    const tiendasData = await TiendaSchema.find({
      GuildId: guildId,
    });

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
    const tiendaResponse = {
      success: true,
      tiendas: tiendasData.map((tienda) => ({
        tipo: tienda.Tipo,
        inventario: tienda.Inventario.map((item) => ({
          articulo: item.Articulo,
          cantidad: item.Cantidad,
          unidad: item.Unidad || "x",
          cantidadFormateada: formatQuantity(item.Cantidad, item.Unidad),
          precio: item.Precio,
          identificador: item.Identificador,
          fechaAgregado: item.FechaAgregado,
        })),
        totalItems: tienda.Inventario.length,
        totalValue: tienda.Inventario.reduce(
          (sum, item) => sum + item.Precio * item.Cantidad,
          0
        ),
      })),
    };

    console.log(
      `Successfully retrieved shop data for guild ${guildId}: ${tiendaResponse.tiendas.length} shops`
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tiendaResponse),
    };
  } catch (error) {
    console.error("Tienda error:", error);
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
