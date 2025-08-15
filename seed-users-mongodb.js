const mongoose = require('mongoose');
const User = require('./src/models/user.model');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://pdps93:22042483@ppollo.t1gqn93.mongodb.net/coder-ecommerce')
    .then(() => {
        console.log('Conectado a MongoDB Atlas');
        return createSampleUsers();
    })
    .then(() => {
        console.log('Usuarios de prueba creados');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

async function createSampleUsers() {
    // Limpiar usuarios existentes
    await User.deleteMany({});
    
    const sampleUsers = [
        {
            first_name: 'Juan',
            last_name: 'Pérez',
            email: 'juan.perez@email.com'
        },
        {
            first_name: 'María',
            last_name: 'González',
            email: 'maria.gonzalez@email.com'
        },
        {
            first_name: 'Carlos',
            last_name: 'López',
            email: 'carlos.lopez@email.com'
        }
    ];
    
    await User.insertMany(sampleUsers);
    console.log('3 usuarios de prueba insertados');
}
