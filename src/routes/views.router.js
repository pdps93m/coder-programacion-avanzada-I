const express = require('express');
const ProductManager = require('../../managers/ProductManager');

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

module.exports = router;