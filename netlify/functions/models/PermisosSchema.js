const mongoose = require("mongoose");

const PermisosSchema = new mongoose.Schema({
  GuildId: String,
  Comite: String,
  Developer: String,
  OficinaAdm: String,
  Administrador: String,
  ProyectManager: String,
  ARH: String,
  AI: String,
  HeadStaff: String,
  SupervisorEtica: String,
  RH: String,
  DepartamentoEtica: String,
  Vinculacion: String,
  Tesoreria: String,
  AuditorTesoreria: String,
  DRVinculacion: String,
  DirectorSoporte: String,
  ControlFac: String,
  CommunitySupport: String,
  CommunityManager: String,
  Moderador: String,
  SoporteTecnico: String,
  Trial: String,
  EquipoAdministrativo: String,
  Auditor: String,
  INE: String,
});

module.exports = mongoose.model("Permisos", PermisosSchema);

