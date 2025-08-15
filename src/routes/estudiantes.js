const express = require('express');
const Estudiante = require('../models/Estudiante');

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
                    filter.activo = value === 'true'; // Convertir string a boolean
                }
            } else {
                // Búsqueda simple por texto en nombre o apellido
                filter.$or = [
                    { nombre: { $regex: query, $options: 'i' } },    // Buscar en nombre (case insensitive)
                    { apellido: { $regex: query, $options: 'i' } }   // Buscar en apellido (case insensitive)
                ];
            }
        }
        
        // 📝 PASO 4: Configurar ordenamiento
        let sortObject = {};
        if (sort === 'asc' || sort === 'desc') {
            sortObject.edad = sort === 'asc' ? 1 : -1; // Ordenar por edad
        } else if (sort === 'nombre') {
            sortObject.nombre = 1; // Ordenar por nombre A-Z
        }
        
        // 📝 PASO 5: Ejecutar consulta principal con filtros, ordenamiento y paginación
        const estudiantes = await Estudiante.find(filter)
            .sort(sortObject)
            .skip(skip)
            .limit(limit)
            .lean(); // .lean() mejora performance al retornar objetos planos
        
        // 📝 PASO 6: Contar total de documentos que coinciden con el filtro
        const totalDocs = await Estudiante.countDocuments(filter);
        
        // 📝 PASO 7: Calcular información de paginación
        const totalPages = Math.ceil(totalDocs / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        const nextPage = hasNextPage ? page + 1 : null;
        const prevPage = hasPrevPage ? page - 1 : null;
        
        // 📝 PASO 8: Construir respuesta con TODOS los metadatos de paginación
        const response = {
            status: 'success',
            payload: estudiantes,
            totalPages,
            prevPage,
            nextPage,
            page,
            hasPrevPage,
            hasNextPage,
            prevLink: hasPrevPage ? `/api/estudiantes?page=${prevPage}&limit=${limit}&sort=${sort}${query ? `&query=${query}` : ''}` : null,
            nextLink: hasNextPage ? `/api/estudiantes?page=${nextPage}&limit=${limit}&sort=${sort}${query ? `&query=${query}` : ''}` : null
        };
        
        res.json(response);
        
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
        const estudiante = new Estudiante(req.body);
        await estudiante.save();
        res.status(201).json({
            status: 'success',
            payload: estudiante,
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
