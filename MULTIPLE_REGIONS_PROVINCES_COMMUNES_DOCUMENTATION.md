# Múltiples Regiones, Provincias y Comunas - Documentación

## Resumen de Cambios

Se ha modificado el sistema para permitir que un proyecto pueda tener múltiples regiones, provincias y comunas asociadas, en lugar de estar limitado a una sola de cada tipo.

## Cambios en el Schema de Base de Datos

### Nuevas Tablas Creadas

1. **etapas_regiones**: Relación muchos a muchos entre etapas_registro y regiones
2. **etapas_provincias**: Relación muchos a muchos entre etapas_registro y provincias  
3. **etapas_comunas**: Relación muchos a muchos entre etapas_registro y comunas

### Campos Eliminados de etapas_registro

- `region_id` (Int?)
- `provincia_id` (Int?)
- `comuna_id` (Int?)

### Nuevas Relaciones

```prisma
model etapas_regiones {
  id              Int       @id @default(autoincrement())
  etapa_registro_id Int
  region_id       Int
  created_at      DateTime  @default(now())

  etapa_registro etapas_registro @relation(fields: [etapa_registro_id], references: [id])
  region         regiones         @relation(fields: [region_id], references: [id])

  @@unique([etapa_registro_id, region_id])
}

model etapas_provincias {
  id              Int       @id @default(autoincrement())
  etapa_registro_id Int
  provincia_id    Int
  created_at      DateTime  @default(now())

  etapa_registro etapas_registro @relation(fields: [etapa_registro_id], references: [id])
  provincia      provincias       @relation(fields: [provincia_id], references: [id])

  @@unique([etapa_registro_id, provincia_id])
}

model etapas_comunas {
  id              Int       @id @default(autoincrement())
  etapa_registro_id Int
  comuna_id       Int
  created_at      DateTime  @default(now())

  etapa_registro etapas_registro @relation(fields: [etapa_registro_id], references: [id])
  comuna         comunas          @relation(fields: [comuna_id], references: [id])

  @@unique([etapa_registro_id, comuna_id])
}
```

## Cambios en los Endpoints

### POST /proyectos

**Schema de entrada actualizado:**
```typescript
etapas_registro: z.object({
  etapa_tipo_id: z.number(),
  tipo_iniciativa_id: z.number(),
  tipo_obra_id: z.number().optional(),
  regiones: z.array(z.number()).optional(),        // Nuevo: array de IDs de regiones
  provincias: z.array(z.number()).optional(),      // Nuevo: array de IDs de provincias
  comunas: z.array(z.number()).optional(),         // Nuevo: array de IDs de comunas
  volumen: z.string().optional(),
  presupuesto_oficial: z.string().optional(),
  valor_referencia: z.string().max(255).optional(),
  bip: z.string().optional(),
  fecha_llamado_licitacion: z.string().datetime().optional(),
  fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
  fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
  decreto_adjudicacion: z.string().optional(),
  sociedad_concesionaria: z.string().max(255).optional(),
  fecha_inicio_concesion: z.string().datetime().optional(),
  plazo_total_concesion: z.string().optional(),
  inspector_fiscal_id: z.number().optional(),
  usuario_creador: z.number()
})
```

**Ejemplo de uso:**
```json
{
  "nombre": "Proyecto Múltiples Regiones",
  "creado_por": 1,
  "etapas_registro": {
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "regiones": [1, 2, 3],
    "provincias": [1, 2],
    "comunas": [1, 2, 3, 4],
    "volumen": "1000 m³",
    "presupuesto_oficial": "50000000"
  }
}
```

### PUT /proyectos/:id

**Schema de entrada actualizado:**
```typescript
etapas_registro: z.object({
  tipo_iniciativa_id: z.number().optional(),
  tipo_obra_id: z.number().optional(),
  regiones: z.array(z.number()).optional(),        // Nuevo: array de IDs de regiones
  provincias: z.array(z.number()).optional(),      // Nuevo: array de IDs de provincias
  comunas: z.array(z.number()).optional(),         // Nuevo: array de IDs de comunas
  volumen: z.string().optional(),
  presupuesto_oficial: z.string().optional(),
  valor_referencia: z.string().max(255).optional(),
  bip: z.string().optional(),
  fecha_llamado_licitacion: z.string().datetime().optional(),
  fecha_recepcion_ofertas_tecnicas: z.string().datetime().optional(),
  fecha_apertura_ofertas_economicas: z.string().datetime().optional(),
  decreto_adjudicacion: z.string().optional(),
  sociedad_concesionaria: z.string().max(255).optional(),
  fecha_inicio_concesion: z.string().datetime().optional(),
  plazo_total_concesion: z.string().optional(),
  inspector_fiscal_id: z.number().optional()
}).optional()
```

### GET /proyectos/:id

**Schema de respuesta actualizado:**
```typescript
etapas_registro: z.array(z.object({
  id: z.number(),
  etapa_tipo: z.object({
    id: z.number(),
    nombre: z.string(),
    descripcion: z.string().nullable(),
    color: z.string().nullable()
  }),
  tipo_iniciativa: z.object({
    id: z.number(),
    nombre: z.string()
  }).nullable(),
  tipo_obra: z.object({
    id: z.number(),
    nombre: z.string()
  }).nullable(),
  regiones: z.array(z.object({                    // Nuevo: array de regiones
    id: z.number(),
    codigo: z.string(),
    nombre: z.string(),
    nombre_corto: z.string().nullable()
  })),
  provincias: z.array(z.object({                  // Nuevo: array de provincias
    id: z.number(),
    codigo: z.string(),
    nombre: z.string()
  })),
  comunas: z.array(z.object({                     // Nuevo: array de comunas
    id: z.number(),
    nombre: z.string()
  })),
  volumen: z.string().nullable(),
  presupuesto_oficial: z.string().nullable(),
  // ... resto de campos
}))
```

## Migración de Datos Existentes

### Proceso de Migración

1. **Ejecutar la migración:**
   ```bash
   npx prisma migrate dev --name add_multiple_regions_provinces_communes
   ```

2. **Migrar datos existentes (opcional):**
   ```sql
   -- Migrar regiones existentes
   INSERT INTO etapas_regiones (etapa_registro_id, region_id, created_at)
   SELECT id, region_id, NOW()
   FROM etapas_registro 
   WHERE region_id IS NOT NULL;
   
   -- Migrar provincias existentes
   INSERT INTO etapas_provincias (etapa_registro_id, provincia_id, created_at)
   SELECT id, provincia_id, NOW()
   FROM etapas_registro 
   WHERE provincia_id IS NOT NULL;
   
   -- Migrar comunas existentes
   INSERT INTO etapas_comunas (etapa_registro_id, comuna_id, created_at)
   SELECT id, comuna_id, NOW()
   FROM etapas_registro 
   WHERE comuna_id IS NOT NULL;
   ```

## Funcionalidades Implementadas

### Creación de Proyectos con Múltiples Regiones

- ✅ Crear proyecto con múltiples regiones
- ✅ Crear proyecto con múltiples provincias
- ✅ Crear proyecto con múltiples comunas
- ✅ Combinación de múltiples regiones, provincias y comunas

### Actualización de Proyectos

- ✅ Actualizar regiones existentes
- ✅ Actualizar provincias existentes
- ✅ Actualizar comunas existentes
- ✅ Eliminar todas las relaciones y crear nuevas

### Consulta de Proyectos

- ✅ Obtener proyecto con todas sus regiones
- ✅ Obtener proyecto con todas sus provincias
- ✅ Obtener proyecto con todas sus comunas

## Endpoints que Necesitan Actualización

### Pendientes de Actualizar

1. **GET /proyectos/:id/etapa-actual** - Actualizar para incluir múltiples regiones/provincias/comunas
2. **PATCH /proyectos/:id/cambiar-etapa** - Actualizar para manejar múltiples regiones/provincias/comunas
3. **Endpoints de etapas** - Actualizar todos los endpoints relacionados con etapas

### Cambios Necesarios en Otros Archivos

1. **src/http/routes/etapas/etapas.ts** - Actualizar todos los endpoints
2. **Frontend** - Actualizar formularios y visualización
3. **Documentación de API** - Actualizar ejemplos y schemas

## Testing

### Archivo de Test

Se ha creado `test_multiple_regions.js` para verificar la funcionalidad:

```bash
node test_multiple_regions.js
```

### Casos de Prueba

1. **Crear proyecto con múltiples regiones**
2. **Crear proyecto con múltiples provincias**
3. **Crear proyecto con múltiples comunas**
4. **Actualizar regiones existentes**
5. **Eliminar todas las relaciones**
6. **Consultar proyecto con relaciones**

## Consideraciones de Rendimiento

### Índices Recomendados

```sql
-- Índices para mejorar el rendimiento de consultas
CREATE INDEX idx_etapas_regiones_etapa_id ON etapas_regiones(etapa_registro_id);
CREATE INDEX idx_etapas_regiones_region_id ON etapas_regiones(region_id);
CREATE INDEX idx_etapas_provincias_etapa_id ON etapas_provincias(etapa_registro_id);
CREATE INDEX idx_etapas_provincias_provincia_id ON etapas_provincias(provincia_id);
CREATE INDEX idx_etapas_comunas_etapa_id ON etapas_comunas(etapa_registro_id);
CREATE INDEX idx_etapas_comunas_comuna_id ON etapas_comunas(comuna_id);
```

### Optimizaciones de Consulta

- Usar `include` para cargar relaciones en una sola consulta
- Implementar paginación para proyectos con muchas relaciones
- Considerar cache para consultas frecuentes

## Próximos Pasos

1. **Regenerar Prisma Client:**
   ```bash
   npx prisma generate
   ```

2. **Actualizar endpoints restantes:**
   - GET /proyectos/:id/etapa-actual
   - PATCH /proyectos/:id/cambiar-etapa
   - Todos los endpoints de etapas

3. **Actualizar frontend:**
   - Formularios de creación/edición
   - Visualización de múltiples regiones/provincias/comunas
   - Validaciones

4. **Testing completo:**
   - Tests unitarios
   - Tests de integración
   - Tests de rendimiento

5. **Documentación:**
   - Actualizar documentación de API
   - Guías de migración
   - Ejemplos de uso

## Notas Importantes

- Los campos `region_id`, `provincia_id`, y `comuna_id` han sido eliminados de `etapas_registro`
- Las nuevas relaciones usan tablas intermedias con restricciones únicas
- La migración es compatible hacia adelante pero requiere actualización del código
- Se recomienda hacer backup antes de aplicar la migración en producción 