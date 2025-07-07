const fs = require('fs').promises;
const path = require('path');

class ProductManager {
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

            // Cargar productos existentes y establecer nextId
            const products = await this.getProducts();
            if (products.length > 0) {
                this.nextId = Math.max(...products.map(p => parseInt(p.id))) + 1;
            }
        } catch (error) {
            console.error('Error inicializando ProductManager:', error);
        }
    }

    async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error leyendo productos:', error);
            return [];
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id == id);
    }

    async addProduct(product) {
        try {
            // Validar campos requeridos
            const { title, description, code, price, status = true, stock, category, thumbnails = [] } = product;

            if (!title || !description || !code || price === undefined || stock === undefined || !category) {
                throw new Error('Todos los campos son obligatorios excepto thumbnails y status');
            }

            const products = await this.getProducts();

            // Verificar que el código no esté repetido
            if (products.find(p => p.code === code)) {
                throw new Error('El código del producto ya existe');
            }

            const newProduct = {
                id: this.nextId.toString(),
                title,
                description,
                code,
                price: Number(price),
                status: Boolean(status),
                stock: Number(stock),
                category,
                thumbnails
            };

            products.push(newProduct);
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            
            this.nextId++;
            return newProduct;
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, updates) {
        try {
            const products = await this.getProducts();
            const index = products.findIndex(p => p.id == id);

            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            // No permitir actualizar el ID
            delete updates.id;

            // Si se está actualizando el código, verificar que no exista
            if (updates.code) {
                const existingProduct = products.find(p => p.code === updates.code && p.id != id);
                if (existingProduct) {
                    throw new Error('El código del producto ya existe');
                }
            }

            // Actualizar solo los campos proporcionados
            products[index] = { ...products[index], ...updates };

            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            return products[index];
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const products = await this.getProducts();
            const index = products.findIndex(p => p.id == id);

            if (index === -1) {
                throw new Error('Producto no encontrado');
            }

            const deletedProduct = products.splice(index, 1)[0];
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            
            return deletedProduct;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ProductManager;
