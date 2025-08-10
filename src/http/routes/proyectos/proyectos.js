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
                            regiones: zod_1.default.array(zod_1.default.number()).optional(),
                            provincias: zod_1.default.array(zod_1.default.number()).optional(),
                            comunas: zod_1.default.array(zod_1.default.number()).optional(),
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
                var _a, etapas_registro, datosProyecto, proyecto, etapaTipoId, etapaCreada_1, projectFolderPath, carpetaRaiz, dbError_1, initialFolders, folderError_1, etapaTipo, carpetasTransversales, _i, carpetasTransversales_1, carpetaTransversal, subcarpetas, subfolderError_1, etapaTipoError_1, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
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
                            proyecto = _b.sent();
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
                            etapaCreada_1 = _b.sent();
                            if (!(etapas_registro.regiones && etapas_registro.regiones.length > 0)) return [3 /*break*/, 4];
                            return [4 /*yield*/, prisma_1.prisma.etapas_regiones.createMany({
                                    data: etapas_registro.regiones.map(function (regionId) { return ({
                                        etapa_registro_id: etapaCreada_1.id,
                                        region_id: regionId
                                    }); })
                                })];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            if (!(etapas_registro.provincias && etapas_registro.provincias.length > 0)) return [3 /*break*/, 6];
                            return [4 /*yield*/, prisma_1.prisma.etapas_provincias.createMany({
                                    data: etapas_registro.provincias.map(function (provinciaId) { return ({
                                        etapa_registro_id: etapaCreada_1.id,
                                        provincia_id: provinciaId
                                    }); })
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            if (!(etapas_registro.comunas && etapas_registro.comunas.length > 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, prisma_1.prisma.etapas_comunas.createMany({
                                    data: etapas_registro.comunas.map(function (comunaId) { return ({
                                        etapa_registro_id: etapaCreada_1.id,
                                        comuna_id: comunaId
                                    }); })
                                })];
                        case 7:
                            _b.sent();
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 35, , 36]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyecto.nombre, proyecto.id)];
                        case 9:
                            projectFolderPath = _b.sent();
                            console.log("Project folder created in MinIO: ".concat(projectFolderPath));
                            carpetaRaiz = null;
                            _b.label = 10;
                        case 10:
                            _b.trys.push([10, 12, , 13]);
                            console.log("Creating root folder for project \"".concat(proyecto.nombre, "\" with ID: ").concat(proyecto.id));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createProjectRootFolder(proyecto.id, proyecto.nombre, projectFolderPath, datosProyecto.creado_por)];
                        case 11:
                            carpetaRaiz = _b.sent();
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
                            dbError_1 = _b.sent();
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
                            _b.label = 14;
                        case 14:
                            _b.trys.push([14, 17, , 18]);
                            // Crear carpetas en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createInitialFolders(projectFolderPath, datosProyecto.carpeta_inicial)];
                        case 15:
                            // Crear carpetas en MinIO
                            _b.sent();
                            console.log('Initial folders created successfully in MinIO for project:', proyecto.nombre);
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createInitialFoldersDB(proyecto.id, projectFolderPath, datosProyecto.carpeta_inicial, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, etapaTipoId)];
                        case 16:
                            initialFolders = _b.sent();
                            console.log("Initial folders DB records created successfully for project: ".concat(proyecto.nombre, ". Created ").concat(initialFolders.length, " folders with S3 data."));
                            return [3 /*break*/, 18];
                        case 17:
                            folderError_1 = _b.sent();
                            console.error('Error creating initial folders:', folderError_1);
                            return [3 /*break*/, 18];
                        case 18:
                            if (!(etapas_registro && etapas_registro.etapa_tipo_id)) return [3 /*break*/, 34];
                            _b.label = 19;
                        case 19:
                            _b.trys.push([19, 33, , 34]);
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
                            etapaTipo = _b.sent();
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
                            carpetasTransversales = _b.sent();
                            if (!(carpetasTransversales && carpetasTransversales.length > 0)) return [3 /*break*/, 29];
                            console.log("Creating ".concat(carpetasTransversales.length, " transverse folders for etapa tipo: ").concat(etapaTipo === null || etapaTipo === void 0 ? void 0 : etapaTipo.nombre));
                            _i = 0, carpetasTransversales_1 = carpetasTransversales;
                            _b.label = 22;
                        case 22:
                            if (!(_i < carpetasTransversales_1.length)) return [3 /*break*/, 28];
                            carpetaTransversal = carpetasTransversales_1[_i];
                            if (!(carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object')) return [3 /*break*/, 27];
                            console.log("Creating transverse subfolders for: ".concat(carpetaTransversal.nombre));
                            console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                            _b.label = 23;
                        case 23:
                            _b.trys.push([23, 26, , 27]);
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas)];
                        case 24:
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            _b.sent();
                            console.log("Transverse subfolders created successfully in MinIO for: ".concat(carpetaTransversal.nombre));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createNestedFolderStructureDB(proyecto.id, projectFolderPath, carpetaTransversal.estructura_carpetas, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, // carpeta_padre_id será la carpeta raíz del proyecto
                                etapaTipo === null || etapaTipo === void 0 ? void 0 : etapaTipo.id, 'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                                carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                                )];
                        case 25:
                            subcarpetas = _b.sent();
                            console.log("Transverse subfolders DB records created successfully for: ".concat(carpetaTransversal.nombre, ". Created ").concat(subcarpetas.length, " subfolders."));
                            return [3 /*break*/, 27];
                        case 26:
                            subfolderError_1 = _b.sent();
                            console.error("Error creating transverse subfolders for ".concat(carpetaTransversal.nombre, ":"), subfolderError_1);
                            return [3 /*break*/, 27];
                        case 27:
                            _i++;
                            return [3 /*break*/, 22];
                        case 28:
                            console.log("Transverse folders created successfully for project: ".concat(proyecto.nombre));
                            _b.label = 29;
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
                            _b.sent();
                            console.log('Etapa tipo folders created successfully in MinIO for project:', proyecto.nombre);
                            // Crear registros en la base de datos
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createEtapaTipoFoldersDB(proyecto.id, projectFolderPath, { carpetas_iniciales: etapaTipo.carpetas_iniciales }, datosProyecto.creado_por, carpetaRaiz === null || carpetaRaiz === void 0 ? void 0 : carpetaRaiz.id, etapaTipo.id)];
                        case 31:
                            // Crear registros en la base de datos
                            _b.sent();
                            _b.label = 32;
                        case 32: return [3 /*break*/, 34];
                        case 33:
                            etapaTipoError_1 = _b.sent();
                            console.error('Error creating etapa tipo folders:', etapaTipoError_1);
                            return [3 /*break*/, 34];
                        case 34:
                            console.log("Project folders and DB records created successfully for project: ".concat(proyecto.nombre));
                            console.log("S3 bucket used: ".concat(process.env.MINIO_BUCKET || 'gestor-files'));
                            return [3 /*break*/, 36];
                        case 35:
                            error_1 = _b.sent();
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
                    description: 'Retorna una lista paginada de todos los proyectos activos (no eliminados) con información básica incluyendo el tipo de etapa más reciente, el creador y la carpeta raíz.',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                created_at: zod_1.default.date(),
                                carpeta_raiz_id: zod_1.default.number().nullable(),
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
                                    eliminado: false
                                },
                                select: {
                                    id: true,
                                    nombre: true,
                                    created_at: true,
                                    carpeta_raiz_id: true,
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
                    description: 'Retorna la información completa de un proyecto específico activo (no eliminado) incluyendo todas sus etapas de registro, relaciones con divisiones, departamentos, unidades y creador.',
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
                                    // Hierarchical geographical data
                                    regiones: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        codigo: zod_1.default.string(),
                                        nombre: zod_1.default.string(),
                                        nombre_corto: zod_1.default.string().nullable(),
                                        provincias: zod_1.default.array(zod_1.default.object({
                                            id: zod_1.default.number(),
                                            codigo: zod_1.default.string(),
                                            nombre: zod_1.default.string(),
                                            comunas: zod_1.default.array(zod_1.default.object({
                                                id: zod_1.default.number(),
                                                nombre: zod_1.default.string()
                                            }))
                                        }))
                                    })),
                                    volumen: zod_1.default.string().nullable(),
                                    presupuesto_oficial: zod_1.default.string().nullable(),
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
                                        etapas_registro: {
                                            take: 1,
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
                                                // Include multiple regions, provinces, and communes
                                                etapas_regiones: {
                                                    include: {
                                                        region: {
                                                            select: {
                                                                id: true,
                                                                codigo: true,
                                                                nombre: true,
                                                                nombre_corto: true,
                                                                provincias: {
                                                                    select: {
                                                                        id: true,
                                                                        codigo: true,
                                                                        nombre: true,
                                                                        comunas: {
                                                                            select: {
                                                                                id: true,
                                                                                nombre: true
                                                                            }
                                                                        }
                                                                    }
                                                                }
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
                            transformedProyecto = __assign(__assign({}, proyecto), { etapas_registro: proyecto.etapas_registro.map(function (etapa) { return (__assign(__assign({}, etapa), { 
                                    // Extract hierarchical regions with their provinces and communes
                                    regiones: etapa.etapas_regiones.map(function (er) { return er.region; }), 
                                    // Remove the relationship tables from the response
                                    etapas_regiones: undefined })); }) });
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
                    summary: 'Actualizar proyecto existente',
                    description: 'Actualiza la información de un proyecto existente. Permite modificar datos básicos del proyecto y crear o actualizar etapas de registro asociadas.',
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
                            regiones: zod_1.default.array(zod_1.default.number()).optional(),
                            provincias: zod_1.default.array(zod_1.default.number()).optional(),
                            comunas: zod_1.default.array(zod_1.default.number()).optional(),
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
                var id, proyectoExistente, _a, etapas_registro, datosProyecto, proyectoActualizado, etapasExistentes, etapaExistente_1, regiones, provincias, comunas, datosEtapa, regiones, provincias, comunas, datosEtapa, etapaCreada_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: id },
                                    include: {
                                        etapas_registro: true
                                    }
                                })];
                        case 1:
                            proyectoExistente = _b.sent();
                            if (!proyectoExistente) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
                                    })];
                            }
                            _a = request.body, etapas_registro = _a.etapas_registro, datosProyecto = __rest(_a, ["etapas_registro"]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.update({
                                    where: { id: id },
                                    data: datosProyecto
                                })];
                        case 2:
                            proyectoActualizado = _b.sent();
                            console.log("proyecto actualizado");
                            console.log(request.body);
                            if (!etapas_registro) return [3 /*break*/, 21];
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
                            etapasExistentes = _b.sent();
                            etapaExistente_1 = etapasExistentes[0];
                            console.log(" etapas existente");
                            console.log(etapaExistente_1);
                            console.log("proyecto_id");
                            console.log(id);
                            if (!etapaExistente_1) return [3 /*break*/, 14];
                            // Si existe, actualizar el registro existente
                            console.log("actualizar");
                            regiones = etapas_registro.regiones, provincias = etapas_registro.provincias, comunas = etapas_registro.comunas, datosEtapa = __rest(etapas_registro, ["regiones", "provincias", "comunas"]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaExistente_1.id },
                                    data: __assign(__assign({}, datosEtapa), { fecha_actualizacion: new Date() })
                                })];
                        case 4:
                            _b.sent();
                            if (!(regiones !== undefined)) return [3 /*break*/, 7];
                            // Eliminar relaciones existentes
                            return [4 /*yield*/, prisma_1.prisma.etapas_regiones.deleteMany({
                                    where: { etapa_registro_id: etapaExistente_1.id }
                                })];
                        case 5:
                            // Eliminar relaciones existentes
                            _b.sent();
                            if (!(regiones.length > 0)) return [3 /*break*/, 7];
                            return [4 /*yield*/, prisma_1.prisma.etapas_regiones.createMany({
                                    data: regiones.map(function (regionId) { return ({
                                        etapa_registro_id: etapaExistente_1.id,
                                        region_id: regionId
                                    }); })
                                })];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7:
                            if (!(provincias !== undefined)) return [3 /*break*/, 10];
                            // Eliminar relaciones existentes
                            return [4 /*yield*/, prisma_1.prisma.etapas_provincias.deleteMany({
                                    where: { etapa_registro_id: etapaExistente_1.id }
                                })];
                        case 8:
                            // Eliminar relaciones existentes
                            _b.sent();
                            if (!(provincias.length > 0)) return [3 /*break*/, 10];
                            return [4 /*yield*/, prisma_1.prisma.etapas_provincias.createMany({
                                    data: provincias.map(function (provinciaId) { return ({
                                        etapa_registro_id: etapaExistente_1.id,
                                        provincia_id: provinciaId
                                    }); })
                                })];
                        case 9:
                            _b.sent();
                            _b.label = 10;
                        case 10:
                            if (!(comunas !== undefined)) return [3 /*break*/, 13];
                            // Eliminar relaciones existentes
                            return [4 /*yield*/, prisma_1.prisma.etapas_comunas.deleteMany({
                                    where: { etapa_registro_id: etapaExistente_1.id }
                                })];
                        case 11:
                            // Eliminar relaciones existentes
                            _b.sent();
                            if (!(comunas.length > 0)) return [3 /*break*/, 13];
                            return [4 /*yield*/, prisma_1.prisma.etapas_comunas.createMany({
                                    data: comunas.map(function (comunaId) { return ({
                                        etapa_registro_id: etapaExistente_1.id,
                                        comuna_id: comunaId
                                    }); })
                                })];
                        case 12:
                            _b.sent();
                            _b.label = 13;
                        case 13: return [3 /*break*/, 21];
                        case 14:
                            // Si no existe, crear un nuevo registro
                            console.log("crear");
                            regiones = etapas_registro.regiones, provincias = etapas_registro.provincias, comunas = etapas_registro.comunas, datosEtapa = __rest(etapas_registro, ["regiones", "provincias", "comunas"]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                    data: __assign(__assign({}, datosEtapa), { proyecto_id: id, fecha_creacion: new Date(), fecha_actualizacion: new Date(), activa: true, usuario_creador: proyectoExistente.creado_por })
                                })];
                        case 15:
                            etapaCreada_2 = _b.sent();
                            if (!(regiones && regiones.length > 0)) return [3 /*break*/, 17];
                            return [4 /*yield*/, prisma_1.prisma.etapas_regiones.createMany({
                                    data: regiones.map(function (regionId) { return ({
                                        etapa_registro_id: etapaCreada_2.id,
                                        region_id: regionId
                                    }); })
                                })];
                        case 16:
                            _b.sent();
                            _b.label = 17;
                        case 17:
                            if (!(provincias && provincias.length > 0)) return [3 /*break*/, 19];
                            return [4 /*yield*/, prisma_1.prisma.etapas_provincias.createMany({
                                    data: provincias.map(function (provinciaId) { return ({
                                        etapa_registro_id: etapaCreada_2.id,
                                        provincia_id: provinciaId
                                    }); })
                                })];
                        case 18:
                            _b.sent();
                            _b.label = 19;
                        case 19:
                            if (!(comunas && comunas.length > 0)) return [3 /*break*/, 21];
                            return [4 /*yield*/, prisma_1.prisma.etapas_comunas.createMany({
                                    data: comunas.map(function (comunaId) { return ({
                                        etapa_registro_id: etapaCreada_2.id,
                                        comuna_id: comunaId
                                    }); })
                                })];
                        case 20:
                            _b.sent();
                            _b.label = 21;
                        case 21: return [2 /*return*/, reply.status(200).send({
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
                    summary: 'Obtener carpetas del proyecto',
                    description: 'Retorna la estructura de carpetas asociada a un proyecto específico, incluyendo carpetas padre e hijas con su información de organización.',
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
                                carpetas_hijas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    s3_path: zod_1.default.string(),
                                    orden_visualizacion: zod_1.default.number()
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
                                    where: { id: id }
                                })];
                        case 1:
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
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
                                    message: 'Carpetas del proyecto obtenidas exitosamente',
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
                    summary: 'Cambia la etapa activa de un proyecto',
                    description: 'Cambia la etapa activa de un proyecto. Desactiva la etapa actual y activa la nueva etapa especificada. Incluye validación para asegurar que solo una etapa esté activa por proyecto.',
                    params: zod_1.default.object({
                        id: zod_1.default.string().transform(function (val) { return parseInt(val, 10); })
                    }),
                    body: zod_1.default.object({
                        etapa_tipo_id: zod_1.default.number().int().min(1, 'ID de tipo de etapa es requerido'),
                        tipo_iniciativa_id: zod_1.default.number().int().min(1).optional(),
                        tipo_obra_id: zod_1.default.number().int().min(1).optional(),
                        // Multiple regions, provinces, and communes
                        regiones: zod_1.default.array(zod_1.default.number().int().min(1)).optional(),
                        provincias: zod_1.default.array(zod_1.default.number().int().min(1)).optional(),
                        comunas: zod_1.default.array(zod_1.default.number().int().min(1)).optional(),
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
                var id, body, proyecto, etapaTipo, etapaExistente, etapaActual, nuevaEtapa_1, proyectoInfo, projectFolderPath, etapaTipoFolders, carpetasTransversales, projectFolderPath, _i, carpetasTransversales_2, carpetaTransversal, subcarpetas, subfolderError_2, folderError_2, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            body = request.body;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 32, , 33]);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: id },
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
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: body.etapa_tipo_id },
                                    select: {
                                        id: true,
                                        nombre: true,
                                        carpetas_iniciales: true
                                    }
                                })];
                        case 3:
                            etapaTipo = _a.sent();
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
                            etapaExistente = _a.sent();
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
                            _a.sent();
                            _a.label = 6;
                        case 6: return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                data: {
                                    etapa_tipo_id: body.etapa_tipo_id,
                                    proyecto_id: id,
                                    tipo_iniciativa_id: body.tipo_iniciativa_id,
                                    tipo_obra_id: body.tipo_obra_id,
                                    volumen: body.volumen,
                                    presupuesto_oficial: body.presupuesto_oficial,
                                    valor_referencia: body.valor_referencia,
                                    bip: body.bip,
                                    fecha_llamado_licitacion: body.fecha_llamado_licitacion ? new Date(body.fecha_llamado_licitacion) : null,
                                    fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas ? new Date(body.fecha_recepcion_ofertas_tecnicas) : null,
                                    fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas ? new Date(body.fecha_apertura_ofertas_economicas) : null,
                                    decreto_adjudicacion: body.decreto_adjudicacion,
                                    sociedad_concesionaria: body.sociedad_concesionaria,
                                    fecha_inicio_concesion: body.fecha_inicio_concesion ? new Date(body.fecha_inicio_concesion) : null,
                                    plazo_total_concesion: body.plazo_total_concesion,
                                    inspector_fiscal_id: body.inspector_fiscal_id,
                                    fecha_creacion: new Date(),
                                    fecha_actualizacion: new Date(),
                                    activa: true,
                                    usuario_creador: body.usuario_creador
                                },
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
                            nuevaEtapa_1 = _a.sent();
                            if (!(body.regiones && body.regiones.length > 0)) return [3 /*break*/, 9];
                            return [4 /*yield*/, prisma_1.prisma.etapas_regiones.createMany({
                                    data: body.regiones.map(function (regionId) { return ({
                                        etapa_registro_id: nuevaEtapa_1.id,
                                        region_id: regionId
                                    }); })
                                })];
                        case 8:
                            _a.sent();
                            _a.label = 9;
                        case 9:
                            if (!(body.provincias && body.provincias.length > 0)) return [3 /*break*/, 11];
                            return [4 /*yield*/, prisma_1.prisma.etapas_provincias.createMany({
                                    data: body.provincias.map(function (provinciaId) { return ({
                                        etapa_registro_id: nuevaEtapa_1.id,
                                        provincia_id: provinciaId
                                    }); })
                                })];
                        case 10:
                            _a.sent();
                            _a.label = 11;
                        case 11:
                            if (!(body.comunas && body.comunas.length > 0)) return [3 /*break*/, 13];
                            return [4 /*yield*/, prisma_1.prisma.etapas_comunas.createMany({
                                    data: body.comunas.map(function (comunaId) { return ({
                                        etapa_registro_id: nuevaEtapa_1.id,
                                        comuna_id: comunaId
                                    }); })
                                })];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13:
                            _a.trys.push([13, 30, , 31]);
                            console.log('Creating initial folders for new etapa:', nuevaEtapa_1.etapa_tipo.nombre);
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: id },
                                    select: {
                                        nombre: true,
                                        carpeta_raiz_id: true
                                    }
                                })];
                        case 14:
                            proyectoInfo = _a.sent();
                            if (!(proyectoInfo && nuevaEtapa_1.etapa_tipo.carpetas_iniciales)) return [3 /*break*/, 18];
                            console.log('Etapa tipo carpetas_iniciales found:', JSON.stringify(nuevaEtapa_1.etapa_tipo.carpetas_iniciales, null, 2));
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyectoInfo.nombre, id)];
                        case 15:
                            projectFolderPath = _a.sent();
                            // Crear carpetas en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createEtapaTipoFolders(projectFolderPath, {
                                    carpetas_iniciales: nuevaEtapa_1.etapa_tipo.carpetas_iniciales
                                })];
                        case 16:
                            // Crear carpetas en MinIO
                            _a.sent();
                            console.log('Etapa tipo folders created successfully in MinIO for new etapa:', nuevaEtapa_1.etapa_tipo.nombre);
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createEtapaTipoFoldersDB(id, projectFolderPath, {
                                    carpetas_iniciales: nuevaEtapa_1.etapa_tipo.carpetas_iniciales
                                }, body.usuario_creador, proyectoInfo.carpeta_raiz_id, body.etapa_tipo_id)];
                        case 17:
                            etapaTipoFolders = _a.sent();
                            console.log("Etapa tipo folders DB records created successfully for new etapa: ".concat(nuevaEtapa_1.etapa_tipo.nombre, ". Created ").concat(etapaTipoFolders.length, " folders with S3 data."));
                            return [3 /*break*/, 19];
                        case 18:
                            console.log('No carpetas_iniciales found for new etapa_tipo_id:', body.etapa_tipo_id);
                            _a.label = 19;
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
                            carpetasTransversales = _a.sent();
                            if (!(carpetasTransversales && carpetasTransversales.length > 0)) return [3 /*break*/, 29];
                            console.log("Creating ".concat(carpetasTransversales.length, " transverse folders for new etapa: ").concat(nuevaEtapa_1.etapa_tipo.nombre));
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createProjectFolder(proyectoInfo.nombre, id)];
                        case 21:
                            projectFolderPath = _a.sent();
                            _i = 0, carpetasTransversales_2 = carpetasTransversales;
                            _a.label = 22;
                        case 22:
                            if (!(_i < carpetasTransversales_2.length)) return [3 /*break*/, 28];
                            carpetaTransversal = carpetasTransversales_2[_i];
                            if (!(carpetaTransversal.estructura_carpetas && typeof carpetaTransversal.estructura_carpetas === 'object')) return [3 /*break*/, 27];
                            console.log("Creating transverse subfolders for: ".concat(carpetaTransversal.nombre));
                            console.log('Estructura carpetas:', JSON.stringify(carpetaTransversal.estructura_carpetas, null, 2));
                            _a.label = 23;
                        case 23:
                            _a.trys.push([23, 26, , 27]);
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createNestedFolderStructure(projectFolderPath, carpetaTransversal.estructura_carpetas)];
                        case 24:
                            // Crear las subcarpetas directamente en la raíz del proyecto en MinIO
                            _a.sent();
                            console.log("Transverse subfolders created successfully in MinIO for: ".concat(carpetaTransversal.nombre));
                            return [4 /*yield*/, carpeta_db_utils_1.CarpetaDBUtils.createNestedFolderStructureDB(id, projectFolderPath, carpetaTransversal.estructura_carpetas, body.usuario_creador, proyectoInfo.carpeta_raiz_id, // carpeta_padre_id será la carpeta raíz del proyecto
                                body.etapa_tipo_id, 'Carpeta transversal del proyecto', // descripción específica para carpetas transversales
                                carpetaTransversal.id // carpeta_transversal_id para las subcarpetas
                                )];
                        case 25:
                            subcarpetas = _a.sent();
                            console.log("Transverse subfolders DB records created successfully for: ".concat(carpetaTransversal.nombre, ". Created ").concat(subcarpetas.length, " subfolders."));
                            return [3 /*break*/, 27];
                        case 26:
                            subfolderError_2 = _a.sent();
                            console.error("Error creating transverse subfolders for ".concat(carpetaTransversal.nombre, ":"), subfolderError_2);
                            return [3 /*break*/, 27];
                        case 27:
                            _i++;
                            return [3 /*break*/, 22];
                        case 28:
                            console.log("Transverse folders created successfully for new etapa: ".concat(nuevaEtapa_1.etapa_tipo.nombre));
                            _a.label = 29;
                        case 29: return [3 /*break*/, 31];
                        case 30:
                            folderError_2 = _a.sent();
                            console.error('Error creating etapa tipo folders for new etapa:', folderError_2);
                            return [3 /*break*/, 31];
                        case 31: return [2 /*return*/, reply.status(200).send({
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
                                        id: nuevaEtapa_1.id,
                                        etapa_tipo_id: nuevaEtapa_1.etapa_tipo_id,
                                        nombre_etapa: nuevaEtapa_1.etapa_tipo.nombre
                                    }
                                }
                            })];
                        case 32:
                            error_3 = _a.sent();
                            console.error('Error changing project stage:', error_3);
                            return [2 /*return*/, reply.status(500).send({
                                    success: false,
                                    message: 'Error al cambiar la etapa del proyecto'
                                })];
                        case 33: return [2 /*return*/];
                    }
                });
            }); })
                .get('/proyectos/:id/etapa-actual', {
                schema: {
                    tags: ['Proyectos'],
                    summary: 'Obtener la etapa actual del proyecto',
                    description: 'Retorna la información completa de la etapa actualmente activa del proyecto, incluyendo todos los datos de la etapa y sus relaciones.',
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
                                    // Hierarchical geographical data
                                    regiones: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        codigo: zod_1.default.string(),
                                        nombre: zod_1.default.string(),
                                        nombre_corto: zod_1.default.string().nullable(),
                                        provincias: zod_1.default.array(zod_1.default.object({
                                            id: zod_1.default.number(),
                                            codigo: zod_1.default.string(),
                                            nombre: zod_1.default.string(),
                                            comunas: zod_1.default.array(zod_1.default.object({
                                                id: zod_1.default.number(),
                                                nombre: zod_1.default.string()
                                            }))
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
                                    where: { id: id }
                                })];
                        case 2:
                            proyecto = _a.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
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
                                        // Include multiple regions, provinces, and communes
                                        etapas_regiones: {
                                            include: {
                                                region: {
                                                    select: {
                                                        id: true,
                                                        codigo: true,
                                                        nombre: true,
                                                        nombre_corto: true,
                                                        provincias: {
                                                            select: {
                                                                id: true,
                                                                codigo: true,
                                                                nombre: true,
                                                                comunas: {
                                                                    select: {
                                                                        id: true,
                                                                        nombre: true
                                                                    }
                                                                }
                                                            }
                                                        }
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
                            transformedEtapaActual = etapaActual ? __assign(__assign({}, etapaActual), { 
                                // Extract hierarchical regions with their provinces and communes
                                regiones: etapaActual.etapas_regiones.map(function (er) { return er.region; }), 
                                // Remove the relationship tables from the response
                                etapas_regiones: undefined }) : null;
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
                    summary: 'Eliminar proyecto (soft delete)',
                    description: 'Realiza un soft delete del proyecto marcándolo como eliminado sin borrar físicamente los datos. El proyecto y sus datos asociados permanecen en la base de datos pero no aparecen en las consultas normales.',
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
                                    where: { id: id },
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
                                        message: 'Proyecto no encontrado'
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
                    summary: 'Restaurar proyecto eliminado',
                    description: 'Restaura un proyecto que ha sido eliminado mediante soft delete, marcándolo como activo nuevamente.',
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
                                    where: { id: id }
                                })];
                        case 2:
                            proyecto = _b.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(404).send({
                                        success: false,
                                        message: 'Proyecto no encontrado'
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
                    summary: 'Obtener lista de proyectos eliminados',
                    description: 'Retorna una lista de todos los proyectos que han sido eliminados mediante soft delete.',
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
                                    eliminado: true
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
            }); });
            return [2 /*return*/];
        });
    });
}
