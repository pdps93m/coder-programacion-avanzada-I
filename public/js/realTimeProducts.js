// Conectar con Socket.io
const socket = io();

// Referencias al DOM
const productForm = document.getElementById('productForm');
const productsContainer = document.getElementById('productsContainer');

// Conectar con el servidor
socket.on('connect', () => {
    // Solicitar lista inicial de productos
    socket.emit('requestProducts');
});

// Escuchar cuando llegan productos actualizados
socket.on('updateProducts', (products) => {
    renderProducts(products);
});

// Escuchar mensajes del servidor
socket.on('productAdded', (product) => {
    showNotification(`Producto "${product.title}" agregado exitosamente`, 'success');
});

socket.on('productDeleted', (product) => {
    showNotification(`Producto "${product.title}" eliminado`, 'info');
});

socket.on('error', (error) => {
    console.error('Error:', error);
    showNotification(error.message, 'error');
});

// Manejar envío del formulario
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        status: document.getElementById('status').checked,
        thumbnails: document.getElementById('thumbnail').value ? [document.getElementById('thumbnail').value] : []
    };
    
    // Enviar via WebSocket
    socket.emit('addProduct', formData);
    
    // Limpiar formulario
    productForm.reset();
    document.getElementById('status').checked = true; // Reset checkbox
});

// Función para eliminar producto
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        socket.emit('deleteProduct', productId);
    }
}

// Función para renderizar productos en el DOM
function renderProducts(products) {
    if (!products || products.length === 0) {
        productsContainer.innerHTML = `
            <div class="no-products">
                <p>No hay productos. ¡Agrega el primero usando el formulario!</p>
            </div>
        `;
        return;
    }
    
    const productsGrid = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <h4>${product.title}</h4>
            <p class="description">${product.description}</p>
            <div class="product-info">
                <span class="price">$${product.price}</span>
                <span class="stock">Stock: ${product.stock}</span>
                <span class="category">${product.category}</span>
            </div>
            <p class="code">Código: ${product.code}</p>
            ${product.status ? 
                '<span class="status available">Disponible</span>' : 
                '<span class="status unavailable">No disponible</span>'
            }
            <button class="delete-btn" onclick="deleteProduct('${product.id}')">
                🗑️ Eliminar
            </button>
        </div>
    `).join('');
    
    productsContainer.innerHTML = `
        <div class="products-grid">
            ${productsGrid}
        </div>
    `;
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos básicos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : ''}
        ${type === 'error' ? 'background: #dc3545;' : ''}
        ${type === 'info' ? 'background: #17a2b8;' : ''}
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS para animaciones (se agrega dinámicamente)
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

