const jwt = require("jsonwebtoken");

// Clave secreta para firmar los JWT (debe estar en variables de entorno)
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
const JWT_EXPIRATION = "30d"; // Token válido por 30 días

/**
 * Genera un JWT con los datos del usuario
 * @param {Object} userData - Datos del usuario de Discord
 * @returns {string} JWT firmado
 */
function generateToken(userData) {
  const payload = {
    userId: userData.id,
    username: userData.username,
    email: userData.email,
    iat: Math.floor(Date.now() / 1000),
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verifica y decodifica un JWT
 * @param {string} token - JWT a verificar
 * @returns {Object|null} Datos del usuario si el token es válido, null si no lo es
 */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
}

/**
 * Middleware para validar JWT en las peticiones
 * @param {Object} event - Evento de Netlify Function
 * @returns {Object|null} Usuario autenticado o null si falla la autenticación
 */
function authenticateRequest(event) {
  // Obtener el token del header Authorization
  const authHeader = event.headers.authorization || event.headers.Authorization;

  if (!authHeader) {
    return {
      error: true,
      statusCode: 401,
      message: "Token de autenticación requerido",
    };
  }

  // El formato esperado es: "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return {
      error: true,
      statusCode: 401,
      message: "Formato de token inválido. Use: Bearer <token>",
    };
  }

  const token = parts[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      error: true,
      statusCode: 401,
      message: "Token inválido o expirado",
    };
  }

  // Retornar los datos del usuario autenticado
  return {
    error: false,
    user: {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
    },
  };
}

module.exports = {
  generateToken,
  verifyToken,
  authenticateRequest,
};
