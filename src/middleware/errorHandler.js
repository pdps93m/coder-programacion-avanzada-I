const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            status: 'error',
            message: 'Error de validación',
            errors: errors
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return res.status(400).json({
            status: 'error',
            message: `${field} ya existe`,
            errors: [`${value} ya está en uso`]
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            status: 'error',
            message: 'ID inválido'
        });
    }

    return res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
};

const notFoundHandler = (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada'
    });
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
