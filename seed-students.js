const mongoose = require('mongoose');
const Student = require('./src/models/Student');

// 🎲 DATOS ALEATORIOS PARA GENERAR ESTUDIANTES
const nombres = [
    'Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Laura',
    'Miguel', 'Isabel', 'David', 'Patricia', 'Jorge', 'Rosa', 'Alberto',
    'Elena', 'Francisco', 'Teresa', 'Manuel', 'Pilar', 'Antonio', 'Dolores',
    'Ángel', 'Mercedes', 'Rafael'
];

const apellidos = [
    'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez',
    'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández',
    'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez',
    'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos'
];

const cursos = ['inicial', 'medio', 'avanzado'];

// 🎯 FUNCIÓN PARA GENERAR ESTUDIANTE ALEATORIO
function generarEstudiante(index) {
    const nombre = nombres[Math.floor(Math.random() * nombres.length)];
    const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
    const edad = Math.floor(Math.random() * (45 - 18 + 1)) + 18; // Entre 18 y 45 años
    const curso = cursos[Math.floor(Math.random() * cursos.length)];
    const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${index}@coder.com`;
    
    return {
        nombre,
        apellido,
        edad,
        curso,
        email,
        activo: Math.random() > 0.1 // 90% activos, 10% inactivos
    };
}

// 🚀 FUNCIÓN PRINCIPAL PARA SEMBRAR LA BASE DE DATOS
async function seedStudents() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect('mongodb+srv://pdps93:22042483@ppollo.t1gqn93.mongodb.net/coder-ecommerce?retryWrites=true&w=majority&appName=ppollo');
        
        console.log('🗑️ Limpiando estudiantes existentes...');
        await Student.deleteMany({});
        
        console.log('🎓 Generando 25 estudiantes aleatorios...');
        const estudiantes = [];
        
        for (let i = 1; i <= 25; i++) {
            estudiantes.push(generarEstudiante(i));
        }
        
        console.log('💾 Insertando estudiantes en MongoDB...');
        const result = await Student.insertMany(estudiantes);
        
        console.log(`✅ ${result.length} estudiantes creados exitosamente!`);
        
        // 📊 MOSTRAR ESTADÍSTICAS
        const stats = await Student.aggregate([
            {
                $group: {
                    _id: '$curso',
                    cantidad: { $sum: 1 },
                    edadPromedio: { $avg: '$edad' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        console.log('\n📊 ESTADÍSTICAS POR CURSO:');
        stats.forEach(stat => {
            console.log(`   ${stat._id.toUpperCase()}: ${stat.cantidad} estudiantes (edad promedio: ${Math.round(stat.edadPromedio)} años)`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// 🎯 EJECUTAR EL SCRIPT
seedStudents();
