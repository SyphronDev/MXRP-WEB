const mongoose = require("mongoose");

const ProtocoloSchema = new mongoose.Schema({
  GuildId: String,
  Panel: String,
  PanelId: String,
  Registro: String,
  Server: [
    {
      Servidor: String,
      Protocolo: Number,
      VC: String,
      Sended: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("ProtocoloSchema", ProtocoloSchema);
