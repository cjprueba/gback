# Actualización de Colores a Formato Hexadecimal

## Resumen

Se han actualizado todos los colores de las etapas (`etapas_tipo`) de formato RGB a formato hexadecimal para mejorar la consistencia y compatibilidad con estándares web.

## Cambios Realizados

### 1. Archivos Actualizados

#### `prisma/seed.js`
- **Cartera de proyectos**: `rgb(52, 152, 219)` → `#3498DB`
- **Proyectos en Licitación**: `rgb(241, 196, 15)` → `#F1C40F`
- **Concesiones en Construcción**: `rgb(231, 76, 60)` → `#E74C3C`
- **Concesiones en Operación**: `rgb(46, 204, 113)` → `#2ECC71`
- **Concesiones en Operación y Construcción**: `rgb(155, 89, 182)` → `#9B59B6`
- **Concesiones Finalizadas**: `rgb(127, 140, 141)` → `#7F8C8D`

#### `etapas_tipo_atributos.csv`
- Todos los colores actualizados de formato RGB a hexadecimal
- Mismo mapeo de colores que en el seed file

#### `src/http/routes/etapas/etapas-tipo.ts`
- Agregada validación de formato hexadecimal para el campo `color`
- Regex: `/^#[0-9A-Fa-f]{6}$/`
- Mensaje de error: "Color debe ser un código hexadecimal válido (ej: #3498DB)"

### 2. Script de Actualización

#### `scripts/update-colors-to-hex.sql`
Script SQL para actualizar registros existentes en la base de datos:

```sql
-- Actualizar colores de etapas_tipo
UPDATE etapas_tipo 
SET color = '#3498DB' 
WHERE nombre = 'Cartera de proyectos' AND color = 'rgb(52, 152, 219)';

UPDATE etapas_tipo 
SET color = '#F1C40F' 
WHERE nombre = 'Proyectos en Licitación' AND color = 'rgb(241, 196, 15)';

UPDATE etapas_tipo 
SET color = '#E74C3C' 
WHERE nombre = 'Concesiones en Construcción' AND color = 'rgb(231, 76, 60)';

UPDATE etapas_tipo 
SET color = '#2ECC71' 
WHERE nombre = 'Concesiones en Operación' AND color = 'rgb(46, 204, 113)';

UPDATE etapas_tipo 
SET color = '#9B59B6' 
WHERE nombre = 'Concesiones en Operación y Construcción' AND color = 'rgb(155, 89, 182)';

UPDATE etapas_tipo 
SET color = '#7F8C8D' 
WHERE nombre = 'Concesiones Finalizadas' AND color = 'rgb(127, 140, 141)';
```

## Paleta de Colores

| Etapa | Color Hexadecimal | Descripción |
|-------|------------------|-------------|
| Cartera de proyectos | `#3498DB` | Azul |
| Proyectos en Licitación | `#F1C40F` | Amarillo |
| Concesiones en Construcción | `#E74C3C` | Rojo |
| Concesiones en Operación | `#2ECC71` | Verde |
| Concesiones en Operación y Construcción | `#9B59B6` | Púrpura |
| Concesiones Finalizadas | `#7F8C8D` | Gris |

## Instrucciones de Implementación

### 1. Para Bases de Datos Existentes

Si tienes datos existentes con colores en formato RGB, ejecuta el script de actualización:

```bash
# Ejecutar el script SQL
sqlite3 prisma/database.db < scripts/update-colors-to-hex.sql
```

### 2. Para Nuevas Instalaciones

Para nuevas instalaciones, simplemente ejecuta el seed actualizado:

```bash
# Ejecutar el seed actualizado
npm run db:seed
```

### 3. Verificación

Para verificar que los cambios se aplicaron correctamente:

```sql
SELECT id, nombre, color FROM etapas_tipo ORDER BY id;
```

Todos los colores deben aparecer en formato hexadecimal (ej: `#3498DB`).

## Beneficios del Cambio

1. **Consistencia**: Formato estándar web para colores
2. **Compatibilidad**: Mejor integración con frameworks frontend
3. **Validación**: Validación automática de formato hexadecimal
4. **Mantenibilidad**: Códigos de color más legibles y estándar

## Notas Importantes

- Los colores de `carpetas_transversales` ya estaban en formato hexadecimal
- La validación en las APIs ahora requiere formato hexadecimal
- Los colores mantienen la misma apariencia visual, solo cambia el formato
- El campo `color` en la base de datos soporta hasta 20 caracteres (suficiente para códigos hexadecimales) 