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
      match: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
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

// Método para denegar solicitud
SolicitudEmpresaSchema.methods.denegar = async function (
  revisorUserId,
  revisorUsername,
  revisorRol,
  motivo
) {
  this.estado = "denegada";
  this.revisadoPor = {
    userId: revisorUserId,
    username: revisorUsername,
    rol: revisorRol,
  };
  this.fechaRevision = new Date();
  this.motivoDenegacion = motivo;
  this.fechaActualizacion = new Date();
  this.dmEnviada = false;

  return await this.save();
};

module.exports = SolicitudEmpresaSchema;
