// prisma/seed.js
// npx prisma db seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando datos existentes...')
  
  // Eliminar datos en orden inverso a las dependencias
  // (primero las tablas que dependen de otras)
  await prisma.comunas.deleteMany({})
  await prisma.provincias.deleteMany({})
  await prisma.usuarios.deleteMany({})
  await prisma.etapas_tipo.deleteMany({})
  await prisma.regiones.deleteMany({})
  await prisma.tipos_obras.deleteMany({})
  await prisma.tipos_iniciativas.deleteMany({})
  await prisma.unidades.deleteMany({})
  await prisma.departamentos.deleteMany({})
  await prisma.divisiones.deleteMany({})
  await prisma.perfiles.deleteMany({})

  console.log('✅ Datos existentes eliminados')
  console.log('📝 Insertando datos iniciales...')

  // Crear perfiles básicos
  const perfiles = await prisma.perfiles.createMany({
    data: [
      { nombre: 'Administrador', descripcion: 'Acceso completo al sistema' },
      { nombre: 'Inspector Fiscal', descripcion: 'Inspector de obras y proyectos' },
      { nombre: 'Jefe de División', descripcion: 'Gestión de división' },
      { nombre: 'Usuario', descripcion: 'Usuario básico del sistema' }
    ]
  })

  // Crear divisiones
  const divisiones = await prisma.divisiones.createMany({
    data: [
      { nombre: 'División de Obras Públicas', descripcion: 'División principal de obras públicas y mantenimiento' },
      { nombre: 'División de Planificación', descripcion: 'División de planificación y desarrollo urbano' },
      { nombre: 'División de Fiscalización', descripcion: 'División de control y fiscalización de obras' },
      { nombre: 'División de Infraestructura', descripcion: 'División de infraestructura vial y transporte' },
      { nombre: 'División de Desarrollo Regional', descripcion: 'División de desarrollo regional y territorial' }
    ]
  })

  // Crear departamentos
  const departamentos = await prisma.departamentos.createMany({
    data: [
      // Departamentos de División de Obras Públicas
      { nombre: 'Departamento de Construcción', descripcion: 'Departamento de construcción de obras públicas', division_id: 1 },
      { nombre: 'Departamento de Mantenimiento', descripcion: 'Departamento de mantenimiento de obras', division_id: 1 },
      { nombre: 'Departamento de Supervisión', descripcion: 'Departamento de supervisión de obras', division_id: 1 },
      
      // Departamentos de División de Planificación
      { nombre: 'Departamento de Planificación Urbana', descripcion: 'Departamento de planificación urbana y territorial', division_id: 2 },
      { nombre: 'Departamento de Estudios', descripcion: 'Departamento de estudios y proyectos', division_id: 2 },
      { nombre: 'Departamento de Desarrollo Sostenible', descripcion: 'Departamento de desarrollo sostenible', division_id: 2 },
      
      // Departamentos de División de Fiscalización
      { nombre: 'Departamento de Control de Calidad', descripcion: 'Departamento de control de calidad de obras', division_id: 3 },
      { nombre: 'Departamento de Auditoría', descripcion: 'Departamento de auditoría de proyectos', division_id: 3 },
      { nombre: 'Departamento de Inspección', descripcion: 'Departamento de inspección técnica', division_id: 3 },
      
      // Departamentos de División de Infraestructura
      { nombre: 'Departamento de Vialidad', descripcion: 'Departamento de vialidad y transporte', division_id: 4 },
      { nombre: 'Departamento de Puentes', descripcion: 'Departamento de puentes y estructuras', division_id: 4 },
      { nombre: 'Departamento de Señalización', descripcion: 'Departamento de señalización vial', division_id: 4 },
      
      // Departamentos de División de Desarrollo Regional
      { nombre: 'Departamento de Desarrollo Local', descripcion: 'Departamento de desarrollo local', division_id: 5 },
      { nombre: 'Departamento de Cooperación', descripcion: 'Departamento de cooperación interregional', division_id: 5 },
      { nombre: 'Departamento de Gestión Territorial', descripcion: 'Departamento de gestión territorial', division_id: 5 }
    ]
  })

  // Crear unidades
  const unidades = await prisma.unidades.createMany({
    data: [
      // Unidades del Departamento de Construcción
      { nombre: 'Unidad de Construcción Vial', descripcion: 'Unidad especializada en construcción de carreteras', departamento_id: 1, division_id: 1 },
      { nombre: 'Unidad de Construcción Edificios', descripcion: 'Unidad especializada en construcción de edificios públicos', departamento_id: 1, division_id: 1 },
      { nombre: 'Unidad de Construcción Puentes', descripcion: 'Unidad especializada en construcción de puentes', departamento_id: 1, division_id: 1 },
      
      // Unidades del Departamento de Mantenimiento
      { nombre: 'Unidad de Mantenimiento Vial', descripcion: 'Unidad de mantenimiento de carreteras', departamento_id: 2, division_id: 1 },
      { nombre: 'Unidad de Mantenimiento Edificios', descripcion: 'Unidad de mantenimiento de edificios públicos', departamento_id: 2, division_id: 1 },
      { nombre: 'Unidad de Mantenimiento Equipos', descripcion: 'Unidad de mantenimiento de equipos', departamento_id: 2, division_id: 1 },
      
      // Unidades del Departamento de Supervisión
      { nombre: 'Unidad de Supervisión Técnica', descripcion: 'Unidad de supervisión técnica de obras', departamento_id: 3, division_id: 1 },
      { nombre: 'Unidad de Control de Obras', descripcion: 'Unidad de control de obras en ejecución', departamento_id: 3, division_id: 1 },
      
      // Unidades del Departamento de Planificación Urbana
      { nombre: 'Unidad de Planificación Territorial', descripcion: 'Unidad de planificación territorial', departamento_id: 4, division_id: 2 },
      { nombre: 'Unidad de Desarrollo Urbano', descripcion: 'Unidad de desarrollo urbano', departamento_id: 4, division_id: 2 },
      { nombre: 'Unidad de Gestión de Proyectos', descripcion: 'Unidad de gestión de proyectos urbanos', departamento_id: 4, division_id: 2 },
      
      // Unidades del Departamento de Estudios
      { nombre: 'Unidad de Estudios Técnicos', descripcion: 'Unidad de estudios técnicos y de factibilidad', departamento_id: 5, division_id: 2 },
      { nombre: 'Unidad de Investigación', descripcion: 'Unidad de investigación y desarrollo', departamento_id: 5, division_id: 2 },
      
      // Unidades del Departamento de Desarrollo Sostenible
      { nombre: 'Unidad de Medio Ambiente', descripcion: 'Unidad de gestión ambiental', departamento_id: 6, division_id: 2 },
      { nombre: 'Unidad de Energías Renovables', descripcion: 'Unidad de energías renovables', departamento_id: 6, division_id: 2 },
      
      // Unidades del Departamento de Control de Calidad
      { nombre: 'Unidad de Control de Materiales', descripcion: 'Unidad de control de calidad de materiales', departamento_id: 7, division_id: 3 },
      { nombre: 'Unidad de Ensayos', descripcion: 'Unidad de ensayos de laboratorio', departamento_id: 7, division_id: 3 },
      
      // Unidades del Departamento de Auditoría
      { nombre: 'Unidad de Auditoría Financiera', descripcion: 'Unidad de auditoría financiera de proyectos', departamento_id: 8, division_id: 3 },
      { nombre: 'Unidad de Auditoría Técnica', descripcion: 'Unidad de auditoría técnica de obras', departamento_id: 8, division_id: 3 },
      
      // Unidades del Departamento de Inspección
      { nombre: 'Unidad de Inspección Vial', descripcion: 'Unidad de inspección de obras viales', departamento_id: 9, division_id: 3 },
      { nombre: 'Unidad de Inspección Edificios', descripcion: 'Unidad de inspección de edificios', departamento_id: 9, division_id: 3 },
      
      // Unidades del Departamento de Vialidad
      { nombre: 'Unidad de Diseño Vial', descripcion: 'Unidad de diseño de carreteras', departamento_id: 10, division_id: 4 },
      { nombre: 'Unidad de Tránsito', descripcion: 'Unidad de gestión de tránsito', departamento_id: 10, division_id: 4 },
      
      // Unidades del Departamento de Puentes
      { nombre: 'Unidad de Diseño Estructural', descripcion: 'Unidad de diseño estructural de puentes', departamento_id: 11, division_id: 4 },
      { nombre: 'Unidad de Construcción Especializada', descripcion: 'Unidad de construcción especializada', departamento_id: 11, division_id: 4 },
      
      // Unidades del Departamento de Señalización
      { nombre: 'Unidad de Señalización Horizontal', descripcion: 'Unidad de señalización horizontal', departamento_id: 12, division_id: 4 },
      { nombre: 'Unidad de Señalización Vertical', descripcion: 'Unidad de señalización vertical', departamento_id: 12, division_id: 4 },
      
      // Unidades del Departamento de Desarrollo Local
      { nombre: 'Unidad de Desarrollo Comunitario', descripcion: 'Unidad de desarrollo comunitario', departamento_id: 13, division_id: 5 },
      { nombre: 'Unidad de Capacitación', descripcion: 'Unidad de capacitación local', departamento_id: 13, division_id: 5 },
      
      // Unidades del Departamento de Cooperación
      { nombre: 'Unidad de Cooperación Internacional', descripcion: 'Unidad de cooperación internacional', departamento_id: 14, division_id: 5 },
      { nombre: 'Unidad de Cooperación Interregional', descripcion: 'Unidad de cooperación interregional', departamento_id: 14, division_id: 5 },
      
      // Unidades del Departamento de Gestión Territorial
      { nombre: 'Unidad de Ordenamiento Territorial', descripcion: 'Unidad de ordenamiento territorial', departamento_id: 15, division_id: 5 },
      { nombre: 'Unidad de Gestión de Suelos', descripcion: 'Unidad de gestión de suelos', departamento_id: 15, division_id: 5 }
    ]
  })

  // Crear tipos de iniciativas
  const tiposIniciativas = await prisma.tipos_iniciativas.createMany({
    data: [
      { nombre: 'Pública' },
      { nombre: 'Privada' }
    ]
  })

  // Crear tipos de obras
  const tiposObras = await prisma.tipos_obras.createMany({
    data: [
      { nombre: 'Infraestructura Vial Interurbana' },
      { nombre: 'Infraestructura Vial Urbana' },
      { nombre: 'Soluciones Hídricas' },
      { nombre: 'Infraestructura Aeroportuaria' },
      { nombre: 'Infraestructura Hospitalaria' },
      { nombre: 'Edificación Pública y Equipamiento Urbano' },
      { nombre: 'Infraestructura Penitenciaria' },
      { nombre: 'Seguridad Hídrica' },
      { nombre: 'Ruta Panamericana de Chile y sus accesos' },
      { nombre: 'Mejores ciudades: movilidad y equipamiento' },
      { nombre: 'Un mejor servicio aeroportuario' }
    ],
    skipDuplicates: true
  });

  // Crear regiones (ejemplo con algunas regiones de Chile)
  const regiones = await prisma.regiones.createMany({
    data: [
      { codigo: 'XV', nombre: 'Arica y Parinacota', nombre_corto: 'Arica' },
      { codigo: 'I', nombre: 'Tarapacá', nombre_corto: 'Tarapacá' },
      { codigo: 'II', nombre: 'Antofagasta', nombre_corto: 'Antofagasta' },
      { codigo: 'III', nombre: 'Atacama', nombre_corto: 'Atacama' },
      { codigo: 'IV', nombre: 'Coquimbo', nombre_corto: 'Coquimbo' },
      { codigo: 'V', nombre: 'Valparaíso', nombre_corto: 'Valparaíso' },
      { codigo: 'RM', nombre: 'Metropolitana de Santiago', nombre_corto: 'Santiago' },
      { codigo: 'VI', nombre: 'Libertador General Bernardo O\'Higgins', nombre_corto: 'O\'Higgins' },
      { codigo: 'VII', nombre: 'Maule', nombre_corto: 'Maule' },
      { codigo: 'VIII', nombre: 'Biobío', nombre_corto: 'Biobío' },
      { codigo: 'IX', nombre: 'Araucanía', nombre_corto: 'Araucanía' },
      { codigo: 'XIV', nombre: 'Los Ríos', nombre_corto: 'Los Ríos' },
      { codigo: 'X', nombre: 'Los Lagos', nombre_corto: 'Los Lagos' },
      { codigo: 'XI', nombre: 'Aysén del General Carlos Ibáñez del Campo', nombre_corto: 'Aysén' },
      { codigo: 'XII', nombre: 'Magallanes y de la Antártica Chilena', nombre_corto: 'Magallanes' }
    ]
  })

  // Crear etapas tipo básicas
  const etapasTipo = await prisma.etapas_tipo.createMany({
    data: [
      { 
        nombre: 'Cartera de proyectos', 
        descripcion: 'Etapa de inicio de proyecto',
        // Todos los campos están en true por defecto
      },
      { 
        nombre: 'Proyectos en Licitación', 
        descripcion: 'Proceso de licitación',
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true
      },
      { 
        nombre: 'Concesiones en Operación', 
        descripcion: '-',
        decreto_adjudicacion: true,
        sociedad_concesionaria: true
      },
      { 
        nombre: 'Concesiones en Construcción', 
        descripcion: '-',
        fecha_inicio_concesion: true,
        plazo_total_meses: true,
        inspector_fiscal_id: true
      },
      { 
        nombre: 'Concesiones en Operación y Construcción', 
        descripcion: '-',
        fecha_inicio_concesion: true,
        plazo_total_meses: true,
        inspector_fiscal_id: true
      },
      { 
        nombre: 'Concesiones Finalizadas', 
        descripcion: '-',
        fecha_inicio_concesion: true,
        plazo_total_meses: true,
        inspector_fiscal_id: true
      }
    ]
  })


  const etapas_tipo_obra = await prisma.etapas_tipo_obras.createMany({
    data: [
      { 
        etapa_tipo_id: 1, 
        tipo_obra_id: 9,
      },
      { 
        etapa_tipo_id: 1, 
        tipo_obra_id: 10,
      },
      { 
        etapa_tipo_id: 1, 
        tipo_obra_id: 11,
      },
      { 
        etapa_tipo_id: 2, 
        tipo_obra_id: 8,
      },
      { 
        etapa_tipo_id: 2, 
        tipo_obra_id: 9,
      },
      { 
        etapa_tipo_id: 2, 
        tipo_obra_id: 10,
      },
      { 
        etapa_tipo_id: 2, 
        tipo_obra_id: 11,
      },
      // Concesiones en Operación
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 1,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 2,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 3,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 4,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 5,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 6,
      },
      { 
        etapa_tipo_id: 3, 
        tipo_obra_id: 7,
      },
      // Conseciones en Construcción
      {
        etapa_tipo_id: 4,
        tipo_obra_id: 1,
      },
      {
        etapa_tipo_id: 4,
        tipo_obra_id: 2,
      },
      {
        etapa_tipo_id: 4,
        tipo_obra_id: 3,
      },
      {
        etapa_tipo_id: 4,
        tipo_obra_id: 5,
      },
      {
        etapa_tipo_id: 4,
        tipo_obra_id: 6,
      },
      // Concesiones en Operación y Construcción
      {
        etapa_tipo_id: 5,
        tipo_obra_id: 1,
      },
      {
        etapa_tipo_id: 5,
        tipo_obra_id: 4,
      },
      // Concesiones Finalizadas
      {
        etapa_tipo_id: 6,
        tipo_obra_id: 1,
      },
      {
        etapa_tipo_id: 6,
        tipo_obra_id: 2,
      },
      {
        etapa_tipo_id: 6,
        tipo_obra_id: 3,
      },
      {
        etapa_tipo_id: 6,
        tipo_obra_id: 4,
      },
      {
        etapa_tipo_id: 6,
        tipo_obra_id: 6,
      }
    ]
  })

  // Crear usuario administrador por defecto
  const adminPerfil = await prisma.perfiles.findFirst({
    where: { nombre: 'Administrador' }
  })

  const primeraDiv = await prisma.divisiones.findFirst()

  if (adminPerfil && primeraDiv) {
    await prisma.usuarios.create({
      data: {
        nombre_completo: 'Administrador del Sistema',
        correo_electronico: 'cris@sistema.cl',
        perfil_id: adminPerfil.id,
        division_id: primeraDiv.id,
        activo: true
      }
    })
  }

  // Crear provincias (ejemplo con algunas provincias de Chile)
  const provincias = await prisma.provincias.createMany({
    data: [
      { codigo: '011', nombre: 'Arica', region_id: 1 },
      { codigo: '014', nombre: 'Parinacota', region_id: 1 },
      { codigo: '021', nombre: 'Iquique', region_id: 2 },
      { codigo: '022', nombre: 'Tamarugal', region_id: 2 },
      { codigo: '031', nombre: 'Antofagasta', region_id: 3 },
      { codigo: '032', nombre: 'El Loa', region_id: 3 },
      { codigo: '033', nombre: 'Tocopilla', region_id: 3 }
    ]
  })

  // Crear comunas (ejemplo con algunas comunas de Chile)
  const comunas = await prisma.comunas.createMany({
    data: [
      { codigo: '01101', nombre: 'Arica', provincia_id: 1, region_id: 1 },
      { codigo: '01107', nombre: 'Camarones', provincia_id: 1, region_id: 1 },
      { codigo: '01401', nombre: 'Putre', provincia_id: 2, region_id: 1 },
      { codigo: '01402', nombre: 'General Lagos', provincia_id: 2, region_id: 1 },
      { codigo: '02101', nombre: 'Iquique', provincia_id: 3, region_id: 2 },
      { codigo: '02102', nombre: 'Alto Hospicio', provincia_id: 3, region_id: 2 },
      { codigo: '02201', nombre: 'Pozo Almonte', provincia_id: 4, region_id: 2 },
      { codigo: '02202', nombre: 'Camiña', provincia_id: 4, region_id: 2 },
      { codigo: '02203', nombre: 'Colchane', provincia_id: 4, region_id: 2 },
      { codigo: '02204', nombre: 'Huara', provincia_id: 4, region_id: 2 },
      { codigo: '02205', nombre: 'Pica', provincia_id: 4, region_id: 2 }
    ]
  })

  console.log('✅ Datos iniciales cargados correctamente')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })