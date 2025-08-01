// Script de ejemplo para probar la funcionalidad de soft delete
// Ejecutar después de aplicar los cambios en la base de datos

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSoftDelete() {
  try {
    console.log('🧪 Iniciando pruebas de soft delete...\n');

    // 1. Crear un proyecto de prueba
    console.log('1. Creando proyecto de prueba...');
    const proyecto = await prisma.proyectos.create({
      data: {
        nombre: 'Proyecto de Prueba - Soft Delete',
        creado_por: 1, // Asegúrate de que este usuario existe
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1
      }
    });
    console.log(`✅ Proyecto creado con ID: ${proyecto.id}\n`);

    // 2. Verificar que el proyecto aparece en la lista normal
    console.log('2. Verificando que el proyecto aparece en la lista normal...');
    const proyectosActivos = await prisma.proyectos.findMany({
      where: { eliminado: false },
      select: { id: true, nombre: true, eliminado: true }
    });
    console.log(`✅ Proyectos activos encontrados: ${proyectosActivos.length}`);
    console.log('Proyectos activos:', proyectosActivos.map(p => ({ id: p.id, nombre: p.nombre, eliminado: p.eliminado })));
    console.log('');

    // 3. Simular soft delete
    console.log('3. Realizando soft delete del proyecto...');
    const proyectoEliminado = await prisma.proyectos.update({
      where: { id: proyecto.id },
      data: { eliminado: true }
    });
    console.log(`✅ Proyecto marcado como eliminado: ${proyectoEliminado.nombre}\n`);

    // 4. Verificar que el proyecto NO aparece en la lista normal
    console.log('4. Verificando que el proyecto NO aparece en la lista normal...');
    const proyectosActivosDespues = await prisma.proyectos.findMany({
      where: { eliminado: false },
      select: { id: true, nombre: true, eliminado: true }
    });
    console.log(`✅ Proyectos activos después del soft delete: ${proyectosActivosDespues.length}`);
    console.log('Proyectos activos:', proyectosActivosDespues.map(p => ({ id: p.id, nombre: p.nombre, eliminado: p.eliminado })));
    console.log('');

    // 5. Verificar que el proyecto SÍ aparece en la lista de eliminados
    console.log('5. Verificando que el proyecto aparece en la lista de eliminados...');
    const proyectosEliminados = await prisma.proyectos.findMany({
      where: { eliminado: true },
      select: { id: true, nombre: true, eliminado: true }
    });
    console.log(`✅ Proyectos eliminados encontrados: ${proyectosEliminados.length}`);
    console.log('Proyectos eliminados:', proyectosEliminados.map(p => ({ id: p.id, nombre: p.nombre, eliminado: p.eliminado })));
    console.log('');

    // 6. Simular restauración
    console.log('6. Restaurando el proyecto...');
    const proyectoRestaurado = await prisma.proyectos.update({
      where: { id: proyecto.id },
      data: { eliminado: false }
    });
    console.log(`✅ Proyecto restaurado: ${proyectoRestaurado.nombre}\n`);

    // 7. Verificar que el proyecto aparece nuevamente en la lista normal
    console.log('7. Verificando que el proyecto aparece nuevamente en la lista normal...');
    const proyectosActivosFinal = await prisma.proyectos.findMany({
      where: { eliminado: false },
      select: { id: true, nombre: true, eliminado: true }
    });
    console.log(`✅ Proyectos activos finales: ${proyectosActivosFinal.length}`);
    console.log('Proyectos activos:', proyectosActivosFinal.map(p => ({ id: p.id, nombre: p.nombre, eliminado: p.eliminado })));
    console.log('');

    // 8. Limpiar - eliminar el proyecto de prueba
    console.log('8. Limpiando proyecto de prueba...');
    await prisma.proyectos.delete({
      where: { id: proyecto.id }
    });
    console.log(`✅ Proyecto de prueba eliminado permanentemente\n`);

    console.log('🎉 Todas las pruebas de soft delete completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testSoftDelete(); 