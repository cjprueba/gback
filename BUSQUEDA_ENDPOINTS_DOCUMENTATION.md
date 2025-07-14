# Endpoints de Búsqueda - Documentación

## Descripción General

Se han creado tres endpoints principales para la búsqueda de archivos y carpetas en el sistema:

1. **Búsqueda General** (`/busqueda`) - Busca en archivos y carpetas simultáneamente
2. **Búsqueda de Archivos** (`/busqueda/archivos`) - Búsqueda específica de archivos
3. **Búsqueda de Carpetas** (`/busqueda/carpetas`) - Búsqueda específica de carpetas

## Endpoints Disponibles

### 1. Búsqueda General - `/busqueda`

**Método:** GET

**Descripción:** Realiza una búsqueda general en archivos y carpetas con múltiples opciones de filtrado.

**Parámetros de Query:**
- `query` (requerido): Texto a buscar
- `tipo_busqueda` (opcional): `general`, `archivos`, `carpetas` (default: `general`)

**Filtros de Archivos:**
- `extension`: Extensión del archivo
- `categoria`: Categoría del archivo
- `estado`: Estado del archivo
- `etiquetas`: Etiquetas separadas por comas
- `tamano_min`: Tamaño mínimo en MB
- `tamano_max`: Tamaño máximo en MB
- `fecha_desde`: Fecha de creación desde (YYYY-MM-DD)
- `fecha_hasta`: Fecha de creación hasta (YYYY-MM-DD)

**Filtros de Carpetas:**
- `carpeta_padre_id`: ID de la carpeta padre
- `proyecto_id`: ID del proyecto
- `usuario_creador`: ID del usuario creador

**Filtros Generales:**
- `activo`: Estado activo (true/false)

**Paginación:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)

**Ordenamiento:**
- `sort_by`: `nombre`, `fecha_creacion`, `tamano`, `relevancia` (default: `relevancia`)
- `sort_order`: `asc`, `desc` (default: `desc`)

**Incluir Relaciones:**
- `include_creador`: Incluir información del creador (true/false)
- `include_carpeta`: Incluir información de la carpeta (true/false)
- `include_proyecto`: Incluir información del proyecto (true/false)

**Ejemplo de Uso:**
```
GET /busqueda?query=documento&tipo_busqueda=general&extension=pdf&page=1&limit=10&include_creador=true
```

### 2. Búsqueda de Archivos - `/busqueda/archivos`

**Método:** GET

**Descripción:** Realiza una búsqueda específica en archivos con filtros avanzados.

**Parámetros de Query:**
- `query` (requerido): Texto a buscar
- `extension`: Extensión del archivo
- `categoria`: Categoría del archivo
- `estado`: Estado del archivo
- `etiquetas`: Etiquetas separadas por comas
- `tamano_min`: Tamaño mínimo en MB
- `tamano_max`: Tamaño máximo en MB
- `fecha_desde`: Fecha de creación desde (YYYY-MM-DD)
- `fecha_hasta`: Fecha de creación hasta (YYYY-MM-DD)
- `proyecto_id`: ID del proyecto
- `carpeta_id`: ID de la carpeta
- `usuario_creador`: ID del usuario creador
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)
- `sort_by`: `nombre`, `fecha_creacion`, `tamano`, `relevancia` (default: `relevancia`)
- `sort_order`: `asc`, `desc` (default: `desc`)
- `include_creador`: Incluir información del creador (true/false)
- `include_carpeta`: Incluir información de la carpeta (true/false)
- `include_proyecto`: Incluir información del proyecto (true/false)

**Ejemplo de Uso:**
```
GET /busqueda/archivos?query=reporte&extension=pdf&categoria=informes&page=1&limit=20
```

### 3. Búsqueda de Carpetas - `/busqueda/carpetas`

**Método:** GET

**Descripción:** Realiza una búsqueda específica en carpetas con filtros avanzados.

**Parámetros de Query:**
- `query` (requerido): Texto a buscar
- `carpeta_padre_id`: ID de la carpeta padre
- `proyecto_id`: ID del proyecto
- `usuario_creador`: ID del usuario creador
- `activa`: Estado activo (true/false)
- `fecha_desde`: Fecha de creación desde (YYYY-MM-DD)
- `fecha_hasta`: Fecha de creación hasta (YYYY-MM-DD)
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 20)
- `sort_by`: `nombre`, `fecha_creacion`, `relevancia` (default: `relevancia`)
- `sort_order`: `asc`, `desc` (default: `desc`)
- `include_creador`: Incluir información del creador (true/false)
- `include_padre`: Incluir información de la carpeta padre (true/false)
- `include_proyecto`: Incluir información del proyecto (true/false)

**Ejemplo de Uso:**
```
GET /busqueda/carpetas?query=proyecto&proyecto_id=1&include_creador=true&include_padre=true
```

## Respuestas

### Estructura de Respuesta General

```json
{
  "resultados": {
    "archivos": [...],
    "carpetas": [...]
  },
  "paginacion": {
    "page": 1,
    "limit": 20,
    "total_archivos": 50,
    "total_carpetas": 10,
    "total_resultados": 60,
    "total_pages": 3
  },
  "estadisticas": {
    "tiempo_busqueda_ms": 150,
    "consulta_original": "documento",
    "tipo_busqueda": "general"
  }
}
```

### Estructura de Respuesta para Archivos

```json
{
  "archivos": [
    {
      "id": "uuid",
      "nombre_archivo": "documento.pdf",
      "extension": "pdf",
      "tamano": 1024000,
      "tipo_mime": "application/pdf",
      "descripcion": "Documento de ejemplo",
      "categoria": "informes",
      "estado": "activo",
      "version": "1.0",
      "carpeta_id": 1,
      "s3_path": "carpeta/documento.pdf",
      "etiquetas": ["importante", "final"],
      "proyecto_id": 1,
      "subido_por": 1,
      "fecha_creacion": "2024-01-01T00:00:00Z",
      "fecha_ultima_actualizacion": "2024-01-01T00:00:00Z",
      "creador": {
        "id": 1,
        "nombre_completo": "Juan Pérez",
        "correo_electronico": "juan@example.com"
      },
      "carpeta": {
        "id": 1,
        "nombre": "Documentos",
        "s3_path": "carpeta"
      },
      "proyecto": {
        "id": 1,
        "nombre": "Proyecto A"
      }
    }
  ],
  "paginacion": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "total_pages": 3
  },
  "estadisticas": {
    "tiempo_busqueda_ms": 100,
    "consulta_original": "documento"
  }
}
```

### Estructura de Respuesta para Carpetas

```json
{
  "carpetas": [
    {
      "id": 1,
      "nombre": "Documentos",
      "descripcion": "Carpeta de documentos",
      "carpeta_padre_id": null,
      "proyecto_id": 1,
      "s3_path": "documentos",
      "orden_visualizacion": 1,
      "max_tamaño_mb": 100,
      "tipos_archivo_permitidos": ["pdf", "doc", "docx"],
      "permisos_lectura": ["admin", "user"],
      "permisos_escritura": ["admin"],
      "usuario_creador": 1,
      "fecha_creacion": "2024-01-01T00:00:00Z",
      "fecha_actualizacion": "2024-01-01T00:00:00Z",
      "activa": true,
      "creador": {
        "id": 1,
        "nombre_completo": "Juan Pérez",
        "correo_electronico": "juan@example.com"
      },
      "carpeta_padre": {
        "id": 1,
        "nombre": "Raíz"
      },
      "proyecto": {
        "id": 1,
        "nombre": "Proyecto A"
      }
    }
  ],
  "paginacion": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "total_pages": 1
  },
  "estadisticas": {
    "tiempo_busqueda_ms": 50,
    "consulta_original": "documentos"
  }
}
```

## Características Principales

### Búsqueda de Texto
- Búsqueda insensible a mayúsculas/minúsculas
- Búsqueda en nombres y descripciones
- Soporte para búsqueda parcial

### Filtros Avanzados
- Filtros por tipo de archivo (extensión)
- Filtros por categoría y estado
- Filtros por etiquetas
- Filtros por tamaño de archivo
- Filtros por fechas de creación
- Filtros por proyecto y carpeta
- Filtros por usuario creador

### Paginación
- Control de página y límite de resultados
- Información de total de resultados
- Cálculo automático de páginas totales

### Ordenamiento
- Por nombre (alfabético)
- Por fecha de creación
- Por tamaño (solo archivos)
- Por relevancia (basado en fecha de creación)

### Relaciones Incluidas
- Información del creador
- Información de la carpeta contenedora
- Información del proyecto asociado
- Información de la carpeta padre (para carpetas)

### Estadísticas
- Tiempo de búsqueda en milisegundos
- Consulta original realizada
- Tipo de búsqueda ejecutada

## Códigos de Error

- `400`: Error en los parámetros de la consulta
- `500`: Error interno del servidor

## Notas de Implementación

1. **Búsqueda de Texto**: Utiliza búsqueda insensible a mayúsculas/minúsculas en nombres y descripciones
2. **Filtros de Tamaño**: Los tamaños se manejan en bytes internamente, pero se aceptan en MB en los parámetros
3. **Fechas**: Se aceptan fechas en formato ISO (YYYY-MM-DD)
4. **Etiquetas**: Se pueden especificar múltiples etiquetas separadas por comas
5. **Relaciones**: Las relaciones son opcionales y se incluyen solo si se solicitan
6. **Paginación**: Se aplica por separado a archivos y carpetas en la búsqueda general
7. **Ordenamiento**: El ordenamiento por relevancia se simula usando la fecha de creación
8. **Transformación de Datos**: Los tamaños BigInt se convierten a números para la respuesta JSON 