const mongoose = require("mongoose");

const PerfilStaffSchema = new mongoose.Schema({
  GuildId: String,
  Perfiles: [
    {
      UserId: String,
      TiempoTotal: { type: Number, default: 0 },
      Tier: { type: String, default: "No asignado" },
      TiempoContratado: { type: Date, default: null },
      TicketsAtendidos: { type: Number, default: 0 },
      Invitados: { type: Number, default: 0 },
      Inactividad: { type: String, default: "No" },
      Ticket: { type: Number, default: 0 },
      TiempoTotalHoy: { type: Number, default: 0 },
      TiempoTotalBackup: { type: Number, default: 0 },
      TicketsTotales: { type: Number, default: 0 },
      Calificacion: { type: Number, default: 0 },
      RobuxReclamados: { type: Boolean, default: null },
      NotaAdministrativa: [
        {
          Nota: String,
          Aplicado: Date,
          Aplicador: String,
        },
      ],
      WarnAdministrativo: [
        {
          Warn: [
            {
              Warn: String,
              Aplicador: String,
              Aplicado: Date,
            },
          ],
        },
      ],
    },
  ],
});

module.exports = mongoose.model("PerfilStaff", PerfilStaffSchema);

