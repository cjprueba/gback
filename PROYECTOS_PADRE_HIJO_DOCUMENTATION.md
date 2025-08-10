# Documentación: Proyectos Padre-Hijo

## Descripción General

Esta nueva funcionalidad permite crear proyectos padre que pueden contener múltiples proyectos hijos. Los proyectos padre se crean como carpetas en MinIO y pueden asignar proyectos hijos existentes, moviendo sus carpetas dentro de la estructura del proyecto padre.

## Características Principales

### 1. Proyectos Padre
- **Definición**: Un proyecto especial marcado con `es_proyecto_padre: true`
- **Propósito**: Organizar y agrupar proyectos relacionados
- **Estructura**: Se crea como carpeta en MinIO con su propia estructura de carpetas
- **Relación**: Puede tener múltiples proyectos hijos

### 2. Proyectos Hijos
- **Definición**: Proyectos normales que pueden ser asignados a un proyecto padre
- **Restricciones**: 
  - No pueden ser proyectos padre
  - Solo pueden tener un proyecto padre a la vez
  - No pueden ser eliminados mientras estén asignados a un padre
- **Movimiento**: Sus carpetas se mueven físicamente dentro de la carpeta del proyecto padre

## Endpoints Implementados

### 1. Crear Proyecto Padre
**POST** `/proyectos/padre`

Crea un nuevo proyecto padre con la opción de asignar proyectos hijos existentes.

#### Parámetros del Body:
```json
{
  "nombre": "string (max 255)",
  "division_id": "number (opcional)",
  "departamento_id": "number (opcional)",
  "unidad_id": "number (opcional)",
  "creado_por": "number (requerido)",
  "proyectos_hijos_ids": "array de numbers (opcional)",
  "carpeta_inicial": "object (opcional)"
}
```

#### Respuesta Exitosa (201):
```json
{
  "success": true,
  "message": "Proyecto padre creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Proyecto Padre",
    "es_proyecto_padre": true,
    "proyectos_hijos": [
      {
        "id": 2,
        "nombre": "Proyecto Hijo 1"
      }
    ]
  }
}
```

### 2. Asignar Proyectos Hijos
**POST** `/proyectos/:id/asignar-hijos`

Asigna proyectos hijos existentes a un proyecto padre.

#### Parámetros del Body:
```json
{
  "proyectos_hijos_ids": [1, 2, 3],
  "usuario_operacion": 1
}
```

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Proyectos hijos asignados exitosamente",
  "data": {
    "proyecto_padre": {
      "id": 1,
      "nombre": "Proyecto Padre"
    },
    "proyectos_asignados": [
      {
        "id": 2,
        "nombre": "Proyecto Hijo 1"
      }
    ]
  }
}
```

### 3. Obtener Lista de Proyectos Padre
**GET** `/proyectos/padres`

Retorna todos los proyectos padre con información de sus proyectos hijos.

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Lista de proyectos padre obtenida exitosamente",
  "data": [
    {
      "id": 1,
      "nombre": "Proyecto Padre",
      "created_at": "2024-01-01T00:00:00Z",
      "es_proyecto_padre": true,
      "proyectos_hijos": [
        {
          "id": 2,
          "nombre": "Proyecto Hijo 1",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ],
      "creador": {
        "id": 1,
        "nombre_completo": "Usuario Creador"
      }
    }
  ]
}
```

### 4. Obtener Proyectos Hijos
**GET** `/proyectos/:id/hijos`

Retorna todos los proyectos hijos de un proyecto padre específico.

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Proyectos hijos obtenidos exitosamente",
  "data": {
    "proyecto_padre": {
      "id": 1,
      "nombre": "Proyecto Padre"
    },
    "proyectos_hijos": [
      {
        "id": 2,
        "nombre": "Proyecto Hijo 1",
        "created_at": "2024-01-01T00:00:00Z",
        "division": {
          "id": 1,
          "nombre": "División"
        },
        "departamento": {
          "id": 1,
          "nombre": "Departamento"
        },
        "unidad": {
          "id": 1,
          "nombre": "Unidad"
        }
      }
    ]
  }
}
```

### 5. Remover Proyectos Hijos
**PATCH** `/proyectos/:id/remover-hijos`

Remueve proyectos hijos de un proyecto padre, moviendo sus carpetas de vuelta a la raíz.

#### Parámetros del Body:
```json
{
  "proyectos_hijos_ids": [1, 2, 3],
  "usuario_operacion": 1
}
```

#### Respuesta Exitosa (200):
```json
{
  "success": true,
  "message": "Proyectos hijos removidos exitosamente",
  "data": {
    "proyecto_padre": {
      "id": 1,
      "nombre": "Proyecto Padre"
    },
    "proyectos_removidos": [
      {
        "id": 2,
        "nombre": "Proyecto Hijo 1"
      }
    ]
  }
}
```

## Validaciones Implementadas

### Al Crear Proyecto Padre:
1. **Usuario Creador**: Debe existir en la base de datos
2. **Proyectos Hijos**: 
   - Deben existir y no estar eliminados
   - No pueden ser proyectos padre
   - No pueden tener ya un proyecto padre asignado

### Al Asignar Proyectos Hijos:
1. **Proyecto Padre**: Debe existir y ser un proyecto padre
2. **Proyectos Hijos**:
   - Deben existir y no estar eliminados
   - No pueden ser proyectos padre
   - No pueden tener ya un proyecto padre

### Al Remover Proyectos Hijos:
1. **Proyecto Padre**: Debe existir y ser un proyecto padre
2. **Proyectos Hijos**: Deben existir y pertenecer al proyecto padre especificado

## Gestión de Carpetas en MinIO

### Estructura de Carpetas:
```
proyectos/
├── proyecto_padre_1/
│   ├── carpeta_inicial_1/
│   ├── carpeta_inicial_2/
│   ├── proyecto_hijo_1/
│   │   ├── documentos/
│   │   └── carpetas/
│   └── proyecto_hijo_2/
│       ├── documentos/
│       └── carpetas/
└── proyecto_padre_2/
    └── ...
```

### Operaciones de Carpetas:
1. **Creación**: Se crea la carpeta del proyecto padre con estructura inicial
2. **Asignación**: Las carpetas de los proyectos hijos se mueven dentro del proyecto padre
3. **Remoción**: Las carpetas de los proyectos hijos se mueven de vuelta a la raíz
4. **Actualización**: Se actualizan las rutas en la base de datos

## Base de Datos

### Campos Agregados al Modelo `proyectos`:
- `proyecto_padre_id`: ID del proyecto padre (nullable)
- `es_proyecto_padre`: Boolean que indica si es un proyecto padre

### Relaciones:
- `proyecto_padre`: Relación con el proyecto padre
- `proyectos_hijos`: Relación con los proyectos hijos

## Casos de Uso

### 1. Organización de Proyectos Relacionados
- Crear un proyecto padre para agrupar proyectos de la misma región
- Crear un proyecto padre para proyectos del mismo tipo de obra
- Crear un proyecto padre para proyectos de la misma división

### 2. Gestión Jerárquica
- Un proyecto padre puede contener múltiples proyectos hijos
- Los proyectos hijos mantienen su independencia funcional
- Se pueden mover proyectos hijos entre diferentes proyectos padre

### 3. Estructura de Carpetas Organizada
- Los proyectos hijos se organizan dentro de la carpeta del proyecto padre
- Mantiene una estructura clara y fácil de navegar
- Permite acceso centralizado a todos los proyectos relacionados

## Consideraciones Técnicas

### Rendimiento:
- Las operaciones de movimiento de carpetas en MinIO pueden tomar tiempo
- Se implementan validaciones para evitar operaciones innecesarias
- Se manejan errores de forma individual para cada proyecto hijo

### Seguridad:
- Se validan permisos de usuario para todas las operaciones
- Se verifica la existencia de todos los elementos antes de las operaciones
- Se mantiene la integridad referencial en la base de datos

### Escalabilidad:
- La estructura permite agregar más proyectos hijos sin límite
- Se pueden crear múltiples niveles de jerarquía (futuro)
- Las operaciones se pueden optimizar para grandes volúmenes de datos

## Ejemplos de Uso

### Ejemplo 1: Crear Proyecto Padre con Hijos
```bash
curl -X POST http://localhost:3000/proyectos/padre \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Proyectos Región Metropolitana",
    "division_id": 1,
    "creado_por": 1,
    "proyectos_hijos_ids": [1, 2, 3],
    "carpeta_inicial": {
      "carpetas": [
        {"nombre": "Documentos Regionales"},
        {"nombre": "Reportes"}
      ]
    }
  }'
```

### Ejemplo 2: Asignar Proyectos Hijos Adicionales
```bash
curl -X POST http://localhost:3000/proyectos/1/asignar-hijos \
  -H "Content-Type: application/json" \
  -d '{
    "proyectos_hijos_ids": [4, 5],
    "usuario_operacion": 1
  }'
```

### Ejemplo 3: Obtener Proyectos Padre
```bash
curl -X GET http://localhost:3000/proyectos/padres
```

### Ejemplo 4: Obtener Hijos de un Proyecto Padre
```bash
curl -X GET http://localhost:3000/proyectos/1/hijos
```

### Ejemplo 5: Remover Proyectos Hijos
```bash
curl -X PATCH http://localhost:3000/proyectos/1/remover-hijos \
  -H "Content-Type: application/json" \
  -d '{
    "proyectos_hijos_ids": [2, 3],
    "usuario_operacion": 1
  }'
```

## Notas de Implementación

1. **Migración de Base de Datos**: Se requiere ejecutar la migración para agregar los nuevos campos
2. **Cliente Prisma**: Se debe regenerar el cliente de Prisma después de la migración
3. **MinIO**: Asegurar que el servicio de MinIO esté funcionando correctamente
4. **Permisos**: Verificar que el usuario tenga permisos para crear y modificar proyectos

## Futuras Mejoras

1. **Jerarquía Múltiple**: Permitir proyectos padre dentro de otros proyectos padre
2. **Permisos Granulares**: Control de acceso específico para proyectos padre e hijos
3. **Auditoría**: Registro de cambios en las relaciones padre-hijo
4. **Búsqueda Avanzada**: Filtros por proyectos padre en las búsquedas
5. **Reportes**: Generación de reportes consolidados por proyecto padre
