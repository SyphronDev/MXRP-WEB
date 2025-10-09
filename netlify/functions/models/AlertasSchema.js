const mongoose = require("mongoose");

const AlertasSchema = new mongoose.Schema(
  {
    GuildId: {
      type: String,
      required: true,
    },
    Registro: String,
    Panel: String,
    Notify: String,
    Status: [
      {
        Servidor: {
          type: String,
          required: true,
        },
        Alerta: {
          type: String,
          required: true,
        },
        MessageId: String,
        Sended: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
AlertasSchema.index({ GuildId: 1 });

module.exports = mongoose.model("AlertasSchema", AlertasSchema);
