# Gestión del Orden de Etapas

## Descripción General

Este documento describe los nuevos endpoints implementados para gestionar el orden de las etapas en el sistema. Estos endpoints permiten cambiar la jerarquía y secuencia de las etapas, moviendo etapas hacia arriba, hacia abajo, o a posiciones específicas.

## Endpoints Disponibles

### 1. GET /etapas/orden - Obtener Orden Actual

**Descripción**: Retorna el orden actual de todas las etapas activas, ordenadas por su posición en el flujo.

**Parámetros de consulta**:
- `proyecto_id` (opcional): ID del proyecto para filtrar etapas específicas

**Respuesta**:
```json
{
  "success": true,
  "message": "Orden de etapas obtenido exitosamente",
  "data": [
    {
      "id": 1,
      "etapa_tipo_id": 1,
      "nombre": "Planificación",
      "descripcion": "Etapa inicial de planificación",
      "color": "#3498DB",
      "orden_actual": 1,
      "fecha_creacion": "2024-01-01T00:00:00.000Z",
      "activa": true
    }
  ]
}
```

### 2. PUT /etapas/:id/mover - Mover Etapa a Nueva Posición

**Descripción**: Mueve una etapa específica a una nueva posición en el orden.

**Parámetros de ruta**:
- `id`: ID de la etapa a mover

**Cuerpo de la petición**:
```json
{
  "nueva_posicion": 3,
  "proyecto_id": 1
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Etapa \"Planificación\" movida de posición 1 a 3",
  "data": {
    "id": 1,
    "posicion_anterior": 1,
    "nueva_posicion": 3,
    "etapas_reordenadas": [
      {
        "id": 2,
        "nombre": "Diseño",
        "orden": 1
      },
      {
        "id": 3,
        "nombre": "Construcción",
        "orden": 2
      },
      {
        "id": 1,
        "nombre": "Planificación",
        "orden": 3
      }
    ]
  }
}
```

### 3. PUT /etapas/reordenar - Reordenar Múltiples Etapas

**Descripción**: Reordena múltiples etapas a la vez especificando el nuevo orden.

**Cuerpo de la petición**:
```json
{
  "proyecto_id": 1,
  "etapas": [
    {
      "id": 1,
      "nueva_posicion": 3
    },
    {
      "id": 2,
      "nueva_posicion": 1
    },
    {
      "id": 3,
      "nueva_posicion": 2
    }
  ]
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "3 etapas reordenadas exitosamente",
  "data": {
    "etapas_reordenadas": [
      {
        "id": 2,
        "nombre": "Diseño",
        "orden": 1
      },
      {
        "id": 3,
        "nombre": "Construcción",
        "orden": 2
      },
      {
        "id": 1,
        "nombre": "Planificación",
        "orden": 3
      }
    ],
    "cambios_aplicados": 3
  }
}
```

### 4. POST /etapas/:id/subir - Subir Etapa una Posición

**Descripción**: Mueve una etapa hacia arriba una posición en el orden.

**Parámetros de ruta**:
- `id`: ID de la etapa a subir

**Cuerpo de la petición**:
```json
{
  "proyecto_id": 1
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Etapa \"Construcción\" subida de posición 3 a 2",
  "data": {
    "id": 3,
    "posicion_anterior": 3,
    "nueva_posicion": 2,
    "movida": true
  }
}
```

### 5. POST /etapas/:id/bajar - Bajar Etapa una Posición

**Descripción**: Mueve una etapa hacia abajo una posición en el orden.

**Parámetros de ruta**:
- `id`: ID de la etapa a bajar

**Cuerpo de la petición**:
```json
{
  "proyecto_id": 1
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Etapa \"Planificación\" bajada de posición 1 a 2",
  "data": {
    "id": 1,
    "posicion_anterior": 1,
    "nueva_posicion": 2,
    "movida": true
  }
}
```

### 6. POST /etapas/:id/ir-primero - Mover Etapa al Primer Lugar

**Descripción**: Mueve una etapa específica al primer lugar en el orden.

**Parámetros de ruta**:
- `id`: ID de la etapa a mover

**Cuerpo de la petición**:
```json
{
  "proyecto_id": 1
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Etapa \"Construcción\" movida al primer lugar",
  "data": {
    "id": 3,
    "posicion_anterior": 3,
    "nueva_posicion": 1,
    "etapas_reordenadas": [
      {
        "id": 3,
        "nombre": "Construcción",
        "orden": 1
      },
      {
        "id": 1,
        "nombre": "Planificación",
        "orden": 2
      },
      {
        "id": 2,
        "nombre": "Diseño",
        "orden": 3
      }
    ]
  }
}
```

### 7. POST /etapas/:id/ir-ultimo - Mover Etapa al Último Lugar

**Descripción**: Mueve una etapa específica al último lugar en el orden.

**Parámetros de ruta**:
- `id`: ID de la etapa a mover

**Cuerpo de la petición**:
```json
{
  "proyecto_id": 1
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Etapa \"Planificación\" movida al último lugar",
  "data": {
    "id": 1,
    "posicion_anterior": 1,
    "nueva_posicion": 3,
    "etapas_reordenadas": [
      {
        "id": 2,
        "nombre": "Diseño",
        "orden": 1
      },
      {
        "id": 3,
        "nombre": "Construcción",
        "orden": 2
      },
      {
        "id": 1,
        "nombre": "Planificación",
        "orden": 3
      }
    ]
  }
}
```

## Códigos de Error

### 400 - Bad Request
- Posición inválida (fuera del rango permitido)
- Etapas no encontradas
- Datos de entrada inválidos

### 404 - Not Found
- Etapa no encontrada
- Etapa no encontrada en la lista

### 500 - Internal Server Error
- Errores de base de datos
- Errores de servidor

## Consideraciones Técnicas

### Ordenamiento
- El orden se mantiene mediante el campo `fecha_creacion`
- Al reordenar, se actualizan las fechas de creación para mantener la secuencia
- Las etapas se ordenan por `fecha_creacion` ascendente

### Filtrado por Proyecto
- Todos los endpoints soportan filtrado por `proyecto_id`
- Si no se especifica `proyecto_id`, se consideran todas las etapas activas

### Validaciones
- Se valida que las etapas existan antes de moverlas
- Se valida que las posiciones estén dentro del rango válido
- Se previenen operaciones innecesarias (mover a la misma posición)

## Ejemplos de Uso

### Ejemplo 1: Cambiar la primera etapa
```bash
# Obtener el orden actual
GET /etapas/orden?proyecto_id=1

# Mover la etapa "Construcción" al primer lugar
POST /etapas/3/ir-primero
{
  "proyecto_id": 1
}
```

### Ejemplo 2: Reordenar completamente
```bash
# Reordenar múltiples etapas a la vez
PUT /etapas/reordenar
{
  "proyecto_id": 1,
  "etapas": [
    {"id": 3, "nueva_posicion": 1},
    {"id": 1, "nueva_posicion": 2},
    {"id": 2, "nueva_posicion": 3}
  ]
}
```

### Ejemplo 3: Mover etapa a posición específica
```bash
# Mover etapa a la posición 2
PUT /etapas/1/mover
{
  "nueva_posicion": 2,
  "proyecto_id": 1
}
```

## Notas de Implementación

- Todos los endpoints son transaccionales para garantizar consistencia
- Se mantiene un historial de cambios mediante auditoría
- Los cambios son inmediatos y afectan el flujo de trabajo
- Se recomienda validar el nuevo orden después de cada operación 