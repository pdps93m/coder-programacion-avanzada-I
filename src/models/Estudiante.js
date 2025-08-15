const mongoose = require('mongoose');

// 🎓 MODELO ESTUDIANTE PARA PRACTICAR PAGINACIÓN Y FILTROS
const estudianteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    edad: {
        type: Number,
        required: true,
        min: 16,
        max: 80
    },
    curso: {
        type: String,
        required: true,
        enum: ['inicial', 'medio', 'avanzado'], // Solo estos 3 valores permitidos
        lowercase: true // Convertir a minúsculas automáticamente
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    fechaInscripcion: {
        type: Date,
        default: Date.now
    },
    activo: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// 📊 ÍNDICES PARA MEJORAR PERFORMANCE EN CONSULTAS
estudianteSchema.index({ curso: 1 }); // Índice en curso para filtros rápidos
estudianteSchema.index({ edad: 1 });  // Índice en edad para ordenamiento
estudianteSchema.index({ nombre: 'text', apellido: 'text' }); // Búsqueda de texto

module.exports = mongoose.model('Estudiante', estudianteSchema);
