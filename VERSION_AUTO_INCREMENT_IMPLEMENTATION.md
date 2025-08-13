# Implementación de Auto-Incremento de Versiones

## Resumen de Cambios

Se ha implementado exitosamente la funcionalidad para que el campo `numero_version` en la tabla `documento_versiones` sea numérico y auto-incremente automáticamente cuando se reemplaza un archivo.

## Cambios Realizados

### 1. Modificación del Schema de Prisma

**Archivo:** `prisma/schema.prisma`

**Cambio:** El campo `numero_version` en el modelo `documento_versiones` se cambió de:
```prisma
numero_version    String     @db.VarChar(20)
```

A:
```prisma
numero_version    Int
```

**Migración:** Se creó y aplicó la migración `20250813002210_change_numero_version_to_int`

### 2. Actualización de la Lógica de Subida de Archivos

**Archivo:** `src/http/routes/documentos/documentos.ts`

#### 2.1 Lógica de Verificación de Documentos Existentes
- Se modificó la lógica para permitir reemplazo de archivos cuando `reemplazar: true`
- Se implementó la búsqueda de la versión más alta para calcular el siguiente número de versión

#### 2.2 Auto-Incremento de Versiones
- **Para archivos nuevos:** Se crea con `numero_version: 1`
- **Para archivos reemplazados:** Se calcula automáticamente `nextVersionNumber = highestVersion.numero_version + 1`

#### 2.3 Manejo de Versiones Activas
- Al reemplazar un archivo, todas las versiones anteriores se marcan como `activa: false`
- Solo la nueva versión se marca como `activa: true`

#### 2.4 Registro de Auditoría
- Se actualiza el historial para distinguir entre `upload` y `replace`
- Se registra la versión anterior y la nueva versión

### 3. Actualización de Esquemas de Respuesta

**Archivo:** `src/http/routes/documentos/documentos.ts`

Se actualizaron todos los esquemas Zod para que `numero_version` sea de tipo `z.number()` en lugar de `z.string()`:

- Endpoint `POST /documentos/upload`
- Endpoint `GET /documentos/folder/:carpetaId`
- Endpoint `GET /documentos/:documentoId`

### 4. Conversión de Tipos en Historial

**Archivo:** `src/http/routes/documentos/documentos.ts`

Se implementó la conversión de `numero_version` (numérico) a string para el registro en `archivo_historial`, ya que este campo espera strings.

## Funcionalidad Implementada

### 1. Subida de Archivos Nuevos
- Crea documento con `numero_version: 1`
- Marca la versión como activa

### 2. Reemplazo de Archivos Existentes
- Busca la versión más alta del documento
- Calcula automáticamente el siguiente número: `highestVersion + 1`
- Desactiva todas las versiones anteriores
- Crea nueva versión con el número calculado
- Marca la nueva versión como activa

### 3. Control de Versiones
- Solo una versión puede estar activa por documento
- Las versiones anteriores se mantienen para auditoría
- El historial registra todas las acciones (upload/replace)

## Ejemplo de Funcionamiento

```
Documento: "reporte.pdf"
├── Versión 1: Activa (inicial)
├── Versión 2: Inactiva (reemplazada)
└── Versión 3: Activa (última reemplazada)

Al reemplazar nuevamente:
├── Versión 1: Inactiva
├── Versión 2: Inactiva  
├── Versión 3: Inactiva
└── Versión 4: Activa (nueva)
```

## Endpoints Afectados

1. **`POST /documentos/upload`** - Subida y reemplazo de archivos
2. **`GET /documentos/folder/:carpetaId`** - Lista de documentos con versiones
3. **`GET /documentos/:documentoId`** - Propiedades del documento con versión activa
4. **`DELETE /documentos/:documentoId`** - Eliminación con registro de versión

## Beneficios de la Implementación

1. **Control de Versiones Automático:** No es necesario especificar manualmente el número de versión
2. **Integridad de Datos:** Garantiza que no haya duplicados de números de versión
3. **Auditoría Completa:** Mantiene historial de todas las versiones
4. **Flexibilidad:** Permite reemplazar archivos existentes sin crear duplicados
5. **Consistencia:** Solo una versión activa por documento en cualquier momento

## Consideraciones Técnicas

- El campo `numero_version` ahora es de tipo `Int` en la base de datos
- Se mantiene compatibilidad con el historial convirtiendo a string cuando es necesario
- La lógica de auto-incremento es robusta y maneja casos edge
- Se mantiene la integridad referencial con la tabla `documentos`

## Pruebas Realizadas

Se ejecutó un script de prueba que verificó:
- ✅ Creación de primera versión (numero_version: 1)
- ✅ Reemplazo con segunda versión (numero_version: 2)
- ✅ Reemplazo con tercera versión (numero_version: 3)
- ✅ Cálculo automático del siguiente número (numero_version: 4)
- ✅ Control de versiones activas/inactivas
- ✅ Integridad de los datos en la base de datos

## Conclusión

La implementación del auto-incremento de versiones está completa y funcional. El sistema ahora maneja automáticamente la numeración de versiones cuando se reemplazan archivos, manteniendo un control estricto sobre las versiones activas y proporcionando un historial completo de cambios.
