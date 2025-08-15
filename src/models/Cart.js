const mongoose = require('mongoose');

// PASO 1: Esquema del carrito ANÓNIMO (Opción B)
const cartSchema = mongoose.Schema({
    // Array de productos en el carrito
    products: [{
        // Referencia al producto
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',  // ← Referencia a la colección de productos
            required: true
        },
        // Cantidad que quiere comprar
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad debe ser mayor a 0']  // ← Tu regla de negocio
        }
    }]
}, {
    timestamps: true  // createdAt y updatedAt automáticos
});

// PASO 2: Pre-save Hook - Tu lógica de unificación
cartSchema.pre('save', function(next) {
    // 'this' se refiere al documento del carrito que se va a guardar
    
    // Crear un mapa para agrupar productos por ID
    const productMap = new Map();
    
    // Recorrer todos los productos del carrito
    this.products.forEach(item => {
        const productId = item.product.toString(); // Convertir ObjectId a string
        
        if (productMap.has(productId)) {
            // Si el producto ya existe, SUMAR las cantidades
            productMap.set(productId, productMap.get(productId) + item.quantity);
        } else {
            // Si es nuevo, agregarlo al mapa
            productMap.set(productId, item.quantity);
        }
    });
    
    // Reconstruir el array products sin duplicados
    this.products = Array.from(productMap.entries()).map(([productId, quantity]) => ({
        product: productId,
        quantity: quantity
    }));
    
    next(); // Continuar con el guardado
});

// PASO 3: Exportar el modelo
const cartModel = mongoose.model('Cart', cartSchema);
module.exports = cartModel;
