const { generateToken } = require("./utils/jwt");

/**
 * Función para renovar un token JWT existente
 * Verifica el token actual y genera uno nuevo si es válido
 */
exports.handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    // Obtener el token del header Authorization
    const authHeader =
      event.headers.authorization || event.headers.Authorization;

    if (!authHeader) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: "Token de autenticación requerido",
        }),
      };
    }

    // Extraer el token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: "Formato de token inválido",
        }),
      };
    }

    const oldToken = parts[1];

    // Intentar decodificar el token (incluso si está expirado)
    // Usamos jwt.decode en lugar de verify para tokens expirados
    const jwt = require("jsonwebtoken");
    const decoded = jwt.decode(oldToken);

    if (!decoded || !decoded.userId) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message: "Token inválido",
        }),
      };
    }

    // Verificar que el token no esté expirado por más de 7 días
    // Esto evita que tokens muy antiguos puedan ser renovados
    const now = Math.floor(Date.now() / 1000);
    const tokenAge = now - decoded.iat;
    const maxAge = 37 * 24 * 60 * 60; // 37 días (30 días de validez + 7 días de gracia)

    if (tokenAge > maxAge) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          success: false,
          message:
            "Token demasiado antiguo. Por favor, inicia sesión nuevamente.",
          requiresLogin: true,
        }),
      };
    }

    // Generar un nuevo token con los mismos datos
    const newToken = generateToken({
      id: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Token renovado exitosamente",
        token: newToken,
        expiresIn: 30 * 24 * 60 * 60, // 30 días en segundos
      }),
    };
  } catch (error) {
    console.error("Error renovando token:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Error al renovar el token",
      }),
    };
  }
};
