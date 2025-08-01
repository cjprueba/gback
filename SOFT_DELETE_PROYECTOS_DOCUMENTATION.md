# Soft Delete para Proyectos

## Descripción

Se ha implementado la funcionalidad de soft delete para proyectos, que permite "eliminar" proyectos sin borrar físicamente los datos de la base de datos. Los proyectos eliminados se marcan con un flag `eliminado = true` y no aparecen en las consultas normales.

## Cambios en la Base de Datos

### 1. Modificación del Esquema Prisma

Se agregó el campo `eliminado` al modelo `proyectos` en `prisma/schema.prisma`:

```prisma
model proyectos {
  id                 Int       @id @default(autoincrement())
  carpeta_inicial    Json?
  nombre             String    @db.VarChar(255)
  division_id        Int?
  departamento_id    Int?
  unidad_id          Int?
  creado_por         Int
  created_at         DateTime  @default(now())
  eliminado          Boolean   @default(false)  // NUEVO CAMPO

  // ... resto del modelo
}
```

### 2. Script SQL para Aplicar el Cambio

Ejecutar el script `scripts/add_eliminado_to_proyectos.sql`:

```sql
-- Agregar campo eliminado a la tabla proyectos para soft delete
ALTER TABLE proyectos ADD COLUMN eliminado BOOLEAN DEFAULT FALSE;

-- Crear índice para mejorar el rendimiento de las consultas que filtran por eliminado
CREATE INDEX idx_proyectos_eliminado ON proyectos(eliminado);
```

### 3. Regenerar Cliente Prisma

Después de aplicar el script SQL, ejecutar:

```bash
npx prisma generate
```

## Endpoints Implementados

### 1. Eliminar Proyecto (Soft Delete)

**Endpoint:** `DELETE /proyectos/:id`

**Descripción:** Realiza un soft delete del proyecto marcándolo como eliminado.

**Body:**
```json
{
  "usuario_eliminador": 1,
  "motivo_eliminacion": "Proyecto cancelado por cambios en requerimientos"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proyecto eliminado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Proyecto Ejemplo",
    "eliminado": true,
    "fecha_eliminacion": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Restaurar Proyecto Eliminado

**Endpoint:** `PATCH /proyectos/:id/restaurar`

**Descripción:** Restaura un proyecto que ha sido eliminado mediante soft delete.

**Body:**
```json
{
  "usuario_restaurador": 1,
  "motivo_restauracion": "Proyecto reactivado por nueva aprobación"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Proyecto restaurado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Proyecto Ejemplo",
    "eliminado": false,
    "fecha_restauracion": "2024-01-15T11:00:00.000Z"
  }
}
```

### 3. Listar Proyectos Eliminados

**Endpoint:** `GET /proyectos/eliminados`

**Descripción:** Retorna una lista de todos los proyectos que han sido eliminados.

**Respuesta:**
```json
{
  "success": true,
  "message": "Lista de proyectos eliminados obtenida exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Proyecto Eliminado 1",
      "created_at": "2024-01-10T09:00:00.000Z",
      "eliminado": true,
      "creador": {
        "id": 1,
        "nombre_completo": "Juan Pérez"
      }
    }
  ]
}
```

## Modificaciones en Endpoints Existentes

### 1. Listar Proyectos (`GET /proyectos`)

- **Antes:** Mostraba todos los proyectos
- **Después:** Solo muestra proyectos activos (`eliminado = false`)

### 2. Obtener Proyecto por ID (`GET /proyectos/:id`)

- **Antes:** Retornaba cualquier proyecto por ID
- **Después:** Solo retorna proyectos activos, devuelve 404 si el proyecto está eliminado

## Funcionalidades Adicionales

### 1. Desactivación de Etapas

Cuando se elimina un proyecto, todas sus etapas activas se desactivan automáticamente:

```typescript
// Desactivar todas las etapas activas del proyecto
if (proyecto.etapas_registro.length > 0) {
  await prisma.etapas_registro.updateMany({
    where: {
      proyecto_id: id,
      activa: true
    },
    data: {
      activa: false
    }
  });
}
```

### 2. Validaciones

- **Verificación de existencia:** Se verifica que el proyecto existe antes de eliminarlo/restaurarlo
- **Verificación de estado:** Se verifica que el proyecto no esté ya eliminado antes de eliminarlo
- **Verificación de usuario:** Se verifica que el usuario que realiza la operación existe

### 3. Logging

Se registra en consola información sobre las operaciones de eliminación y restauración:

```typescript
console.log(`Proyecto "${proyecto.nombre}" eliminado por usuario ${usuario_eliminador}. Motivo: ${motivo_eliminacion || 'No especificado'}`);
```

## Consideraciones de Seguridad

1. **Auditoría:** Todas las operaciones de eliminación y restauración se registran con el usuario que las realiza
2. **Motivos:** Se permite especificar un motivo para la eliminación/restauración
3. **Validación:** Se valida la existencia del usuario que realiza la operación

## Ventajas del Soft Delete

1. **Recuperación de datos:** Los proyectos eliminados pueden ser restaurados
2. **Integridad referencial:** No se pierden las relaciones con otros datos
3. **Auditoría:** Se mantiene un historial completo de las operaciones
4. **Rendimiento:** No se afecta el rendimiento de las consultas normales
5. **Flexibilidad:** Permite implementar políticas de retención de datos

## Uso Recomendado

1. **Eliminación temporal:** Usar soft delete para proyectos que pueden ser reactivados
2. **Eliminación permanente:** Para eliminación definitiva, considerar un proceso de limpieza periódica
3. **Backup:** Antes de eliminaciones masivas, realizar backup de los datos
4. **Monitoreo:** Implementar alertas para proyectos eliminados por períodos largos

## Próximos Pasos

1. Aplicar el script SQL a la base de datos
2. Regenerar el cliente de Prisma
3. Probar los endpoints en un entorno de desarrollo
4. Implementar políticas de retención de datos eliminados
5. Considerar agregar campos de auditoría adicionales (fecha_eliminacion, usuario_eliminador, etc.) 