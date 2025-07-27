# Estructura de Carpetas en carpetas_transversales

## Nueva Columna: `estructura_carpetas`

Se ha agregado una nueva columna JSON llamada `estructura_carpetas` a la tabla `carpetas_transversales` para almacenar la estructura jerárquica de carpetas de manera flexible.

### Características de la Columna

- **Tipo**: `Json?` (opcional)
- **Valor por defecto**: `"{}"` (objeto JSON vacío)
- **Propósito**: Almacenar la estructura jerárquica de carpetas como un objeto JSON

### Estructura JSON Esperada

```json
{
  "carpetas": [
    {
      "id": "carpeta_1",
      "nombre": "Documentos de Proyecto",
      "descripcion": "Carpeta principal para documentos del proyecto",
      "orden": 1,
      "subcarpetas": [
        {
          "id": "subcarpeta_1_1",
          "nombre": "Planos",
          "descripcion": "Documentos de planos y diseños",
          "orden": 1,
          "subcarpetas": []
        },
        {
          "id": "subcarpeta_1_2",
          "nombre": "Contratos",
          "descripcion": "Documentos contractuales",
          "orden": 2,
          "subcarpetas": []
        }
      ]
    },
    {
      "id": "carpeta_2",
      "nombre": "Informes",
      "descripcion": "Carpeta para informes y reportes",
      "orden": 2,
      "subcarpetas": []
    }
  ],
  "configuracion": {
    "max_profundidad": 5,
    "permisos_por_defecto": {
      "lectura": ["admin", "usuario"],
      "escritura": ["admin"]
    },
    "tipos_archivo_permitidos": [".pdf", ".doc", ".docx", ".xls", ".xlsx"]
  }
}
```

### Propiedades de Cada Carpeta

- **id**: Identificador único de la carpeta (string)
- **nombre**: Nombre de la carpeta (string)
- **descripcion**: Descripción opcional de la carpeta (string)
- **orden**: Orden de visualización (number)
- **subcarpetas**: Array de subcarpetas (array de objetos con la misma estructura)

### Propiedades de Configuración

- **max_profundidad**: Número máximo de niveles de anidación permitidos
- **permisos_por_defecto**: Permisos por defecto para las carpetas
- **tipos_archivo_permitidos**: Tipos de archivo permitidos en las carpetas

### Ejemplo de Uso en el Código

```typescript
// Crear una nueva carpeta transversal con estructura
const nuevaCarpetaTransversal = await prisma.carpetas_transversales.create({
  data: {
    nombre: "Estructura de Documentos",
    descripcion: "Estructura estándar para documentos de proyectos",
    color: "#FF5733",
    orden: 1,
    etapa_tipo_id: 1,
    estructura_carpetas: {
      carpetas: [
        {
          id: "doc_proyecto",
          nombre: "Documentos de Proyecto",
          descripcion: "Documentos principales del proyecto",
          orden: 1,
          subcarpetas: [
            {
              id: "planos",
              nombre: "Planos",
              descripcion: "Planos y diseños",
              orden: 1,
              subcarpetas: []
            }
          ]
        }
      ],
      configuracion: {
        max_profundidad: 3,
        permisos_por_defecto: {
          lectura: ["admin", "usuario"],
          escritura: ["admin"]
        },
        tipos_archivo_permitidos: [".pdf", ".doc", ".docx"]
      }
    }
  }
});

// Consultar una carpeta transversal con su estructura
const carpetaTransversal = await prisma.carpetas_transversales.findUnique({
  where: { id: 1 },
  select: {
    id: true,
    nombre: true,
    estructura_carpetas: true
  }
});

// Acceder a la estructura de carpetas
const estructura = carpetaTransversal?.estructura_carpetas as any;
console.log(estructura.carpetas);
```

### Ventajas de esta Implementación

1. **Flexibilidad**: Permite estructuras de carpetas complejas y anidadas
2. **Configuración**: Incluye configuraciones específicas para cada tipo de carpeta transversal
3. **Escalabilidad**: Fácil de extender con nuevas propiedades
4. **Validación**: Se puede validar la estructura JSON antes de guardar
5. **Versionado**: Permite diferentes versiones de estructura para diferentes tipos de etapas

### Migración Aplicada

La migración `20250727010122_add_estructura_carpetas_to_carpetas_transversales` ha sido aplicada exitosamente, agregando la columna `estructura_carpetas` a la tabla `carpetas_transversales`. 