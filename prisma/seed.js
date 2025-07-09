// prisma/seed.js
// npx prisma db seed

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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
      { nombre: 'División de Obras Públicas', descripcion: 'División principal de obras' },
      { nombre: 'División de Planificación', descripcion: 'División de planificación y desarrollo' },
      { nombre: 'División de Fiscalización', descripcion: 'División de control y fiscalización' }
    ]
  })

  // Crear tipos de iniciativas
  const tiposIniciativas = await prisma.tipos_iniciativas.createMany({
    data: [
      { nombre: 'Obra Pública' },
      { nombre: 'Concesión' },
      { nombre: 'Programa' },
      { nombre: 'Proyecto Especial' }
    ]
  })

  // Crear tipos de obras
  const tiposObras = await prisma.tipos_obras.createMany({
    data: [
      { nombre: 'Carreteras' },
      { nombre: 'Puentes' },
      { nombre: 'Edificación' },
      { nombre: 'Obras Hidráulicas' },
      { nombre: 'Aeropuertos' },
      { nombre: 'Puertos' }
    ]
  })

  // Crear regiones (ejemplo con algunas regiones de Chile)
  const existingRegions = await prisma.regiones.findMany();
  if (existingRegions.length === 0) {
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
    });
  }

  // Crear etapas tipo básicas
  const etapasTipo = await prisma.etapas_tipo.createMany({
    data: [
      { 
        nombre: 'Etapa Inicial', 
        descripcion: 'Etapa de inicio de proyecto',
        // Todos los campos están en true por defecto
      },
      { 
        nombre: 'Etapa de Licitación', 
        descripcion: 'Proceso de licitación',
        fecha_llamado_licitacion: true,
        fecha_recepcion_ofertas_tecnicas: true,
        fecha_apertura_ofertas_economicas: true
      },
      { 
        nombre: 'Etapa de Adjudicación', 
        descripcion: 'Proceso de adjudicación',
        decreto_adjudicacion: true,
        sociedad_concesionaria: true
      },
      { 
        nombre: 'Etapa de Ejecución', 
        descripcion: 'Ejecución del proyecto',
        fecha_inicio_concesion: true,
        plazo_total_meses: true,
        inspector_fiscal_id: true
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

  
