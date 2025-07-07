const express = require('express');
const ProductManager = require('../../managers/ProductManager');

const router = express.Router();
const productManager = new ProductManager('./data/products.json');

// GET / - Listar todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.json({
            status: 'success',
            payload: products
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET /:pid - Obtener producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.getProductById(pid);
        
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        res.json({
            status: 'success',
            payload: product
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST / - Agregar nuevo producto
router.post('/', async (req, res) => {
    try {
        const product = await productManager.addProduct(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Producto creado exitosamente',
            payload: product
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT /:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.updateProduct(pid, req.body);
        
        res.json({
            status: 'success',
            message: 'Producto actualizado exitosamente',
            payload: product
        });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
            return res.status(404).json({
                status: 'error',
                message: error.message
            });
        }
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// DELETE /:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await productManager.deleteProduct(pid);
        
        res.json({
            status: 'success',
            message: 'Producto eliminado exitosamente',
            payload: product
        });
    } catch (error) {
        if (error.message === 'Producto no encontrado') {
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
