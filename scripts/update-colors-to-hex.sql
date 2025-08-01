-- Script para actualizar colores de etapas_tipo de RGB a hexadecimal
-- Este script convierte los colores existentes de formato RGB a hexadecimal

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

-- Verificar los cambios
SELECT id, nombre, color FROM etapas_tipo ORDER BY id; 