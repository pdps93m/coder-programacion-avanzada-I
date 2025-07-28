const express = require('express');
const ProductManager = require('./managers/ProductManager');
const CartManager = require('./managers/CartManager');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.static('public'));

const productManager = new ProductManager('./data/products.json');
const cartManager = new CartManager('./data/carts.json');

const viewsRouter = require('./src/routes/views.router');
const productsRouter = require('./src/routes/products');
const cartsRouter = require('./src/routes/carts');

app.use('/', viewsRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

server.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
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