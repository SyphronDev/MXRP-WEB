/**
 * Utilidades JWT para el cliente
 * Funciones para decodificar y manejar tokens JWT en el navegador
 */

interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Decodifica un JWT sin verificar la firma (solo para leer datos en el cliente)
 * NOTA: Esta función NO verifica la firma. La verificación se hace en el servidor.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Un JWT tiene 3 partes separadas por puntos: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    // Decodificar la parte del payload (segunda parte)
    const payload = parts[1];

    // Decodificar desde base64url
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

/**
 * Obtiene el userId del token JWT almacenado
 */
export function getUserIdFromToken(): string | null {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.userId || null;
}

/**
 * Verifica si el token ha expirado
 */
export function isTokenExpired(): boolean {
  const token = localStorage.getItem("auth_token");
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded) return true;

  // exp está en segundos, Date.now() está en milisegundos
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Obtiene los datos del usuario desde el token JWT
 */
export function getUserFromToken(): {
  userId: string;
  username: string;
  email: string;
} | null {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  return {
    userId: decoded.userId,
    username: decoded.username,
    email: decoded.email,
  };
}
