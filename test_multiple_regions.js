const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMultipleRegions() {
  try {
    console.log('Testing multiple regions, provinces, and communes functionality...');
    
    // Test creating a project with multiple regions, provinces, and communes
    const proyecto = await prisma.proyectos.create({
      data: {
        nombre: 'Proyecto Test Múltiples Regiones',
        creado_por: 1, // Assuming user ID 1 exists
        division_id: 1,
        departamento_id: 1,
        unidad_id: 1
      }
    });
    
    console.log('Proyecto creado:', proyecto.id);
    
    // Create etapa with multiple regions, provinces, and communes
    const etapa = await prisma.etapas_registro.create({
      data: {
        etapa_tipo_id: 1, // Assuming etapa tipo 1 exists
        proyecto_id: proyecto.id,
        tipo_iniciativa_id: 1, // Assuming tipo iniciativa 1 exists
        volumen: 'Test volumen',
        presupuesto_oficial: '1000000',
        usuario_creador: 1,
        activa: true
      }
    });
    
    console.log('Etapa creada:', etapa.id);
    
    // Add multiple regions
    await prisma.etapas_regiones.createMany({
      data: [
        { etapa_registro_id: etapa.id, region_id: 1 },
        { etapa_registro_id: etapa.id, region_id: 2 }
      ]
    });
    
    // Add multiple provinces
    await prisma.etapas_provincias.createMany({
      data: [
        { etapa_registro_id: etapa.id, provincia_id: 1 },
        { etapa_registro_id: etapa.id, provincia_id: 2 }
      ]
    });
    
    // Add multiple communes
    await prisma.etapas_comunas.createMany({
      data: [
        { etapa_registro_id: etapa.id, comuna_id: 1 },
        { etapa_registro_id: etapa.id, comuna_id: 2 }
      ]
    });
    
    console.log('Relaciones creadas exitosamente');
    
    // Query to verify the relationships
    const etapaWithRelations = await prisma.etapas_registro.findUnique({
      where: { id: etapa.id },
      include: {
        etapas_regiones: {
          include: {
            region: true
          }
        },
        etapas_provincias: {
          include: {
            provincia: true
          }
        },
        etapas_comunas: {
          include: {
            comuna: true
          }
        }
      }
    });
    
    console.log('Etapa con relaciones:', JSON.stringify(etapaWithRelations, null, 2));
    
    // Clean up
    await prisma.etapas_regiones.deleteMany({
      where: { etapa_registro_id: etapa.id }
    });
    
    await prisma.etapas_provincias.deleteMany({
      where: { etapa_registro_id: etapa.id }
    });
    
    await prisma.etapas_comunas.deleteMany({
      where: { etapa_registro_id: etapa.id }
    });
    
    await prisma.etapas_registro.delete({
      where: { id: etapa.id }
    });
    
    await prisma.proyectos.delete({
      where: { id: proyecto.id }
    });
    
    console.log('Test completado exitosamente');
    
  } catch (error) {
    console.error('Error en el test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultipleRegions(); 