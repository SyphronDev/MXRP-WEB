const mongoose = require("mongoose");

const EconomyUserSchema = new mongoose.Schema(
  {
    GuildId: {
      type: String,
      required: true,
    },
    Registro: String,
    RolSat: String,
    RolAct: String,
    Salario2k: String,
    Salario5k: String,
    Salario7k: String,
    Salario10k: String,
    Salario15k: String,
    Salario20k: String,
    Salario25k: String,
    Usuario: [
      {
        UserId: {
          type: String,
          required: true,
        },
        TipoCuenta: {
          type: String,
          enum: ["personal", "gobierno", "empresarial"],
          default: "personal",
        },
        CuentaSalario: {
          Balance: { type: Number, default: 0 },
          Activa: { type: Boolean, default: true },
        },
        CuentaCorriente: {
          Balance: { type: Number, default: 0 },
          Activa: { type: Boolean, default: true },
        },
        CuentaGobierno: {
          Balance: { type: Number, default: 0 },
          Activa: { type: Boolean, default: false },
        },
        CuentaEmpresa: {
          Balance: { type: Number, default: 0 },
          Activa: { type: Boolean, default: false },
        },
        Efectivo: { type: Number, default: 0 },
        DineroNegro: { type: Number, default: 0 },
        Deuda: { type: Number, default: 0 },
        LastCobro: Date,
        Sat: { type: Boolean, default: false },
        Empresarial: { type: Boolean, default: false },
        Divisas: {
          USD: { type: Number, default: 0 },
          BTC: { type: Number, default: 0 },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para búsquedas eficientes
EconomyUserSchema.index({ GuildId: 1, "Usuario.UserId": 1 });

module.exports = mongoose.model("newTest", EconomyUserSchema);
