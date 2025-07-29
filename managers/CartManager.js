const fs = require('fs').promises;
const path = require('path');

class CartManager {
    constructor(filePath) {
        this.path = filePath;
        this.nextId = 1;
        this.init();
    }

    async init() {
        try {
            const dir = path.dirname(this.path);
            await fs.mkdir(dir, { recursive: true });
            
            // Verificar si el archivo existe
            try {
                await fs.access(this.path);
            } catch {
                // Si no existe, crear archivo con array vacío
                await fs.writeFile(this.path, JSON.stringify([], null, 2));
            }

            // Cargar carritos existentes y establecer nextId
            const carts = await this.getCarts();
            if (carts.length > 0) {
                this.nextId = Math.max(...carts.map(c => parseInt(c.id))) + 1;
            }
        } catch (error) {
            console.error('Error inicializando CartManager:', error);
        }
    }

    async getCarts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error leyendo carritos:', error);
            return [];
        }
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(cart => cart.id == id);
    }

    async createCart() {
        try {
            const carts = await this.getCarts();

            const newCart = {
                id: this.nextId.toString(),
                products: []
            };

            carts.push(newCart);
            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            
            this.nextId++;
            return newCart;
        } catch (error) {
            throw error;
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(c => c.id == cartId);

            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }

            const cart = carts[cartIndex];
            const existingProduct = cart.products.find(p => p.product == productId);

            if (existingProduct) {
                // Si el producto ya existe, incrementar cantidad
                existingProduct.quantity += 1;
            } else {
                // Si no existe, agregarlo con cantidad 1
                cart.products.push({
                    product: productId.toString(),
                    quantity: 1
                });
            }

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return cart;
        } catch (error) {
            throw error;
        }
    }

    async getCartProducts(cartId) {
        try {
            const cart = await this.getCartById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart.products;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CartManager;
