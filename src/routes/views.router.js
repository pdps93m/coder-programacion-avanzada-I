const express = require('express');
const ProductManager = require('../../managers/ProductManager');
const Product = require('../models/Product'); // ← Importar modelo MongoDB
const Estudiante = require('../models/Estudiante'); // ← Importar modelo Estudiante

const router = express.Router();
const productManager = new ProductManager('./data/products.json');

// GET / - Vista estática de productos usando MongoDB
router.get('/', async (req, res) => {
    try {
        // Obtener productos de MongoDB en lugar del archivo JSON
        const products = await Product.find({ status: true }).limit(50).lean();
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

// GET /shop - Vista exclusiva del carrito
router.get('/shop', async (req, res) => {
    try {
        // Solo renderizar la vista del carrito sin datos de productos
        res.render('shop', {
            title: '� Mi Carrito de Compras'
        });
    } catch (error) {
        console.error('Error en ruta /shop:', error);
        res.render('shop', {
            title: '� Mi Carrito de Compras'
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

// GET /vista-estudiantes - Vista CON PAGINACIÓN de estudiantes (DEMO PRINCIPAL)
router.get('/vista-estudiantes', async (req, res) => {
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
        const estudiantes = await Estudiante.find(filter)
            .sort(sortConfig)
            .skip(skip)
            .limit(limit);
        
        // 📝 PASO 6: Calcular metadatos de paginación
        const totalEstudiantes = await Estudiante.countDocuments(filter);
        const totalPages = Math.ceil(totalEstudiantes / limit);
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
            totalStudents: totalEstudiantes,
            // URLs para navegación (manteniendo filtros)
            nextUrl: hasNextPage ? `/vista-estudiantes?page=${page + 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
            prevUrl: hasPrevPage ? `/vista-estudiantes?page=${page - 1}&limit=${limit}&sort=${sort}&query=${query}` : null,
            // URLs para filtros rápidos por curso
            inicialUrl: `/vista-estudiantes?page=1&limit=${limit}&sort=${sort}&query=curso:inicial`,
            medioUrl: `/vista-estudiantes?page=1&limit=${limit}&sort=${sort}&query=curso:medio`,
            avanzadoUrl: `/vista-estudiantes?page=1&limit=${limit}&sort=${sort}&query=curso:avanzado`,
            todosUrl: `/vista-estudiantes?page=1&limit=${limit}&sort=${sort}`
        };
        
        // 📝 PASO 8: Calcular estadísticas por curso
        const estadisticas = await Estudiante.aggregate([
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
        res.render('estudiantes', {
            title: 'Estudiantes con Paginación',
            estudiantes,
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
        console.error('Error en ruta /vista-estudiantes:', error);
        res.render('estudiantes', {
            title: 'Estudiantes con Paginación',
            estudiantes: [],
            pagination: { totalPages: 0, currentPage: 1 },
            estadisticas: [],
            error: 'Error cargando estudiantes'
        });
    }
});

module.exports = router;