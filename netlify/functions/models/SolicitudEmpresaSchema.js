const mongoose = require("mongoose");

const SolicitudEmpresaSchema = new mongoose.Schema(
  {
    // Información del solicitante
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    userTag: {
      type: String,
      required: true,
    },

    // Información de la empresa/facción
    nombreEmpresa: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    dueno: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    funcion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    tipo: {
      type: String,
      required: true,
      enum: [
        "Empresa Legal",
        "Empresa Ilegal",
        "Facción Legal",
        "Facción Ilegal",
      ],
    },
    colorRol: {
      type: String,
      required: true,
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    imagenBanner: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Permitir URLs de Discord y otros servicios de imágenes
          const discordPattern = /^https?:\/\/cdn\.discordapp\.com\/.+$/i;
          const imagePattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i;
          const imgurPattern = /^https?:\/\/i\.imgur\.com\/.+$/i;
          const gyazoPattern = /^https?:\/\/gyazo\.com\/.+$/i;

          return (
            discordPattern.test(v) ||
            imagePattern.test(v) ||
            imgurPattern.test(v) ||
            gyazoPattern.test(v)
          );
        },
        message:
          "Debe ser una URL válida de imagen (Discord, Imgur, Gyazo o archivo de imagen)",
      },
    },
    linkDiscord: {
      type: String,
      required: true,
      match: /^https?:\/\/discord\.(gg|com)\/.+$/i,
    },

    // Estado de la solicitud
    estado: {
      type: String,
      required: true,
      enum: ["pendiente", "aprobada", "denegada"],
      default: "pendiente",
      index: true,
    },

    // Información de revisión
    revisadoPor: {
      userId: String,
      username: String,
      rol: String, // Administrador, Departamento, Supervisor
    },
    fechaRevision: {
      type: Date,
    },
    motivoAprobacion: {
      type: String,
      maxlength: 500,
    },
    motivoDenegacion: {
      type: String,
      maxlength: 500,
    },

    // Información del servidor
    guildId: {
      type: String,
      required: true,
      index: true,
    },

    // Metadatos
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaActualizacion: {
      type: Date,
      default: Date.now,
    },

    // Notificación DM
    dmEnviada: {
      type: Boolean,
      default: false,
    },
    fechaNotificacion: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índices para optimizar consultas
SolicitudEmpresaSchema.index({ userId: 1, estado: 1 });
SolicitudEmpresaSchema.index({ guildId: 1, estado: 1 });
SolicitudEmpresaSchema.index({ fechaCreacion: -1 });

// Método para verificar si el usuario tiene solicitud pendiente
SolicitudEmpresaSchema.statics.tieneSolicitudPendiente = async function (
  userId,
  guildId
) {
  const solicitud = await this.findOne({
    userId,
    guildId,
    estado: "pendiente",
  });
  return !!solicitud;
};

// Método para obtener solicitudes del usuario
SolicitudEmpresaSchema.statics.obtenerSolicitudesUsuario = async function (
  userId,
  guildId
) {
  return await this.find({
    userId,
    guildId,
    estado: { $in: ["pendiente", "aprobada"] },
  }).sort({ fechaCreacion: -1 });
};

// Método para obtener solicitudes pendientes para administradores
SolicitudEmpresaSchema.statics.obtenerSolicitudesPendientes = async function (
  guildId
) {
  return await this.find({
    guildId,
    estado: "pendiente",
  }).sort({ fechaCreacion: -1 });
};

// Método para aprobar solicitud
SolicitudEmpresaSchema.methods.aprobar = async function (
  revisorUserId,
  revisorUsername,
  revisorRol,
  motivo
) {
  this.estado = "aprobada";
  this.revisadoPor = {
    userId: revisorUserId,
    username: revisorUsername,
    rol: revisorRol,
  };
  this.fechaRevision = new Date();
  this.motivoAprobacion = motivo;
  this.fechaActualizacion = new Date();
  this.dmEnviada = false;

  return await this.save();
};

// Método para denegar solicitud (elimina el documento)
SolicitudEmpresaSchema.methods.denegar = async function (
  revisorUserId,
  revisorUsername,
  revisorRol,
  motivo
) {
  // Guardar información del revisor antes de eliminar
  const revisorInfo = {
    userId: revisorUserId,
    username: revisorUsername,
    rol: revisorRol,
  };
  
  // Eliminar el documento de la base de datos
  await this.deleteOne();
  
  // Retornar información para el DM
  return {
    eliminado: true,
    revisorInfo,
    motivo,
    nombreEmpresa: this.nombreEmpresa,
    tipo: this.tipo,
    userId: this.userId
  };
};

// Crear el modelo de Mongoose
const SolicitudEmpresa = mongoose.model(
  "SolicitudEmpresa",
  SolicitudEmpresaSchema
);

module.exports = SolicitudEmpresa;
