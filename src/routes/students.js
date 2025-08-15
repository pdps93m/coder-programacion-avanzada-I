const express = require('express');
const Student = require('../models/Student');

const router = express.Router();

// GET - Listar estudiantes con PAGINACIÓN, FILTROS Y ORDENAMIENTO
router.get('/', async (req, res) => {
    try {
        // 📝 PASO 1: Extraer parámetros de query con valores por defecto
        const limit = parseInt(req.query.limit) || 10;  // Default: 10 estudiantes por página
        const page = parseInt(req.query.page) || 1;     // Default: página 1
        const sort = req.query.sort || 'asc';           // Default: orden ascendente por edad
        const query = req.query.query || '';            // Default: sin filtro
        
        // 📝 PASO 2: Calcular cuántos estudiantes saltar
        // Fórmula: skip = (página - 1) × límite
        // Ejemplo: Página 2 con límite 5 → skip = (2-1) × 5 = 5
        const skip = (page - 1) * limit;
        
        // 📝 PASO 3: Construir filtro de búsqueda
        let filter = {};
        if (query) {
            if (query.includes(':')) {
                // Formato avanzado: "curso:inicial", "curso:medio", "curso:avanzado"
                const [field, value] = query.split(':');
                if (field === 'curso') {
                    filter.curso = value.toLowerCase(); // Buscar curso exacto
                } else if (field === 'edad') {
                    filter.edad = { $gte: parseInt(value) }; // Mayor o igual a la edad
                } else if (field === 'activo') {
                    filter.activo = value === 'true'; // Filtrar por estado activo/inactivo
                }
            } else {
                // Búsqueda simple en nombre o apellido
                filter.$or = [
                    { nombre: { $regex: query, $options: 'i' } },
                    { apellido: { $regex: query, $options: 'i' } }
                ];
            }
        }
        
        // 📝 PASO 4: Configurar ordenamiento
        let sortConfig = {};
        if (sort === 'asc') {
            sortConfig.edad = 1;  // Edad ascendente
        } else if (sort === 'desc') {
            sortConfig.edad = -1; // Edad descendente
        } else if (sort === 'nombre') {
            sortConfig.nombre = 1; // Alfabético por nombre
        }
        
        // 📝 PASO 5: Ejecutar consulta con todos los parámetros
        const students = await Student.find(filter)
            .sort(sortConfig)
            .skip(skip)
            .limit(limit);
        
        // 📝 PASO 6: Calcular información de paginación
        const totalStudents = await Student.countDocuments(filter);
        const totalPages = Math.ceil(totalStudents / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        // 📝 PASO 7: Respuesta con metadatos de paginación
        res.json({
            status: 'success',
            payload: students,
            totalPages,
            prevPage: hasPrevPage ? page - 1 : null,
            nextPage: hasNextPage ? page + 1 : null,
            page,
            hasPrevPage,
            hasNextPage,
            totalDocs: totalStudents,
            limit,
            prevLink: hasPrevPage ? `/api/students?page=${page-1}&limit=${limit}` : null,
            nextLink: hasNextPage ? `/api/students?page=${page+1}&limit=${limit}` : null
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET - Obtener estudiante específico por ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Estudiante no encontrado'
            });
        }
        res.json({
            status: 'success',
            payload: student
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST - Crear nuevo estudiante
router.post('/', async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json({
            status: 'success',
            payload: student,
            message: 'Estudiante creado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
