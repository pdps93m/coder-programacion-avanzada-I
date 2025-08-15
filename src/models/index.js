import express from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/user.router.js';

const app = express()
const PORT = 8080;

mongoose.connect('mongodb+srv://pdps93:22042483@ppollo.t1gqn93.mongodb.net/?retryWrites=true&w=majority&appName=ppollo')
.then(() =>{
    console.log('Conexión a mongodb exitosa')
})
.catch(error => {
    console.log(`Error al conectar a MongoDB. Error: ${error}`)
})

app.use(express.json());

app.use('/api/users', userRouter )

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`)
})