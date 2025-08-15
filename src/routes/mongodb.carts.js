const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// POST - Crear carrito vacío (para cuando usuario agrega primer producto)
router.post('/', async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json({
            status: 'success',
            payload: newCart,
            message: 'Carrito creado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET - Obtener TODOS los carritos (para debugging y administración)
router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find()
            .populate('products.product');
        res.status(200).json({
            status: 'success',
            payload: carts,
            message: 'Carritos obtenidos exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET - Obtener carrito específico CON POPULATE (concepto clave)
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid)
            .populate('products.product'); // ← ¡POPULATE! Trae datos completos del producto
        
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        res.json({
            status: 'success',
            payload: cart,
            message: 'Carrito obtenido exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST - Agregar producto al carrito (tu lógica de unificación funcionará automáticamente)
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity = 1 } = req.body;

        // Verificar que el producto existe
        const product = await Product.findById(pid);
        if (!product) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado'
            });
        }

        // Verificar stock disponible
        if (product.stock < quantity) {
            return res.status(400).json({
                status: 'error',
                message: `Stock insuficiente. Disponible: ${product.stock}`
            });
        }

        // Buscar o crear carrito
        let cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Agregar producto al carrito
        cart.products.push({
            product: pid,
            quantity: parseInt(quantity)
        });

        // Guardar (tu pre-save hook unificará duplicados automáticamente)
        await cart.save();

        // Retornar carrito con productos populados
        const updatedCart = await Cart.findById(cid).populate('products.product');

        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Producto agregado al carrito'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT - Actualizar cantidad de un producto específico en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad debe ser mayor a 0'
            });
        }

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Buscar el producto en el carrito
        const productIndex = cart.products.findIndex(
            item => item.product.toString() === pid
        );

        if (productIndex === -1) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado en el carrito'
            });
        }

        // Verificar stock disponible
        const product = await Product.findById(pid);
        if (product.stock < quantity) {
            return res.status(400).json({
                status: 'error',
                message: `Stock insuficiente. Disponible: ${product.stock}`
            });
        }

        // Actualizar cantidad
        cart.products[productIndex].quantity = parseInt(quantity);
        await cart.save();

        const updatedCart = await Cart.findById(cid).populate('products.product');

        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Cantidad actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// DELETE - Eliminar producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Filtrar para eliminar el producto específico
        const originalLength = cart.products.length;
        cart.products = cart.products.filter(
            item => item.product.toString() !== pid
        );

        if (cart.products.length === originalLength) {
            return res.status(404).json({
                status: 'error',
                message: 'Producto no encontrado en el carrito'
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cid).populate('products.product');

        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Producto eliminado del carrito'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT - Actualizar carrito completo (reemplazar todos los productos)
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({
                status: 'error',
                message: 'Products debe ser un array'
            });
        }

        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // Validar que todos los productos existen
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `Producto ${item.product} no encontrado`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Stock insuficiente para ${product.title}. Disponible: ${product.stock}`
                });
            }
        }

        // Reemplazar productos (tu pre-save hook unificará duplicados automáticamente)
        cart.products = products;
        await cart.save();

        const updatedCart = await Cart.findById(cid).populate('products.product');

        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Carrito actualizado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT - Actualizar carrito completo (reemplazar todos los productos)
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        // 📝 PASO 1: Validar que se envíe el array de productos
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere un array de productos en el body'
            });
        }

        // 📝 PASO 2: Validar estructura de cada producto
        for (const item of products) {
            if (!item.product || !item.quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cada producto debe tener "product" (ID) y "quantity"'
                });
            }
            if (item.quantity < 1) {
                return res.status(400).json({
                    status: 'error',
                    message: 'La cantidad debe ser mayor a 0'
                });
            }
        }

        // 📝 PASO 3: Verificar que el carrito existe
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // 📝 PASO 4: Validar que todos los productos existen y verificar stock
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    status: 'error',
                    message: `Producto ${item.product} no encontrado`
                });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: `Stock insuficiente para ${product.title}. Stock disponible: ${product.stock}`
                });
            }
        }

        // 📝 PASO 5: Reemplazar completamente el array de productos
        // IMPORTANTE: Esto activará el pre-save hook que unifica duplicados
        cart.products = products;
        await cart.save();

        // 📝 PASO 6: Obtener carrito actualizado con populate
        const updatedCart = await Cart.findById(cid).populate('products.product');

        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Carrito actualizado completamente'
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// DELETE - Vaciar carrito completo (eliminar todos los productos)
router.delete('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // 📝 PASO 1: Verificar que el carrito existe
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Carrito no encontrado'
            });
        }

        // 📝 PASO 2: Vaciar el array de productos
        // CONCEPTO: No eliminamos el carrito, solo vaciamos los productos
        cart.products = [];
        await cart.save();

        // 📝 PASO 3: Retornar carrito vacío
        res.json({
            status: 'success',
            payload: cart,
            message: 'Carrito vaciado correctamente'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
