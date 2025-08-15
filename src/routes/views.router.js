const express = require('express');
const ProductManager = require('../../managers/ProductManager');
const Product = require('../models/Product'); // ← NUEVO: Importar modelo MongoDB
const Student = require('../models/Student'); // ← NUEVO: Importar modelo Student

const router = express.Router();
const productManager = new ProductManager('./data/products.json');

// GET / - Vista estática de productos (home)
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', {
            title: 'Lista de Productos',
            products: products
        });
    } catch (error) {
        console.error('Error en ruta /:', error);
        res.render('home', {
            title: 'Lista de Productos',
            products: []
        });
    }
});

// GET  - Vista dinámica con WebSockets
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', {
            title: 'Gestión en Tiempo Real',
            products: products
        });
    } catch (error) {
        console.error('Error en ruta /realtimeproducts:', error);
        res.render('realTimeProducts', {
            title: 'Gestión en Tiempo Real',
            products: []
        });
    }
});

// GET /products - Vista CON PAGINACIÓN usando MongoDB
router.get('/products', async (req, res) => {
    try {
        // 📝 PASO 1: Obtener parámetros de query (igual que en la API)
        const limit = parseInt(req.query.limit) || 5;    // 5 productos por página para ver paginación
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort || 'asc';
        const query = req.query.query || '';
        
        // 📝 PASO 2: Calcular skip (misma lógica que en API)
        const skip = (page - 1) * limit;
        
        // 📝 PASO 3: Construir filtro (igual que en API)
        let filter = {};
        if (query) {
            if (query.includes(':')) {
                const [field, value] = query.split(':');
                if (field === 'category') {
                    filter.category = { $regex: value, $options: 'i' };
                }
            } else {
                filter.title = { $regex: query, $options: 'i' };
            }
        }
        
        // 📝 PASO 4: Configurar ordenamiento
        let sortConfig = {};
        if (sort === 'asc') {
            sortConfig.price = 1;
        } else if (sort === 'desc') {
            sortConfig.price = -1;
        }
        
        // 📝 PASO 5: Ejecutar consulta MongoDB (igual que en API)
        const products = await Product.find(filter)
            .sort(sortConfig)
            .skip(skip)
            .limit(limit);
        
        // 📝 PASO 6: Calcular metadatos de paginación
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        // 📝 PASO 7: Preparar datos para la vista
        const paginationData = {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
            limit,
            totalProducts,
            // URLs para los enlaces de navegación
            nextUrl: hasNextPage ? `/products?page=${page + 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
            prevUrl: hasPrevPage ? `/products?page=${page - 1}&limit=${limit}&sort=${sort}&query=${query}` : null
        };
        
        // 📝 PASO 8: Renderizar vista con todos los datos
        res.render('products', {
            title: 'Productos con Paginación',
            products,
            pagination: paginationData,
            currentSort: sort,
            currentQuery: query,
            currentLimit: limit
        });
        
    } catch (error) {
        console.error('Error en ruta /products:', error);
        res.render('products', {
            title: 'Productos con Paginación',
            products: [],
            pagination: { totalPages: 0, currentPage: 1 },
            error: 'Error cargando productos'
        });
    }
});

// GET /students-view - Vista CON PAGINACIÓN de estudiantes (DEMO PRINCIPAL)
router.get('/students-view', async (req, res) => {
    try {
        // 📝 PASO 1: Obtener parámetros (misma lógica que API de estudiantes)
        const limit = parseInt(req.query.limit) || 5;    // 5 estudiantes por página
        const page = parseInt(req.query.page) || 1;
        const sort = req.query.sort || 'asc';
        const query = req.query.query || '';
        
        // 📝 PASO 2: Calcular skip (misma fórmula)
        const skip = (page - 1) * limit;
        
        // 📝 PASO 3: Construir filtro (igual que en API)
        let filter = {};
        if (query) {
            if (query.includes(':')) {
                const [field, value] = query.split(':');
                if (field === 'curso') {
                    filter.curso = value.toLowerCase(); // Buscar curso exacto
                } else if (field === 'edad') {
                    filter.edad = { $gte: parseInt(value) }; // Mayor o igual a la edad
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
        
        // 📝 PASO 5: Ejecutar consulta (misma que en API)
        const students = await Student.find(filter)
            .sort(sortConfig)
            .skip(skip)
            .limit(limit);
        
        // 📝 PASO 6: Calcular metadatos de paginación
        const totalStudents = await Student.countDocuments(filter);
        const totalPages = Math.ceil(totalStudents / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        // 📝 PASO 7: Preparar datos específicos para estudiantes
        const paginationData = {
            currentPage: page,
            totalPages,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
            limit,
            totalStudents,
            // URLs para navegación (manteniendo filtros)
            nextUrl: hasNextPage ? `/students-view?page=${page + 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
            prevUrl: hasPrevPage ? `/students-view?page=${page - 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
            // URLs para filtros rápidos por curso
            inicialUrl: `/students-view?page=1&limit=${limit}&sort=${sort}&query=curso:inicial`,
            medioUrl: `/students-view?page=1&limit=${limit}&sort=${sort}&query=curso:medio`,
            avanzadoUrl: `/students-view?page=1&limit=${limit}&sort=${sort}&query=curso:avanzado`,
            todosUrl: `/students-view?page=1&limit=${limit}&sort=${sort}`
        };
        
        // 📝 PASO 8: Calcular estadísticas por curso
        const estadisticas = await Student.aggregate([
            {
                $group: {
                    _id: '$curso',
                    cantidad: { $sum: 1 },
                    edadPromedio: { $avg: '$edad' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        
        // 📝 PASO 9: Renderizar vista con todos los datos
        res.render('students', {
            title: 'Estudiantes con Paginación',
            students,
            pagination: paginationData,
            estadisticas,
            currentSort: sort,
            currentQuery: query,
            currentLimit: limit,
            // Helper para mostrar curso actual en filtros
            isInicial: query === 'curso:inicial',
            isMedio: query === 'curso:medio',
            isAvanzado: query === 'curso:avanzado'
        });
        
    } catch (error) {
        console.error('Error en ruta /students-view:', error);
        res.render('students', {
            title: 'Estudiantes con Paginación',
            students: [],
            pagination: { totalPages: 0, currentPage: 1 },
            estadisticas: [],
            error: 'Error cargando estudiantes'
        });
    }
});

module.exports = router;