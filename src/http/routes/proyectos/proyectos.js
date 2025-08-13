"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proyectosRoutes = proyectosRoutes;
var zod_1 = require("zod");
var prisma_1 = require("@/lib/prisma");
var minio_utils_1 = require("@/utils/minio-utils");
var carpeta_db_utils_1 = require("@/utils/carpeta-db-utils");
// Helper function to extract all commune IDs from nested geographical structure
function extractComunaIdsFromNestedStructure(regiones) {
    var comunaIds = [];
    regiones.forEach(function (region) {
        region.provincias.forEach(function (provincia) {
            provincia.comunas.forEach(function (comuna) {
                comunaIds.push(comuna.id);
            });
        });
    });
    return comunaIds;
}
// Helper function to transform flat geographical data into deeply nested hierarchical structure
function transformGeographicalData(etapasGeografia) {
    // Create a map of regions with their provinces and communes
    var regionsMap = new Map();
    // Process all geographical data from the unified table
    // Now each record represents a specific commune with its complete hierarchy
    etapasGeografia.forEach(function (etapaGeo) {
        var region = etapaGeo.region, provincia = etapaGeo.provincia, comuna = etapaGeo.comuna;
        // Ensure we have all the geographical data
        if (region && provincia && comuna) {
            // Add region if not exists
            if (!regionsMap.has(region.id)) {
                regionsMap.set(region.id, __assign(__assign({}, region), { etapas_provincias: [] }));
            }
            var regionData = regionsMap.get(region.id);
            // Add province if not exists
            var provinciaData = regionData.etapas_provincias.find(function (p) { return p.provincia.id === provincia.id; });
            if (!provinciaData) {
                provinciaData = {
                    provincia: __assign(__assign({}, provincia), { etapas_comunas: [] })
                };
                regionData.etapas_provincias.push(provinciaData);
            }
            // Add comuna if not exists
            if (!provinciaData.provincia.etapas_comunas.find(function (c) { return c.comuna.id === comuna.id; })) {
                provinciaData.provincia.etapas_comunas.push({
                    comuna: comuna
                });
            }
        }
    });
    // Convert map to array
    return Array.from(regionsMap.values());
}
function proyectosRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            fastify.withTypeProvider()
                .post('/proyectos', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Crear un nuevo proyecto',
                    description: 'Crea un nuevo proyecto con su estructura de carpetas inicial y etapa de registro. El endpoint permite crear carpetas en MinIO y registros en la base de datos de forma automática. Soporta tanto estructuras planas como anidadas para carpetas iniciales.',
                    body: zod_1.default.object({
                        // Campos de proyecto
                        nombre: zod_1.default.string().max(255),
                        carpeta_inicial: zod_1.default.union([
                            // Old flat structure
                            zod_1.default.object({
                                carpetas: zod_1.default.array(zod_1.default.object({
                                    nombre: zod_1.default.string()
                                }))
                            }),
                            // New nested structure
                            zod_1.default.record(zod_1.default.any())
                        ]).optional(),
                        //estado: z.string().max(50).optional(),
                        //fecha_inicio: z.string().date().optional(),
                        //fecha_termino: z.string().date().optional(),
                        division_id: zod_1.default.number().optional(),
                        departamento_id: zod_1.default.number().optional(),
                        unidad_id: zod_1.default.number().optional(),
                        creado_por: zod_1.default.number(),
                        // Campos de etapas_registro (opcional, para crear una nueva etapa)
                        etapas_registro: zod_1.default.object({
                            etapa_tipo_id: zod_1.default.number(),
                            tipo_iniciativa_id: zod_1.default.number(),
                            tipo_obra_id: zod_1.default.number().optional(),
                            // Nueva estructura anidada para datos geográficos
                            regiones: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                provincias: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    comunas: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number()
                                    }))
                                }))
                            })).optional(),
                            volumen: zod_1.default.string().optional(),
                            presupuesto_oficial: zod_1.default.string().optional(),
                            valor_referencia: zod_1.default.string().max(255).optional(),
                            bip: zod_1.default.string().optional(),
                            fecha_llamado_licitacion: zod_1.default.string().datetime().optional(),
                            fecha_recepcion_ofertas_tecnicas: zod_1.default.string().datetime().optional(),
                            fecha_apertura_ofertas_economicas: zod_1.default.string().datetime().optional(),
                            decreto_adjudicacion: zod_1.default.string().optional(),
                            sociedad_concesionaria: zod_1.default.string().max(255).optional(),
                            fecha_inicio_concesion: zod_1.default.string().datetime().optional(),
                            plazo_total_concesion: zod_1.default.string().optional(),
                            inspector_fiscal_id: zod_1.default.number().optional(),
                            usuario_creador: zod_1.default.number()
                        })
                    }),
                    response: {
                        201: zod_1.default.object({
                            id: zod_1.default.number(),
                            nombre: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, etapas_registro, datosProyecto, proyecto, etapaTipoId, etapaCreada, comunaIds, geographicalData, _i, comunaIds_1, comunaId, comuna, projectFolderPath, carpetaRaiz, dbError_1, initialFolders, folderError_1, etapaTipo, carpetasTransversales, _b, carpetasTransversales_1, carpetaTransversal, subcarpetas, subfolderError_1, etapaTipoError_1, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = request.body, etapas_registro = _a.etapas_registro, datosProyecto = __rest(_a, ["etapas_registro"]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.create({
                                    data: {
                                        nombre: datosProyecto.nombre,
                                        carpeta_inicial: datosProyecto.carpeta_inicial,
                                        division_id: datosProyecto.division_id,
                                        departamento_id: datosProyecto.departamento_id,
                                        unidad_id: datosProyecto.unidad_id,
                                        creado_por: datosProyecto.creado_por
                                    }
                                })];
                        case 1:
                            proyecto = _c.sent();
                            etapaTipoId = null;
                            if (!etapas_registro) return [3 /*break*/, 8];
                            etapaTipoId = etapas_registro.etapa_tipo_id;
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                    data: {
                                        etapa_tipo_id: etapas_registro.etapa_tipo_id,
                                        proyecto_id: proyecto.id,
                                        tipo_iniciativa_id: etapas_registro.tipo_iniciativa_id,
                                        tipo_obra_id: etapas_registro.tipo_obra_id,
                                        volumen: etapas_registro.volumen,
                                        presupuesto_oficial: etapas_registro.presupuesto_oficial,
                                        valor_referencia: etapas_registro.valor_referencia,
                                        bip: etapas_registro.bip,
                                        fecha_llamado_licitacion: etapas_registro.fecha_llamado_licitacion,
                                        fecha_recepcion_ofertas_tecnicas: etapas_registro.fecha_recepcion_ofertas_tecnicas,
                                        fecha_apertura_ofertas_economicas: etapas_registro.fecha_apertura_ofertas_economicas,
                                        decreto_adjudicacion: etapas_registro.decreto_adjudicacion,
                                        sociedad_concesionaria: etapas_registro.sociedad_concesionaria,
                                        fecha_inicio_concesion: etapas_registro.fecha_inicio_concesion,
                                        plazo_total_concesion: etapas_registro.plazo_total_concesion,
                                        inspector_fiscal_id: etapas_registro.inspector_fiscal_id,
                                        fecha_creacion: new Date(),
                                        fecha_actualizacion: new Date(),
                                        activa: true,
                                        usuario_creador: request.body.creado_por
                                    }
                                })];
                        case 2:
                            etapaCreada = _c.sent();
                            if (!(etapas_registro.regiones && etapas_registro.regiones.length > 0)) return [3 /*break*/, 8];
                            comunaIds = extractComunaIdsFromNestedStructure(etapas_registro.regiones);
                            geographicalData = [];
                            _i = 0, comunaIds_1 = comunaIds;
                            _c.label = 3;
                        case 3:
                            if (!(_i < comunaIds_1.length)) return [3 /*break*/, 6];
                            comunaId = comunaIds_1[_i];
                            return [4 /*yield*/, prisma_1.prisma.comunas.findUnique({
                                    where: { id: comunaId },
                                    include: {
                                        provincia: {
                                            include: {
                                                region: true
                                            }
                                        }
                                    }
                                })];
                        case 4:
                            comuna = _c.sent();
                            if (comuna) {
                                geographicalData.push({
                                    etapa_registro_id: etapaCreada.id,
                                    region_id: comuna.provincia.region.id,
                                    provincia_id: comuna.provincia.id,
                                    comuna_id: comuna.id
                                });
                            }
                            _c.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6:
                            if (!(geographicalData.length > 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, prisma_1.prisma.etapas_geografia.createMany({
                                    data: geographicalData
                                })];
                        case 7:
                            _c.sent();
                            _c.label = 8;
                        case 8:
                            _c.trys.push([8, 35, , 36]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyecto.nombre, proyecto.id)];
                        case 9:
                            projectFolderPath = _c.sent();
                            console.log("Project folder created in MinIO: ".concat(projectFolderPath));
                            carpetaRaiz = null;
                            _c.label = 10;
                        case 10:
                            _c.trys.push([10, 12, , 13]);
                            console.log("Creating root folder for project \"".concat(proyecto.nombre, "\" with ID: ").concat(proyecto.id));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createProjectRootFolder(proyecto.id, proyecto.nombre, projectFolderPath, datosProyecto.creado_por)];
                        case 11:
                            carpetaRaiz = _c.sent();
                            console.log('Project root folder DB record created successfully with S3 data:', {
                                id: carpetaRaiz.id,
                                nombre: carpetaRaiz.nombre, // Show the folder name (should be project name)
                                s3_path: carpetaRaiz.s3_path,
                                s3_bucket_name: carpetaRaiz.s3_bucket_name,
                                s3_created: carpetaRaiz.s3_created,
                                proyecto_id: carpetaRaiz.proyecto_id
                            });
                            return [3 /*break*/, 13];
                        case 12:
                            dbError_1 = _c.sent();
                            console.error('❌ Error creating project root folder DB record:', dbError_1);
                            console.error('Error details:', {
                                message: dbError_1.message,
                                code: dbError_1.code,
                                meta: dbError_1.meta
                            });
                            // Don't continue if root folder creation fails - this is critical
                            throw new Error("Failed to create project root folder: ".concat(dbError_1.message));
                        case 13:
                            if (!(datosProyecto.carpeta_inicial && typeof datosProyecto.carpeta_inicial === 'object')) return [3 /*break*/, 18];
                            console.log('Creating initial folders for project:', proyecto.nombre);
                            console.log('Initial folder structure:', JSON.stringify(datosProyecto.carpeta_inicial, null, 2));
                            _c.label = 14;
                        case 14:
                            _c.trys.push([14, 17, , 18]);
                            // Crear carpetas en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createInitialFolders(projectFolderPath, datosProyecto.carpeta_inicial)];
                        case 15:
                            // Crear carpetas en MinIO
                            _c.sent();
                            console.log('Initial folders created successfully in MinIO for project:', proyecto.nombre);
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createInitialFoldersDB(proyecto.id, projectFolderPath, datosProyecto.carpeta_inicial, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, etapaTipoId)];
                        case 16:
                            initialFolders = _c.sent();
                            console.log("Initial folders DB records created successfully for project: ".concat(proyecto.nombre, ". Created ").concat(initialFolders.length, " folders with S3 data."));
                            return [3 /*break*/, 18];
                        case 17:
                            folderError_1 = _c.sent();
                            console.error('Error creating initial folders:', folderError_1);
                            return [3 /*break*/, 18];
                        case 18:
                            if (!(etapas_registro && etapas_registro.etapa_tipo_id)) return [3 /*break*/, 34];
                            _c.label = 19;
                        case 19:
                            _c.trys.push([19, 33, , 34]);
                            console.log('Fetching etapa tipo folders for etapa_tipo_id:', etapas_registro.etapa_tipo_id);
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: etapas_registro.etapa_tipo_id },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        carpetas_iniciales: true
                                    }
                                })];
                        case 20:
                            etapaTipo = _c.sent();
                            return [4 /*yield*/, prisma_1.prisma.carpetas_transversales.findMany({
                                    where: {
                                        etapa_tipo_id: etapas_registro.etapa_tipo_id,
                                        activa: true
                                    },
                                    orderBy: {
                                        orden: 'asc'
                                    }
                                })];
                        case 21:
                            carpetasTransversales = _c.sent();
                            if (!(carpetasTransversales && carpetasTransversales.length > 0)) return [3 /*break*/, 29];
                            console.log("Creating ".concat(carpetasTransversales.length, " transverse folders for etapa tipo: ").concat(etapaTipo === null || etapaTipo === void 0 ? void 0 : etapaTipo.nombre));
                            _b = 0, carpetasTransversales_1 = carpetasTransversales;
                            _c.label = 22;
                        case 22:
                            if (!(_b < carpetasTransversales_1.length)) return [3 /*break*/, 28];
                            carpetaTransversal = carpetasTransversales_1[_b];
                            if (!(carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object')) return [3 /*break*/, 27];
                            console.log("Creating transverse subfolders for: ".concat(carpetaTransversal.nombre));
                            console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                            _c.label = 23;
                        case 23:
                            _c.trys.push([23, 26, , 27]);
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas)];
                        case 24:
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            _c.sent();
                            console.log("Transverse subfolders created successfully in MinIO for: ".concat(carpetaTransversal.nombre));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createNestedFolderStructureDB(proyecto.id, projectFolderPath, carpetaTransversal.estructura_carpetas, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, // carpeta_padre_id será la carpeta raíz del proyecto
                                etapaTipo === null || etapaTipo === void 0 ? void 0 : etapaTipo.id, 'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                                carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                                )];
                        case 25:
                            subcarpetas = _c.sent();
                            console.log("Transverse subfolders DB records created successfully for: ".concat(carpetaTransversal.nombre, ". Created ").concat(subcarpetas.length, " subfolders."));
                            return [3 /*break*/, 27];
                        case 26:
                            subfolderError_1 = _c.sent();
                            console.error("Error creating transverse subfolders for ".concat(carpetaTransversal.nombre, ":"), subfolderError_1);
                            return [3 /*break*/, 27];
                        case 27:
                            _b++;
                            return [3 /*break*/, 22];
                        case 28:
                            console.log("Transverse folders created successfully for project: ".concat(proyecto.nombre));
                            _c.label = 29;
                        case 29:
                            if (!(etapaTipo && etapaTipo.carpetas_iniciales)) return [3 /*break*/, 32];
                            console.log('Etapa tipo found:', etapaTipo.nombre);
                            console.log('Etapa tipo carpetas_iniciales:', JSON.stringify(etapaTipo.carpetas_iniciales, null, 2));
                            // Crear carpetas en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
                                    carpetas_iniciales: etapaTipo.carpetas_iniciales
                                })];
                        case 30:
                            // Crear carpetas en MinIO
                            _c.sent();
                            console.log('Etapa tipo folders created successfully in MinIO for project:', proyecto.nombre);
                            // Crear registros en la base de datos
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createEtapaTipoFoldersDB(proyecto.id, projectFolderPath, { carpetas_iniciales: etapaTipo.carpetas_iniciales }, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, etapaTipo.id)];
                        case 31:
                            // Crear registros en la base de datos
                            _c.sent();
                            _c.label = 32;
                        case 32: return [3 /*break*/, 34];
                        case 33:
                            etapaTipoError_1 = _c.sent();
                            console.error('Error creating etapa tipo folders:', etapaTipoError_1);
                            return [3 /*break*/, 34];
                        case 34:
                            console.log("Project folders and DB records created successfully for project: ".concat(proyecto.nombre));
                            console.log("S3 bucket used: ".concat(process.env.MINIO_BUCKET || 'gestor-files'));
                            return [3 /*break*/, 36];
                        case 35:
                            error_1 = _c.sent();
                            console.error('Error creating project folders and DB records:', error_1);
                            return [3 /*break*/, 36];
                        case 36: return [2 /*return*/, reply.status(201).send({
                                id: proyecto.id,
                                nombre: proyecto.nombre
                            })];
                    }
                });
            }); })
                .get('/proyectos', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener lista de proyectos',
                    description: 'Retorna una lista paginada de todos los proyectos activos (no eliminados) incluyendo información básica, el tipo de etapa más reciente, el creador y la carpeta raíz. El campo es_proyecto_padre indica si es un proyecto padre o hijo.',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                created_at: zod_1.default.date(),
                                carpeta_raiz_id: zod_1.default.number().nullable(),
                                es_proyecto_padre: zod_1.default.boolean(),
                                proyecto_padre_id: zod_1.default.number().nullable(),
                                // Solo etapa_tipo
                                etapas_registro: zod_1.default.array(zod_1.default.object({
                                    etapa_tipo: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        color: zod_1.default.string()
                                    })
                                })),
                                // Solo creador
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable()
                                })
                            }))
                        })
                    }
                }
            }, function () { return __awaiter(_this, void 0, void 0, function () {
                var proyectos;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                where: {
                                    eliminado: false,
                                    // Removido el filtro proyecto_padre_id: null para mostrar todos los proyectos
                                    proyecto_padre_id: null
                                },
                                select: {
                                    id: true,
                                    nombre: true,
                                    created_at: true,
                                    carpeta_raiz_id: true,
                                    es_proyecto_padre: true,
                                    proyecto_padre_id: true,
                                    etapas_registro: {
                                        take: 1,
                                        orderBy: {
                                            fecha_creacion: 'desc'
                                        },
                                        select: {
                                            etapa_tipo: {
                                                select: {
                                                    id: true,
                                                    nombre: true,
                                                    color: true
                                                }
                                            }
                                        }
                                    },
                                    creador: {
                                        select: {
                                            id: true,
                                            nombre_completo: true
                                        }
                                    }
                                }
                            })];
                        case 1:
                            proyectos = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Lista de proyectos obtenida exitosamente',
                                    data: proyectos
                                }];
                    }
                });
            }); })
                .get('/proyectos/:id', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener proyecto por ID',
                    description: 'Retorna la información completa de un proyecto específico activo (no eliminado) incluyendo todas sus etapas de registro, relaciones con divisiones, departamentos, unidades y creador. El campo es_proyecto_padre indica si es un proyecto padre o hijo.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                carpeta_inicial: zod_1.default.any().nullable(),
                                carpeta_raiz_id: zod_1.default.number().nullable(),
                                created_at: zod_1.default.date(),
                                es_proyecto_padre: zod_1.default.boolean(),
                                proyecto_padre_id: zod_1.default.number().nullable(),
                                // Relaciones
                                etapas_registro: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    etapa_tipo: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        color: zod_1.default.string().nullable()
                                    }),
                                    tipo_iniciativa: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).nullable(),
                                    tipo_obra: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).nullable(),
                                    // Deeply nested hierarchical geographical data
                                    etapas_regiones: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        codigo: zod_1.default.string(),
                                        nombre: zod_1.default.string(),
                                        nombre_corto: zod_1.default.string().nullable(),
                                        etapas_provincias: zod_1.default.array(zod_1.default.object({
                                            provincia: zod_1.default.object({
                                                id: zod_1.default.number(),
                                                codigo: zod_1.default.string(),
                                                nombre: zod_1.default.string(),
                                                etapas_comunas: zod_1.default.array(zod_1.default.object({
                                                    comuna: zod_1.default.object({
                                                        id: zod_1.default.number(),
                                                        nombre: zod_1.default.string()
                                                    })
                                                }))
                                            })
                                        }))
                                    })),
                                    volumen: zod_1.default.string().nullable(),
                                    presupuesto_oficial: zod_1.default.string().nullable(),
                                    valor_referencia: zod_1.default.string().nullable(),
                                    bip: zod_1.default.string().nullable(),
                                    fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                    fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                    fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                    decreto_adjudicacion: zod_1.default.string().nullable(),
                                    sociedad_concesionaria: zod_1.default.string().nullable(),
                                    fecha_inicio_concesion: zod_1.default.date().nullable(),
                                    plazo_total_concesion: zod_1.default.string().nullable(),
                                    inspector_fiscal: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre_completo: zod_1.default.string().nullable(),
                                        correo_electronico: zod_1.default.string().nullable()
                                    }).nullable()
                                })),
                                division: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable()
                                }).nullable(),
                                departamento: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable()
                                }).nullable(),
                                unidad: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable()
                                }).nullable(),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable(),
                                    correo_electronico: zod_1.default.string().nullable()
                                })
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto, transformedProyecto;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        eliminado: false
                                    },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        carpeta_inicial: true,
                                        carpeta_raiz_id: true,
                                        created_at: true,
                                        es_proyecto_padre: true,
                                        proyecto_padre_id: true,
                                        etapas_registro: {
                                            orderBy: {
                                                fecha_creacion: 'desc'
                                            },
                                            include: {
                                                etapa_tipo: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        descripcion: true,
                                                        color: true
                                                    }
                                                },
                                                tipo_iniciativa: true,
                                                tipo_obra: true,
                                                // Include unified geographical data
                                                etapas_geografia: {
                                                    include: {
                                                        region: {
                                                            select: {
                                                                id: true,
                                                                codigo: true,
                                                                nombre: true,
                                                                nombre_corto: true
                                                            }
                                                        },
                                                        provincia: {
                                                            select: {
                                                                id: true,
                                                                codigo: true,
                                                                nombre: true
                                                            }
                                                        },
                                                        comuna: {
                                                            select: {
                                                                id: true,
                                                                nombre: true
                                                            }
                                                        }
                                                    }
                                                },
                                                inspector_fiscal: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true
                                                    }
                                                }
                                            }
                                        },
                                        division: true,
                                        departamento: true,
                                        unidad: true,
                                        creador: {
                                            select: {
                                                id: true,
                                                nombre_completo: true,
                                                correo_electronico: true
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado o ha sido eliminado'
                                    })];
                            }
                            transformedProyecto = __assign(__assign({}, proyecto), { etapas_registro: proyecto.etapas_registro.map(function (etapa) { return (__assign(__assign({}, etapa), { etapas_regiones: transformGeographicalData(etapa.etapas_geografia) })); }) });
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Proyecto obtenido exitosamente',
                                    data: transformedProyecto
                                }];
                    }
                });
            }); })
                .put('/proyectos/:id', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Actualizar proyecto padre existente',
                    description: 'Actualiza la información de un proyecto padre existente. Permite modificar datos básicos del proyecto y crear o actualizar etapas de registro asociadas. No permite actualizar proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        nombre: zod_1.default.string().max(255).optional(),
                        carpeta_inicial: zod_1.default.union([
                            // Old flat structure
                            zod_1.default.object({
                                carpetas: zod_1.default.array(zod_1.default.object({
                                    nombre: zod_1.default.string()
                                }))
                            }),
                            // New nested structure
                            zod_1.default.record(zod_1.default.any())
                        ]).optional(),
                        division_id: zod_1.default.number().optional(),
                        departamento_id: zod_1.default.number().optional(),
                        unidad_id: zod_1.default.number().optional(),
                        // Campos de etapas_registro (opcional, para actualizar la etapa existente)
                        etapas_registro: zod_1.default.object({
                            tipo_iniciativa_id: zod_1.default.number().optional(),
                            tipo_obra_id: zod_1.default.number().optional(),
                            // Nueva estructura anidada para datos geográficos
                            regiones: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                provincias: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    comunas: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number()
                                    }))
                                }))
                            })).optional(),
                            volumen: zod_1.default.string().optional(),
                            presupuesto_oficial: zod_1.default.string().optional(),
                            valor_referencia: zod_1.default.string().max(255).optional(),
                            bip: zod_1.default.string().optional(),
                            fecha_llamado_licitacion: zod_1.default.string().datetime().optional(),
                            fecha_recepcion_ofertas_tecnicas: zod_1.default.string().datetime().optional(),
                            fecha_apertura_ofertas_economicas: zod_1.default.string().datetime().optional(),
                            decreto_adjudicacion: zod_1.default.string().optional(),
                            sociedad_concesionaria: zod_1.default.string().max(255).optional(),
                            fecha_inicio_concesion: zod_1.default.string().datetime().optional(),
                            plazo_total_concesion: zod_1.default.string().optional(),
                            inspector_fiscal_id: zod_1.default.number().optional()
                        }).optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyectoExistente, _a, etapas_registro, datosProyecto, proyectoActualizado, etapasExistentes, etapaExistente, regiones, datosEtapa, comunaIds, geographicalData, _i, comunaIds_2, comunaId, comuna, regiones, datosEtapa, etapaData, etapaCreada, comunaIds, geographicalData, _b, comunaIds_3, comunaId, comuna;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        // Solo permitir actualizar proyectos que NO son hijos
                                        proyecto_padre_id: null
                                    },
                                    include: {
                                        etapas_registro: true
                                    }
                                })];
                        case 1:
                            proyectoExistente = _c.sent();
                            if (!proyectoExistente) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado o es un proyecto hijo'
                                    })];
                            }
                            _a = request.body, etapas_registro = _a.etapas_registro, datosProyecto = __rest(_a, ["etapas_registro"]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.update({
                                    where: { id: id },
                                    data: datosProyecto
                                })];
                        case 2:
                            proyectoActualizado = _c.sent();
                            console.log("proyecto actualizado");
                            console.log(request.body);
                            if (!etapas_registro) return [3 /*break*/, 19];
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: {
                                        proyecto_id: id,
                                        activa: true
                                    },
                                    orderBy: {
                                        fecha_creacion: 'desc'
                                    }
                                })];
                        case 3:
                            etapasExistentes = _c.sent();
                            etapaExistente = etapasExistentes[0];
                            console.log(" etapas existente");
                            console.log(etapaExistente);
                            console.log("proyecto_id");
                            console.log(id);
                            if (!etapaExistente) return [3 /*break*/, 12];
                            // Si existe, actualizar el registro existente
                            console.log("actualizar");
                            regiones = etapas_registro.regiones, datosEtapa = __rest(etapas_registro, ["regiones"]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaExistente.id },
                                    data: __assign(__assign({}, datosEtapa), { fecha_actualizacion: new Date() })
                                })];
                        case 4:
                            _c.sent();
                            if (!(regiones !== undefined)) return [3 /*break*/, 11];
                            // Eliminar todas las relaciones geográficas existentes
                            return [4 /*yield*/, prisma_1.prisma.etapas_geografia.deleteMany({
                                    where: { etapa_registro_id: etapaExistente.id }
                                })];
                        case 5:
                            // Eliminar todas las relaciones geográficas existentes
                            _c.sent();
                            if (!(regiones && regiones.length > 0)) return [3 /*break*/, 11];
                            comunaIds = extractComunaIdsFromNestedStructure(regiones);
                            geographicalData = [];
                            _i = 0, comunaIds_2 = comunaIds;
                            _c.label = 6;
                        case 6:
                            if (!(_i < comunaIds_2.length)) return [3 /*break*/, 9];
                            comunaId = comunaIds_2[_i];
                            return [4 /*yield*/, prisma_1.prisma.comunas.findUnique({
                                    where: { id: comunaId },
                                    include: {
                                        provincia: {
                                            include: {
                                                region: true
                                            }
                                        }
                                    }
                                })];
                        case 7:
                            comuna = _c.sent();
                            if (comuna) {
                                geographicalData.push({
                                    etapa_registro_id: etapaExistente.id,
                                    region_id: comuna.provincia.region.id,
                                    provincia_id: comuna.provincia.id,
                                    comuna_id: comuna.id
                                });
                            }
                            _c.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 6];
                        case 9:
                            if (!(geographicalData.length > 0)) return [3 /*break*/, 11];
                            return [4 /*yield*/, prisma_1.prisma.etapas_geografia.createMany({
                                    data: geographicalData
                                })];
                        case 10:
                            _c.sent();
                            _c.label = 11;
                        case 11: return [3 /*break*/, 19];
                        case 12:
                            // Si no existe, crear un nuevo registro
                            console.log("crear");
                            regiones = etapas_registro.regiones, datosEtapa = __rest(etapas_registro, ["regiones"]);
                            etapaData = {
                                proyecto_id: id,
                                fecha_creacion: new Date(),
                                fecha_actualizacion: new Date(),
                                activa: true,
                                usuario_creador: proyectoExistente.creado_por
                            };
                            // Agregar campos opcionales solo si existen
                            if (datosEtapa.tipo_iniciativa_id)
                                etapaData.tipo_iniciativa_id = datosEtapa.tipo_iniciativa_id;
                            if (datosEtapa.tipo_obra_id)
                                etapaData.tipo_obra_id = datosEtapa.tipo_obra_id;
                            if (datosEtapa.volumen)
                                etapaData.volumen = datosEtapa.volumen;
                            if (datosEtapa.presupuesto_oficial)
                                etapaData.presupuesto_oficial = datosEtapa.presupuesto_oficial;
                            if (datosEtapa.valor_referencia)
                                etapaData.valor_referencia = datosEtapa.valor_referencia;
                            if (datosEtapa.bip)
                                etapaData.bip = datosEtapa.bip;
                            if (datosEtapa.fecha_llamado_licitacion)
                                etapaData.fecha_llamado_licitacion = datosEtapa.fecha_llamado_licitacion;
                            if (datosEtapa.fecha_recepcion_ofertas_tecnicas)
                                etapaData.fecha_recepcion_ofertas_tecnicas = datosEtapa.fecha_recepcion_ofertas_tecnicas;
                            if (datosEtapa.fecha_apertura_ofertas_economicas)
                                etapaData.fecha_apertura_ofertas_economicas = datosEtapa.fecha_apertura_ofertas_economicas;
                            if (datosEtapa.decreto_adjudicacion)
                                etapaData.decreto_adjudicacion = datosEtapa.decreto_adjudicacion;
                            if (datosEtapa.sociedad_concesionaria)
                                etapaData.sociedad_concesionaria = datosEtapa.sociedad_concesionaria;
                            if (datosEtapa.fecha_inicio_concesion)
                                etapaData.fecha_inicio_concesion = datosEtapa.fecha_inicio_concesion;
                            if (datosEtapa.plazo_total_concesion)
                                etapaData.plazo_total_concesion = datosEtapa.plazo_total_concesion;
                            if (datosEtapa.inspector_fiscal_id)
                                etapaData.inspector_fiscal_id = datosEtapa.inspector_fiscal_id;
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                    data: etapaData
                                })];
                        case 13:
                            etapaCreada = _c.sent();
                            if (!(regiones && regiones.length > 0)) return [3 /*break*/, 19];
                            comunaIds = extractComunaIdsFromNestedStructure(regiones);
                            geographicalData = [];
                            _b = 0, comunaIds_3 = comunaIds;
                            _c.label = 14;
                        case 14:
                            if (!(_b < comunaIds_3.length)) return [3 /*break*/, 17];
                            comunaId = comunaIds_3[_b];
                            return [4 /*yield*/, prisma_1.prisma.comunas.findUnique({
                                    where: { id: comunaId },
                                    include: {
                                        provincia: {
                                            include: {
                                                region: true
                                            }
                                        }
                                    }
                                })];
                        case 15:
                            comuna = _c.sent();
                            if (comuna) {
                                geographicalData.push({
                                    etapa_registro_id: etapaCreada.id,
                                    region_id: comuna.provincia.region.id,
                                    provincia_id: comuna.provincia.id,
                                    comuna_id: comuna.id
                                });
                            }
                            _c.label = 16;
                        case 16:
                            _b++;
                            return [3 /*break*/, 14];
                        case 17:
                            if (!(geographicalData.length > 0)) return [3 /*break*/, 19];
                            return [4 /*yield*/, prisma_1.prisma.etapas_geografia.createMany({
                                    data: geographicalData
                                })];
                        case 18:
                            _c.sent();
                            _c.label = 19;
                        case 19: return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: 'Proyecto actualizado exitosamente',
                                data: {
                                    id: proyectoActualizado.id,
                                    nombre: proyectoActualizado.nombre
                                }
                            })];
                    }
                });
            }); })
                .get('/proyectos/:id/carpetas', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener carpetas del proyecto padre',
                    description: 'Retorna la estructura de carpetas asociada a un proyecto padre específico, incluyendo carpetas padre e hijas con su información de organización. Para proyectos padre, también incluye las carpetas de todos sus proyectos hijos. No permite obtener carpetas de proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                s3_path: zod_1.default.string(),
                                s3_bucket_name: zod_1.default.string().nullable(),
                                orden_visualizacion: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                carpeta_padre_id: zod_1.default.number().nullable(),
                                proyecto_id: zod_1.default.number(),
                                carpetas_hijas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    s3_path: zod_1.default.string(),
                                    orden_visualizacion: zod_1.default.number(),
                                    proyecto_id: zod_1.default.number()
                                }))
                            }))
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto, carpetas, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        // Solo permitir obtener carpetas de proyectos que NO son hijos
                                        proyecto_padre_id: null
                                    }
                                })];
                        case 1:
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado o es un proyecto hijo'
                                    })];
                            }
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.getProjectFolders(id)];
                        case 3:
                            carpetas = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Carpetas del proyecto padre obtenidas exitosamente, incluyendo carpetas de proyectos hijos',
                                    data: carpetas
                                }];
                        case 4:
                            error_2 = _a.sent();
                            console.error('Error getting project folders:', error_2);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al obtener las carpetas del proyecto'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })
                .patch('/proyectos/:id/cambiar-etapa', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Cambia la etapa activa de un proyecto padre',
                    description: 'Cambia la etapa activa de un proyecto padre. Desactiva la etapa actual y activa la nueva etapa especificada. Incluye validación para asegurar que solo una etapa esté activa por proyecto. No permite cambiar etapa en proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        etapa_tipo_id: zod_1.default.number().int().min(1, 'ID de tipo de etapa es requerido'),
                        tipo_iniciativa_id: zod_1.default.number().int().min(1).optional(),
                        tipo_obra_id: zod_1.default.number().int().min(1).optional(),
                        // Nested geographical structure
                        regiones: zod_1.default.array(zod_1.default.object({
                            id: zod_1.default.number(),
                            provincias: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                comunas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number()
                                }))
                            }))
                        })).optional(),
                        volumen: zod_1.default.string().optional(),
                        presupuesto_oficial: zod_1.default.string().optional(),
                        valor_referencia: zod_1.default.string().max(255).optional(),
                        bip: zod_1.default.string().optional(),
                        fecha_llamado_licitacion: zod_1.default.string().datetime().optional(),
                        fecha_recepcion_ofertas_tecnicas: zod_1.default.string().datetime().optional(),
                        fecha_apertura_ofertas_economicas: zod_1.default.string().datetime().optional(),
                        decreto_adjudicacion: zod_1.default.string().optional(),
                        sociedad_concesionaria: zod_1.default.string().max(255).optional(),
                        fecha_inicio_concesion: zod_1.default.string().datetime().optional(),
                        plazo_total_concesion: zod_1.default.string().optional(),
                        inspector_fiscal_id: zod_1.default.number().int().min(1).optional(),
                        usuario_creador: zod_1.default.number().int().min(1, 'Usuario creador es requerido')
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                proyecto_id: zod_1.default.number(),
                                etapa_anterior: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    etapa_tipo_id: zod_1.default.number(),
                                    nombre_etapa: zod_1.default.string()
                                }).nullable(),
                                etapa_nueva: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    etapa_tipo_id: zod_1.default.number(),
                                    nombre_etapa: zod_1.default.string()
                                })
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, body, proyecto, etapaTipo, etapaExistente, etapaActual, nuevaEtapa, comunaIds, geographicalData, _i, comunaIds_4, comunaId, comuna, proyectoInfo, projectFolderPath, etapaTipoFolders, carpetasTransversales, _a, carpetasTransversales_2, carpetaTransversal, subcarpetas, subfolderError_2, folderError_2, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            body = request.body;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 35, , 36]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id
                                    },
                                    include: {
                                        etapas_registro: {
                                            where: { activa: true },
                                            include: {
                                                etapa_tipo: true
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            proyecto = _b.sent();
                            console.log('proyecto', proyecto);
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: body.etapa_tipo_id },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        carpetas_iniciales: true
                                    }
                                })];
                        case 3:
                            etapaTipo = _b.sent();
                            if (!etapaTipo) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'Tipo de etapa no encontrado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findFirst({
                                    where: {
                                        proyecto_id: id,
                                        etapa_tipo_id: body.etapa_tipo_id
                                    }
                                })];
                        case 4:
                            etapaExistente = _b.sent();
                            if (etapaExistente) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: "Ya existe un registro con el tipo de etapa \"".concat(etapaTipo.nombre, "\" para este proyecto")
                                    })];
                            }
                            etapaActual = proyecto.etapas_registro[0];
                            if (!etapaActual) return [3 /*break*/, 6];
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaActual.id },
                                    data: { activa: false }
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                data: __assign(__assign({ etapa_tipo_id: body.etapa_tipo_id, proyecto_id: id, tipo_iniciativa_id: body.tipo_iniciativa_id, tipo_obra_id: body.tipo_obra_id, volumen: body.volumen, presupuesto_oficial: body.presupuesto_oficial, valor_referencia: body.valor_referencia, bip: body.bip, fecha_llamado_licitacion: body.fecha_llamado_licitacion ? new Date(body.fecha_llamado_licitacion) : null, fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas ? new Date(body.fecha_recepcion_ofertas_tecnicas) : null, fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas ? new Date(body.fecha_apertura_ofertas_economicas) : null, decreto_adjudicacion: body.decreto_adjudicacion, sociedad_concesionaria: body.sociedad_concesionaria, fecha_inicio_concesion: body.fecha_inicio_concesion ? new Date(body.fecha_inicio_concesion) : null, plazo_total_concesion: body.plazo_total_concesion }, (body.inspector_fiscal_id && { inspector_fiscal_id: body.inspector_fiscal_id })), { fecha_creacion: new Date(), fecha_actualizacion: new Date(), activa: true, usuario_creador: body.usuario_creador }),
                                include: {
                                    etapa_tipo: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            descripcion: true,
                                            color: true,
                                            carpetas_iniciales: true
                                        }
                                    }
                                }
                            })];
                        case 7:
                            nuevaEtapa = _b.sent();
                            if (!(body.regiones && body.regiones.length > 0)) return [3 /*break*/, 13];
                            comunaIds = extractComunaIdsFromNestedStructure(body.regiones);
                            geographicalData = [];
                            _i = 0, comunaIds_4 = comunaIds;
                            _b.label = 8;
                        case 8:
                            if (!(_i < comunaIds_4.length)) return [3 /*break*/, 11];
                            comunaId = comunaIds_4[_i];
                            return [4 /*yield*/, prisma_1.prisma.comunas.findUnique({
                                    where: { id: comunaId },
                                    include: {
                                        provincia: {
                                            include: {
                                                region: true
                                            }
                                        }
                                    }
                                })];
                        case 9:
                            comuna = _b.sent();
                            if (comuna) {
                                geographicalData.push({
                                    etapa_registro_id: nuevaEtapa.id,
                                    region_id: comuna.provincia.region.id,
                                    provincia_id: comuna.provincia.id,
                                    comuna_id: comuna.id,
                                });
                            }
                            _b.label = 10;
                        case 10:
                            _i++;
                            return [3 /*break*/, 8];
                        case 11:
                            if (!(geographicalData.length > 0)) return [3 /*break*/, 13];
                            return [4 /*yield*/, prisma_1.prisma.etapas_geografia.createMany({
                                    data: geographicalData,
                                    skipDuplicates: true,
                                })];
                        case 12:
                            _b.sent();
                            _b.label = 13;
                        case 13:
                            _b.trys.push([13, 33, , 34]);
                            console.log('Creating initial folders for new etapa:', nuevaEtapa.etapa_tipo.nombre);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: id },
                                    select: {
                                        nombre: true,
                                        carpeta_raiz_id: true
                                    }
                                })];
                        case 14:
                            proyectoInfo = _b.sent();
                            projectFolderPath = null;
                            if (!(proyectoInfo && nuevaEtapa.etapa_tipo.carpetas_iniciales)) return [3 /*break*/, 18];
                            console.log('Etapa tipo carpetas_iniciales found:', JSON.stringify(nuevaEtapa.etapa_tipo.carpetas_iniciales, null, 2));
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyectoInfo.nombre, id)];
                        case 15:
                            // Crear la ruta base del proyecto en MinIO
                            projectFolderPath = _b.sent();
                            // Crear carpetas en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
                                    carpetas_iniciales: nuevaEtapa.etapa_tipo.carpetas_iniciales
                                })];
                        case 16:
                            // Crear carpetas en MinIO
                            _b.sent();
                            console.log('Etapa tipo folders created successfully in MinIO for new etapa:', nuevaEtapa.etapa_tipo.nombre);
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createEtapaTipoFoldersDB(id, projectFolderPath, {
                                    carpetas_iniciales: nuevaEtapa.etapa_tipo.carpetas_iniciales
                                }, body.usuario_creador, proyectoInfo.carpeta_raiz_id, body.etapa_tipo_id)];
                        case 17:
                            etapaTipoFolders = _b.sent();
                            console.log("Etapa tipo folders DB records created successfully for new etapa: ".concat(nuevaEtapa.etapa_tipo.nombre, ". Created ").concat(etapaTipoFolders.length, " folders with S3 data."));
                            return [3 /*break*/, 19];
                        case 18:
                            console.log('No carpetas_iniciales found for new etapa_tipo_id:', body.etapa_tipo_id);
                            _b.label = 19;
                        case 19: return [4 /*yield*/, prisma_1.prisma.carpetas_transversales.findMany({
                                where: {
                                    etapa_tipo_id: body.etapa_tipo_id,
                                    activa: true
                                },
                                orderBy: {
                                    orden: 'asc'
                                }
                            })];
                        case 20:
                            carpetasTransversales = _b.sent();
                            if (!(carpetasTransversales && carpetasTransversales.length > 0)) return [3 /*break*/, 32];
                            console.log("Creating ".concat(carpetasTransversales.length, " transverse folders for new etapa: ").concat(nuevaEtapa.etapa_tipo.nombre));
                            if (!!projectFolderPath) return [3 /*break*/, 22];
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyectoInfo.nombre, id)];
                        case 21:
                            projectFolderPath = _b.sent();
                            _b.label = 22;
                        case 22:
                            if (!projectFolderPath) return [3 /*break*/, 30];
                            _a = 0, carpetasTransversales_2 = carpetasTransversales;
                            _b.label = 23;
                        case 23:
                            if (!(_a < carpetasTransversales_2.length)) return [3 /*break*/, 29];
                            carpetaTransversal = carpetasTransversales_2[_a];
                            if (!(carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object')) return [3 /*break*/, 28];
                            console.log("Creating transverse subfolders for: ".concat(carpetaTransversal.nombre));
                            console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                            _b.label = 24;
                        case 24:
                            _b.trys.push([24, 27, , 28]);
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas)];
                        case 25:
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            _b.sent();
                            console.log("Transverse subfolders created successfully in MinIO for: ".concat(carpetaTransversal.nombre));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createNestedFolderStructureDB(id, projectFolderPath, carpetaTransversal.estructura_carpetas, body.usuario_creador, proyectoInfo.carpeta_raiz_id, // carpeta_padre_id será la carpeta raíz del proyecto
                                body.etapa_tipo_id, 'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                                carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                                )];
                        case 26:
                            subcarpetas = _b.sent();
                            console.log("Transverse subfolders DB records created successfully for: ".concat(carpetaTransversal.nombre, ". Created ").concat(subcarpetas.length, " subfolders."));
                            return [3 /*break*/, 28];
                        case 27:
                            subfolderError_2 = _b.sent();
                            console.error("Error creating transverse subfolders for ".concat(carpetaTransversal.nombre, ":"), subfolderError_2);
                            return [3 /*break*/, 28];
                        case 28:
                            _a++;
                            return [3 /*break*/, 23];
                        case 29: return [3 /*break*/, 31];
                        case 30:
                            console.warn('Cannot create transverse folders: project folder path was not created successfully');
                            _b.label = 31;
                        case 31:
                            console.log("Transverse folders created successfully for new etapa: ".concat(nuevaEtapa.etapa_tipo.nombre));
                            _b.label = 32;
                        case 32: return [3 /*break*/, 34];
                        case 33:
                            folderError_2 = _b.sent();
                            console.error('Error creating etapa tipo folders for new etapa:', folderError_2);
                            return [3 /*break*/, 34];
                        case 34: return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: 'Etapa del proyecto cambiada exitosamente',
                                data: {
                                    proyecto_id: id,
                                    etapa_anterior: etapaActual ? {
                                        id: etapaActual.id,
                                        etapa_tipo_id: etapaActual.etapa_tipo_id,
                                        nombre_etapa: etapaActual.etapa_tipo.nombre
                                    } : null,
                                    etapa_nueva: {
                                        id: nuevaEtapa.id,
                                        etapa_tipo_id: nuevaEtapa.etapa_tipo_id,
                                        nombre_etapa: nuevaEtapa.etapa_tipo.nombre
                                    }
                                }
                            })];
                        case 35:
                            error_3 = _b.sent();
                            console.error('Error changing project stage:', error_3);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al cambiar la etapa del proyecto'
                                })];
                        case 36: return [2 /*return*/];
                    }
                });
            }); })
                .get('/proyectos/:id/etapa-actual', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener la etapa actual del proyecto padre',
                    description: 'Retorna la información completa de la etapa actualmente activa del proyecto padre, incluyendo todos los datos de la etapa y sus relaciones. No permite obtener etapa actual de proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                proyecto_id: zod_1.default.number(),
                                etapa_actual: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    etapa_tipo_id: zod_1.default.number(),
                                    etapa_tipo: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        color: zod_1.default.string().nullable()
                                    }),
                                    tipo_iniciativa: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).nullable(),
                                    tipo_obra: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).nullable(),
                                    // Deeply nested hierarchical geographical data
                                    etapas_regiones: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        codigo: zod_1.default.string(),
                                        nombre: zod_1.default.string(),
                                        nombre_corto: zod_1.default.string().nullable(),
                                        etapas_provincias: zod_1.default.array(zod_1.default.object({
                                            provincia: zod_1.default.object({
                                                id: zod_1.default.number(),
                                                codigo: zod_1.default.string(),
                                                nombre: zod_1.default.string(),
                                                etapas_comunas: zod_1.default.array(zod_1.default.object({
                                                    comuna: zod_1.default.object({
                                                        id: zod_1.default.number(),
                                                        nombre: zod_1.default.string()
                                                    })
                                                }))
                                            })
                                        }))
                                    })),
                                    volumen: zod_1.default.string().nullable(),
                                    presupuesto_oficial: zod_1.default.string().nullable(),
                                    valor_referencia: zod_1.default.string().nullable(),
                                    bip: zod_1.default.string().nullable(),
                                    fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                    fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                    fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                    decreto_adjudicacion: zod_1.default.string().nullable(),
                                    sociedad_concesionaria: zod_1.default.string().nullable(),
                                    fecha_inicio_concesion: zod_1.default.date().nullable(),
                                    plazo_total_concesion: zod_1.default.string().nullable(),
                                    inspector_fiscal: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre_completo: zod_1.default.string().nullable(),
                                        correo_electronico: zod_1.default.string().nullable()
                                    }).nullable()
                                }).nullable()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto, etapaActual, transformedEtapaActual, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        // Solo permitir obtener etapa actual de proyectos que NO son hijos
                                        proyecto_padre_id: null
                                    }
                                })];
                        case 2:
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado o es un proyecto hijo'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findFirst({
                                    where: {
                                        proyecto_id: id,
                                        activa: true
                                    },
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                id: true,
                                                nombre: true,
                                                descripcion: true,
                                                color: true
                                            }
                                        },
                                        tipo_iniciativa: true,
                                        tipo_obra: true,
                                        // Include unified geographical data
                                        etapas_geografia: {
                                            include: {
                                                region: {
                                                    select: {
                                                        id: true,
                                                        codigo: true,
                                                        nombre: true,
                                                        nombre_corto: true
                                                    }
                                                },
                                                provincia: {
                                                    select: {
                                                        id: true,
                                                        codigo: true,
                                                        nombre: true
                                                    }
                                                },
                                                comuna: {
                                                    select: {
                                                        id: true,
                                                        nombre: true
                                                    }
                                                }
                                            }
                                        },
                                        inspector_fiscal: {
                                            select: {
                                                id: true,
                                                nombre_completo: true,
                                                correo_electronico: true
                                            }
                                        }
                                    }
                                })];
                        case 3:
                            etapaActual = _a.sent();
                            transformedEtapaActual = etapaActual ? __assign(__assign({}, etapaActual), { etapas_regiones: transformGeographicalData(etapaActual.etapas_geografia) }) : null;
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Etapa actual del proyecto obtenida exitosamente',
                                    data: {
                                        proyecto_id: id,
                                        etapa_actual: transformedEtapaActual
                                    }
                                }];
                        case 4:
                            error_4 = _a.sent();
                            console.error('Error getting current project stage:', error_4);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al obtener la etapa actual del proyecto'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })
                .delete('/proyectos/:id', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Eliminar proyecto padre (soft delete)',
                    description: 'Realiza un soft delete del proyecto padre marcándolo como eliminado sin borrar físicamente los datos. El proyecto y sus datos asociados permanecen en la base de datos pero no aparecen en las consultas normales. No permite eliminar proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        usuario_eliminador: zod_1.default.number().int().min(1, 'Usuario que realiza la eliminación es requerido'),
                        motivo_eliminacion: zod_1.default.string().max(500).optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                eliminado: zod_1.default.boolean(),
                                fecha_eliminacion: zod_1.default.date()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, usuario_eliminador, motivo_eliminacion, proyecto, usuario, proyectoEliminado, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            _a = request.body, usuario_eliminador = _a.usuario_eliminador, motivo_eliminacion = _a.motivo_eliminacion;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        // Solo permitir eliminar proyectos que NO son hijos
                                        proyecto_padre_id: null
                                    },
                                    include: {
                                        etapas_registro: {
                                            where: { activa: true },
                                            include: {
                                                etapa_tipo: true
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            proyecto = _b.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado o es un proyecto hijo'
                                    })];
                            }
                            if (proyecto.eliminado) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'El proyecto ya ha sido eliminado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: usuario_eliminador }
                                })];
                        case 3:
                            usuario = _b.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'Usuario eliminador no encontrado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.proyectos.update({
                                    where: { id: id },
                                    data: {
                                        eliminado: true
                                    }
                                })];
                        case 4:
                            proyectoEliminado = _b.sent();
                            if (!(proyecto.etapas_registro.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.updateMany({
                                    where: {
                                        proyecto_id: id,
                                        activa: true
                                    },
                                    data: {
                                        activa: false
                                    }
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            // Opcional: Crear un registro de auditoría de la eliminación
                            // Esto dependería de si tienes una tabla de auditoría configurada
                            console.log("Proyecto \"".concat(proyecto.nombre, "\" eliminado por usuario ").concat(usuario_eliminador, ". Motivo: ").concat(motivo_eliminacion || 'No especificado'));
                            return [2 /*return*/, reply.status(200).send({
                                    success: true,
                                    message: 'Proyecto eliminado exitosamente',
                                    data: {
                                        id: proyectoEliminado.id,
                                        nombre: proyectoEliminado.nombre,
                                        eliminado: proyectoEliminado.eliminado,
                                        fecha_eliminacion: new Date()
                                    }
                                })];
                        case 7:
                            error_5 = _b.sent();
                            console.error('Error deleting project:', error_5);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al eliminar el proyecto'
                                })];
                        case 8: return [2 /*return*/];
                    }
                });
            }); })
                .patch('/proyectos/:id/restaurar', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Restaurar proyecto padre eliminado',
                    description: 'Restaura un proyecto padre que ha sido eliminado mediante soft delete, marcándolo como activo nuevamente. No permite restaurar proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        usuario_restaurador: zod_1.default.number().int().min(1, 'Usuario que realiza la restauración es requerido'),
                        motivo_restauracion: zod_1.default.string().max(500).optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                eliminado: zod_1.default.boolean(),
                                fecha_restauracion: zod_1.default.date()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, usuario_restaurador, motivo_restauracion, proyecto, usuario, proyectoRestaurado, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            _a = request.body, usuario_restaurador = _a.usuario_restaurador, motivo_restauracion = _a.motivo_restauracion;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        // Solo permitir restaurar proyectos que NO son hijos
                                        proyecto_padre_id: null
                                    }
                                })];
                        case 2:
                            proyecto = _b.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado o es un proyecto hijo'
                                    })];
                            }
                            if (!proyecto.eliminado) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'El proyecto no ha sido eliminado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: usuario_restaurador }
                                })];
                        case 3:
                            usuario = _b.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'Usuario restaurador no encontrado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.proyectos.update({
                                    where: { id: id },
                                    data: {
                                        eliminado: false
                                    }
                                })];
                        case 4:
                            proyectoRestaurado = _b.sent();
                            console.log("Proyecto \"".concat(proyecto.nombre, "\" restaurado por usuario ").concat(usuario_restaurador, ". Motivo: ").concat(motivo_restauracion || 'No especificado'));
                            return [2 /*return*/, reply.status(200).send({
                                    success: true,
                                    message: 'Proyecto restaurado exitosamente',
                                    data: {
                                        id: proyectoRestaurado.id,
                                        nombre: proyectoRestaurado.nombre,
                                        eliminado: proyectoRestaurado.eliminado,
                                        fecha_restauracion: new Date()
                                    }
                                })];
                        case 5:
                            error_6 = _b.sent();
                            console.error('Error restoring project:', error_6);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al restaurar el proyecto'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); })
                .get('/proyectos/eliminados', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener lista de proyectos padre eliminados',
                    description: 'Retorna una lista de todos los proyectos padre que han sido eliminados mediante soft delete (no incluye proyectos hijos eliminados).',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                created_at: zod_1.default.date(),
                                eliminado: zod_1.default.boolean(),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable()
                                })
                            }))
                        })
                    }
                }
            }, function () { return __awaiter(_this, void 0, void 0, function () {
                var proyectosEliminados;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                where: {
                                    eliminado: true,
                                    // Solo mostrar proyectos padre eliminados (no proyectos hijos eliminados)
                                    proyecto_padre_id: null
                                },
                                select: {
                                    id: true,
                                    nombre: true,
                                    created_at: true,
                                    eliminado: true,
                                    creador: {
                                        select: {
                                            id: true,
                                            nombre_completo: true
                                        }
                                    }
                                },
                                orderBy: {
                                    created_at: 'desc'
                                }
                            })];
                        case 1:
                            proyectosEliminados = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Lista de proyectos eliminados obtenida exitosamente',
                                    data: proyectosEliminados
                                }];
                    }
                });
            }); })
                .post('/proyectos/padre', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Crear un proyecto padre',
                    description: 'Crea un nuevo proyecto padre que puede contener proyectos hijos. El proyecto padre se crea como carpeta en MinIO y puede asignar proyectos hijos existentes opcionalmente.',
                    body: zod_1.default.object({
                        nombre: zod_1.default.string().max(255),
                        division_id: zod_1.default.number().optional(),
                        departamento_id: zod_1.default.number().optional(),
                        unidad_id: zod_1.default.number().optional(),
                        creado_por: zod_1.default.number(),
                        proyectos_hijos_ids: zod_1.default.array(zod_1.default.number()).optional()
                    }),
                    response: {
                        201: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                es_proyecto_padre: zod_1.default.boolean(),
                                proyectos_hijos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }))
                            })
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, proyectos_hijos_ids, datosProyecto, usuario, proyectosHijos, proyectosPadre, proyectosConPadre, proyectoPadre, projectFolderPath, carpetaRaiz, folderError_3, proyectosHijosAsignados, _i, proyectos_hijos_ids_1, proyectoHijoId, proyectoHijo, oldPath, newPath, moveError_1, error_7;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = request.body, proyectos_hijos_ids = _a.proyectos_hijos_ids, datosProyecto = __rest(_a, ["proyectos_hijos_ids"]);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 28, , 29]);
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: datosProyecto.creado_por }
                                })];
                        case 2:
                            usuario = _b.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'Usuario creador no encontrado'
                                    })];
                            }
                            if (!(proyectos_hijos_ids && proyectos_hijos_ids.length > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids },
                                        eliminado: false
                                    },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        es_proyecto_padre: true,
                                        proyecto_padre_id: true
                                    }
                                })];
                        case 3:
                            proyectosHijos = _b.sent();
                            if (proyectosHijos.length !== proyectos_hijos_ids.length) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Uno o más proyectos hijos no encontrados'
                                    })];
                            }
                            proyectosPadre = proyectosHijos.filter(function (p) { return p.es_proyecto_padre; });
                            if (proyectosPadre.length > 0) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: "Los siguientes proyectos son proyectos padre y no pueden ser hijos: ".concat(proyectosPadre.map(function (p) { return p.nombre; }).join(', '))
                                    })];
                            }
                            proyectosConPadre = proyectosHijos.filter(function (p) { return p.proyecto_padre_id !== null; });
                            if (proyectosConPadre.length > 0) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: "Los siguientes proyectos ya tienen un proyecto padre: ".concat(proyectosConPadre.map(function (p) { return p.nombre; }).join(', '))
                                    })];
                            }
                            _b.label = 4;
                        case 4: return [4 /*yield*/, prisma_1.prisma.proyectos.create({
                                data: {
                                    nombre: datosProyecto.nombre,
                                    division_id: datosProyecto.division_id,
                                    departamento_id: datosProyecto.departamento_id,
                                    unidad_id: datosProyecto.unidad_id,
                                    creado_por: datosProyecto.creado_por,
                                    es_proyecto_padre: true
                                }
                            })];
                        case 5:
                            proyectoPadre = _b.sent();
                            projectFolderPath = null;
                            carpetaRaiz = null;
                            _b.label = 6;
                        case 6:
                            _b.trys.push([6, 9, , 10]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyectoPadre.nombre, proyectoPadre.id)];
                        case 7:
                            projectFolderPath = _b.sent();
                            console.log("Project parent folder created in MinIO: ".concat(projectFolderPath));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createProjectRootFolder(proyectoPadre.id, proyectoPadre.nombre, projectFolderPath, datosProyecto.creado_por)];
                        case 8:
                            // Crear registro de carpeta raíz en la base de datos
                            carpetaRaiz = _b.sent();
                            return [3 /*break*/, 10];
                        case 9:
                            folderError_3 = _b.sent();
                            console.error('Error creating project parent folders:', folderError_3);
                            return [3 /*break*/, 10];
                        case 10:
                            proyectosHijosAsignados = [];
                            if (!(proyectos_hijos_ids && proyectos_hijos_ids.length > 0)) return [3 /*break*/, 27];
                            // Actualizar los proyectos hijos para asignarlos al proyecto padre
                            return [4 /*yield*/, prisma_1.prisma.proyectos.updateMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids }
                                    },
                                    data: {
                                        proyecto_padre_id: proyectoPadre.id
                                    }
                                })];
                        case 11:
                            // Actualizar los proyectos hijos para asignarlos al proyecto padre
                            _b.sent();
                            if (!projectFolderPath) return [3 /*break*/, 24];
                            _i = 0, proyectos_hijos_ids_1 = proyectos_hijos_ids;
                            _b.label = 12;
                        case 12:
                            if (!(_i < proyectos_hijos_ids_1.length)) return [3 /*break*/, 23];
                            proyectoHijoId = proyectos_hijos_ids_1[_i];
                            _b.label = 13;
                        case 13:
                            _b.trys.push([13, 21, , 22]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: proyectoHijoId },
                                    include: {
                                        carpeta_raiz: true
                                    }
                                })];
                        case 14:
                            proyectoHijo = _b.sent();
                            console.log("proyectoHijo");
                            console.log(proyectoHijo);
                            console.log(proyectoHijo.carpeta_raiz);
                            if (!(proyectoHijo && proyectoHijo.carpeta_raiz)) return [3 /*break*/, 20];
                            oldPath = proyectoHijo.carpeta_raiz.s3_path;
                            newPath = "".concat(projectFolderPath, "/").concat(proyectoHijo.nombre);
                            // Mover la carpeta en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.moveFolder(oldPath, newPath)];
                        case 15:
                            // Mover la carpeta en MinIO
                            _b.sent();
                            if (!carpetaRaiz) return [3 /*break*/, 17];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                    where: { id: proyectoHijo.carpeta_raiz.id },
                                    data: {
                                        s3_path: newPath,
                                        carpeta_padre_id: carpetaRaiz.id
                                    }
                                })];
                        case 16:
                            _b.sent();
                            return [3 /*break*/, 19];
                        case 17: 
                        // Si no se pudo crear la carpeta raíz, solo actualizar la ruta
                        return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                where: { id: proyectoHijo.carpeta_raiz.id },
                                data: { s3_path: newPath }
                            })];
                        case 18:
                            // Si no se pudo crear la carpeta raíz, solo actualizar la ruta
                            _b.sent();
                            _b.label = 19;
                        case 19:
                            console.log("Moved project ".concat(proyectoHijo.nombre, " from ").concat(oldPath, " to ").concat(newPath));
                            _b.label = 20;
                        case 20: return [3 /*break*/, 22];
                        case 21:
                            moveError_1 = _b.sent();
                            console.error("Error moving project ".concat(proyectoHijoId, ":"), moveError_1);
                            return [3 /*break*/, 22];
                        case 22:
                            _i++;
                            return [3 /*break*/, 12];
                        case 23: return [3 /*break*/, 25];
                        case 24:
                            console.warn('Cannot move child project folders: parent project folder was not created successfully');
                            _b.label = 25;
                        case 25: return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                where: {
                                    id: { in: proyectos_hijos_ids }
                                },
                                select: {
                                    id: true,
                                    nombre: true
                                }
                            })];
                        case 26:
                            // Obtener los proyectos hijos actualizados
                            proyectosHijosAsignados = _b.sent();
                            _b.label = 27;
                        case 27: return [2 /*return*/, reply.status(201).send({
                                success: true,
                                message: 'Proyecto padre creado exitosamente',
                                data: {
                                    id: proyectoPadre.id,
                                    nombre: proyectoPadre.nombre,
                                    es_proyecto_padre: proyectoPadre.es_proyecto_padre,
                                    proyectos_hijos: proyectosHijosAsignados
                                }
                            })];
                        case 28:
                            error_7 = _b.sent();
                            console.error('Error creating parent project:', error_7);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al crear el proyecto padre'
                                })];
                        case 29: return [2 /*return*/];
                    }
                });
            }); })
                .post('/proyectos/:id/asignar-hijos', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Asignar proyectos hijos a un proyecto padre',
                    description: 'Asigna proyectos hijos existentes a un proyecto padre. Los proyectos hijos se mueven dentro de la carpeta del proyecto padre en MinIO.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        proyectos_hijos_ids: zod_1.default.array(zod_1.default.number()),
                        usuario_operacion: zod_1.default.number()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                proyecto_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }),
                                proyectos_asignados: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }))
                            })
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, proyectos_hijos_ids, usuario_operacion, proyectoPadre, proyectosHijos, proyectosPadre, proyectosConPadre, proyectosAsignados, _i, proyectosHijos_1, proyectoHijo, oldPath, newPath, moveError_2, error_8;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            id = request.params.id;
                            _a = request.body, proyectos_hijos_ids = _a.proyectos_hijos_ids, usuario_operacion = _a.usuario_operacion;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 17, , 18]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        eliminado: false
                                    },
                                    include: {
                                        carpeta_raiz: true
                                    }
                                })];
                        case 2:
                            proyectoPadre = _c.sent();
                            if (!proyectoPadre) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado'
                                    })];
                            }
                            if (!proyectoPadre.es_proyecto_padre) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'El proyecto especificado no es un proyecto padre'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids },
                                        eliminado: false
                                    },
                                    include: {
                                        carpeta_raiz: true
                                    }
                                })];
                        case 3:
                            proyectosHijos = _c.sent();
                            if (proyectosHijos.length !== proyectos_hijos_ids.length) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Uno o más proyectos hijos no encontrados'
                                    })];
                            }
                            proyectosPadre = proyectosHijos.filter(function (p) { return p.es_proyecto_padre; });
                            if (proyectosPadre.length > 0) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: "Los siguientes proyectos son proyectos padre y no pueden ser hijos: ".concat(proyectosPadre.map(function (p) { return p.nombre; }).join(', '))
                                    })];
                            }
                            proyectosConPadre = proyectosHijos.filter(function (p) { return p.proyecto_padre_id !== null; });
                            if (proyectosConPadre.length > 0) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: "Los siguientes proyectos ya tienen un proyecto padre: ".concat(proyectosConPadre.map(function (p) { return p.nombre; }).join(', '))
                                    })];
                            }
                            // Asignar los proyectos hijos al proyecto padre
                            return [4 /*yield*/, prisma_1.prisma.proyectos.updateMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids }
                                    },
                                    data: {
                                        proyecto_padre_id: id
                                    }
                                })];
                        case 4:
                            // Asignar los proyectos hijos al proyecto padre
                            _c.sent();
                            proyectosAsignados = [];
                            _i = 0, proyectosHijos_1 = proyectosHijos;
                            _c.label = 5;
                        case 5:
                            if (!(_i < proyectosHijos_1.length)) return [3 /*break*/, 16];
                            proyectoHijo = proyectosHijos_1[_i];
                            _c.label = 6;
                        case 6:
                            _c.trys.push([6, 13, , 14]);
                            if (!proyectoHijo.carpeta_raiz) return [3 /*break*/, 12];
                            oldPath = proyectoHijo.carpeta_raiz.s3_path;
                            newPath = "".concat(((_b = proyectoPadre.carpeta_raiz) === null || _b === void 0 ? void 0 : _b.s3_path) || "proyectos/".concat(proyectoPadre.nombre, "_").concat(proyectoPadre.id), "/").concat(proyectoHijo.nombre);
                            // Mover la carpeta en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.moveFolder(oldPath, newPath)];
                        case 7:
                            // Mover la carpeta en MinIO
                            _c.sent();
                            if (!proyectoPadre.carpeta_raiz) return [3 /*break*/, 9];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                    where: { id: proyectoHijo.carpeta_raiz.id },
                                    data: {
                                        s3_path: newPath,
                                        carpeta_padre_id: proyectoPadre.carpeta_raiz.id
                                    }
                                })];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 11];
                        case 9: 
                        // Si no hay carpeta raíz del proyecto padre, solo actualizar la ruta
                        return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                where: { id: proyectoHijo.carpeta_raiz.id },
                                data: { s3_path: newPath }
                            })];
                        case 10:
                            // Si no hay carpeta raíz del proyecto padre, solo actualizar la ruta
                            _c.sent();
                            _c.label = 11;
                        case 11:
                            console.log("Moved project ".concat(proyectoHijo.nombre, " from ").concat(oldPath, " to ").concat(newPath));
                            _c.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            moveError_2 = _c.sent();
                            console.error("Error moving project ".concat(proyectoHijo.id, ":"), moveError_2);
                            return [3 /*break*/, 14];
                        case 14:
                            proyectosAsignados.push({
                                id: proyectoHijo.id,
                                nombre: proyectoHijo.nombre
                            });
                            _c.label = 15;
                        case 15:
                            _i++;
                            return [3 /*break*/, 5];
                        case 16: return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: 'Proyectos hijos asignados exitosamente',
                                data: {
                                    proyecto_padre: {
                                        id: proyectoPadre.id,
                                        nombre: proyectoPadre.nombre
                                    },
                                    proyectos_asignados: proyectosAsignados
                                }
                            })];
                        case 17:
                            error_8 = _c.sent();
                            console.error('Error assigning child projects:', error_8);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al asignar proyectos hijos'
                                })];
                        case 18: return [2 /*return*/];
                    }
                });
            }); })
                .get('/proyectos/padres', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener lista de proyectos padre',
                    description: 'Retorna una lista de todos los proyectos padre con información de sus proyectos hijos.',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                created_at: zod_1.default.date(),
                                es_proyecto_padre: zod_1.default.boolean(),
                                proyectos_hijos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    created_at: zod_1.default.date()
                                })),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable()
                                })
                            }))
                        })
                    }
                }
            }, function () { return __awaiter(_this, void 0, void 0, function () {
                var proyectosPadre;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                where: {
                                    es_proyecto_padre: true,
                                    eliminado: false
                                },
                                select: {
                                    id: true,
                                    nombre: true,
                                    created_at: true,
                                    es_proyecto_padre: true,
                                    proyectos_hijos: {
                                        where: {
                                            eliminado: false
                                        },
                                        select: {
                                            id: true,
                                            nombre: true,
                                            created_at: true
                                        }
                                    },
                                    creador: {
                                        select: {
                                            id: true,
                                            nombre_completo: true
                                        }
                                    }
                                },
                                orderBy: {
                                    created_at: 'desc'
                                }
                            })];
                        case 1:
                            proyectosPadre = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Lista de proyectos padre obtenida exitosamente',
                                    data: proyectosPadre
                                }];
                    }
                });
            }); })
                .get('/proyectos/:id/hijos', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener proyectos hijos de un proyecto padre',
                    description: 'Retorna una lista de todos los proyectos hijos de un proyecto padre específico.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                proyecto_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }),
                                proyectos_hijos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    created_at: zod_1.default.date(),
                                    carpeta_raiz_id: zod_1.default.number().nullable(),
                                    es_proyecto_padre: zod_1.default.boolean(),
                                    proyecto_padre_id: zod_1.default.number().nullable(),
                                    // Solo etapa_tipo
                                    etapas_registro: zod_1.default.array(zod_1.default.object({
                                        etapa_tipo: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string(),
                                            color: zod_1.default.string()
                                        })
                                    })),
                                    // Solo creador
                                    creador: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre_completo: zod_1.default.string().nullable()
                                    })
                                }))
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyectoPadre, proyectosHijos, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        eliminado: false
                                    },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        es_proyecto_padre: true
                                    }
                                })];
                        case 2:
                            proyectoPadre = _a.sent();
                            if (!proyectoPadre) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
                                    })];
                            }
                            if (!proyectoPadre.es_proyecto_padre) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'El proyecto especificado no es un proyecto padre'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        proyecto_padre_id: id,
                                        eliminado: false
                                    },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        created_at: true,
                                        carpeta_raiz_id: true,
                                        es_proyecto_padre: true,
                                        proyecto_padre_id: true,
                                        etapas_registro: {
                                            take: 1,
                                            orderBy: {
                                                fecha_creacion: 'desc'
                                            },
                                            select: {
                                                etapa_tipo: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        color: true
                                                    }
                                                }
                                            }
                                        },
                                        creador: {
                                            select: {
                                                id: true,
                                                nombre_completo: true
                                            }
                                        }
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    }
                                })];
                        case 3:
                            proyectosHijos = _a.sent();
                            return [2 /*return*/, reply.status(200).send({
                                    success: true,
                                    message: 'Proyectos hijos obtenidos exitosamente',
                                    data: {
                                        proyecto_padre: {
                                            id: proyectoPadre.id,
                                            nombre: proyectoPadre.nombre
                                        },
                                        proyectos_hijos: proyectosHijos
                                    }
                                })];
                        case 4:
                            error_9 = _a.sent();
                            console.error('Error getting child projects:', error_9);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al obtener los proyectos hijos'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); })
                .patch('/proyectos/:id/remover-hijos', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Remover proyectos hijos de un proyecto padre',
                    description: 'Remueve proyectos hijos de un proyecto padre. Los proyectos hijos se mueven de vuelta a la raíz y se actualizan sus rutas en MinIO.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        proyectos_hijos_ids: zod_1.default.array(zod_1.default.number()),
                        usuario_operacion: zod_1.default.number()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                proyecto_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }),
                                proyectos_removidos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }))
                            })
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, proyectos_hijos_ids, usuario_operacion, proyectoPadre, proyectosHijos, proyectosRemovidos, _i, proyectosHijos_2, proyectoHijo, oldPath, newPath, moveError_3, error_10;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            _a = request.body, proyectos_hijos_ids = _a.proyectos_hijos_ids, usuario_operacion = _a.usuario_operacion;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 14, , 15]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: {
                                        id: id,
                                        eliminado: false
                                    },
                                    include: {
                                        carpeta_raiz: true
                                    }
                                })];
                        case 2:
                            proyectoPadre = _b.sent();
                            if (!proyectoPadre) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto padre no encontrado'
                                    })];
                            }
                            if (!proyectoPadre.es_proyecto_padre) {
                                return [2 /*return*/, reply.status(400).send({
                                        success: false,
                                        message: 'El proyecto especificado no es un proyecto padre'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids },
                                        proyecto_padre_id: id,
                                        eliminado: false
                                    },
                                    include: {
                                        carpeta_raiz: true
                                    }
                                })];
                        case 3:
                            proyectosHijos = _b.sent();
                            if (proyectosHijos.length !== proyectos_hijos_ids.length) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Uno o más proyectos hijos no encontrados o no pertenecen a este proyecto padre'
                                    })];
                            }
                            // Remover los proyectos hijos del proyecto padre
                            return [4 /*yield*/, prisma_1.prisma.proyectos.updateMany({
                                    where: {
                                        id: { in: proyectos_hijos_ids }
                                    },
                                    data: {
                                        proyecto_padre_id: null
                                    }
                                })];
                        case 4:
                            // Remover los proyectos hijos del proyecto padre
                            _b.sent();
                            proyectosRemovidos = [];
                            _i = 0, proyectosHijos_2 = proyectosHijos;
                            _b.label = 5;
                        case 5:
                            if (!(_i < proyectosHijos_2.length)) return [3 /*break*/, 13];
                            proyectoHijo = proyectosHijos_2[_i];
                            _b.label = 6;
                        case 6:
                            _b.trys.push([6, 10, , 11]);
                            if (!proyectoHijo.carpeta_raiz) return [3 /*break*/, 9];
                            oldPath = proyectoHijo.carpeta_raiz.s3_path;
                            newPath = "proyectos/".concat(proyectoHijo.nombre, "_").concat(proyectoHijo.id);
                            // Mover la carpeta en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.moveFolder(oldPath, newPath)];
                        case 7:
                            // Mover la carpeta en MinIO
                            _b.sent();
                            // Actualizar la ruta y remover la carpeta padre en la base de datos
                            return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                    where: { id: proyectoHijo.carpeta_raiz.id },
                                    data: {
                                        s3_path: newPath,
                                        carpeta_padre_id: null
                                    }
                                })];
                        case 8:
                            // Actualizar la ruta y remover la carpeta padre en la base de datos
                            _b.sent();
                            console.log("Moved project ".concat(proyectoHijo.nombre, " from ").concat(oldPath, " to ").concat(newPath));
                            _b.label = 9;
                        case 9: return [3 /*break*/, 11];
                        case 10:
                            moveError_3 = _b.sent();
                            console.error("Error moving project ".concat(proyectoHijo.id, ":"), moveError_3);
                            return [3 /*break*/, 11];
                        case 11:
                            proyectosRemovidos.push({
                                id: proyectoHijo.id,
                                nombre: proyectoHijo.nombre
                            });
                            _b.label = 12;
                        case 12:
                            _i++;
                            return [3 /*break*/, 5];
                        case 13: return [2 /*return*/, reply.status(200).send({
                                success: true,
                                message: 'Proyectos hijos removidos exitosamente',
                                data: {
                                    proyecto_padre: {
                                        id: proyectoPadre.id,
                                        nombre: proyectoPadre.nombre
                                    },
                                    proyectos_removidos: proyectosRemovidos
                                }
                            })];
                        case 14:
                            error_10 = _b.sent();
                            console.error('Error removing child projects:', error_10);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al remover proyectos hijos'
                                })];
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
