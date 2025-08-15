const mongoose = require('mongoose');
const Product = require('./src/models/Product');

// Conectar a MongoDB
mongoose.connect('mongodb+srv://pdps93:22042483@ppollo.t1gqn93.mongodb.net/coder-ecommerce')
    .then(() => {
        console.log('Conectado a MongoDB Atlas');
        return createSampleProducts();
    })
    .then(() => {
        console.log('Productos de prueba creados');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });

async function createSampleProducts() {
    // Limpiar productos existentes
    await Product.deleteMany({});
    
    const sampleProducts = [
        {
            title: 'Laptop Gaming',
            description: 'Laptop para gaming de alta gama',
            code: 'LAP001',
            price: 1500,
            status: true,
            stock: 10,
            category: 'Electronics',
            thumbnails: ['laptop1.jpg', 'laptop2.jpg']
        },
        {
            title: 'Mouse Inalámbrico',
            description: 'Mouse ergonómico inalámbrico',
            code: 'MOU001',
            price: 25,
            status: true,
            stock: 50,
            category: 'Accessories',
            thumbnails: ['mouse1.jpg']
        },
        {
            title: 'Teclado Mecánico',
            description: 'Teclado mecánico RGB',
            code: 'KEY001',
            price: 80,
            status: true,
            stock: 30,
            category: 'Accessories',
            thumbnails: ['keyboard1.jpg', 'keyboard2.jpg']
        }
    ];
    
    await Product.insertMany(sampleProducts);
    console.log('3 productos de prueba insertados');
}
