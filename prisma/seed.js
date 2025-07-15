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

  // Crear regiones de Chile (datos oficiales)
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
        color: 'rgb(52, 152, 219)',
        carpetas_iniciales: {
          "Desarrollo de Proyectos": {},
          "División Participación Medio Ambiente y Territorio": {},
          "Jurídica": {},
          "Ingeniería": {},
          "División de Administración y Finanzas": {},
          "División de Estudios y Análisis Financiero": {},
          "Expropiaciones": {}
        },
        // Solo habilitar los campos específicos para Cartera de proyectos
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        fecha_llamado_licitacion: true,
        plazo_total_concesion: true,
        // Deshabilitar todos los demás campos
        valor_referencia: false,
        bip: false,
        fecha_recepcion_ofertas_tecnicas: false,
        fecha_apertura_ofertas_economicas: false,
        fecha_inicio_concesion: false,
        decreto_adjudicacion: false,
        sociedad_concesionaria: false,
        inspector_fiscal_id: false
      },
      { 
        nombre: 'Proyectos en Licitación', 
        descripcion: 'Proceso de licitación',
        color: 'rgb(241, 196, 15)',
        carpetas_iniciales: {
          "Proyecto en Licitación": {
            "Proyectos": {
              "Proyecto de Licitación": {},
              "Proyecto de Adjudicación": {}
            }
          }
        },
        // Solo habilitar los campos específicos para Proyectos en Licitación
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true,
        // Deshabilitar todos los demás campos
        valor_referencia: false,
        bip: false,
        fecha_inicio_concesion: false,
        plazo_total_concesion: false,
        decreto_adjudicacion: false,
        sociedad_concesionaria: false,
        inspector_fiscal_id: false
      },
      { 
        nombre: 'Concesiones en Construcción', 
        descripcion: '-',
        color: 'rgb(231, 76, 60)',
        carpetas_iniciales: {
          "Coordinación Técnica": {
            "Subcarpetas": {
              "Coordinación Técnica": {},
              "Contratos de Asesorías": {},
              "Coordinación Técnica ": {}
            }
          },
          "Departamento": {},
          "Expropiaciones": {},
          "Ingeniería": {}
        },
        // Solo habilitar los campos específicos para Concesiones en Construcción
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true,
        decreto_adjudicacion: true,
        sociedad_concesionaria: true,
        fecha_inicio_concesion: true,
        plazo_total_concesion: true,
        inspector_fiscal_id: true,
        // Deshabilitar todos los demás campos
        valor_referencia: false,
        bip: false
      },
      { 
        nombre: 'Concesiones en Operación', 
        descripcion: '-',
        color: 'rgb(46, 204, 113)',
        // Solo habilitar los campos específicos para Concesiones en Operación
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true,
        decreto_adjudicacion: true,
        sociedad_concesionaria: true,
        fecha_inicio_concesion: true,
        plazo_total_concesion: true,
        inspector_fiscal_id: true,
        // Deshabilitar todos los demás campos
        valor_referencia: false,
        bip: false
      },
      { 
        nombre: 'Concesiones en Operación y Construcción', 
        descripcion: '-',
        color: 'rgb(155, 89, 182)',
        // Solo habilitar los campos específicos para Concesiones en Operación y Construcción
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true,
        decreto_adjudicacion: true,
        sociedad_concesionaria: true,
        fecha_inicio_concesion: true,
        plazo_total_concesion: true,
        inspector_fiscal_id: true,
        // Deshabilitar todos los demás campos
        valor_referencia: false,
        bip: false
      },
      { 
        nombre: 'Concesiones Finalizadas', 
        descripcion: '-',
        color: 'rgb(127, 140, 141)',
        // Solo habilitar los campos específicos para Concesiones Finalizadas
        tipo_iniciativa: true,
        tipo_obra: true,
        region: true,
        provincia: true,
        comuna: true,
        volumen: true,
        presupuesto_oficial: true,
        valor_referencia: true,
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true,
        decreto_adjudicacion: true,
        sociedad_concesionaria: true,
        fecha_inicio_concesion: true,
        plazo_total_concesion: true,
        // Deshabilitar todos los demás campos
        bip: false,
        inspector_fiscal_id: false
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

  // Crear provincias de Chile (datos oficiales)
  const provincias = await prisma.provincias.createMany({
    data: [
      // Región de Arica y Parinacota (XV)
      { codigo: '011', nombre: 'Arica', region_id: 1 },
      { codigo: '014', nombre: 'Parinacota', region_id: 1 },
      
      // Región de Tarapacá (I)
      { codigo: '021', nombre: 'Iquique', region_id: 2 },
      { codigo: '022', nombre: 'Tamarugal', region_id: 2 },
      
      // Región de Antofagasta (II)
      { codigo: '031', nombre: 'Antofagasta', region_id: 3 },
      { codigo: '032', nombre: 'El Loa', region_id: 3 },
      { codigo: '033', nombre: 'Tocopilla', region_id: 3 },
      
      // Región de Atacama (III)
      { codigo: '041', nombre: 'Copiapó', region_id: 4 },
      { codigo: '042', nombre: 'Chañaral', region_id: 4 },
      { codigo: '043', nombre: 'Huasco', region_id: 4 },
      
      // Región de Coquimbo (IV)
      { codigo: '051', nombre: 'Elqui', region_id: 5 },
      { codigo: '052', nombre: 'Choapa', region_id: 5 },
      { codigo: '053', nombre: 'Limarí', region_id: 5 },
      
      // Región de Valparaíso (V)
      { codigo: '061', nombre: 'Valparaíso', region_id: 6 },
      { codigo: '062', nombre: 'Isla de Pascua', region_id: 6 },
      { codigo: '063', nombre: 'Los Andes', region_id: 6 },
      { codigo: '064', nombre: 'Petorca', region_id: 6 },
      { codigo: '065', nombre: 'Quillota', region_id: 6 },
      { codigo: '066', nombre: 'San Antonio', region_id: 6 },
      { codigo: '067', nombre: 'San Felipe de Aconcagua', region_id: 6 },
      { codigo: '068', nombre: 'Marga Marga', region_id: 6 },
      
      // Región Metropolitana de Santiago (RM)
      { codigo: '131', nombre: 'Santiago', region_id: 7 },
      { codigo: '132', nombre: 'Cordillera', region_id: 7 },
      { codigo: '133', nombre: 'Chacabuco', region_id: 7 },
      { codigo: '134', nombre: 'Maipo', region_id: 7 },
      { codigo: '135', nombre: 'Melipilla', region_id: 7 },
      { codigo: '136', nombre: 'Talagante', region_id: 7 },
      
      // Región del Libertador General Bernardo O'Higgins (VI)
      { codigo: '061', nombre: 'Cachapoal', region_id: 8 },
      { codigo: '062', nombre: 'Colchagua', region_id: 8 },
      { codigo: '063', nombre: 'Cardenal Caro', region_id: 8 },
      
      // Región del Maule (VII)
      { codigo: '071', nombre: 'Curicó', region_id: 9 },
      { codigo: '072', nombre: 'Talca', region_id: 9 },
      { codigo: '073', nombre: 'Linares', region_id: 9 },
      { codigo: '074', nombre: 'Cauquenes', region_id: 9 },
      
      // Región del Biobío (VIII)
      { codigo: '081', nombre: 'Concepción', region_id: 10 },
      { codigo: '082', nombre: 'Ñuble', region_id: 10 },
      { codigo: '083', nombre: 'Biobío', region_id: 10 },
      { codigo: '084', nombre: 'Arauco', region_id: 10 },
      
      // Región de la Araucanía (IX)
      { codigo: '091', nombre: 'Cautín', region_id: 11 },
      { codigo: '092', nombre: 'Malleco', region_id: 11 },
      
      // Región de Los Ríos (XIV)
      { codigo: '141', nombre: 'Valdivia', region_id: 12 },
      { codigo: '142', nombre: 'Ranco', region_id: 12 },
      
      // Región de Los Lagos (X)
      { codigo: '101', nombre: 'Llanquihue', region_id: 13 },
      { codigo: '102', nombre: 'Chiloé', region_id: 13 },
      { codigo: '103', nombre: 'Osorno', region_id: 13 },
      { codigo: '104', nombre: 'Palena', region_id: 13 },
      
      // Región de Aysén del General Carlos Ibáñez del Campo (XI)
      { codigo: '111', nombre: 'Coyhaique', region_id: 14 },
      { codigo: '112', nombre: 'Aysén', region_id: 14 },
      { codigo: '113', nombre: 'General Carrera', region_id: 14 },
      { codigo: '114', nombre: 'Capitán Prat', region_id: 14 },
      
      // Región de Magallanes y de la Antártica Chilena (XII)
      { codigo: '121', nombre: 'Magallanes', region_id: 15 },
      { codigo: '122', nombre: 'Antártica Chilena', region_id: 15 },
      { codigo: '123', nombre: 'Tierra del Fuego', region_id: 15 },
      { codigo: '124', nombre: 'Última Esperanza', region_id: 15 }
    ]
  })

  // Crear comunas de Chile (datos oficiales - principales ciudades)
  const comunas = await prisma.comunas.createMany({
    data: [
      // Región de Arica y Parinacota (XV)
      { codigo: '01101', nombre: 'Arica', provincia_id: 1, region_id: 1 },
      { codigo: '01107', nombre: 'Camarones', provincia_id: 1, region_id: 1 },
      { codigo: '01401', nombre: 'Putre', provincia_id: 2, region_id: 1 },
      { codigo: '01402', nombre: 'General Lagos', provincia_id: 2, region_id: 1 },
      
      // Región de Tarapacá (I)
      { codigo: '02101', nombre: 'Iquique', provincia_id: 3, region_id: 2 },
      { codigo: '02102', nombre: 'Alto Hospicio', provincia_id: 3, region_id: 2 },
      { codigo: '02201', nombre: 'Pozo Almonte', provincia_id: 4, region_id: 2 },
      { codigo: '02202', nombre: 'Camiña', provincia_id: 4, region_id: 2 },
      { codigo: '02203', nombre: 'Colchane', provincia_id: 4, region_id: 2 },
      { codigo: '02204', nombre: 'Huara', provincia_id: 4, region_id: 2 },
      { codigo: '02205', nombre: 'Pica', provincia_id: 4, region_id: 2 },
      
      // Región de Antofagasta (II)
      { codigo: '03101', nombre: 'Antofagasta', provincia_id: 5, region_id: 3 },
      { codigo: '03102', nombre: 'Mejillones', provincia_id: 5, region_id: 3 },
      { codigo: '03103', nombre: 'Sierra Gorda', provincia_id: 5, region_id: 3 },
      { codigo: '03104', nombre: 'Taltal', provincia_id: 5, region_id: 3 },
      { codigo: '03201', nombre: 'Calama', provincia_id: 6, region_id: 3 },
      { codigo: '03202', nombre: 'Ollagüe', provincia_id: 6, region_id: 3 },
      { codigo: '03203', nombre: 'San Pedro de Atacama', provincia_id: 6, region_id: 3 },
      { codigo: '03301', nombre: 'Tocopilla', provincia_id: 7, region_id: 3 },
      { codigo: '03302', nombre: 'María Elena', provincia_id: 7, region_id: 3 },
      
      // Región de Atacama (III)
      { codigo: '04101', nombre: 'Copiapó', provincia_id: 8, region_id: 4 },
      { codigo: '04102', nombre: 'Caldera', provincia_id: 8, region_id: 4 },
      { codigo: '04103', nombre: 'Tierra Amarilla', provincia_id: 8, region_id: 4 },
      { codigo: '04201', nombre: 'Chañaral', provincia_id: 9, region_id: 4 },
      { codigo: '04202', nombre: 'Diego de Almagro', provincia_id: 9, region_id: 4 },
      { codigo: '04301', nombre: 'Vallenar', provincia_id: 10, region_id: 4 },
      { codigo: '04302', nombre: 'Alto del Carmen', provincia_id: 10, region_id: 4 },
      { codigo: '04303', nombre: 'Freirina', provincia_id: 10, region_id: 4 },
      { codigo: '04304', nombre: 'Huasco', provincia_id: 10, region_id: 4 },
      
      // Región de Coquimbo (IV)
      { codigo: '05101', nombre: 'La Serena', provincia_id: 11, region_id: 5 },
      { codigo: '05102', nombre: 'Coquimbo', provincia_id: 11, region_id: 5 },
      { codigo: '05103', nombre: 'Andacollo', provincia_id: 11, region_id: 5 },
      { codigo: '05104', nombre: 'La Higuera', provincia_id: 11, region_id: 5 },
      { codigo: '05105', nombre: 'Paiguano', provincia_id: 11, region_id: 5 },
      { codigo: '05106', nombre: 'Vicuña', provincia_id: 11, region_id: 5 },
      { codigo: '05201', nombre: 'Illapel', provincia_id: 12, region_id: 5 },
      { codigo: '05202', nombre: 'Canela', provincia_id: 12, region_id: 5 },
      { codigo: '05203', nombre: 'Los Vilos', provincia_id: 12, region_id: 5 },
      { codigo: '05204', nombre: 'Salamanca', provincia_id: 12, region_id: 5 },
      { codigo: '05301', nombre: 'Ovalle', provincia_id: 13, region_id: 5 },
      { codigo: '05302', nombre: 'Combarbalá', provincia_id: 13, region_id: 5 },
      { codigo: '05303', nombre: 'Monte Patria', provincia_id: 13, region_id: 5 },
      { codigo: '05304', nombre: 'Punitaqui', provincia_id: 13, region_id: 5 },
      { codigo: '05305', nombre: 'Río Hurtado', provincia_id: 13, region_id: 5 },
      
      // Región de Valparaíso (V)
      { codigo: '06101', nombre: 'Valparaíso', provincia_id: 14, region_id: 6 },
      { codigo: '06102', nombre: 'Casablanca', provincia_id: 14, region_id: 6 },
      { codigo: '06103', nombre: 'Concón', provincia_id: 14, region_id: 6 },
      { codigo: '06104', nombre: 'Juan Fernández', provincia_id: 14, region_id: 6 },
      { codigo: '06105', nombre: 'Puchuncaví', provincia_id: 14, region_id: 6 },
      { codigo: '06107', nombre: 'Quintero', provincia_id: 14, region_id: 6 },
      { codigo: '06109', nombre: 'Viña del Mar', provincia_id: 14, region_id: 6 },
      { codigo: '06201', nombre: 'Isla de Pascua', provincia_id: 15, region_id: 6 },
      { codigo: '06301', nombre: 'Los Andes', provincia_id: 16, region_id: 6 },
      { codigo: '06302', nombre: 'Calle Larga', provincia_id: 16, region_id: 6 },
      { codigo: '06303', nombre: 'Rinconada', provincia_id: 16, region_id: 6 },
      { codigo: '06304', nombre: 'San Esteban', provincia_id: 16, region_id: 6 },
      { codigo: '06401', nombre: 'La Ligua', provincia_id: 17, region_id: 6 },
      { codigo: '06402', nombre: 'Cabildo', provincia_id: 17, region_id: 6 },
      { codigo: '06403', nombre: 'Papudo', provincia_id: 17, region_id: 6 },
      { codigo: '06404', nombre: 'Petorca', provincia_id: 17, region_id: 6 },
      { codigo: '06405', nombre: 'Zapallar', provincia_id: 17, region_id: 6 },
      { codigo: '06501', nombre: 'Quillota', provincia_id: 18, region_id: 6 },
      { codigo: '06502', nombre: 'Calera', provincia_id: 18, region_id: 6 },
      { codigo: '06503', nombre: 'Hijuelas', provincia_id: 18, region_id: 6 },
      { codigo: '06504', nombre: 'La Cruz', provincia_id: 18, region_id: 6 },
      { codigo: '06506', nombre: 'Nogales', provincia_id: 18, region_id: 6 },
      { codigo: '06601', nombre: 'San Antonio', provincia_id: 19, region_id: 6 },
      { codigo: '06602', nombre: 'Algarrobo', provincia_id: 19, region_id: 6 },
      { codigo: '06603', nombre: 'Cartagena', provincia_id: 19, region_id: 6 },
      { codigo: '06604', nombre: 'El Quisco', provincia_id: 19, region_id: 6 },
      { codigo: '06605', nombre: 'El Tabo', provincia_id: 19, region_id: 6 },
      { codigo: '06606', nombre: 'Santo Domingo', provincia_id: 19, region_id: 6 },
      { codigo: '06701', nombre: 'San Felipe', provincia_id: 20, region_id: 6 },
      { codigo: '06702', nombre: 'Catemu', provincia_id: 20, region_id: 6 },
      { codigo: '06703', nombre: 'Llaillay', provincia_id: 20, region_id: 6 },
      { codigo: '06704', nombre: 'Panquehue', provincia_id: 20, region_id: 6 },
      { codigo: '06705', nombre: 'Putaendo', provincia_id: 20, region_id: 6 },
      { codigo: '06706', nombre: 'Santa María', provincia_id: 20, region_id: 6 },
      { codigo: '06801', nombre: 'Quilpué', provincia_id: 21, region_id: 6 },
      { codigo: '06802', nombre: 'Limache', provincia_id: 21, region_id: 6 },
      { codigo: '06803', nombre: 'Olmué', provincia_id: 21, region_id: 6 },
      { codigo: '06804', nombre: 'Villa Alemana', provincia_id: 21, region_id: 6 },
      
      // Región Metropolitana de Santiago (RM)
      { codigo: '13101', nombre: 'Santiago', provincia_id: 22, region_id: 7 },
      { codigo: '13102', nombre: 'Cerrillos', provincia_id: 22, region_id: 7 },
      { codigo: '13103', nombre: 'Cerro Navia', provincia_id: 22, region_id: 7 },
      { codigo: '13104', nombre: 'Conchalí', provincia_id: 22, region_id: 7 },
      { codigo: '13105', nombre: 'El Bosque', provincia_id: 22, region_id: 7 },
      { codigo: '13106', nombre: 'Estación Central', provincia_id: 22, region_id: 7 },
      { codigo: '13107', nombre: 'Huechuraba', provincia_id: 22, region_id: 7 },
      { codigo: '13108', nombre: 'Independencia', provincia_id: 22, region_id: 7 },
      { codigo: '13109', nombre: 'La Cisterna', provincia_id: 22, region_id: 7 },
      { codigo: '13110', nombre: 'La Florida', provincia_id: 22, region_id: 7 },
      { codigo: '13111', nombre: 'La Granja', provincia_id: 22, region_id: 7 },
      { codigo: '13112', nombre: 'La Pintana', provincia_id: 22, region_id: 7 },
      { codigo: '13113', nombre: 'La Reina', provincia_id: 22, region_id: 7 },
      { codigo: '13114', nombre: 'Las Condes', provincia_id: 22, region_id: 7 },
      { codigo: '13115', nombre: 'Lo Barnechea', provincia_id: 22, region_id: 7 },
      { codigo: '13116', nombre: 'Lo Espejo', provincia_id: 22, region_id: 7 },
      { codigo: '13117', nombre: 'Lo Prado', provincia_id: 22, region_id: 7 },
      { codigo: '13118', nombre: 'Macul', provincia_id: 22, region_id: 7 },
      { codigo: '13119', nombre: 'Maipú', provincia_id: 22, region_id: 7 },
      { codigo: '13120', nombre: 'Ñuñoa', provincia_id: 22, region_id: 7 },
      { codigo: '13121', nombre: 'Pedro Aguirre Cerda', provincia_id: 22, region_id: 7 },
      { codigo: '13122', nombre: 'Peñalolén', provincia_id: 22, region_id: 7 },
      { codigo: '13123', nombre: 'Providencia', provincia_id: 22, region_id: 7 },
      { codigo: '13124', nombre: 'Pudahuel', provincia_id: 22, region_id: 7 },
      { codigo: '13125', nombre: 'Quilicura', provincia_id: 22, region_id: 7 },
      { codigo: '13126', nombre: 'Quinta Normal', provincia_id: 22, region_id: 7 },
      { codigo: '13127', nombre: 'Recoleta', provincia_id: 22, region_id: 7 },
      { codigo: '13128', nombre: 'Renca', provincia_id: 22, region_id: 7 },
      { codigo: '13129', nombre: 'San Joaquín', provincia_id: 22, region_id: 7 },
      { codigo: '13130', nombre: 'San Miguel', provincia_id: 22, region_id: 7 },
      { codigo: '13131', nombre: 'San Ramón', provincia_id: 22, region_id: 7 },
      { codigo: '13132', nombre: 'Vitacura', provincia_id: 22, region_id: 7 },
      { codigo: '13201', nombre: 'Puente Alto', provincia_id: 23, region_id: 7 },
      { codigo: '13202', nombre: 'Pirque', provincia_id: 23, region_id: 7 },
      { codigo: '13203', nombre: 'San José de Maipo', provincia_id: 23, region_id: 7 },
      { codigo: '13301', nombre: 'Colina', provincia_id: 24, region_id: 7 },
      { codigo: '13302', nombre: 'Lampa', provincia_id: 24, region_id: 7 },
      { codigo: '13303', nombre: 'Tiltil', provincia_id: 24, region_id: 7 },
      { codigo: '13401', nombre: 'San Bernardo', provincia_id: 25, region_id: 7 },
      { codigo: '13402', nombre: 'Buin', provincia_id: 25, region_id: 7 },
      { codigo: '13403', nombre: 'Calera de Tango', provincia_id: 25, region_id: 7 },
      { codigo: '13404', nombre: 'Paine', provincia_id: 25, region_id: 7 },
      { codigo: '13501', nombre: 'Melipilla', provincia_id: 26, region_id: 7 },
      { codigo: '13502', nombre: 'Alhué', provincia_id: 26, region_id: 7 },
      { codigo: '13503', nombre: 'Curacaví', provincia_id: 26, region_id: 7 },
      { codigo: '13504', nombre: 'María Pinto', provincia_id: 26, region_id: 7 },
      { codigo: '13505', nombre: 'San Pedro', provincia_id: 26, region_id: 7 },
      { codigo: '13601', nombre: 'Talagante', provincia_id: 27, region_id: 7 },
      { codigo: '13602', nombre: 'El Monte', provincia_id: 27, region_id: 7 },
      { codigo: '13603', nombre: 'Isla de Maipo', provincia_id: 27, region_id: 7 },
      { codigo: '13604', nombre: 'Padre Hurtado', provincia_id: 27, region_id: 7 },
      { codigo: '13605', nombre: 'Peñaflor', provincia_id: 27, region_id: 7 }
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