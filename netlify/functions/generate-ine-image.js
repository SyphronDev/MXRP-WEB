const { connectDB } = require("./utils/database");
const InesSchema = require("./models/InesSchema");
const { loadImage, createCanvas } = require("@napi-rs/canvas");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Inicializar cliente de Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

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
    if (
      !process.env.MONGO_URI ||
      !process.env.GUILD_ID ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SECRET_KEY
    ) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "Server configuration error",
          message: "Database, Guild ID, or Supabase credentials not configured",
        }),
      };
    }

    await connectDB();

    let discordId;
    try {
      const body = JSON.parse(event.body);
      discordId = body.discordId;
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

    if (!discordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Discord ID is required" }),
      };
    }

    const guildId = process.env.GUILD_ID;

    // Buscar el INE del usuario
    const ineData = await InesSchema.findIneByUserId(guildId, discordId);

    if (!ineData || !ineData.Bucket || ineData.Bucket.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          error: "No INE found",
          message: "No tienes INE registrada",
        }),
      };
    }

    const ine = ineData.Bucket[0];

    // Verificar que esté aprobada
    if (!ine.Aprobada) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          error: "INE not approved",
          message: "Tu INE no ha sido aprobada aún",
        }),
      };
    }

    try {
      // Generar imagen de INE
      const imageBuffer = await generateIneImage(ine);

      if (!imageBuffer) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Image generation failed",
            message: "Error al generar la imagen del INE",
          }),
        };
      }

      // Subir a Supabase
      const imageUrl = await uploadImageToSupabase(imageBuffer, discordId);

      if (!imageUrl) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            error: "Upload failed",
            message: "Error al subir la imagen",
          }),
        };
      }

      // Actualizar la URL de la imagen en la base de datos
      await InesSchema.updateIneImageURL(guildId, discordId, imageUrl);

      console.log(
        `Successfully generated and uploaded INE image for user ${discordId}`
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          imageUrl: imageUrl,
          message: "Imagen de INE generada exitosamente",
        }),
      };
    } catch (imageError) {
      console.error("Error generating INE image:", imageError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Image generation error",
          message: imageError.message,
        }),
      };
    }
  } catch (error) {
    console.error("Generate INE image error:", error);
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

/**
 * Genera una imagen de INE usando Canvas
 * @param {Object} ineData - Datos del INE
 * @returns {Promise<Buffer|null>} Buffer de la imagen o null si hay error
 */
async function generateIneImage(ineData) {
  try {
    // Cargar la plantilla de INE desde archivo local
    const templatePath = path.join(
      process.cwd(),
      "public",
      "images",
      "Ine.png"
    );

    // Usar loadImage con la ruta del archivo directamente
    const template = await loadImage(templatePath);

    // Crear canvas con las dimensiones del template
    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext("2d");

    // Dibujar la plantilla completa
    ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    // Configurar fuente para los datos principales
    ctx.font = "bold 50px Arial";
    ctx.fillStyle = "#000000";

    // Dibujar datos del usuario con las posiciones correctas
    ctx.fillText(ineData.Nombre, 600, 530);
    ctx.fillText(ineData.Apellido, 600, 583);
    ctx.fillText(ineData.FechaNacimiento, 600, 730);

    // Configurar fuente más pequeña para CURP
    ctx.font = "bold 40px Arial";
    ctx.fillText(ineData.Curp, 700, 945);

    // Volver a fuente grande para otros datos
    ctx.font = "bold 50px Arial";

    // Mostrar la clave del estado
    ctx.fillText(ineData.Estado, 758, 1023);
    ctx.fillText(`INE${ineData.Number}`, 970, 865);
    ctx.fillText(ineData.Seccion, 1500, 1028);
    ctx.fillText(ineData.Municipio, 1200, 1028);
    ctx.fillText(ineData.Localidad, 825, 1100);

    // Si hay avatar, dibujarlo
    if (ineData.ImageURL) {
      try {
        const avatar = await loadImage(ineData.ImageURL);
        // Dibujar avatar en la posición correcta
        ctx.drawImage(avatar, 126, 435, 400, 400);
      } catch (avatarError) {
        console.warn("Error cargando avatar:", avatarError);
      }
    }

    // Convertir a buffer
    return canvas.toBuffer("image/png");
  } catch (error) {
    console.error("Error generando imagen de INE:", error);
    return null;
  }
}

/**
 * Sube una imagen a Supabase
 * @param {Buffer} imageBuffer - Buffer de la imagen
 * @param {string} userId - ID del usuario
 * @returns {Promise<string|null>} URL pública de la imagen o null si hay error
 */
async function uploadImageToSupabase(imageBuffer, userId) {
  try {
    const filename = `ine_${userId}_${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ines")
      .upload(filename, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      throw new Error("Failed to upload image to Supabase");
    }

    const {
      data: { publicUrl },
      error: urlError,
    } = supabase.storage.from("ines").getPublicUrl(filename);

    if (urlError) {
      console.error("Supabase public URL error:", urlError);
      throw new Error("Failed to get public URL");
    }

    return publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    throw error;
  }
}
