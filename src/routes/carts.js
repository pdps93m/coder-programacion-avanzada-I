const express = require('express');
const CartManager = require('../../managers/CartManager');
const ProductManager = require('../../managers/ProductManager');

const router = express.Router();
const cartManager = new CartManager('./data/carts.json');
const productManager = new ProductManager('./data/products.json');

// POST / - Crear nuevo carrito
router.post('/', async (req, res) => {
    try {
        const cart = await cartManager.createCart();
        res.status(201).json({
            status: 'success',
            message: 'Carrito creado exitosamente',
            payload: cart
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET Obtener productos del carrito
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const products = await cartManager.getCartProducts(cid);
        
        res.json({
            status: 'success',
            payload: products
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        
        // Verifica que el producto existe
        const product = await productManager.getProductById(pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        const cart = await cartManager.addProductToCart(cid, pid);
        
        res.json({
            status: 'success',
            message: 'Producto agregado al carrito exitosamente',
            payload: cart
        });
    } catch (error) {
        if (error.message === 'Carrito no encontrado') {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
