-- Script de prueba para verificar la creación de proyectos con carpetas
-- Este script simula la creación de un proyecto y verifica que se creen los registros correctamente

-- 1. Verificar que existe un usuario para crear el proyecto
SELECT id, nombre_completo FROM usuarios WHERE id = 1 LIMIT 1;

-- 2. Verificar que existe una división, departamento y unidad
SELECT id, nombre FROM divisiones WHERE id = 1 LIMIT 1;
SELECT id, nombre FROM departamentos WHERE id = 1 LIMIT 1;
SELECT id, nombre FROM unidades WHERE id = 1 LIMIT 1;

-- 3. Verificar que existe un tipo de etapa con carpetas_iniciales configuradas
SELECT 
  id, 
  nombre, 
  carpetas_iniciales 
FROM etapas_tipo 
WHERE carpetas_iniciales IS NOT NULL 
  AND carpetas_iniciales != '{}'
LIMIT 1;

-- 4. Simular la creación de un proyecto (esto se haría via API)
-- INSERT INTO proyectos (nombre, creado_por, division_id, departamento_id, unidad_id)
-- VALUES ('Proyecto de Prueba', 1, 1, 1, 1);

-- 5. Verificar la estructura de carpetas después de crear un proyecto
-- (Ejecutar después de crear un proyecto via API)

-- Consulta para ver todos los proyectos con sus carpetas raíz
SELECT 
  p.id,
  p.nombre as proyecto_nombre,
  p.carpeta_raiz_id,
  c.nombre as carpeta_raiz_nombre,
  c.s3_path as carpeta_raiz_s3_path
FROM proyectos p
LEFT JOIN carpetas c ON p.carpeta_raiz_id = c.id
ORDER BY p.id DESC
LIMIT 10;

-- Consulta para ver todas las carpetas de un proyecto específico
-- (Reemplazar 123 con el ID del proyecto creado)
SELECT 
  c.id,
  c.nombre,
  c.descripcion,
  c.s3_path,
  c.orden_visualizacion,
  c.carpeta_padre_id,
  CASE 
    WHEN c.carpeta_padre_id IS NULL THEN 'Carpeta Raíz'
    ELSE 'Subcarpeta'
  END as tipo_carpeta
FROM carpetas c
WHERE c.proyecto_id = 123  -- Cambiar por el ID del proyecto
ORDER BY c.orden_visualizacion;

-- Consulta para ver la jerarquía de carpetas de un proyecto
WITH RECURSIVE carpeta_hierarchy AS (
  -- Carpetas raíz del proyecto
  SELECT 
    id, nombre, descripcion, carpeta_padre_id, s3_path, orden_visualizacion,
    0 as nivel,
    nombre as ruta_completa
  FROM carpetas 
  WHERE proyecto_id = 123 AND carpeta_padre_id IS NULL  -- Cambiar por el ID del proyecto
  
  UNION ALL
  
  -- Subcarpetas
  SELECT 
    c.id, c.nombre, c.descripcion, c.carpeta_padre_id, c.s3_path, c.orden_visualizacion,
    ch.nivel + 1,
    ch.ruta_completa || ' > ' || c.nombre
  FROM carpetas c
  INNER JOIN carpeta_hierarchy ch ON c.carpeta_padre_id = ch.id
  WHERE c.proyecto_id = 123  -- Cambiar por el ID del proyecto
)
SELECT 
  nivel,
  nombre,
  descripcion,
  s3_path,
  ruta_completa
FROM carpeta_hierarchy
ORDER BY ruta_completa;

-- Consulta para verificar que las carpetas de MinIO coinciden con los registros de BD
-- (Esta consulta ayuda a verificar la sincronización entre MinIO y la base de datos)
SELECT 
  c.id,
  c.nombre,
  c.s3_path,
  c.s3_bucket_name,
  c.s3_created,
  CASE 
    WHEN c.s3_created = true THEN '✅ Sincronizada'
    ELSE '❌ No sincronizada'
  END as estado_sincronizacion
FROM carpetas c
WHERE c.proyecto_id = 123  -- Cambiar por el ID del proyecto
ORDER BY c.orden_visualizacion;

-- Consulta para ver estadísticas de carpetas por proyecto
SELECT 
  p.id as proyecto_id,
  p.nombre as proyecto_nombre,
  COUNT(c.id) as total_carpetas,
  COUNT(CASE WHEN c.carpeta_padre_id IS NULL THEN 1 END) as carpetas_raiz,
  COUNT(CASE WHEN c.carpeta_padre_id IS NOT NULL THEN 1 END) as subcarpetas,
  MAX(c.orden_visualizacion) as max_orden
FROM proyectos p
LEFT JOIN carpetas c ON p.id = c.proyecto_id
GROUP BY p.id, p.nombre
ORDER BY p.id DESC
LIMIT 10; 