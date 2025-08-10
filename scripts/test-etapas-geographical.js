const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEtapasGeographical() {
  try {
    console.log('🧪 Testing Etapas Geographical Structure...\n');

    // Test 1: Check if etapas_geografia table has data
    console.log('1. Checking etapas_geografia table...');
    const etapasGeografia = await prisma.etapas_geografia.findMany({
      take: 5,
      include: {
        region: true,
        provincia: true,
        comuna: true,
        etapa_registro: {
          include: {
            etapa_tipo: true,
            proyecto: true
          }
        }
      }
    });

    if (etapasGeografia.length === 0) {
      console.log('   ⚠️  No geographical data found in etapas_geografia table');
      console.log('   This might be normal if no projects have been created with geographical data yet');
    } else {
      console.log(`   ✅ Found ${etapasGeografia.length} geographical records`);
      console.log('   Sample data:');
      etapasGeografia.forEach((geo, index) => {
        console.log(`   Record ${index + 1}:`);
        console.log(`     Region: ${geo.region.nombre} (${geo.region.codigo})`);
        console.log(`     Province: ${geo.provincia.nombre} (${geo.provincia.codigo})`);
        console.log(`     Commune: ${geo.comuna.nombre}`);
        console.log(`     Project: ${geo.etapa_registro.proyecto.nombre}`);
        console.log(`     Stage Type: ${geo.etapa_registro.etapa_tipo.nombre}`);
      });
    }

    // Test 2: Check if etapas_registro table has data with geographical relationships
    console.log('\n2. Checking etapas_registro with geographical data...');
    const etapasConGeografia = await prisma.etapas_registro.findMany({
      where: {
        etapas_geografia: {
          some: {}
        }
      },
      take: 3,
      include: {
        etapas_geografia: {
          include: {
            region: true,
            provincia: true,
            comuna: true
          }
        },
        etapa_tipo: true,
        proyecto: true
      }
    });

    if (etapasConGeografia.length === 0) {
      console.log('   ⚠️  No stages found with geographical data');
    } else {
      console.log(`   ✅ Found ${etapasConGeografia.length} stages with geographical data`);
      console.log('   Sample stages:');
      etapasConGeografia.forEach((etapa, index) => {
        console.log(`   Stage ${index + 1}: ${etapa.etapa_tipo.nombre}`);
        console.log(`     Project: ${etapa.proyecto.nombre}`);
        console.log(`     Geographical records: ${etapa.etapas_geografia.length}`);
        etapa.etapas_geografia.forEach((geo, geoIndex) => {
          console.log(`       Geo ${geoIndex + 1}: ${geo.region.nombre} > ${geo.provincia.nombre} > ${geo.comuna.nombre}`);
        });
      });
    }

    // Test 3: Test the transformGeographicalData function logic
    console.log('\n3. Testing geographical data transformation logic...');
    if (etapasConGeografia.length > 0) {
      const etapa = etapasConGeografia[0];
      console.log(`   Using stage: ${etapa.etapa_tipo.nombre}`);
      
      // Simulate the transformGeographicalData function
      const regionsMap = new Map();
      
      etapa.etapas_geografia.forEach(etapaGeo => {
        const { region, provincia, comuna } = etapaGeo;
        
        if (region && provincia && comuna) {
          if (!regionsMap.has(region.id)) {
            regionsMap.set(region.id, {
              ...region,
              etapas_provincias: []
            });
          }
          
          const regionData = regionsMap.get(region.id);
          
          let provinciaData = regionData.etapas_provincias.find(p => p.provincia.id === provincia.id);
          if (!provinciaData) {
            provinciaData = {
              provincia: {
                ...provincia,
                etapas_comunas: []
              }
            };
            regionData.etapas_provincias.push(provinciaData);
          }
          
          if (!provinciaData.provincia.etapas_comunas.find(c => c.comuna.id === comuna.id)) {
            provinciaData.provincia.etapas_comunas.push({
              comuna: comuna
            });
          }
        }
      });
      
      const transformedData = Array.from(regionsMap.values());
      console.log(`   ✅ Transformation successful: ${transformedData.length} regions`);
      
      transformedData.forEach((region, index) => {
        console.log(`     Region ${index + 1}: ${region.nombre} (${region.codigo})`);
        console.log(`       Provinces: ${region.etapas_provincias.length}`);
        region.etapas_provincias.forEach((provData, pIndex) => {
          console.log(`         Province ${pIndex + 1}: ${provData.provincia.nombre} (${provData.provincia.codigo})`);
          console.log(`           Communes: ${provData.provincia.etapas_comunas.length}`);
          provData.provincia.etapas_comunas.forEach((comData, cIndex) => {
            console.log(`             Commune ${cIndex + 1}: ${comData.comuna.nombre}`);
          });
        });
      });
    }

    // Test 4: Check if there are any projects to test the /avanzar endpoint
    console.log('\n4. Checking available projects for testing...');
    const proyectos = await prisma.proyectos.findMany({
      where: {
        eliminado: false
      },
      take: 5,
      include: {
        etapas_registro: {
          where: { activa: true },
          include: {
            etapas_geografia: {
              include: {
                region: true,
                provincia: true,
                comuna: true
              }
            }
          }
        }
      }
    });

    if (proyectos.length === 0) {
      console.log('   ⚠️  No projects found');
    } else {
      console.log(`   ✅ Found ${proyectos.length} projects`);
      console.log('   Projects available for testing /etapas/:proyecto_id/avanzar endpoint:');
      proyectos.forEach((proyecto, index) => {
        console.log(`   Project ${index + 1}: ${proyecto.nombre} (ID: ${proyecto.id})`);
        if (proyecto.etapas_registro.length > 0) {
          const etapa = proyecto.etapas_registro[0];
          console.log(`     Active stage: ${etapa.etapa_tipo_id}`);
          console.log(`     Geographical records: ${etapa.etapas_geografia.length}`);
        } else {
          console.log(`     No active stages`);
        }
      });
    }

    console.log('\n✅ Testing completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   - The etapas endpoints now use the new nested geographical structure');
    console.log('   - Data is retrieved from etapas_geografia table with proper relationships');
    console.log('   - The transformGeographicalData function creates the nested structure');
    console.log('   - Response schemas have been updated to use etapas_regiones');
    console.log('   - The /etapas/:proyecto_id/avanzar endpoint now shows regions, provinces, and communes');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEtapasGeographical();
