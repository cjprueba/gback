# Especificación de Versión en Descarga de Documentos

## Descripción

Se ha agregado la funcionalidad para especificar la versión exacta de un documento al descargarlo como base64. Esto permite a los usuarios acceder a versiones históricas de documentos en lugar de solo la versión activa actual.

## Endpoint Modificado

**Ruta:** `GET /documentos/:documentoId/download-base64`

## Parámetros

### Path Parameters
- `documentoId` (string, UUID): ID del documento a descargar

### Query Parameters
- `maxSize` (number, opcional): Tamaño máximo del archivo en bytes. Por defecto: 10MB
- `version` (number, opcional): Número de versión específica a descargar. Si no se especifica, se descarga la versión activa

## Comportamiento

### Sin especificar versión (comportamiento por defecto)
```
GET /documentos/123e4567-e89b-12d3-a456-426614174000/download-base64
```
- Descarga la versión activa del documento
- Mantiene compatibilidad con implementaciones existentes

### Especificando versión
```
GET /documentos/123e4567-e89b-12d3-a456-426614174000/download-base64?version=2
```
- Descarga la versión específica número 2 del documento
- Si la versión no existe, retorna error 400 con mensaje descriptivo

### Combinando parámetros
```
GET /documentos/123e4567-e89b-12d3-a456-426614174000/download-base64?version=1&maxSize=5242880
```
- Descarga la versión 1 del documento
- Limita el tamaño máximo a 5MB

## Respuestas

### Éxito (200)
```json
{
  "success": true,
  "message": "File downloaded successfully as base64",
  "data": {
    "filename": "documento.pdf",
    "extension": "pdf",
    "size": 1024000,
    "type": "application/pdf",
    "base64": "JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwo...",
    "path": "documents/2024/01/documento_v1.pdf"
  }
}
```

### Error - Versión no encontrada (400)
```json
{
  "error": "Version 5 not found for this document"
}
```

### Error - Documento no encontrado (404)
```json
{
  "error": "File not found"
}
```

### Error - Archivo muy grande (413)
```json
{
  "error": "File too large. Maximum size allowed is 10MB"
}
```

## Casos de Uso

1. **Auditoría histórica**: Acceder a versiones anteriores de documentos para revisión
2. **Comparación de versiones**: Descargar múltiples versiones para análisis comparativo
3. **Recuperación de datos**: Acceder a versiones específicas en caso de problemas con la versión actual
4. **Compliance**: Mantener acceso a versiones históricas por requerimientos regulatorios

## Consideraciones Técnicas

- La funcionalidad mantiene compatibilidad hacia atrás
- Se valida que la versión especificada exista antes de intentar la descarga
- El parámetro `version` es opcional y no afecta el rendimiento cuando no se usa
- Se mantiene la misma lógica de validación de tamaño y permisos

## Ejemplos de Implementación

### JavaScript/Node.js
```javascript
// Descargar versión específica
const response = await fetch('/documentos/123/download-base64?version=2');
const data = await response.json();

// Descargar versión activa (comportamiento por defecto)
const response = await fetch('/documentos/123/download-base64');
const data = await response.json();
```

### cURL
```bash
# Versión específica
curl "http://localhost:3000/documentos/123/download-base64?version=2"

# Versión activa
curl "http://localhost:3000/documentos/123/download-base64"
```

## Migración

No se requieren cambios en el código existente. La funcionalidad se activa automáticamente al incluir el parámetro `version` en la consulta.
