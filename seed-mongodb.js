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
            title: 'Laptop Gamer ASUS ROG',
            description: 'Laptop para juegos de alta gama con RTX 4080, 32GB RAM, procesador Intel i9',
            code: 'LAP001',
            price: 2499.99,
            status: true,
            stock: 8,
            category: 'Computadoras',
            thumbnails: ['laptop1.jpg', 'laptop2.jpg']
        },
        {
            title: 'Mouse Logitech MX Master 3',
            description: 'Mouse ergonómico inalámbrico con precisión avanzada y batería de larga duración',
            code: 'MOU001',
            price: 89.99,
            status: true,
            stock: 25,
            category: 'Accesorios',
            thumbnails: ['mouse1.jpg']
        },
        {
            title: 'Teclado Mecánico Corsair K95',
            description: 'Teclado mecánico RGB con interruptores Cherry MX y teclas programables',
            code: 'KEY001',
            price: 179.99,
            status: true,
            stock: 15,
            category: 'Accesorios',
            thumbnails: ['keyboard1.jpg']
        },
        {
            title: 'iPhone 15 Pro Max',
            description: 'Teléfono inteligente Apple con procesador A17 Pro, cámara de 48MP, 256GB de almacenamiento y batería de larga duración',
            code: 'IPH001',
            price: 1199.99,
            status: true,
            stock: 12,
            category: 'Smartphones',
            thumbnails: ['iphone1.jpg', 'iphone2.jpg']
        },
        {
            title: 'Samsung Smart TV 65" 4K',
            description: 'Televisor inteligente 4K Ultra HD de 65 pulgadas con HDR, sistema Tizen y sonido Dolby Digital',
            code: 'TV001',
            price: 899.99,
            status: true,
            stock: 6,
            category: 'Televisores',
            thumbnails: ['tv1.jpg', 'tv2.jpg']
        }
    ];
    
    await Product.insertMany(sampleProducts);
    console.log('✅ 5 productos de prueba insertados correctamente');
}
