const mongoose = require("mongoose");

const PasaporteSchema = new mongoose.Schema({
  GuildID: String,
  Registro: String,
  Bucket: [
    {
      UserId: String,
      RobloxName: String,
      Nombre: String,
      Apellido: String,
      Edad: Number,
      FechaNacimiento: String,
      Creada: Date,
      Pais: String,
      Image: Buffer,
      Number: Number,
      Type: { type: String, default: "Bot" },
      Pendiente: { type: Boolean, default: true },
      Sended: { type: Boolean, default: true },
      Aprobada: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Pasaporte", PasaporteSchema);
