// prisma/seed.js
// npx prisma db seed

import { PrismaClient } from '@prisma/client'
import { comunasChile } from '../scripts/comunas-chile.js';

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando datos existentes...')
  
  // Eliminar datos en orden inverso a las dependencias
  // (primero las tablas que dependen de otras)
  await prisma.alertas.deleteMany({})
  await prisma.archivo_historial.deleteMany({})
  await prisma.auditorias.deleteMany({})
  await prisma.carpetas_auditoria.deleteMany({})
  await prisma.registro_documental.deleteMany({})
  await prisma.documentos.deleteMany({})
  await prisma.carpetas.deleteMany({})
  await prisma.carpetas_transversales.deleteMany({})
  await prisma.etapas_registro.deleteMany({})
  await prisma.inspector_fiscal.deleteMany({})
  await prisma.fechas_clave.deleteMany({})
  await prisma.externos_involucrados.deleteMany({})
  await prisma.obras_concesionadas.deleteMany({})
  await prisma.concesiones.deleteMany({})
  await prisma.proyectos.deleteMany({})
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
  const division1 = await prisma.divisiones.create({
    data: { nombre: 'División de Obras Públicas', descripcion: 'División principal de obras públicas y mantenimiento' }
  })
  const division2 = await prisma.divisiones.create({
    data: { nombre: 'División de Planificación', descripcion: 'División de planificación y desarrollo urbano' }
  })
  const division3 = await prisma.divisiones.create({
    data: { nombre: 'División de Fiscalización', descripcion: 'División de control y fiscalización de obras' }
  })
  const division4 = await prisma.divisiones.create({
    data: { nombre: 'División de Infraestructura', descripcion: 'División de infraestructura vial y transporte' }
  })
  const division5 = await prisma.divisiones.create({
    data: { nombre: 'División de Desarrollo Regional', descripcion: 'División de desarrollo regional y territorial' }
  })

  // Crear departamentos
  const departamentos = await prisma.departamentos.createMany({
    data: [
      // Departamentos de División de Obras Públicas
      { nombre: 'Departamento de Construcción', descripcion: 'Departamento de construcción de obras públicas', division_id: division1.id },
      { nombre: 'Departamento de Mantenimiento', descripcion: 'Departamento de mantenimiento de obras', division_id: division1.id },
      { nombre: 'Departamento de Supervisión', descripcion: 'Departamento de supervisión de obras', division_id: division1.id },
      
      // Departamentos de División de Planificación
      { nombre: 'Departamento de Planificación Urbana', descripcion: 'Departamento de planificación urbana y territorial', division_id: division2.id },
      { nombre: 'Departamento de Estudios', descripcion: 'Departamento de estudios y proyectos', division_id: division2.id },
      { nombre: 'Departamento de Desarrollo Sostenible', descripcion: 'Departamento de desarrollo sostenible', division_id: division2.id },
      
      // Departamentos de División de Fiscalización
      { nombre: 'Departamento de Control de Calidad', descripcion: 'Departamento de control de calidad de obras', division_id: division3.id },
      { nombre: 'Departamento de Auditoría', descripcion: 'Departamento de auditoría de proyectos', division_id: division3.id },
      { nombre: 'Departamento de Inspección', descripcion: 'Departamento de inspección técnica', division_id: division3.id },
      
      // Departamentos de División de Infraestructura
      { nombre: 'Departamento de Vialidad', descripcion: 'Departamento de vialidad y transporte', division_id: division4.id },
      { nombre: 'Departamento de Puentes', descripcion: 'Departamento de puentes y estructuras', division_id: division4.id },
      { nombre: 'Departamento de Señalización', descripcion: 'Departamento de señalización vial', division_id: division4.id },
      
      // Departamentos de División de Desarrollo Regional
      { nombre: 'Departamento de Desarrollo Local', descripcion: 'Departamento de desarrollo local', division_id: division5.id },
      { nombre: 'Departamento de Cooperación', descripcion: 'Departamento de cooperación interregional', division_id: division5.id },
      { nombre: 'Departamento de Gestión Territorial', descripcion: 'Departamento de gestión territorial', division_id: division5.id }
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
          "Desarrollo de Proyectos": {}
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
        bip: true,
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
              "Proyecto de Licitación": {},
              "Proyecto de Adjudicación": {}
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
              "SIAC": {},
              "Contratos de Asesorías": {},
              "Otros": {}
          }
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
        carpetas_iniciales: {
          "Proyectos OPS": {},
          "Obras": {}
        },
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
        carpetas_iniciales: {
          "Modificaciones de Contrato": {}
        },
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
        carpetas_iniciales: {
          "Concesiones Finalizadas": {}
        },
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

  // Crear etapas tipo básicas
  const etapasTipoCartera = await prisma.etapas_tipo.findFirst({ where: { nombre: 'Cartera de proyectos' } });

  // Crear carpetas transversales asociadas a la etapa 'Cartera de proyectos'
  if (etapasTipoCartera) {
    await prisma.carpetas_transversales.create({
      data: {
        nombre: 'Estructura Completa de Documentos',
        descripcion: 'Estructura transversal completa para todos los documentos del proyecto',
        color: 'rgb(52, 152, 219)',
        orden: 1,
        activa: true,
        etapa_tipo_id: etapasTipoCartera.id,
        estructura_carpetas: {
          "División de Estudios y Análisis Financiero": {},
          "División Participación, Medio Ambiente y Territorio": {},
          "Ingeniería": {},
          "División de Administración y Finanzas": {},
          "Jurídica": {},
          "Expropiaciones": {
            "Planos de Expropiaciones": {},
            "Informes de Tasación": {},
            "Fichas lotes": {},
            "Correspondencia": {}
          }
        }
      }
    });
  }


  // Crear usuario administrador por defecto
  const adminPerfil = await prisma.perfiles.findFirst({
    where: { nombre: 'Administrador' }
  })

  if (adminPerfil) {
    await prisma.usuarios.create({
      data: {
        nombre_completo: 'Administrador del Sistema',
        correo_electronico: 'cris@sistema.cl',
        perfil_id: adminPerfil.id,
        division_id: division1.id,
        activo: true
      }
    })
  }

  // Crear provincias de Chile (datos oficiales)
  const provincias = await prisma.provincias.createMany({
    data: [
      // Región de Arica y Parinacota (XV)
      { codigo: 'P011', nombre: 'Arica', region_id: 1 },
      { codigo: 'P014', nombre: 'Parinacota', region_id: 1 },
      
      // Región de Tarapacá (I)
      { codigo: 'P021', nombre: 'Iquique', region_id: 2 },
      { codigo: 'P022', nombre: 'Tamarugal', region_id: 2 },
      
      // Región de Antofagasta (II)
      { codigo: 'P031', nombre: 'Antofagasta', region_id: 3 },
      { codigo: 'P032', nombre: 'El Loa', region_id: 3 },
      { codigo: 'P033', nombre: 'Tocopilla', region_id: 3 },
      
      // Región de Atacama (III)
      { codigo: 'P041', nombre: 'Copiapó', region_id: 4 },
      { codigo: 'P042', nombre: 'Chañaral', region_id: 4 },
      { codigo: 'P043', nombre: 'Huasco', region_id: 4 },
      
      // Región de Coquimbo (IV)
      { codigo: 'P051', nombre: 'Elqui', region_id: 5 },
      { codigo: 'P052', nombre: 'Choapa', region_id: 5 },
      { codigo: 'P053', nombre: 'Limarí', region_id: 5 },
      
      // Región de Valparaíso (V)
      { codigo: 'P061', nombre: 'Valparaíso', region_id: 6 },
      { codigo: 'P062', nombre: 'Isla de Pascua', region_id: 6 },
      { codigo: 'P063', nombre: 'Los Andes', region_id: 6 },
      { codigo: 'P064', nombre: 'Petorca', region_id: 6 },
      { codigo: 'P065', nombre: 'Quillota', region_id: 6 },
      { codigo: 'P066', nombre: 'San Antonio', region_id: 6 },
      { codigo: 'P067', nombre: 'San Felipe de Aconcagua', region_id: 6 },
      { codigo: 'P068', nombre: 'Marga Marga', region_id: 6 },
      
      // Región Metropolitana de Santiago (RM)
      { codigo: 'P131', nombre: 'Santiago', region_id: 7 },
      { codigo: 'P132', nombre: 'Cordillera', region_id: 7 },
      { codigo: 'P133', nombre: 'Chacabuco', region_id: 7 },
      { codigo: 'P134', nombre: 'Maipo', region_id: 7 },
      { codigo: 'P135', nombre: 'Melipilla', region_id: 7 },
      { codigo: 'P136', nombre: 'Talagante', region_id: 7 },
      
      // Región del Libertador General Bernardo O'Higgins (VI)
      { codigo: 'P081', nombre: 'Cachapoal', region_id: 8 },
      { codigo: 'P082', nombre: 'Colchagua', region_id: 8 },
      { codigo: 'P083', nombre: 'Cardenal Caro', region_id: 8 },
      
      // Región del Maule (VII)
      { codigo: 'P091', nombre: 'Curicó', region_id: 9 },
      { codigo: 'P092', nombre: 'Talca', region_id: 9 },
      { codigo: 'P093', nombre: 'Linares', region_id: 9 },
      { codigo: 'P094', nombre: 'Cauquenes', region_id: 9 },
      
      // Región del Biobío (VIII)
      { codigo: 'P101', nombre: 'Concepción', region_id: 10 },
      { codigo: 'P102', nombre: 'Ñuble', region_id: 10 },
      { codigo: 'P103', nombre: 'Biobío', region_id: 10 },
      { codigo: 'P104', nombre: 'Arauco', region_id: 10 },
      
      // Región de la Araucanía (IX)
      { codigo: 'P111', nombre: 'Cautín', region_id: 11 },
      { codigo: 'P112', nombre: 'Malleco', region_id: 11 },
      
      // Región de Los Ríos (XIV)
      { codigo: 'P121', nombre: 'Valdivia', region_id: 12 },
      { codigo: 'P122', nombre: 'Ranco', region_id: 12 },
      
      // Región de Los Lagos (X)
      { codigo: 'P105', nombre: 'Llanquihue', region_id: 13 },
      { codigo: 'P106', nombre: 'Chiloé', region_id: 13 },
      { codigo: 'P107', nombre: 'Osorno', region_id: 13 },
      { codigo: 'P108', nombre: 'Palena', region_id: 13 },
      
      // Región de Aysén del General Carlos Ibáñez del Campo (XI)
      { codigo: 'P141', nombre: 'Coyhaique', region_id: 14 },
      { codigo: 'P142', nombre: 'Aysén', region_id: 14 },
      { codigo: 'P143', nombre: 'General Carrera', region_id: 14 },
      { codigo: 'P144', nombre: 'Capitán Prat', region_id: 14 },
      
      // Región de Magallanes y de la Antártica Chilena (XII)
      { codigo: 'P151', nombre: 'Magallanes', region_id: 15 },
      { codigo: 'P152', nombre: 'Antártica Chilena', region_id: 15 },
      { codigo: 'P153', nombre: 'Tierra del Fuego', region_id: 15 },
      { codigo: 'P154', nombre: 'Última Esperanza', region_id: 15 }
    ]
  })

  // Crear comunas de Chile (datos oficiales completos)
  const comunas = await prisma.comunas.createMany({
    data: comunasChile
  })

  // Crear tipos de documentos
  const tiposDocumentos = await prisma.tipos_documentos.createMany({
    data: [
      { nombre: 'ACTA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'ANEXO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'ANTECEDENTES', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'ASIGNACION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'AUTORIZACION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'BOLETAS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'BOLETIN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CARTAS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CERTIFICADO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'CERTIFICADO INTERNO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CESION DE CREDITO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CHEQUES', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CIRCULAR (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'COMPROMISO DE FONDOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'COMUNICACIÓN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CONCILIACION BANCARIA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CONSTANCIA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CONTROL', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CONVENIOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CUADROS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'CURRICULUM', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'DECRETO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'DEMANDA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'DENUNCIA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'DICTAMEN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'ENDOSO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'ESCRITURAS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'FACSIMIL', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'FACTURA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'FONDOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'FORMULARIO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'FORMULARIO INTERNO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'GUIA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'INFORME', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'INVITACION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'LICENCIA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'MAIL', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'MANUAL', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'MEMO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'MEMO INTERNO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'MINUTA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'NOMINA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'NOTA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'NOTIFICACIÓN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'OFICIO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'OFICIO INTERNO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'OPOSICIONES', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'ORDEN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PLANILLA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PLANOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'POLIZA', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'POSTULACION CONCURSO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PRESENTACION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PRESTAMOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PROTOCOLIZACIÓN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'PROVIDENCIAS (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false },
      { nombre: 'REASIGNACION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'RECIBOS', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'RECURSO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'REEMBOLSO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'REINTEGRO', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'RENDICION', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'RESOLUCIÓN (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: true },
      { nombre: 'RESOLUCIÓN DE COMETIDO (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: true },
      { nombre: 'RESOLUCIÓN EXPROPIACIÓN', descripcion: null, requiere_nro_pro_exp: false, requiere_saf_exp: false, requiere_numerar: false, requiere_tramitar: false },
      { nombre: 'SOLICITUD (OPV)', descripcion: null, requiere_nro_pro_exp: true, requiere_saf_exp: false, requiere_numerar: true, requiere_tramitar: false }
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