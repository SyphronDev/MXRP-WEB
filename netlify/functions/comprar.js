const { connectDB } = require("./utils/database");
const TiendaSchema = require("./models/TiendaSchema");
const InventarioUsuario = require("./models/InventarioUsuario");
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

    // Parsear el cuerpo de la petición
    let { discordId, articulo, cantidad, unidad, tipoTienda } = {};
    try {
      const body = JSON.parse(event.body);
      discordId = body.discordId;
      articulo = body.articulo;
      cantidad = body.cantidad;
      unidad = body.unidad || "x";
      tipoTienda = body.tipoTienda;
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

    if (!discordId || !articulo || !cantidad || !tipoTienda) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "Missing required fields",
          message: "discordId, articulo, cantidad, and tipoTienda are required",
        }),
      };
    }

    const guildId = process.env.GUILD_ID;

    // Buscar el artículo en la tienda
    const tiendaData = await TiendaSchema.findOne({
      GuildId: guildId,
      Tipo: tipoTienda,
      "Inventario.Articulo": articulo,
    });

    if (!tiendaData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Item not found",
          message: "El artículo no está disponible en la tienda",
        }),
      };
    }

    const item = tiendaData.Inventario.find(
      (invItem) => invItem.Articulo === articulo
    );

    if (!item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Item not found",
          message: "El artículo no está disponible",
        }),
      };
    }

    // Función para convertir unidades a la unidad base del artículo
    const convertToBaseUnit = (amount, fromUnit, toUnit) => {
      if (fromUnit === toUnit) return amount;

      // Convertir todo a gramos para comparación
      let fromGrams = amount;
      if (fromUnit === "kg") fromGrams = amount * 1000;
      if (fromUnit === "mg") fromGrams = amount / 1000;

      let toGrams = 1;
      if (toUnit === "kg") toGrams = 1000;
      if (toUnit === "mg") toGrams = 0.001;

      return fromGrams / toGrams;
    };

    // Convertir la cantidad solicitada a la unidad del artículo
    const cantidadEnUnidadArticulo = convertToBaseUnit(
      cantidad,
      unidad,
      item.Unidad
    );

    if (item.Cantidad < cantidadEnUnidadArticulo) {
      // Calcular cantidad máxima disponible en la unidad solicitada
      let cantidadMaximaEnUnidadSolicitada = item.Cantidad;
      if (item.Unidad === "kg" && unidad === "g")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad * 1000;
      if (item.Unidad === "g" && unidad === "kg")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad / 1000;
      if (item.Unidad === "mg" && unidad === "g")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad / 1000;
      if (item.Unidad === "g" && unidad === "mg")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad * 1000;
      if (item.Unidad === "kg" && unidad === "mg")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad * 1000000;
      if (item.Unidad === "mg" && unidad === "kg")
        cantidadMaximaEnUnidadSolicitada = item.Cantidad / 1000000;

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Insufficient stock",
          message: `No hay suficiente stock disponible. Máximo: ${cantidadMaximaEnUnidadSolicitada}${unidad}`,
        }),
      };
    }

    const costoTotal = item.Precio * cantidadEnUnidadArticulo;

    // Buscar los datos de economía del usuario
    const economyData = await EconomyUser.findOne({
      GuildId: guildId,
      "Usuario.UserId": discordId,
    });

    if (!economyData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Economy data not found",
          message: "No tienes datos de economía registrados",
        }),
      };
    }

    const usuario = economyData.Usuario.find(
      (user) => user.UserId === discordId
    );

    if (!usuario) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "User not found",
          message: "Usuario no encontrado en la economía",
        }),
      };
    }

    // Verificar si tiene suficiente dinero
    const dineroDisponible = usuario.CuentaCorriente.Balance + usuario.Efectivo;
    if (dineroDisponible < costoTotal) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Insufficient funds",
          message: "No tienes suficiente dinero para esta compra",
        }),
      };
    }

    // Realizar la compra
    let dineroRestante = costoTotal;

    // Primero usar dinero de la cuenta corriente
    if (usuario.CuentaCorriente.Balance >= dineroRestante) {
      usuario.CuentaCorriente.Balance -= dineroRestante;
      dineroRestante = 0;
    } else {
      dineroRestante -= usuario.CuentaCorriente.Balance;
      usuario.CuentaCorriente.Balance = 0;
    }

    // Luego usar efectivo si es necesario
    if (dineroRestante > 0) {
      usuario.Efectivo -= dineroRestante;
    }

    // Marcar el documento como modificado para forzar la actualización
    economyData.markModified("Usuario");

    // Actualizar stock en la tienda
    item.Cantidad -= cantidadEnUnidadArticulo;

    // Buscar o crear inventario del usuario
    let inventarioData = await InventarioUsuario.findOne({
      GuildId: guildId,
      UserId: discordId,
    });

    if (!inventarioData) {
      inventarioData = new InventarioUsuario({
        GuildId: guildId,
        UserId: discordId,
        Inventario: [],
      });
    }

    // Buscar si el usuario ya tiene este artículo con la misma unidad
    const articuloExistente = inventarioData.Inventario.find(
      (invItem) =>
        invItem.Articulo.toLowerCase() === articulo.toLowerCase() &&
        invItem.Unidad === item.Unidad
    );

    if (articuloExistente) {
      // Si existe, sumar la cantidad
      articuloExistente.Cantidad += cantidadEnUnidadArticulo;
    } else {
      // Si no existe, añadir nuevo artículo
      inventarioData.Inventario.push({
        Articulo: articulo,
        Cantidad: cantidadEnUnidadArticulo,
        Unidad: item.Unidad,
        Identificador: item.Identificador,
        FechaCompra: new Date(),
        PrecioCompra: item.Precio,
      });
    }

    // Guardar cambios
    await economyData.save();
    await tiendaData.save();
    await inventarioData.save();

    console.log(
      `Successful purchase: User ${discordId} bought ${cantidad}${unidad} ${articulo} for ${costoTotal}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Compra realizada exitosamente",
        compra: {
          articulo: articulo,
          cantidad: cantidad,
          unidadComprada: unidad,
          cantidadEnInventario: cantidadEnUnidadArticulo,
          unidadInventario: item.Unidad,
          precioUnitario: item.Precio,
          costoTotal: costoTotal,
          dineroRestante: usuario.CuentaCorriente.Balance + usuario.Efectivo,
        },
      }),
    };
  } catch (error) {
    console.error("Comprar error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
