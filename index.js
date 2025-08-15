const express = require('express');
const mongoose = require('mongoose');
const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine({
    helpers: {
        ifEquals: function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        },
        range: function(start, end) {
            const result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        }
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));

const productManager = new ProductManager('./data/products.json');
const cartManager = new CartManager('./data/carts.json');

const viewsRouter = require('./src/routes/views.router');
const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');
const mongoProductsRouter = require('./src/routes/mongodb.products');
const mongoUsersRouter = require('./src/routes/mongodb.user');
const mongoCartsRouter = require('./src/routes/mongodb.carts');
const studentsRouter = require('./src/routes/students');

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/mongodb-products', mongoProductsRouter);
app.use('/api/mongodb-user', mongoUsersRouter);
app.use('/api/mongodb-carts', mongoCartsRouter);
app.use('/api/students', studentsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rechazada:', reason);
    process.exit(1);
});

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://pdps93:22042483@ppollo.t1gqn93.mongodb.net/coder-ecommerce?retryWrites=true&w=majority&appName=ppollo')
    .then(() => {
        console.log('✅ Conectado a MongoDB');
        // Iniciar servidor solo después de conectar a la base de datos
        server.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    });

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    socket.on('requestProducts', async () => {
        try {
            const products = await productManager.getProducts();
            socket.emit('updateProducts', products);
        } catch (error) {
            socket.emit('error', { message: 'Error cargando productos' });
        }
    });

    socket.on('addProduct', async (productData) => {
        try {
            const newProduct = await productManager.addProduct(productData);
            const allProducts = await productManager.getProducts();
            
            io.emit('updateProducts', allProducts);
            io.emit('productAdded', newProduct);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('deleteProduct', async (productId) => {
        try {
            const deletedProduct = await productManager.deleteProduct(productId);
            const allProducts = await productManager.getProducts();
            
            io.emit('updateProducts', allProducts);
            io.emit('productDeleted', deletedProduct);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

module.exports = app;
