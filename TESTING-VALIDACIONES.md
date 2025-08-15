# TESTING - VALIDACIONES

## Endpoints implementados:

### POST /api/mongodb-products
Crear producto con validaciones

### PUT /api/mongodb-products/:id  
Actualizar producto

### GET /api/mongodb-products/:id
Obtener producto por ID

### DELETE /api/mongodb-products/:id
Eliminar producto

### GET /api/mongodb-products
Listar productos con paginación y filtros

## Ejemplos de testing:

### Producto válido:
```json
{
    "title": "iPhone 16 Pro",
    "description": "Smartphone Apple con tecnología avanzada",
    "code": "IPH16-PRO-001",
    "price": 1299.99,
    "stock": 25,
    "category": "Smartphones"
}
```

### Errores a probar:

1. Datos faltantes
2. Precio negativo
3. Stock negativo  
4. Categoría inválida
5. Código duplicado
6. ID inválido

## Respuestas esperadas:

### Éxito:
```json
{
    "status": "success",
    "payload": { /* producto */ },
    "message": "Producto creado"
}
```

### Error:
```json
{
    "status": "error",
    "message": "Datos inválidos",
    "errors": ["Título requerido"]
}
```
