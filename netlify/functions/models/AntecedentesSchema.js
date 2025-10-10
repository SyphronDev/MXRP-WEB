const mongoose = require("mongoose");

const AntecedentesSchema = new mongoose.Schema({
  GuildId: {
    type: String,
    required: true,
  },
  UserId: {
    type: String,
    required: true,
  },
  Antecedentes: [
    {
      Fecha: {
        type: Date,
        default: Date.now,
      },
      Motivo: {
        type: String,
        required: true,
      },
      ArrestadoPor: {
        type: String,
        required: true,
      },
      ArrestadoPorTag: {
        type: String,
        required: true,
      },
      Canal: {
        type: String,
        required: true,
      },
      Duracion: {
        type: Number,
        default: 0,
      },
      Activo: {
        type: Boolean,
        default: true,
      },
    },
  ],
  TotalArrestos: {
    type: Number,
    default: 0,
  },
  UsuarioPeligroso: {
    type: Boolean,
    default: false,
  },
  FechaUltimoArresto: {
    type: Date,
    default: null,
  },
  FechaCreacion: {
    type: Date,
    default: Date.now,
  },
  FechaActualizacion: {
    type: Date,
    default: Date.now,
  },
});

// Índices para optimizar consultas
AntecedentesSchema.index({ GuildId: 1, UserId: 1 }, { unique: true });
AntecedentesSchema.index({ GuildId: 1, TotalArrestos: -1 });
AntecedentesSchema.index({ GuildId: 1, UsuarioPeligroso: 1 });
AntecedentesSchema.index({ GuildId: 1, "Antecedentes.Fecha": -1 });

// Middleware para actualizar fecha de modificación
AntecedentesSchema.pre("save", function (next) {
  this.FechaActualizacion = new Date();
  next();
});

// Método para agregar un antecedente
AntecedentesSchema.methods.agregarAntecedente = function (antecedente) {
  this.Antecedentes.push(antecedente);
  this.TotalArrestos += 1;
  this.FechaUltimoArresto = new Date();

  // Marcar como usuario peligroso si tiene más de 3 arrestos
  this.UsuarioPeligroso = this.TotalArrestos > 3;

  return this.save();
};

// Método para obtener antecedentes activos
AntecedentesSchema.methods.getAntecedentesActivos = function () {
  return this.Antecedentes.filter((antecedente) => antecedente.Activo);
};

// Método para obtener estadísticas
AntecedentesSchema.methods.getEstadisticas = function () {
  const activos = this.getAntecedentesActivos();
  const ultimoMes = new Date();
  ultimoMes.setMonth(ultimoMes.getMonth() - 1);

  const arrestosUltimoMes = activos.filter(
    (antecedente) => antecedente.Fecha >= ultimoMes
  ).length;

  return {
    totalArrestos: this.TotalArrestos,
    arrestosActivos: activos.length,
    arrestosUltimoMes,
    esUsuarioPeligroso: this.UsuarioPeligroso,
    fechaUltimoArresto: this.FechaUltimoArresto,
  };
};

module.exports = mongoose.model("Antecedentes", AntecedentesSchema);
