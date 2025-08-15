const express = require('express');
const Product = require('../models/Product');
const { validateProductData, validateMongoId } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sort = req.query.sort || 'asc';
    const query = req.query.query || '';
    
    if (limit < 1 || limit > 100) {
        return res.status(400).json({
            status: 'error',
            message: 'Límite inválido'
        });
    }
    
    if (page < 1) {
        return res.status(400).json({
            status: 'error',
            message: 'Página inválida'
        });
    }
    
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (query) {
        if (query.includes(':')) {
            const [field, value] = query.split(':');
            if (field === 'category') {
                filter.category = { $regex: value, $options: 'i' };
            } else if (field === 'price') {
                filter.price = { $lte: parseFloat(value) };
            } else if (field === 'status') {
                filter.status = value === 'true';
            }
        } else {
            filter.title = { $regex: query, $options: 'i' };
        }
    }
    
    let sortConfig = {};
    if (sort === 'asc') {
        sortConfig.price = 1;
    } else if (sort === 'desc') {
        sortConfig.price = -1;
    }
    
    const products = await Product.find(filter)
        .sort(sortConfig)
        .skip(skip)
        .limit(limit);
    
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
        status: 'success',
        payload: products,
        totalPages,
        prevPage: hasPrevPage ? page - 1 : null,
        nextPage: hasNextPage ? page + 1 : null,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink: hasPrevPage ? `/api/mongodb-products?page=${page-1}&limit=${limit}` : null,
        nextLink: hasNextPage ? `/api/mongodb-products?page=${page+1}&limit=${limit}` : null
    });
}));

router.post('/', validateProductData, asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json({
        status: 'success',
        payload: product,
        message: 'Producto creado'
    });
}));

router.get('/:id', validateMongoId, asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
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
}));

router.put('/:id', validateMongoId, validateProductData, asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { new: true, runValidators: true }
    );
    
    if (!product) {
        return res.status(404).json({
            status: 'error',
            message: 'Producto no encontrado'
        });
    }
    
    res.json({
        status: 'success',
        payload: product,
        message: 'Producto actualizado'
    });
}));

router.delete('/:id', validateMongoId, asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({
            status: 'error',
            message: 'Producto no encontrado'
        });
    }
    res.json({
        status: 'success',
        payload: product,
        message: 'Producto eliminado'
    });
}));

module.exports = router;
