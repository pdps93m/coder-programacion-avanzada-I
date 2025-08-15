const express = require('express');
const User = require('../models/user.model');

const router = express.Router();

// GET - Listar usuarios desde MongoDB
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json({
            status: 'success',
            payload: users,
            message: 'Usuarios desde MongoDB'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// POST - Crear usuario en MongoDB
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({
            status: 'success',
            payload: user,
            message: 'Usuario creado en MongoDB'
        });
    } catch (error) {
        // Manejar error de email duplicado
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// GET por ID - Obtener usuario específico
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado en MongoDB'
            });
        }
        res.json({
            status: 'success',
            payload: user
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// PUT - Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            status: 'success',
            payload: user,
            message: 'Usuario actualizado en MongoDB'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
});

// DELETE - Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuario no encontrado'
            });
        }
        res.json({
            status: 'success',
            payload: user,
            message: 'Usuario eliminado de MongoDB'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

module.exports = router;
