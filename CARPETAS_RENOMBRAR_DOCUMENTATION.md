# Documentación: Renombrar Carpetas

## Descripción

La funcionalidad de renombrar carpetas permite cambiar el nombre de una carpeta específica tanto en la base de datos como en el almacenamiento MinIO. Esta operación es recursiva, lo que significa que también actualiza las rutas de todas las subcarpetas y documentos asociados.

## Endpoint

### PUT `/carpetas/:id/renombrar`

Renombra una carpeta específica por su ID.

#### Parámetros de URL
- `id` (string, requerido): ID de la carpeta a renombrar

#### Cuerpo de la petición
```json
{
  "nuevo_nombre": "string (máximo 255 caracteres)",
  "usuario_modificador": "number (ID del usuario que realiza el cambio)"
}
```

#### Respuesta exitosa (200)
```json
{
  "id": 1,
  "nombre": "Nuevo Nombre",
  "descripcion": "Descripción de la carpeta",
  "carpeta_padre_id": null,
  "proyecto_id": 1,
  "s3_path": "proyectos/mi-proyecto/nuevo-nombre",
  "s3_bucket_name": "gestor-files",
  "s3_created": true,
  "orden_visualizacion": 1,
  "max_tamaño_mb": 100,
  "tipos_archivo_permitidos": ["pdf", "doc", "docx"],
  "permisos_lectura": ["admin", "usuario"],
  "permisos_escritura": ["admin"],
  "usuario_creador": 1,
  "fecha_creacion": "2024-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2024-01-02T00:00:00.000Z",
  "activa": true,
  "message": "Carpeta renombrada exitosamente de \"Nombre Anterior\" a \"Nuevo Nombre\""
}
```

#### Respuestas de error

**400 - Bad Request**
```json
{
  "message": "Usuario modificador no encontrado"
}
```
```json
{
  "message": "El nuevo nombre no puede estar vacío"
}
```
```json
{
  "message": "Ya existe una carpeta con ese nombre en el mismo nivel"
}
```

**404 - Not Found**
```json
{
  "message": "Carpeta no encontrada"
}
```

**500 - Internal Server Error**
```json
{
  "message": "Error renombrando carpeta en el almacenamiento"
}
```
```json
{
  "message": "Error interno del servidor"
}
```

## Funcionalidades

### 1. Validaciones
- Verifica que la carpeta existe
- Valida que el usuario modificador existe
- Asegura que el nuevo nombre no esté vacío
- Verifica que no exista otra carpeta con el mismo nombre en el mismo nivel

### 2. Actualización en MinIO
- Renombra la carpeta en el almacenamiento MinIO
- Copia todos los objetos de la carpeta antigua a la nueva ubicación
- Elimina la carpeta antigua después de la copia exitosa

### 3. Actualización en Base de Datos
- Actualiza el nombre de la carpeta principal
- Recalcula la ruta S3 basada en la nueva estructura
- Actualiza recursivamente todas las subcarpetas
- Actualiza las rutas S3 de todos los documentos asociados

### 4. Actualización Recursiva
La función actualiza automáticamente:
- Todas las subcarpetas directas e indirectas
- Todos los documentos en la carpeta y sus subcarpetas
- Las rutas S3 de todos los elementos afectados

## Ejemplo de uso

### cURL
```bash
curl -X PUT "http://localhost:3333/carpetas/1/renombrar" \
  -H "Content-Type: application/json" \
  -d '{
    "nuevo_nombre": "Documentos 2024",
    "usuario_modificador": 1
  }'
```

### JavaScript/Fetch
```javascript
const response = await fetch('/carpetas/1/renombrar', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nuevo_nombre: 'Documentos 2024',
    usuario_modificador: 1
  })
});

const result = await response.json();
console.log(result);
```

## Consideraciones importantes

1. **Operación atómica**: La operación se realiza de manera atómica. Si falla en cualquier punto, se revierten los cambios.

2. **Tiempo de procesamiento**: Para carpetas con muchos archivos o subcarpetas, la operación puede tomar tiempo debido a la copia de archivos en MinIO.

3. **Permisos**: Asegúrate de que el usuario tenga permisos para modificar la carpeta y sus contenidos.

4. **Espacio en disco**: La operación requiere espacio temporal para copiar los archivos antes de eliminar la carpeta original.

5. **Logs**: Todas las operaciones se registran en los logs del servidor para auditoría.

## Estructura de carpetas antes y después

### Antes
```
proyectos/mi-proyecto/
├── carpeta-antigua/
│   ├── documento1.pdf
│   ├── subcarpeta/
│   │   └── documento2.docx
│   └── documento3.txt
```

### Después
```
proyectos/mi-proyecto/
├── nueva-carpeta/
│   ├── documento1.pdf
│   ├── subcarpeta/
│   │   └── documento2.docx
│   └── documento3.txt
```

## Manejo de errores

La funcionalidad incluye manejo robusto de errores:

- **Carpeta no encontrada**: Retorna 404
- **Usuario inválido**: Retorna 400
- **Nombre duplicado**: Retorna 400
- **Error en MinIO**: Retorna 500
- **Error en base de datos**: Retorna 500

Todos los errores incluyen mensajes descriptivos para facilitar la depuración. 