const express = require('express');
const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');

const app = express();
const PORT = 8080;

// Middleware para parsear JSON
app.use(express.json());

// Instanciar los managers
const productManager = new ProductManager('./data/products.json');
const cartManager = new CartManager('./data/carts.json');

// Importar rutas
const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');

// Usar las rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'Servidor E-commerce funcionando correctamente',
        endpoints: {
            products: '/api/products',
            carts: '/api/carts'
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = app;
