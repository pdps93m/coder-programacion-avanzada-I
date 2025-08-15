const validateProductData = (req, res, next) => {
    const { title, description, code, price, stock, category } = req.body;
    const errors = [];

    if (!title || title.trim() === '') {
        errors.push('Título requerido');
    }
    
    if (!description || description.trim() === '') {
        errors.push('Descripción requerida');
    }
    
    if (!code || code.trim() === '') {
        errors.push('Código requerido');
    }
    
    if (price === undefined || price === null) {
        errors.push('Precio requerido');
    }
    
    if (stock === undefined || stock === null) {
        errors.push('Stock requerido');
    }
    
    if (!category || category.trim() === '') {
        errors.push('Categoría requerida');
    }

    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        errors.push('Precio debe ser mayor a 0');
    }
    
    if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
        errors.push('Stock no puede ser negativo');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Datos inválidos',
            errors: errors
        });
    }

    next();
};

const validateMongoId = (req, res, next) => {
    const { id } = req.params;
    const mongoose = require('mongoose');

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'ID inválido'
        });
    }

    next();
};

module.exports = {
    validateProductData,
    validateMongoId
};
