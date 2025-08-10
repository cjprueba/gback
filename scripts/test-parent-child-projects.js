const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testParentChildProjects() {
  console.log('🧪 Iniciando pruebas de proyectos padre-hijo...\n');

  try {
    // 1. Crear algunos proyectos normales primero
    console.log('1️⃣ Creando proyectos normales...');
    
    const proyecto1 = await prisma.proyectos.create({
      data: {
        nombre: 'Proyecto Carretera Norte',
        creado_por: 1,
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1
      }
    });

    const proyecto2 = await prisma.proyectos.create({
      data: {
        nombre: 'Proyecto Puente Sur',
        creado_por: 1,
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1
      }
    });

    const proyecto3 = await prisma.proyectos.create({
      data: {
        nombre: 'Proyecto Túnel Este',
        creado_por: 1,
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1
      }
    });

    console.log(`✅ Proyectos creados: ${proyecto1.nombre}, ${proyecto2.nombre}, ${proyecto3.nombre}\n`);

    // 2. Crear un proyecto padre
    console.log('2️⃣ Creando proyecto padre...');
    
    const proyectoPadre = await prisma.proyectos.create({
      data: {
        nombre: 'Proyectos Región Metropolitana',
        creado_por: 1,
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1,
        es_proyecto_padre: true,
        carpeta_inicial: {
          carpetas: [
            { nombre: 'Documentos Regionales' },
            { nombre: 'Reportes Consolidados' },
            { nombre: 'Planificación Regional' }
          ]
        }
      }
    });

    console.log(`✅ Proyecto padre creado: ${proyectoPadre.nombre} (ID: ${proyectoPadre.id})\n`);

    // 3. Asignar proyectos hijos al proyecto padre
    console.log('3️⃣ Asignando proyectos hijos al proyecto padre...');
    
    await prisma.proyectos.updateMany({
      where: {
        id: { in: [proyecto1.id, proyecto2.id] }
      },
      data: {
        proyecto_padre_id: proyectoPadre.id
      }
    });

    console.log(`✅ Proyectos ${proyecto1.nombre} y ${proyecto2.nombre} asignados como hijos\n`);

    // 4. Verificar la estructura padre-hijo
    console.log('4️⃣ Verificando estructura padre-hijo...');
    
    const proyectoPadreConHijos = await prisma.proyectos.findUnique({
      where: { id: proyectoPadre.id },
      include: {
        proyectos_hijos: {
          select: {
            id: true,
            nombre: true,
            proyecto_padre_id: true
          }
        }
      }
    });

    console.log(`📋 Proyecto padre: ${proyectoPadreConHijos.nombre}`);
    console.log(`📋 Es proyecto padre: ${proyectoPadreConHijos.es_proyecto_padre}`);
    console.log(`📋 Número de hijos: ${proyectoPadreConHijos.proyectos_hijos.length}`);
    proyectoPadreConHijos.proyectos_hijos.forEach(hijo => {
      console.log(`   - Hijo: ${hijo.nombre} (ID: ${hijo.id})`);
    });
    console.log('');

    // 5. Verificar que los proyectos hijos tienen el padre correcto
    console.log('5️⃣ Verificando proyectos hijos...');
    
    const proyectosHijos = await prisma.proyectos.findMany({
      where: {
        proyecto_padre_id: proyectoPadre.id
      },
      select: {
        id: true,
        nombre: true,
        proyecto_padre_id: true,
        es_proyecto_padre: true
      }
    });

    proyectosHijos.forEach(hijo => {
      console.log(`📋 ${hijo.nombre}:`);
      console.log(`   - ID: ${hijo.id}`);
      console.log(`   - Proyecto padre ID: ${hijo.proyecto_padre_id}`);
      console.log(`   - Es proyecto padre: ${hijo.es_proyecto_padre}`);
    });
    console.log('');

    // 6. Agregar un proyecto hijo adicional
    console.log('6️⃣ Agregando proyecto hijo adicional...');
    
    await prisma.proyectos.update({
      where: { id: proyecto3.id },
      data: {
        proyecto_padre_id: proyectoPadre.id
      }
    });

    console.log(`✅ Proyecto ${proyecto3.nombre} agregado como hijo\n`);

    // 7. Verificar la estructura final
    console.log('7️⃣ Verificando estructura final...');
    
    const estructuraFinal = await prisma.proyectos.findUnique({
      where: { id: proyectoPadre.id },
      include: {
        proyectos_hijos: {
          select: {
            id: true,
            nombre: true,
            created_at: true
          },
          orderBy: {
            created_at: 'asc'
          }
        }
      }
    });

    console.log(`📊 Estructura final del proyecto padre "${estructuraFinal.nombre}":`);
    console.log(`📊 Total de proyectos hijos: ${estructuraFinal.proyectos_hijos.length}`);
    estructuraFinal.proyectos_hijos.forEach((hijo, index) => {
      console.log(`   ${index + 1}. ${hijo.nombre} (creado: ${hijo.created_at.toISOString().split('T')[0]})`);
    });
    console.log('');

    // 8. Probar consultas específicas
    console.log('8️⃣ Probando consultas específicas...');
    
    // Obtener solo proyectos padre
    const proyectosPadre = await prisma.proyectos.findMany({
      where: {
        es_proyecto_padre: true,
        eliminado: false
      },
      select: {
        id: true,
        nombre: true,
        _count: {
          select: {
            proyectos_hijos: true
          }
        }
      }
    });

    console.log('📋 Proyectos padre encontrados:');
    proyectosPadre.forEach(padre => {
      console.log(`   - ${padre.nombre}: ${padre._count.proyectos_hijos} hijos`);
    });
    console.log('');

    // Obtener proyectos sin padre (proyectos raíz)
    const proyectosRaiz = await prisma.proyectos.findMany({
      where: {
        proyecto_padre_id: null,
        eliminado: false
      },
      select: {
        id: true,
        nombre: true,
        es_proyecto_padre: true
      }
    });

    console.log('📋 Proyectos raíz (sin padre):');
    proyectosRaiz.forEach(proyecto => {
      console.log(`   - ${proyecto.nombre} ${proyecto.es_proyecto_padre ? '(es proyecto padre)' : ''}`);
    });
    console.log('');

    console.log('✅ Todas las pruebas completadas exitosamente!\n');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar las pruebas
testParentChildProjects();
