const mongoose = require("mongoose");

const TiendaSchema = new mongoose.Schema({
  GuildId: {
    type: String,
    required: true,
  },
  Tipo: {
    type: String,
    enum: ["legal", "ilegal"],
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
        default: 0,
      },
      Unidad: {
        type: String,
        default: "x",
      },
      Precio: {
        type: Number,
        required: true,
        default: 0,
      },
      Identificador: {
        type: String,
        required: true,
      },
      FechaAgregado: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Índices para búsquedas eficientes
TiendaSchema.index({ GuildId: 1, Tipo: 1 });
TiendaSchema.index({ GuildId: 1, "Inventario.Identificador": 1 });

module.exports = mongoose.model("Tienda", TiendaSchema);
