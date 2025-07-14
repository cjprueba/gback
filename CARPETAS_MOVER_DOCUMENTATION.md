# Documentación: Mover Carpetas

## Endpoint: PUT /carpetas/:id/mover

### Descripción
Este endpoint permite mover una carpeta a otra carpeta padre, actualizando tanto la base de datos como el almacenamiento MinIO. La funcionalidad incluye:

- Mover carpetas entre diferentes carpetas padre
- El `proyecto_id` se determina automáticamente basado en la carpeta padre de destino
- Actualización automática de rutas S3 para subcarpetas y documentos
- Validaciones de integridad y seguridad

### Parámetros

#### Path Parameters
- `id` (string): ID de la carpeta que se desea mover

#### Body Parameters
- `nueva_carpeta_padre_id` (number, requerido): ID de la nueva carpeta padre
- `usuario_modificador` (number, requerido): ID del usuario que realiza la operación

### Casos de Uso

#### Mover carpeta a otra carpeta padre
```json
PUT /carpetas/123/mover
{
  "nueva_carpeta_padre_id": 456,
  "usuario_modificador": 1
}
```

**Nota**: El `proyecto_id` se determina automáticamente basado en la carpeta padre de destino.

### Validaciones

#### Validaciones de Existencia
- La carpeta origen debe existir
- El usuario modificador debe existir
- La carpeta padre de destino debe existir

#### Validaciones de Integridad
- No se puede mover una carpeta a sí misma
- No se puede mover una carpeta a una de sus subcarpetas (evita ciclos)
- No puede existir otra carpeta con el mismo nombre en el destino

#### Validaciones de Negocio
- Solo se pueden mover carpetas activas
- Se mantienen los permisos y configuraciones de la carpeta
- Se preserva la estructura de subcarpetas y documentos

### Respuestas

#### Respuesta Exitosa (200)
```json
{
  "id": 123,
  "nombre": "Mi Carpeta",
  "descripcion": "Descripción de la carpeta",
  "carpeta_padre_id": 456,
  "proyecto_id": 789,
  "s3_path": "proyectos/mi-proyecto/mi-carpeta",
  "s3_bucket_name": "gestor-files",
  "s3_created": true,
  "orden_visualizacion": 1,
  "max_tamaño_mb": 100,
  "tipos_archivo_permitidos": ["pdf", "doc", "docx"],
  "permisos_lectura": ["admin", "user"],
  "permisos_escritura": ["admin"],
  "usuario_creador": 1,
  "fecha_creacion": "2024-01-01T00:00:00.000Z",
  "fecha_actualizacion": "2024-01-02T12:00:00.000Z",
  "activa": true,
  "message": "Carpeta \"Mi Carpeta\" movida exitosamente"
}
```

#### Error - Carpeta no encontrada (404)
```json
{
  "message": "Carpeta no encontrada"
}
```

#### Error - Validación (400)
```json
{
  "message": "No se puede mover una carpeta a una de sus subcarpetas"
}
```

#### Error - Servidor (500)
```json
{
  "message": "Error interno del servidor"
}
```

### Comportamiento del Sistema

#### Actualización de Rutas S3
1. Se obtiene el `proyecto_id` de la carpeta padre de destino
2. Se calcula la nueva ruta S3 basada en la carpeta padre
3. Se mueve la carpeta en MinIO usando `MinIOUtils.moveFolder()`
4. Se actualiza la ruta S3 de la carpeta principal en la base de datos
5. Se actualizan recursivamente las rutas S3 de todas las subcarpetas
6. Se actualizan las rutas S3 de todos los documentos asociados

#### Preservación de Estructura
- Se mantiene toda la jerarquía de subcarpetas
- Se preservan todos los documentos y sus metadatos
- Se mantienen las configuraciones de permisos y tipos de archivo
- Se conserva el historial de creación y modificación

#### Logs y Auditoría
- Se registran todas las operaciones en MinIO
- Se actualiza la fecha de modificación de la carpeta
- Se mantiene el usuario creador original
- Se registra el usuario que realizó la modificación

### Consideraciones Técnicas

#### Rendimiento
- La operación es atómica: si falla en MinIO, no se actualiza la base de datos
- Se procesan las subcarpetas de forma recursiva
- Se optimiza la actualización de documentos usando SQL directo

#### Seguridad
- Se validan todos los permisos antes de la operación
- Se verifica la integridad de la estructura de carpetas
- Se previenen ciclos en la jerarquía de carpetas

#### Compatibilidad
- Compatible con la funcionalidad de renombrar carpetas
- Mantiene compatibilidad con el sistema de documentos
- Preserva la integridad referencial de la base de datos

### Ejemplos de Uso

#### Ejemplo 1: Reorganización de Proyecto
```bash
# Mover carpeta de documentación a la carpeta principal del proyecto
curl -X PUT http://localhost:3000/carpetas/123/mover \
  -H "Content-Type: application/json" \
  -d '{
    "nueva_carpeta_padre_id": 456,
    "usuario_modificador": 1
  }'
```

#### Ejemplo 2: Mover entre Diferentes Proyectos
```bash
# Mover carpeta de un proyecto a otro (usando carpeta padre del proyecto destino)
curl -X PUT http://localhost:3000/carpetas/123/mover \
  -H "Content-Type: application/json" \
  -d '{
    "nueva_carpeta_padre_id": 789,
    "usuario_modificador": 1
  }'
```

### Notas Importantes

1. **Backup**: Se recomienda hacer backup antes de mover carpetas grandes
2. **Permisos**: Verificar que el usuario tiene permisos en el destino
3. **Espacio**: Asegurar que hay espacio suficiente en MinIO
4. **Concurrencia**: Evitar mover la misma carpeta simultáneamente
5. **Monitoreo**: Revisar logs para verificar que la operación fue exitosa

### Errores Comunes

1. **"Carpeta padre de destino no encontrada"**: Verificar que el ID de carpeta padre existe
2. **"Ya existe una carpeta con ese nombre en el destino"**: Cambiar el nombre antes de mover
3. **"No se puede mover una carpeta a una de sus subcarpetas"**: Revisar la jerarquía de carpetas
4. **"Error moviendo carpeta en el almacenamiento"**: Verificar conectividad con MinIO 