# Endpoints de Etapas - Documentación Completa

## Resumen General

El módulo de Etapas gestiona el ciclo de vida completo de las etapas de proyectos de concesión, incluyendo información de licitación, adjudicación, fechas importantes y datos financieros. El sistema implementa operaciones CRUD completas con validación robusta y soft delete.

## Endpoints Disponibles

### 1. GET /etapas
**Resumen:** Obtiene la lista completa de etapas activas ordenadas por fecha de creación descendente.

**Descripción:** 
Este endpoint retorna todas las etapas que están marcadas como activas en el sistema. Incluye información completa de cada etapa con sus relaciones (tipo de etapa, tipo de iniciativa, tipo de obra, ubicación geográfica, inspector fiscal y usuario creador). Los resultados se ordenan por fecha de creación en orden descendente para mostrar las etapas más recientes primero.

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Lista de etapas obtenida exitosamente",
  "data": [
    {
      "id": 1,
      "etapa_tipo": { "id": 1, "nombre": "Licitación", "descripcion": "..." },
      "tipo_iniciativa": { "id": 1, "nombre": "Infraestructura" },
      "tipo_obra": { "id": 1, "nombre": "Carretera" },
      "region": { "id": 1, "nombre": "Metropolitana", "codigo": "13" },
      "provincia": { "id": 1, "nombre": "Santiago", "codigo": "131" },
      "comuna": { "id": 1, "nombre": "Santiago", "codigo": "13101" },
      "inspector_fiscal": { "id": 1, "correo_electronico": "...", "nombre_completo": "..." },
      "usuario_creador_rel": { "id": 1, "correo_electronico": "...", "nombre_completo": "..." },
      // ... otros campos
    }
  ]
}
```

---

### 2. GET /etapas/:id
**Resumen:** Obtiene el detalle completo de una etapa específica por su ID.

**Descripción:**
Este endpoint permite obtener información detallada de una etapa específica, incluyendo todos sus datos y relaciones. Solo retorna etapas que están marcadas como activas. Si la etapa no existe o no está activa, retorna un error 404.

**Parámetros:**
- `id` (path): ID numérico de la etapa

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Detalle de etapa 1 obtenido exitosamente",
  "data": {
    "id": 1,
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "tipo_obra_id": 1,
    "region_id": 1,
    "provincia_id": 1,
    "comuna_id": 1,
    "volumen": "1000 m³",
    "presupuesto_oficial": "50000000",
    "valor_referencia": "45000000",
    "bip": "123456789",
    "fecha_llamado_licitacion": "2024-01-15T00:00:00.000Z",
    "fecha_recepcion_ofertas_tecnicas": "2024-02-15T00:00:00.000Z",
    "fecha_apertura_ofertas_economicas": "2024-03-15T00:00:00.000Z",
    "fecha_inicio_concesion": "2024-04-15T00:00:00.000Z",
    "plazo_total_concesion": "30 años",
    "decreto_adjudicacion": "DECRETO-2024-001",
    "sociedad_concesionaria": "Concesionaria Ejemplo S.A.",
    "inspector_fiscal_id": 1,
    "usuario_creador": 1,
    "fecha_creacion": "2024-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2024-01-01T00:00:00.000Z",
    "activa": true,
    // ... relaciones incluidas
  }
}
```

---

### 3. POST /etapas
**Resumen:** Crea una nueva etapa con toda la información requerida y opcional.

**Descripción:**
Este endpoint permite crear una nueva etapa en el sistema. Requiere como mínimo el tipo de etapa y el usuario creador. Todos los demás campos son opcionales pero permiten almacenar información completa del proyecto de concesión, incluyendo datos financieros, fechas importantes del proceso de licitación y adjudicación, y ubicación geográfica.

**Campos Requeridos:**
- `etapa_tipo_id`: ID del tipo de etapa (número entero positivo)
- `usuario_creador`: ID del usuario que crea la etapa (número entero positivo)

**Campos Opcionales:**
- **Información de la etapa:**
  - `tipo_iniciativa_id`: ID del tipo de iniciativa
  - `tipo_obra_id`: ID del tipo de obra
  - `region_id`: ID de la región
  - `provincia_id`: ID de la provincia
  - `comuna_id`: ID de la comuna
  - `volumen`: Descripción del volumen de trabajo

- **Información financiera:**
  - `presupuesto_oficial`: Presupuesto oficial (máximo 100 caracteres)
  - `valor_referencia`: Valor de referencia (máximo 255 caracteres)
  - `bip`: Código BIP

- **Fechas importantes:**
  - `fecha_llamado_licitacion`: Fecha del llamado a licitación (formato datetime)
  - `fecha_recepcion_ofertas_tecnicas`: Fecha de recepción de ofertas técnicas
  - `fecha_apertura_ofertas_economicas`: Fecha de apertura de ofertas económicas
  - `fecha_inicio_concesion`: Fecha de inicio de la concesión
  - `plazo_total_concesion`: Plazo total de la concesión

- **Información de adjudicación:**
  - `decreto_adjudicacion`: Número de decreto de adjudicación
  - `sociedad_concesionaria`: Nombre de la sociedad concesionaria (máximo 255 caracteres)

- **Inspector fiscal:**
  - `inspector_fiscal_id`: ID del inspector fiscal asignado

**Ejemplo de Request Body:**
```json
{
  "etapa_tipo_id": 1,
  "tipo_iniciativa_id": 1,
  "tipo_obra_id": 1,
  "region_id": 1,
  "provincia_id": 1,
  "comuna_id": 1,
  "volumen": "1000 m³",
  "presupuesto_oficial": "50000000",
  "valor_referencia": "45000000",
  "bip": "123456789",
  "fecha_llamado_licitacion": "2024-01-15T00:00:00.000Z",
  "fecha_recepcion_ofertas_tecnicas": "2024-02-15T00:00:00.000Z",
  "fecha_apertura_ofertas_economicas": "2024-03-15T00:00:00.000Z",
  "fecha_inicio_concesion": "2024-04-15T00:00:00.000Z",
  "plazo_total_concesion": "30 años",
  "decreto_adjudicacion": "DECRETO-2024-001",
  "sociedad_concesionaria": "Concesionaria Ejemplo S.A.",
  "inspector_fiscal_id": 1,
  "usuario_creador": 1
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Etapa creada exitosamente",
  "data": {
    "id": 1,
    "etapa_tipo_id": 1,
    "tipo_iniciativa_id": 1,
    "tipo_obra_id": 1,
    "region_id": 1,
    "provincia_id": 1,
    "comuna_id": 1,
    "volumen": "1000 m³",
    "presupuesto_oficial": "50000000",
    "valor_referencia": "45000000",
    "bip": "123456789",
    "fecha_llamado_licitacion": "2024-01-15T00:00:00.000Z",
    "fecha_recepcion_ofertas_tecnicas": "2024-02-15T00:00:00.000Z",
    "fecha_apertura_ofertas_economicas": "2024-03-15T00:00:00.000Z",
    "fecha_inicio_concesion": "2024-04-15T00:00:00.000Z",
    "plazo_total_concesion": "30 años",
    "decreto_adjudicacion": "DECRETO-2024-001",
    "sociedad_concesionaria": "Concesionaria Ejemplo S.A.",
    "inspector_fiscal_id": 1,
    "usuario_creador": 1,
    "fecha_creacion": "2024-01-01T00:00:00.000Z",
    "fecha_actualizacion": "2024-01-01T00:00:00.000Z",
    "activa": true
  }
}
```

---

### 4. PUT /etapas/:id
**Resumen:** Actualiza una etapa existente permitiendo modificar cualquier campo.

**Descripción:**
Este endpoint permite actualizar cualquier campo de una etapa existente. Todos los campos son opcionales en la actualización, permitiendo actualizaciones parciales. Las fechas se convierten automáticamente al formato Date si se proporcionan como strings datetime.

**Parámetros:**
- `id` (path): ID numérico de la etapa a actualizar

**Campos Actualizables:**
Todos los campos del esquema de creación son actualizables, además de:
- `activa`: Estado activo/inactivo de la etapa (boolean)

**Ejemplo de Request Body:**
```json
{
  "presupuesto_oficial": "55000000",
  "valor_referencia": "50000000",
  "fecha_inicio_concesion": "2024-05-15T00:00:00.000Z",
  "sociedad_concesionaria": "Nueva Concesionaria S.A."
}
```

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Etapa 1 actualizada exitosamente",
  "data": {
    "id": 1,
    "cambios_aplicados": {
      "presupuesto_oficial": "55000000",
      "valor_referencia": "50000000",
      "fecha_inicio_concesion": "2024-05-15T00:00:00.000Z",
      "sociedad_concesionaria": "Nueva Concesionaria S.A."
    }
  }
}
```

---

### 5. DELETE /etapas/:id
**Resumen:** Elimina una etapa mediante soft delete (marca como inactiva).

**Descripción:**
Este endpoint implementa un soft delete, marcando la etapa como inactiva en lugar de eliminarla físicamente de la base de datos. Esto permite mantener el historial y la integridad referencial de los datos.

**Parámetros:**
- `id` (path): ID numérico de la etapa a eliminar

**Respuesta Exitosa:**
```json
{
  "success": true,
  "message": "Etapa 1 eliminada exitosamente",
  "data": {
    "id": 1,
    "eliminada": true
  }
}
```

---

## Características Técnicas

### Validación de Datos
- **Zod Schemas:** Validación robusta con esquemas Zod para todos los endpoints
- **Validación de Tipos:** Conversión automática de tipos (string a number para IDs)
- **Validación de Fechas:** Conversión automática de strings datetime a objetos Date
- **Validación de Longitud:** Límites de caracteres para campos de texto

### Manejo de Errores
- **Error 404:** Etapa no encontrada (GET /etapas/:id)
- **Error 500:** Errores internos del servidor
- **Mensajes descriptivos:** Respuestas con mensajes claros sobre el estado de la operación

### Relaciones Incluidas
- `etapa_tipo`: Información del tipo de etapa
- `tipo_iniciativa`: Tipo de iniciativa del proyecto
- `tipo_obra`: Tipo de obra a realizar
- `region`, `provincia`, `comuna`: Ubicación geográfica
- `inspector_fiscal`: Inspector fiscal asignado
- `usuario_creador_rel`: Usuario que creó la etapa

### Ordenamiento
- Las listas se ordenan por `fecha_creacion` en orden descendente
- Las etapas más recientes aparecen primero

### Soft Delete
- Implementación de soft delete mediante campo `activa`
- Solo se muestran etapas activas en las consultas
- Mantenimiento del historial completo de datos 