const mongoose = require("mongoose");

const InesSchema = new mongoose.Schema(
  {
    GuildID: String,
    Registro: String,
    Bucket: [
      {
        UserId: {
          type: String,
          index: true,
        },
        RobloxName: {
          type: String,
          index: true,
        },
        Nombre: String,
        Apellido: String,
        Edad: Number,
        Estado: String,
        Municipio: String,
        Curp: String,
        Seccion: String,
        Localidad: String,
        FechaNacimiento: String,
        Creada: {
          type: Date,
          index: true,
        },
        ImageURL: String,
        Number: {
          type: Number,
          index: true,
        },
        Type: {
          type: String,
          default: "Bot",
        },
        Pendiente: {
          type: Boolean,
          default: true,
          index: true,
        },
        Sended: {
          type: Boolean,
          default: true,
        },
        Aprobada: {
          type: Boolean,
          default: false,
          index: true,
        },
        AprobadaPor: {
          type: String,
          default: null,
        },
        AprobadaEn: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

InesSchema.index({ "Bucket.UserId": 1, "Bucket.Pendiente": 1 });
InesSchema.index({ "Bucket.UserId": 1, "Bucket.Aprobada": 1 });

InesSchema.statics.findIneByUserId = async function (guildId, userId) {
  return this.findOne(
    {
      GuildID: guildId,
      "Bucket.UserId": userId,
    },
    {
      "Bucket.$": 1,
    }
  ).lean();
};

InesSchema.statics.updateIneStatus = async function (guildId, userId, status) {
  return this.updateOne(
    {
      GuildID: guildId,
      "Bucket.UserId": userId,
    },
    {
      $set: {
        "Bucket.$.Pendiente": status.pendiente,
        "Bucket.$.Aprobada": status.aprobada,
      },
    }
  );
};

InesSchema.statics.updateIneImageURL = async function (
  guildId,
  userId,
  imageUrl
) {
  return this.updateOne(
    {
      GuildID: guildId,
      "Bucket.UserId": userId,
    },
    {
      $set: {
        "Bucket.$.ImageURL": imageUrl,
      },
    }
  );
};

module.exports = mongoose.model("Ines", InesSchema);
