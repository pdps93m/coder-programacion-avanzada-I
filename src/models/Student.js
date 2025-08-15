const mongoose = require('mongoose');

// 🎓 MODELO STUDENT PARA PRACTICAR PAGINACIÓN Y FILTROS
const studentSchema = new mongoose.Schema({
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
studentSchema.index({ curso: 1 }); // Índice en curso para filtros rápidos
studentSchema.index({ edad: 1 });  // Índice en edad para ordenamiento
studentSchema.index({ nombre: 'text', apellido: 'text' }); // Búsqueda de texto

module.exports = mongoose.model('Student', studentSchema);
