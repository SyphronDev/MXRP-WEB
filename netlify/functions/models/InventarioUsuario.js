const mongoose = require("mongoose");

const InventarioUsuarioSchema = new mongoose.Schema(
  {
    GuildId: {
      type: String,
      required: true,
    },
    UserId: {
      type: String,
      required: true,
    },
    Inventario: [
      {
        Articulo: {
          type: String,
          required: true,
        },
        Cantidad: {
          type: Number,
          required: true,
          default: 1,
        },
        Identificador: {
          type: String,
          required: true,
        },
        FechaCompra: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
InventarioUsuarioSchema.index({ GuildId: 1, UserId: 1 });

module.exports = mongoose.model("InventarioUsuario", InventarioUsuarioSchema);
