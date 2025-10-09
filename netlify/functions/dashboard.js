const { connectDB } = require("./utils/database");
const EconomyUser = require("./models/EconomyUser");

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

    // Buscar el usuario en la base de datos
    const economyData = await EconomyUser.findOne({
      GuildId: guildId,
      "Usuario.UserId": discordId,
    });

    if (!economyData) {
      console.log(
        `No economy data found for user ${discordId} in guild ${guildId}`
      );
      return {
        statusCode: 404,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "No economy data found",
          message:
            "No tienes datos de economía registrados. Contacta a un administrador.",
        }),
      };
    }

    // Encontrar los datos específicos del usuario
    const userData = economyData.Usuario.find(
      (user) => user.UserId === discordId
    );

    if (!userData) {
      console.log(`User data not found for ${discordId} in economy document`);
      return {
        statusCode: 404,
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "User data not found",
          message:
            "No tienes datos de economía registrados. Contacta a un administrador.",
        }),
      };
    }

    // Preparar los datos de respuesta
    const dashboardData = {
      success: true,
      user: {
        userId: userData.UserId,
        tipoCuenta: userData.TipoCuenta,
        cuentas: {
          salario: {
            balance: userData.CuentaSalario.Balance,
            activa: userData.CuentaSalario.Activa,
          },
          corriente: {
            balance: userData.CuentaCorriente.Balance,
            activa: userData.CuentaCorriente.Activa,
          },
          gobierno: {
            balance: userData.CuentaGobierno.Balance,
            activa: userData.CuentaGobierno.Activa,
          },
          empresa: {
            balance: userData.CuentaEmpresa.Balance,
            activa: userData.CuentaEmpresa.Activa,
          },
        },
        efectivo: userData.Efectivo,
        dineroNegro: userData.DineroNegro,
        deuda: userData.Deuda,
        divisas: {
          usd: userData.Divisas.USD,
          btc: userData.Divisas.BTC,
        },
        sat: userData.Sat,
        empresarial: userData.Empresarial,
        lastCobro: userData.LastCobro,
      },
      guild: {
        id: economyData.GuildId,
        registro: economyData.Registro,
      },
    };

    console.log(`Successfully retrieved economy data for user ${discordId}`);

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dashboardData),
    };
  } catch (error) {
    console.error("Dashboard error:", error);
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
