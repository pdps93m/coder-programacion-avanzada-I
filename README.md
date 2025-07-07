# 🛒 E-commerce API - Entrega N°1

## 📋 Descripción
API REST para la gestión de productos y carritos de compra desarrollada con Node.js y Express.

## 🏗️ Arquitectura
- **Servidor**: Node.js + Express (Puerto 8080)
- **Persistencia**: Sistema de archivos (JSON)
- **Estructura**: MVC con managers y rutas separadas

## 📁 Estructura del Proyecto
```
├── app.js                 # Servidor principal
├── package.json          # Dependencias del proyecto
├── .gitignore            # Archivos ignorados por Git
├── data/                 # Archivos de persistencia
│   ├── products.json     # Base de datos de productos
│   └── carts.json        # Base de datos de carritos
├── managers/             # Lógica de negocio
│   ├── ProductManager.js # Gestor de productos
│   └── CartManager.js    # Gestor de carritos
└── src/
    └── routes/           # Definición de rutas
        ├── products.js   # Rutas de productos
        └── carts.js      # Rutas de carritos
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js instalado
- npm instalado

### Pasos de instalación
1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd coder-programacion-avanzada-I
```

2. Instalar dependencias
```bash
npm install
```

3. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en `http://localhost:8080`

## 📡 Endpoints

### 🛍️ Productos (`/api/products`)
- **GET** `/api/products` - Listar todos los productos
- **GET** `/api/products/:pid` - Obtener producto por ID
- **POST** `/api/products` - Crear nuevo producto
- **PUT** `/api/products/:pid` - Actualizar producto
- **DELETE** `/api/products/:pid` - Eliminar producto

### 🛒 Carritos (`/api/carts`)
- **POST** `/api/carts` - Crear nuevo carrito
- **GET** `/api/carts/:cid` - Obtener productos del carrito
- **POST** `/api/carts/:cid/product/:pid` - Agregar producto al carrito

## 📦 Estructura de Datos

### Producto
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "code": "string",
  "price": "number",
  "status": "boolean",
  "stock": "number",
  "category": "string",
  "thumbnails": ["string"]
}
```

### Carrito
```json
{
  "id": "string",
  "products": [
    {
      "product": "string",
      "quantity": "number"
    }
  ]
}
```

## 🧪 Pruebas
Se recomienda usar Postman o similar para probar los endpoints.

## 🛠️ Tecnologías Utilizadas
- Node.js
- Express.js
- FileSystem (fs)

## 👨‍💻 Desarrollado por
[Pablo Pollo]

## 📄 Licencia
ISC
