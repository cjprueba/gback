# Campo `es_carpeta_raiz` en Carpetas

## Descripción

Se ha agregado un nuevo campo `es_carpeta_raiz` a las respuestas de carpetas que indica si una carpeta es la carpeta raíz de un proyecto.

## Implementación

### Función Auxiliar

Se creó la función `esCarpetaRaizProyecto(carpetaId: number)` que:

1. Verifica si la carpeta pertenece a un proyecto
2. Consulta el campo `carpeta_raiz_id` del proyecto
3. Retorna `true` si la carpeta es la carpeta raíz del proyecto, `false` en caso contrario

### Ubicación en el Código

```typescript
// Función auxiliar para determinar si una carpeta es la carpeta raíz de un proyecto
async function esCarpetaRaizProyecto(carpetaId: number): Promise<boolean> {
  try {
    const carpeta = await prisma.carpetas.findUnique({
      where: { id: carpetaId },
      select: { 
        id: true,
        proyecto_id: true
      }
    });

    if (!carpeta || !carpeta.proyecto_id) {
      return false;
    }

    // Verificar si esta carpeta es la carpeta raíz del proyecto
    const proyecto = await prisma.proyectos.findUnique({
      where: { id: carpeta.proyecto_id },
      select: { carpeta_raiz_id: true }
    });

    return proyecto?.carpeta_raiz_id === carpetaId;
  } catch (error) {
    console.error('Error verificando si es carpeta raíz del proyecto:', error);
    return false;
  }
}
```

## Uso en las Respuestas

### 1. Consulta de Carpeta Individual (`GET /carpetas/:id`)

La carpeta principal incluye el campo `es_carpeta_raiz`:

```json
{
  "carpeta": {
    "id": 1,
    "nombre": "Carpeta Principal",
    "proyecto_id": 123,
    "es_carpeta_raiz": true,
    // ... otros campos
  },
  "contenido": {
    "carpetas": [],
    "documentos": []
  }
}
```

### 2. Consulta de Carpetas Hijas

Cada carpeta hija incluye el campo `es_carpeta_raiz`:

```json
{
  "contenido": {
    "carpetas": [
      {
        "id": 2,
        "nombre": "Subcarpeta 1",
        "es_carpeta_raiz": false,
        "total_documentos": 5,
        "total_carpetas_hijas": 2
      },
      {
        "id": 3,
        "nombre": "Subcarpeta 2",
        "es_carpeta_raiz": true,
        "total_documentos": 10,
        "total_carpetas_hijas": 0
      }
    ]
  }
}
```

### 3. Lista de Todas las Carpetas (`GET /carpetas`)

Cada carpeta en la lista incluye el campo `es_carpeta_raiz`:

```json
{
  "carpetas": [
    {
      "id": 1,
      "nombre": "Carpeta 1",
      "es_carpeta_raiz": true
    },
    {
      "id": 2,
      "nombre": "Carpeta 2",
      "es_carpeta_raiz": false
    }
  ]
}
```

## Base de Datos

El campo se basa en la relación existente en el esquema de Prisma:

- **Modelo `proyectos`**: Campo `carpeta_raiz_id` que apunta a la carpeta raíz
- **Modelo `carpetas`**: Relación `proyectos_carpeta_raiz` que indica qué proyectos tienen esa carpeta como raíz

## Beneficios

1. **Identificación Clara**: Permite identificar fácilmente qué carpetas son las raíces de los proyectos
2. **Navegación**: Facilita la navegación y estructuración de la interfaz de usuario
3. **Lógica de Negocio**: Permite implementar lógica específica para carpetas raíz vs. subcarpetas
4. **Consistencia**: Mantiene la consistencia con la estructura de la base de datos

## Consideraciones de Rendimiento

- La función se ejecuta para cada carpeta individualmente
- Para consultas con muchas carpetas, se realizan múltiples consultas a la base de datos
- En el futuro, se podría optimizar usando `JOIN` o consultas más eficientes si es necesario
