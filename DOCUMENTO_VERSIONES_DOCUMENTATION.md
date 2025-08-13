# Documento Versiones - Sistema de Versionado

## Descripción General

Se ha implementado una nueva tabla `documento_versiones` para manejar el control de versiones de los documentos de manera más eficiente y organizada. Esta tabla permite mantener un historial completo de todas las versiones de un documento, incluyendo su ubicación en S3, metadatos y trazabilidad.

## Estructura de la Tabla

### Tabla: `documento_versiones`

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | SERIAL | Identificador único de la versión | PRIMARY KEY, AUTO_INCREMENT |
| `documento_id` | UUID | ID del documento al que pertenece la versión | NOT NULL, FOREIGN KEY |
| `numero_version` | VARCHAR(20) | Número o identificador de la versión | NOT NULL |
| `s3_path` | VARCHAR(500) | Ruta del archivo en S3 | NOT NULL |
| `s3_bucket_name` | VARCHAR(100) | Nombre del bucket de S3 | NULLABLE |
| `tamano` | BIGINT | Tamaño del archivo en bytes | NULLABLE |
| `hash_integridad` | VARCHAR(255) | Hash de integridad del archivo | NULLABLE |
| `comentario` | TEXT | Comentario o descripción de la versión | NULLABLE |
| `fecha_creacion` | TIMESTAMP | Fecha y hora de creación de la versión | DEFAULT NOW() |
| `usuario_creador` | INTEGER | ID del usuario que creó la versión | NOT NULL, FOREIGN KEY |
| `metadata` | JSONB | Metadatos adicionales en formato JSON | NULLABLE |
| `activa` | BOOLEAN | Indica si la versión está activa | DEFAULT TRUE |

## Índices y Restricciones

### Índices
- `documento_versiones_documento_id_idx` - Índice en `documento_id` para consultas rápidas
- `documento_versiones_fecha_creacion_idx` - Índice en `fecha_creacion` para ordenamiento temporal

### Restricciones Únicas
- `documento_id` + `numero_version` - No puede haber dos versiones con el mismo número para el mismo documento

### Claves Foráneas
- `documento_id` → `documentos.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)
- `usuario_creador` → `usuarios.id` (ON DELETE RESTRICT, ON UPDATE CASCADE)

## Relaciones

### Con la tabla `documentos`
- Una versión pertenece a un documento específico
- Un documento puede tener múltiples versiones
- Relación: `documentos.id` ←→ `documento_versiones.documento_id`

### Con la tabla `usuarios`
- Una versión es creada por un usuario específico
- Un usuario puede crear múltiples versiones
- Relación: `usuarios.id` ←→ `documento_versiones.usuario_creador`

## Casos de Uso

### 1. Subida de Nueva Versión
Cuando se sube una nueva versión de un documento:
1. Se crea un nuevo registro en `documento_versiones`
2. Se actualiza el campo `version` en la tabla `documentos` con el nuevo número
3. Se puede marcar la versión anterior como inactiva (`activa = false`)

### 2. Consulta de Historial de Versiones
Para obtener todas las versiones de un documento:
```sql
SELECT * FROM documento_versiones 
WHERE documento_id = 'uuid-del-documento' 
ORDER BY fecha_creacion DESC;
```

### 3. Recuperación de Versión Específica
Para acceder a una versión específica:
```sql
SELECT * FROM documento_versiones 
WHERE documento_id = 'uuid-del-documento' 
AND numero_version = '1.2';
```

### 4. Auditoría de Cambios
La tabla permite rastrear:
- Quién creó cada versión
- Cuándo se creó
- Dónde se almacena físicamente (S3)
- Metadatos de cada versión

## Ventajas de esta Implementación

1. **Trazabilidad Completa**: Cada versión mantiene su historial completo
2. **Flexibilidad**: Permite múltiples versiones activas o inactivas
3. **Metadatos**: Almacena información adicional en formato JSON
4. **Integridad**: Mantiene referencias a documentos y usuarios
5. **Performance**: Índices optimizados para consultas frecuentes
6. **Escalabilidad**: Diseñada para manejar grandes volúmenes de versiones

## Consideraciones de Implementación

### Al Subir Nueva Versión
1. Verificar que el `numero_version` sea único para el documento
2. Actualizar el campo `version` en la tabla `documentos`
3. Opcionalmente, marcar versiones anteriores como inactivas

### Al Eliminar Documento
- Las versiones se mantienen por integridad referencial
- Considerar implementar soft delete para versiones también

### Al Consultar Versiones
- Usar los índices para optimizar consultas
- Considerar paginación para documentos con muchas versiones

## Ejemplos de Consultas Útiles

### Obtener la Última Versión de un Documento
```sql
SELECT dv.*, d.nombre_archivo 
FROM documento_versiones dv
JOIN documentos d ON d.id = dv.documento_id
WHERE dv.documento_id = 'uuid-del-documento'
ORDER BY dv.fecha_creacion DESC
LIMIT 1;
```

### Obtener Todas las Versiones Activas
```sql
SELECT * FROM documento_versiones 
WHERE activa = true 
ORDER BY documento_id, fecha_creacion DESC;
```

### Estadísticas de Versiones por Usuario
```sql
SELECT u.nombre_completo, COUNT(dv.id) as total_versiones
FROM documento_versiones dv
JOIN usuarios u ON u.id = dv.usuario_creador
GROUP BY u.id, u.nombre_completo
ORDER BY total_versiones DESC;
```

## Migración y Compatibilidad

Esta implementación es compatible con la estructura existente:
- No afecta la funcionalidad actual de documentos
- Mantiene el campo `version` en la tabla `documentos` para compatibilidad
- Permite migración gradual del sistema de versionado

## Próximos Pasos Recomendados

1. **Implementar Lógica de Negocio**: Crear funciones para manejo automático de versiones
2. **API Endpoints**: Desarrollar endpoints para gestión de versiones
3. **Interfaz de Usuario**: Crear interfaz para visualización y gestión de versiones
4. **Migración de Datos**: Migrar versiones existentes a la nueva estructura
5. **Testing**: Implementar pruebas para validar la funcionalidad
