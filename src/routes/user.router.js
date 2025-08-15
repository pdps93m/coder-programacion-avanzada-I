const express = require('express');
const userModel = require('../models/user.model');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const users = await userModel.find();
        res.status(200).json({
            status: 'success',
            payload: users,
            message: 'Usuarios obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: "Error get users", 
            error: error.message 
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const newUser = new userModel({ first_name, last_name, email });
        await newUser.save();
        res.status(201).json({
            status: 'success',
            payload: newUser,
            message: 'Usuario creado correctamente'
        });
    } catch (error) {
        // Manejar error de email duplicado
        if (error.code === 11000) {
            return res.status(400).json({
                status: 'error',
                message: 'El email ya está registrado'
            });
        }
        res.status(500).json({ 
            status: 'error',
            message: "Error creating user", 
            error: error.message 
        });
    }
});

router.put('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const { first_name, last_name, email } = req.body;
        const user = await userModel.findOne({ _id: uid })
        if (!user) { 
            return res.status(404).json({ message: 'usuario no encontrado'})
        }

        if (first_name) user.first_name = first_name
        if (last_name) user.last_name = last_name 
        if (email) user.email = email

        await user.save()
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }    
})        
        

router.delete('/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const deletedUser = await userModel.deleteOne({ _id: uid });
        if (deletedUser.deletedCount > 0) {
            res.status(200).json({ message: "Eliminado correctamente" });
        } else {
            res.status(404).json({message: "Usuario no encontrado"})
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
})

export default router;