const mongoose = require("mongoose");

const NoticiasSchema = new mongoose.Schema({
  userId: String,
  username: String,
  avatarUrl: String,
  titulo: String,
  descripcion: String,
  imagenUrl: String,
  fields: [
    {
      name: String,
      value: String,
      inline: Boolean,
    },
  ],
  color: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  enviada: {
    type: Boolean,
    default: false,
  },
  messageId: String,
});

module.exports = mongoose.model("Noticias", NoticiasSchema);
