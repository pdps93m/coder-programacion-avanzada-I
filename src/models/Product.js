const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 500
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01,
        max: 999999.99
    },
    status: { 
        type: Boolean, 
        default: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['Smartphones', 'Computadoras', 'Tablets', 'Accesorios', 'Audio', 'Gaming', 'Televisores', 'Otros']
    },
    thumbnails: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

productSchema.index({ code: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
