"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carpetasRoutes = carpetasRoutes;
var zod_1 = require("zod");
var prisma_1 = require("@/lib/prisma");
var minio_utils_1 = require("@/utils/minio-utils");
function carpetasRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            fastify.withTypeProvider()
                .post('/carpetas', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Crear una nueva carpeta',
                    description: 'Crea una nueva carpeta en el sistema de archivos y en MinIO. La carpeta puede ser una carpeta raíz, una subcarpeta de otra carpeta, o una carpeta asociada a un proyecto específico.',
                    body: zod_1.default.object({
                        nombre: zod_1.default.string().max(255),
                        descripcion: zod_1.default.string().optional(),
                        carpeta_padre_id: zod_1.default.number().optional(),
                        proyecto_id: zod_1.default.number().optional(),
                        etapa_tipo_id: zod_1.default.number(),
                        usuario_creador: zod_1.default.number(),
                        orden_visualizacion: zod_1.default.number().optional().default(0),
                        max_tamaño_mb: zod_1.default.number().optional(),
                        tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()).optional(),
                        permisos_lectura: zod_1.default.array(zod_1.default.string()).optional(),
                        permisos_escritura: zod_1.default.array(zod_1.default.string()).optional()
                    }),
                    response: {
                        201: zod_1.default.object({
                            id: zod_1.default.number(),
                            nombre: zod_1.default.string(),
                            descripcion: zod_1.default.string().nullable(),
                            carpeta_padre_id: zod_1.default.number().nullable(),
                            proyecto_id: zod_1.default.number().nullable(),
                            etapa_tipo_id: zod_1.default.number().nullable(),
                            s3_path: zod_1.default.string(),
                            s3_bucket_name: zod_1.default.string().nullable(),
                            s3_created: zod_1.default.boolean(),
                            orden_visualizacion: zod_1.default.number(),
                            max_tamaño_mb: zod_1.default.number().nullable(),
                            tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                            permisos_lectura: zod_1.default.array(zod_1.default.string()),
                            permisos_escritura: zod_1.default.array(zod_1.default.string()),
                            usuario_creador: zod_1.default.number(),
                            fecha_creacion: zod_1.default.date(),
                            fecha_actualizacion: zod_1.default.date(),
                            activa: zod_1.default.boolean()
                        }),
                        400: zod_1.default.object({
                            message: zod_1.default.string(),
                            carpeta_existente: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                s3_path: zod_1.default.string()
                            }).optional()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, nombre, descripcion, carpeta_padre_id, proyecto_id, etapa_tipo_id, usuario_creador, _b, orden_visualizacion, max_tamaño_mb, _c, tipos_archivo_permitidos, _d, permisos_lectura, _e, permisos_escritura, usuario, carpetaPadre, proyecto, etapaTipo, s3Path, carpetaPadre, proyecto, carpetaExistente, minioError_1, carpeta, error_1;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 19, , 20]);
                            _a = request.body, nombre = _a.nombre, descripcion = _a.descripcion, carpeta_padre_id = _a.carpeta_padre_id, proyecto_id = _a.proyecto_id, etapa_tipo_id = _a.etapa_tipo_id, usuario_creador = _a.usuario_creador, _b = _a.orden_visualizacion, orden_visualizacion = _b === void 0 ? 0 : _b, max_tamaño_mb = _a.max_tamaño_mb, _c = _a.tipos_archivo_permitidos, tipos_archivo_permitidos = _c === void 0 ? [] : _c, _d = _a.permisos_lectura, permisos_lectura = _d === void 0 ? [] : _d, _e = _a.permisos_escritura, permisos_escritura = _e === void 0 ? [] : _e;
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: usuario_creador }
                                })];
                        case 1:
                            usuario = _f.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Usuario no encontrado'
                                    })];
                            }
                            if (!carpeta_padre_id) return [3 /*break*/, 3];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: carpeta_padre_id }
                                })];
                        case 2:
                            carpetaPadre = _f.sent();
                            if (!carpetaPadre) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Carpeta padre no encontrada'
                                    })];
                            }
                            _f.label = 3;
                        case 3:
                            if (!proyecto_id) return [3 /*break*/, 5];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: proyecto_id }
                                })];
                        case 4:
                            proyecto = _f.sent();
                            if (!proyecto) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Proyecto no encontrado'
                                    })];
                            }
                            _f.label = 5;
                        case 5:
                            if (!etapa_tipo_id) return [3 /*break*/, 7];
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: etapa_tipo_id }
                                })];
                        case 6:
                            etapaTipo = _f.sent();
                            if (!etapaTipo) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Tipo de etapa no encontrado'
                                    })];
                            }
                            _f.label = 7;
                        case 7:
                            s3Path = '';
                            if (!carpeta_padre_id) return [3 /*break*/, 9];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: carpeta_padre_id },
                                    select: { s3_path: true }
                                })];
                        case 8:
                            carpetaPadre = _f.sent();
                            if (carpetaPadre) {
                                s3Path = "".concat(carpetaPadre.s3_path, "/").concat(nombre);
                            }
                            return [3 /*break*/, 12];
                        case 9:
                            if (!proyecto_id) return [3 /*break*/, 11];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: proyecto_id },
                                    select: { nombre: true }
                                })];
                        case 10:
                            proyecto = _f.sent();
                            if (proyecto) {
                                s3Path = "proyectos/".concat(proyecto.nombre, "/").concat(nombre);
                            }
                            return [3 /*break*/, 12];
                        case 11:
                            // Carpeta raíz
                            s3Path = nombre;
                            _f.label = 12;
                        case 12: return [4 /*yield*/, prisma_1.prisma.carpetas.findFirst({
                                where: {
                                    nombre: nombre,
                                    carpeta_padre_id: carpeta_padre_id || null,
                                    proyecto_id: proyecto_id || null,
                                    activa: true
                                }
                            })];
                        case 13:
                            carpetaExistente = _f.sent();
                            if (carpetaExistente) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: "Ya existe una carpeta con el nombre \"".concat(nombre, "\" en esta ubicaci\u00F3n"),
                                        carpeta_existente: {
                                            id: carpetaExistente.id,
                                            nombre: carpetaExistente.nombre,
                                            s3_path: carpetaExistente.s3_path
                                        }
                                    })];
                            }
                            _f.label = 14;
                        case 14:
                            _f.trys.push([14, 16, , 17]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.createFolder(s3Path)];
                        case 15:
                            _f.sent();
                            console.log("Carpeta creada en MinIO: ".concat(s3Path));
                            return [3 /*break*/, 17];
                        case 16:
                            minioError_1 = _f.sent();
                            console.error('Error creando carpeta en MinIO:', minioError_1);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error creando carpeta en el almacenamiento'
                                })];
                        case 17: return [4 /*yield*/, prisma_1.prisma.carpetas.create({
                                data: {
                                    nombre: nombre,
                                    descripcion: descripcion,
                                    carpeta_padre_id: carpeta_padre_id,
                                    proyecto_id: proyecto_id,
                                    etapa_tipo_id: etapa_tipo_id,
                                    s3_path: s3Path,
                                    s3_bucket_name: process.env.MINIO_BUCKET || 'gestor-files',
                                    s3_created: true,
                                    orden_visualizacion: orden_visualizacion,
                                    max_tamaño_mb: max_tamaño_mb,
                                    tipos_archivo_permitidos: tipos_archivo_permitidos,
                                    permisos_lectura: permisos_lectura,
                                    permisos_escritura: permisos_escritura,
                                    usuario_creador: usuario_creador,
                                    activa: true
                                }
                            })];
                        case 18:
                            carpeta = _f.sent();
                            console.log("Carpeta creada exitosamente: ".concat(carpeta.nombre, " (ID: ").concat(carpeta.id, ")"));
                            return [2 /*return*/, reply.status(201).send(carpeta)];
                        case 19:
                            error_1 = _f.sent();
                            console.error('Error creando carpeta:', error_1);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 20: return [2 /*return*/];
                    }
                });
            }); })
                .get('/carpetas', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Obtener lista de carpetas',
                    description: 'Obtiene una lista paginada de carpetas con múltiples opciones de filtrado, ordenamiento y relaciones. Permite filtrar por proyecto, carpeta padre, usuario creador, estado activo, nombre, descripción, permisos, tipos de archivo permitidos, fechas y tamaños. También permite incluir relaciones como carpeta padre, proyecto, creador, carpetas hijas y documentos.',
                    querystring: zod_1.default.object({
                        // Filtros básicos
                        proyecto_id: zod_1.default.string().optional(),
                        carpeta_padre_id: zod_1.default.string().optional(),
                        usuario_creador: zod_1.default.string().optional(),
                        activa: zod_1.default.string().optional(),
                        // Filtros de búsqueda
                        nombre: zod_1.default.string().optional(),
                        descripcion: zod_1.default.string().optional(),
                        // Filtros de permisos
                        permisos_lectura: zod_1.default.string().optional(),
                        permisos_escritura: zod_1.default.string().optional(),
                        // Filtros de tipos de archivo
                        tipo_archivo: zod_1.default.string().optional(),
                        // Paginación
                        page: zod_1.default.string().optional(),
                        limit: zod_1.default.string().optional(),
                        // Ordenamiento
                        sort_by: zod_1.default.enum(['nombre', 'fecha_creacion', 'orden_visualizacion']).optional(),
                        sort_order: zod_1.default.enum(['asc', 'desc']).optional(),
                        // Filtros de fecha
                        fecha_desde: zod_1.default.string().optional(),
                        fecha_hasta: zod_1.default.string().optional(),
                        // Filtros de tamaño
                        max_tamaño_min: zod_1.default.string().optional(),
                        max_tamaño_max: zod_1.default.string().optional(),
                        // Incluir relaciones
                        include_hijos: zod_1.default.string().optional(),
                        include_padre: zod_1.default.string().optional(),
                        include_proyecto: zod_1.default.string().optional(),
                        include_creador: zod_1.default.string().optional(),
                        include_documentos: zod_1.default.string().optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            carpetas: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                carpeta_padre_id: zod_1.default.number().nullable(),
                                proyecto_id: zod_1.default.number().nullable(),
                                s3_path: zod_1.default.string(),
                                s3_bucket_name: zod_1.default.string().nullable(),
                                s3_created: zod_1.default.boolean(),
                                orden_visualizacion: zod_1.default.number(),
                                max_tamaño_mb: zod_1.default.number().nullable(),
                                tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                                permisos_lectura: zod_1.default.array(zod_1.default.string()),
                                permisos_escritura: zod_1.default.array(zod_1.default.string()),
                                usuario_creador: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean(),
                                // Relaciones opcionales
                                carpeta_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable().optional(),
                                proyecto: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable().optional(),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string()
                                }).nullable().optional(),
                                carpetas_hijas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                })).optional(),
                                documentos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.string(),
                                    nombre_archivo: zod_1.default.string()
                                })).optional(),
                                total_documentos: zod_1.default.number().optional()
                            })),
                            pagination: zod_1.default.object({
                                page: zod_1.default.number(),
                                limit: zod_1.default.number(),
                                total: zod_1.default.number(),
                                total_pages: zod_1.default.number()
                            }).optional(),
                            filters: zod_1.default.object({
                                aplicados: zod_1.default.record(zod_1.default.any()),
                                total_resultados: zod_1.default.number()
                            }).optional()
                        }),
                        400: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, proyecto_id, carpeta_padre_id, usuario_creador, activa, nombre, descripcion, permisos_lectura, permisos_escritura, tipo_archivo, _b, page, _c, limit, _d, sort_by, _e, sort_order, fecha_desde, fecha_hasta, max_tamaño_min, max_tamaño_max, include_hijos, include_padre, include_proyecto, include_creador, include_documentos, where, filters, orderBy, pageNum, limitNum, skip, include, total, carpetas, _i, carpetas_1, carpeta, totalDocs, _f, carpetas_2, carpeta, esCarpetaRaiz, response, error_2;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 11, , 12]);
                            _a = request.query, proyecto_id = _a.proyecto_id, carpeta_padre_id = _a.carpeta_padre_id, usuario_creador = _a.usuario_creador, activa = _a.activa, nombre = _a.nombre, descripcion = _a.descripcion, permisos_lectura = _a.permisos_lectura, permisos_escritura = _a.permisos_escritura, tipo_archivo = _a.tipo_archivo, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '20' : _c, _d = _a.sort_by, sort_by = _d === void 0 ? 'orden_visualizacion' : _d, _e = _a.sort_order, sort_order = _e === void 0 ? 'asc' : _e, fecha_desde = _a.fecha_desde, fecha_hasta = _a.fecha_hasta, max_tamaño_min = _a.max_tamaño_min, max_tamaño_max = _a.max_tamaño_max, include_hijos = _a.include_hijos, include_padre = _a.include_padre, include_proyecto = _a.include_proyecto, include_creador = _a.include_creador, include_documentos = _a.include_documentos;
                            where = {};
                            filters = {};
                            // Filtros básicos
                            if (proyecto_id) {
                                where.proyecto_id = parseInt(proyecto_id);
                                filters.proyecto_id = proyecto_id;
                            }
                            if (carpeta_padre_id) {
                                where.carpeta_padre_id = parseInt(carpeta_padre_id);
                                filters.carpeta_padre_id = carpeta_padre_id;
                            }
                            if (usuario_creador) {
                                where.usuario_creador = parseInt(usuario_creador);
                                filters.usuario_creador = usuario_creador;
                            }
                            if (activa !== undefined) {
                                where.activa = activa === 'true';
                                filters.activa = activa;
                            }
                            // Filtros de búsqueda
                            if (nombre) {
                                where.nombre = {
                                    contains: nombre,
                                    mode: 'insensitive'
                                };
                                filters.nombre = nombre;
                            }
                            if (descripcion) {
                                where.descripcion = {
                                    contains: descripcion,
                                    mode: 'insensitive'
                                };
                                filters.descripcion = descripcion;
                            }
                            // Filtros de permisos
                            if (permisos_lectura) {
                                where.permisos_lectura = {
                                    has: permisos_lectura
                                };
                                filters.permisos_lectura = permisos_lectura;
                            }
                            if (permisos_escritura) {
                                where.permisos_escritura = {
                                    has: permisos_escritura
                                };
                                filters.permisos_escritura = permisos_escritura;
                            }
                            // Filtro de tipo de archivo
                            if (tipo_archivo) {
                                where.tipos_archivo_permitidos = {
                                    has: tipo_archivo
                                };
                                filters.tipo_archivo = tipo_archivo;
                            }
                            // Filtros de fecha
                            if (fecha_desde || fecha_hasta) {
                                where.fecha_creacion = {};
                                if (fecha_desde) {
                                    where.fecha_creacion.gte = new Date(fecha_desde);
                                    filters.fecha_desde = fecha_desde;
                                }
                                if (fecha_hasta) {
                                    where.fecha_creacion.lte = new Date(fecha_hasta);
                                    filters.fecha_hasta = fecha_hasta;
                                }
                            }
                            // Filtros de tamaño
                            if (max_tamaño_min || max_tamaño_max) {
                                where.max_tamaño_mb = {};
                                if (max_tamaño_min) {
                                    where.max_tamaño_mb.gte = parseInt(max_tamaño_min);
                                    filters.max_tamaño_min = max_tamaño_min;
                                }
                                if (max_tamaño_max) {
                                    where.max_tamaño_mb.lte = parseInt(max_tamaño_max);
                                    filters.max_tamaño_max = max_tamaño_max;
                                }
                            }
                            orderBy = {};
                            orderBy[sort_by] = sort_order;
                            pageNum = parseInt(page);
                            limitNum = parseInt(limit);
                            skip = (pageNum - 1) * limitNum;
                            include = {};
                            if (include_padre === 'true') {
                                include.carpeta_padre = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                            }
                            if (include_proyecto === 'true') {
                                include.proyecto = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                            }
                            if (include_creador === 'true') {
                                include.creador = {
                                    select: {
                                        id: true,
                                        nombre_completo: true
                                    }
                                };
                            }
                            if (include_hijos === 'true') {
                                include.carpetas_hijas = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                            }
                            if (include_documentos === 'true') {
                                include.documentos = {
                                    where: {
                                        eliminado: false
                                    },
                                    select: {
                                        id: true,
                                        nombre_archivo: true
                                    }
                                };
                            }
                            return [4 /*yield*/, prisma_1.prisma.carpetas.count({ where: where })];
                        case 1:
                            total = _g.sent();
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                                    where: where,
                                    include: include,
                                    orderBy: orderBy,
                                    skip: skip,
                                    take: limitNum
                                })];
                        case 2:
                            carpetas = _g.sent();
                            if (!(include_documentos === 'true')) return [3 /*break*/, 6];
                            _i = 0, carpetas_1 = carpetas;
                            _g.label = 3;
                        case 3:
                            if (!(_i < carpetas_1.length)) return [3 /*break*/, 6];
                            carpeta = carpetas_1[_i];
                            return [4 /*yield*/, prisma_1.prisma.documentos.count({
                                    where: {
                                        carpeta_id: carpeta.id,
                                        eliminado: false
                                    }
                                })];
                        case 4:
                            totalDocs = _g.sent();
                            carpeta.total_documentos = totalDocs;
                            _g.label = 5;
                        case 5:
                            _i++;
                            return [3 /*break*/, 3];
                        case 6:
                            _f = 0, carpetas_2 = carpetas;
                            _g.label = 7;
                        case 7:
                            if (!(_f < carpetas_2.length)) return [3 /*break*/, 10];
                            carpeta = carpetas_2[_f];
                            return [4 /*yield*/, esCarpetaRaizProyecto(carpeta.id)];
                        case 8:
                            esCarpetaRaiz = _g.sent();
                            carpeta.es_carpeta_raiz = esCarpetaRaiz;
                            _g.label = 9;
                        case 9:
                            _f++;
                            return [3 /*break*/, 7];
                        case 10:
                            response = {
                                carpetas: carpetas,
                                filters: {
                                    aplicados: filters,
                                    total_resultados: total
                                }
                            };
                            // Agregar información de paginación si hay más de un resultado
                            if (total > limitNum) {
                                response.pagination = {
                                    page: pageNum,
                                    limit: limitNum,
                                    total: total,
                                    total_pages: Math.ceil(total / limitNum)
                                };
                            }
                            return [2 /*return*/, reply.send(response)];
                        case 11:
                            error_2 = _g.sent();
                            console.error('Error obteniendo carpetas:', error_2);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 12: return [2 /*return*/];
                    }
                });
            }); })
                .get('/carpetas/:id', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Obtener detalles de una carpeta específica',
                    description: 'Obtiene los detalles completos de una carpeta específica por su ID. Retorna toda la información de la carpeta incluyendo su configuración, permisos, tipos de archivo permitidos y metadatos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string()
                    }),
                    response: {
                        200: zod_1.default.object({
                            id: zod_1.default.number(),
                            nombre: zod_1.default.string(),
                            descripcion: zod_1.default.string().nullable(),
                            carpeta_padre_id: zod_1.default.number().nullable(),
                            proyecto_id: zod_1.default.number().nullable(),
                            s3_path: zod_1.default.string(),
                            s3_bucket_name: zod_1.default.string().nullable(),
                            s3_created: zod_1.default.boolean(),
                            orden_visualizacion: zod_1.default.number(),
                            max_tamaño_mb: zod_1.default.number().nullable(),
                            tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                            permisos_lectura: zod_1.default.array(zod_1.default.string()),
                            permisos_escritura: zod_1.default.array(zod_1.default.string()),
                            usuario_creador: zod_1.default.number(),
                            fecha_creacion: zod_1.default.date(),
                            fecha_actualizacion: zod_1.default.date(),
                            activa: zod_1.default.boolean()
                        }),
                        404: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, carpeta, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: parseInt(id) }
                                })];
                        case 1:
                            carpeta = _a.sent();
                            if (!carpeta) {
                                return [2 /*return*/, reply.status(404).send({
                                        message: 'Carpeta no encontrada'
                                    })];
                            }
                            return [2 /*return*/, reply.send(carpeta)];
                        case 2:
                            error_3 = _a.sent();
                            console.error('Error obteniendo carpeta:', error_3);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })
                .get('/carpetas/:id/contenido', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Obtener el contenido de una carpeta',
                    description: 'Obtiene el contenido completo de una carpeta específica, incluyendo sus subcarpetas y documentos. Permite configurar qué elementos incluir, límites de resultados y ordenamiento. También proporciona estadísticas detalladas sobre el contenido de la carpeta como total de elementos, tamaño total y tipos de archivo únicos. Si la carpeta pertenece a un proyecto padre, también incluye las carpetas de los proyectos hijos.',
                    params: zod_1.default.object({
                        id: zod_1.default.string()
                    }),
                    querystring: zod_1.default.object({
                        include_documentos: zod_1.default.string().optional(),
                        include_carpetas: zod_1.default.string().optional(),
                        limit_documentos: zod_1.default.string().optional(),
                        limit_carpetas: zod_1.default.string().optional(),
                        sort_documentos: zod_1.default.enum(['nombre_archivo', 'fecha_creacion', 'tamano']).optional(),
                        sort_carpetas: zod_1.default.enum(['nombre', 'orden_visualizacion', 'fecha_creacion']).optional(),
                        sort_order: zod_1.default.enum(['asc', 'desc']).optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            carpeta: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                s3_path: zod_1.default.string(),
                                orden_visualizacion: zod_1.default.number(),
                                max_tamaño_mb: zod_1.default.number().nullable(),
                                tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                                permisos_lectura: zod_1.default.array(zod_1.default.string()),
                                permisos_escritura: zod_1.default.array(zod_1.default.string()),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean(),
                                // Información del proyecto si existe
                                proyecto: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable().optional(),
                                // Información de la carpeta padre si existe
                                carpeta_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable().optional(),
                                // Información del tipo de etapa
                                etapa_tipo: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    color: zod_1.default.string().nullable()
                                }).nullable().optional(),
                                carpeta_transversal: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    color: zod_1.default.string(),
                                    orden: zod_1.default.number().nullable()
                                }).nullable().optional()
                            }),
                            contenido: zod_1.default.object({
                                carpetas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    orden_visualizacion: zod_1.default.number(),
                                    fecha_creacion: zod_1.default.date(),
                                    fecha_actualizacion: zod_1.default.date(),
                                    activa: zod_1.default.boolean(),
                                    total_documentos: zod_1.default.number(),
                                    total_carpetas_hijas: zod_1.default.number(),
                                    etapa_tipo: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        color: zod_1.default.string().nullable(),
                                    }).nullable().optional(),
                                    carpeta_transversal: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        color: zod_1.default.string(),
                                        orden: zod_1.default.number().nullable()
                                    }).nullable().optional()
                                })),
                                documentos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.string(),
                                    nombre_archivo: zod_1.default.string(),
                                    extension: zod_1.default.string().nullable(),
                                    tamano: zod_1.default.number().nullable(),
                                    tipo_mime: zod_1.default.string().nullable(),
                                    fecha_creacion: zod_1.default.date(),
                                    descripcion: zod_1.default.string().nullable(),
                                    categoria: zod_1.default.string().nullable(),
                                    estado: zod_1.default.string().nullable(),
                                    version: zod_1.default.string().nullable(),
                                    etiquetas: zod_1.default.array(zod_1.default.string()),
                                    usuario_creador: zod_1.default.number(),
                                    subido_por: zod_1.default.number(),
                                    tipo_documento_id: zod_1.default.number().nullable(),
                                    tipo_documento: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable()
                                    }).nullable().optional()
                                }))
                            }),
                            estadisticas: zod_1.default.object({
                                total_carpetas: zod_1.default.number(),
                                total_documentos: zod_1.default.number(),
                                tamano_total_mb: zod_1.default.number().nullable(),
                                tipos_archivo_unicos: zod_1.default.array(zod_1.default.string()),
                                fecha_ultima_actualizacion: zod_1.default.date().nullable()
                            })
                        }),
                        404: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, _b, include_documentos, _c, include_carpetas, _d, limit_documentos, _e, limit_carpetas, _f, sort_documentos, _g, sort_carpetas, _h, sort_order, carpeta, esCarpetaRaiz, response, projectIds, proyecto, proyectosHijos, carpetasHijas, _i, carpetasHijas_1, carpetaHija, totalDocs, totalCarpetasHijas, esCarpetaRaiz_1, documentos, documentosConTipo, documentosFormateados, totalDocumentos, tamanoTotal, tiposUnicos, fechaUltima, error_4;
                var _j, _k;
                var _this = this;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            _l.trys.push([0, 18, , 19]);
                            id = request.params.id;
                            _a = request.query, _b = _a.include_documentos, include_documentos = _b === void 0 ? 'true' : _b, _c = _a.include_carpetas, include_carpetas = _c === void 0 ? 'true' : _c, _d = _a.limit_documentos, limit_documentos = _d === void 0 ? '50' : _d, _e = _a.limit_carpetas, limit_carpetas = _e === void 0 ? '50' : _e, _f = _a.sort_documentos, sort_documentos = _f === void 0 ? 'nombre_archivo' : _f, _g = _a.sort_carpetas, sort_carpetas = _g === void 0 ? 'orden_visualizacion' : _g, _h = _a.sort_order, sort_order = _h === void 0 ? 'asc' : _h;
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: parseInt(id) },
                                    include: {
                                        proyecto: {
                                            select: {
                                                id: true,
                                                nombre: true
                                            }
                                        },
                                        carpeta_padre: {
                                            select: {
                                                id: true,
                                                nombre: true
                                            }
                                        },
                                        etapa_tipo: {
                                            select: {
                                                id: true,
                                                nombre: true,
                                                color: true
                                            }
                                        },
                                        carpeta_transversal: {
                                            select: {
                                                id: true,
                                                nombre: true,
                                                descripcion: true,
                                                color: true,
                                                orden: true
                                            }
                                        },
                                        proyectos_carpeta_raiz: {
                                            select: {
                                                id: true,
                                                nombre: true
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            carpeta = _l.sent();
                            if (!carpeta) {
                                return [2 /*return*/, reply.status(404).send({
                                        message: 'Carpeta no encontrada'
                                    })];
                            }
                            return [4 /*yield*/, esCarpetaRaizProyecto(parseInt(id))];
                        case 2:
                            esCarpetaRaiz = _l.sent();
                            response = {
                                carpeta: __assign(__assign({}, carpeta), { es_carpeta_raiz: esCarpetaRaiz }),
                                contenido: {
                                    carpetas: [],
                                    documentos: []
                                },
                                estadisticas: {
                                    total_carpetas: 0,
                                    total_documentos: 0,
                                    tamano_total_mb: 0,
                                    tipos_archivo_unicos: [],
                                    fecha_ultima_actualizacion: null
                                }
                            };
                            if (!(include_carpetas === 'true')) return [3 /*break*/, 13];
                            projectIds = [carpeta.proyecto_id];
                            if (!carpeta.proyecto_id) return [3 /*break*/, 5];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: carpeta.proyecto_id },
                                    select: {
                                        id: true,
                                        es_proyecto_padre: true,
                                        proyecto_padre_id: true
                                    }
                                })];
                        case 3:
                            proyecto = _l.sent();
                            if (!(proyecto && proyecto.es_proyecto_padre)) return [3 /*break*/, 5];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        proyecto_padre_id: carpeta.proyecto_id,
                                        eliminado: false
                                    },
                                    select: { id: true }
                                })];
                        case 4:
                            proyectosHijos = _l.sent();
                            projectIds = __spreadArray([carpeta.proyecto_id], proyectosHijos.map(function (p) { return p.id; }), true);
                            _l.label = 5;
                        case 5: return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                                where: __assign({ carpeta_padre_id: parseInt(id), activa: true }, (carpeta.proyecto_id && {
                                    proyecto_id: { in: projectIds }
                                })),
                                include: {
                                    etapa_tipo: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            color: true
                                        }
                                    },
                                    carpeta_transversal: {
                                        select: {
                                            id: true,
                                            nombre: true,
                                            descripcion: true,
                                            color: true,
                                            orden: true
                                        }
                                    },
                                    proyectos_carpeta_raiz: {
                                        select: {
                                            id: true,
                                            nombre: true
                                        }
                                    }
                                },
                                orderBy: (_j = {},
                                    _j[sort_carpetas] = sort_order,
                                    _j),
                                take: parseInt(limit_carpetas)
                            })];
                        case 6:
                            carpetasHijas = _l.sent();
                            _i = 0, carpetasHijas_1 = carpetasHijas;
                            _l.label = 7;
                        case 7:
                            if (!(_i < carpetasHijas_1.length)) return [3 /*break*/, 12];
                            carpetaHija = carpetasHijas_1[_i];
                            return [4 /*yield*/, calcularTotalDocumentosRecursivo(carpetaHija.id)];
                        case 8:
                            totalDocs = _l.sent();
                            return [4 /*yield*/, prisma_1.prisma.carpetas.count({
                                    where: {
                                        carpeta_padre_id: carpetaHija.id,
                                        activa: true
                                    }
                                })];
                        case 9:
                            totalCarpetasHijas = _l.sent();
                            return [4 /*yield*/, esCarpetaRaizProyecto(carpetaHija.id)];
                        case 10:
                            esCarpetaRaiz_1 = _l.sent();
                            carpetaHija.total_documentos = totalDocs;
                            carpetaHija.total_carpetas_hijas = totalCarpetasHijas;
                            carpetaHija.es_carpeta_raiz = esCarpetaRaiz_1;
                            _l.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 7];
                        case 12:
                            response.contenido.carpetas = carpetasHijas;
                            response.estadisticas.total_carpetas = carpetasHijas.length;
                            _l.label = 13;
                        case 13:
                            if (!(include_documentos === 'true')) return [3 /*break*/, 17];
                            return [4 /*yield*/, prisma_1.prisma.documentos.findMany({
                                    where: {
                                        carpeta_id: parseInt(id),
                                        eliminado: false
                                    },
                                    orderBy: (_k = {},
                                        _k[sort_documentos] = sort_order,
                                        _k),
                                    take: parseInt(limit_documentos),
                                    include: {
                                        creador: {
                                            select: {
                                                id: true,
                                                nombre_completo: true
                                            }
                                        },
                                        subio_por: {
                                            select: {
                                                id: true,
                                                nombre_completo: true
                                            }
                                        }
                                    }
                                })];
                        case 14:
                            documentos = _l.sent();
                            return [4 /*yield*/, Promise.all(documentos.map(function (doc) { return __awaiter(_this, void 0, void 0, function () {
                                    var tipoDoc;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!doc.tipo_documento_id) return [3 /*break*/, 2];
                                                return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findUnique({
                                                        where: { id: doc.tipo_documento_id },
                                                        select: {
                                                            id: true,
                                                            nombre: true,
                                                            descripcion: true
                                                        }
                                                    })];
                                            case 1:
                                                tipoDoc = _a.sent();
                                                return [2 /*return*/, __assign(__assign({}, doc), { tipo_documento: tipoDoc })];
                                            case 2: return [2 /*return*/, __assign(__assign({}, doc), { tipo_documento: null })];
                                        }
                                    });
                                }); }))];
                        case 15:
                            documentosConTipo = _l.sent();
                            documentosFormateados = documentos.map(function (doc) { return (__assign(__assign({}, doc), { tamano: doc.tamano ? Number(doc.tamano) : null })); });
                            response.contenido.documentos = documentosFormateados;
                            return [4 /*yield*/, calcularTotalDocumentosRecursivo(parseInt(id))];
                        case 16:
                            totalDocumentos = _l.sent();
                            response.estadisticas.total_documentos = totalDocumentos;
                            // Calcular estadísticas de documentos
                            if (documentos.length > 0) {
                                tamanoTotal = documentos.reduce(function (sum, doc) {
                                    return sum + (doc.tamano ? Number(doc.tamano) : 0);
                                }, 0);
                                tiposUnicos = Array.from(new Set(documentos
                                    .map(function (doc) { return doc.extension; })
                                    .filter(function (ext) { return ext; })));
                                fechaUltima = documentos.reduce(function (latest, doc) {
                                    return doc.fecha_ultima_actualizacion > latest ? doc.fecha_ultima_actualizacion : latest;
                                }, documentos[0].fecha_ultima_actualizacion);
                                response.estadisticas.tamano_total_mb = Math.round(tamanoTotal / (1024 * 1024) * 100) / 100; // Convertir a MB
                                response.estadisticas.tipos_archivo_unicos = tiposUnicos;
                                response.estadisticas.fecha_ultima_actualizacion = fechaUltima;
                            }
                            _l.label = 17;
                        case 17: return [2 /*return*/, reply.send(response)];
                        case 18:
                            error_4 = _l.sent();
                            console.error('Error obteniendo contenido de carpeta:', error_4);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 19: return [2 /*return*/];
                    }
                });
            }); })
                .put('/carpetas/:id/renombrar', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Renombrar una carpeta',
                    description: 'Renombra una carpeta específica tanto en la base de datos como en el almacenamiento MinIO. Actualiza el nombre de la carpeta y recalcula las rutas S3 de todas las subcarpetas y documentos asociados.',
                    params: zod_1.default.object({
                        id: zod_1.default.string()
                    }),
                    body: zod_1.default.object({
                        nuevo_nombre: zod_1.default.string().max(255),
                        usuario_modificador: zod_1.default.number()
                    }),
                    response: {
                        200: zod_1.default.object({
                            id: zod_1.default.number(),
                            nombre: zod_1.default.string(),
                            descripcion: zod_1.default.string().nullable(),
                            carpeta_padre_id: zod_1.default.number().nullable(),
                            proyecto_id: zod_1.default.number().nullable(),
                            etapa_tipo_id: zod_1.default.number().nullable(),
                            s3_path: zod_1.default.string(),
                            s3_bucket_name: zod_1.default.string().nullable(),
                            s3_created: zod_1.default.boolean(),
                            orden_visualizacion: zod_1.default.number(),
                            max_tamaño_mb: zod_1.default.number().nullable(),
                            tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                            permisos_lectura: zod_1.default.array(zod_1.default.string()),
                            permisos_escritura: zod_1.default.array(zod_1.default.string()),
                            usuario_creador: zod_1.default.number(),
                            fecha_creacion: zod_1.default.date(),
                            fecha_actualizacion: zod_1.default.date(),
                            activa: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        404: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, nuevo_nombre, usuario_modificador, carpeta, usuario, carpetaExistente, nuevaRutaS3, carpetaPadre, proyecto, minioError_2, carpetaActualizada, error_5;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 15, , 16]);
                            id = request.params.id;
                            _a = request.body, nuevo_nombre = _a.nuevo_nombre, usuario_modificador = _a.usuario_modificador;
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: parseInt(id) }
                                })];
                        case 1:
                            carpeta = _b.sent();
                            if (!carpeta) {
                                return [2 /*return*/, reply.status(404).send({
                                        message: 'Carpeta no encontrada'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: usuario_modificador }
                                })];
                        case 2:
                            usuario = _b.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Usuario modificador no encontrado'
                                    })];
                            }
                            // Validar que el nuevo nombre no esté vacío
                            if (!nuevo_nombre || nuevo_nombre.trim() === '') {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'El nuevo nombre no puede estar vacío'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findFirst({
                                    where: {
                                        nombre: nuevo_nombre,
                                        carpeta_padre_id: carpeta.carpeta_padre_id,
                                        proyecto_id: carpeta.proyecto_id,
                                        activa: true,
                                        id: { not: parseInt(id) }
                                    }
                                })];
                        case 3:
                            carpetaExistente = _b.sent();
                            if (carpetaExistente) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Ya existe una carpeta con ese nombre en el mismo nivel'
                                    })];
                            }
                            nuevaRutaS3 = '';
                            if (!carpeta.carpeta_padre_id) return [3 /*break*/, 5];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: carpeta.carpeta_padre_id },
                                    select: { s3_path: true }
                                })];
                        case 4:
                            carpetaPadre = _b.sent();
                            if (carpetaPadre) {
                                nuevaRutaS3 = "".concat(carpetaPadre.s3_path, "/").concat(nuevo_nombre);
                            }
                            return [3 /*break*/, 8];
                        case 5:
                            if (!carpeta.proyecto_id) return [3 /*break*/, 7];
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                    where: { id: carpeta.proyecto_id },
                                    select: { nombre: true }
                                })];
                        case 6:
                            proyecto = _b.sent();
                            if (proyecto) {
                                nuevaRutaS3 = "proyectos/".concat(proyecto.nombre, "/").concat(nuevo_nombre);
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            // Carpeta raíz
                            nuevaRutaS3 = nuevo_nombre;
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 10, , 11]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.renameFolder(carpeta.s3_path, nuevaRutaS3)];
                        case 9:
                            _b.sent();
                            console.log("Carpeta renombrada en MinIO: ".concat(carpeta.s3_path, " -> ").concat(nuevaRutaS3));
                            return [3 /*break*/, 11];
                        case 10:
                            minioError_2 = _b.sent();
                            console.error('Error renombrando carpeta en MinIO:', minioError_2);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error renombrando carpeta en el almacenamiento'
                                })];
                        case 11: return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                where: { id: parseInt(id) },
                                data: {
                                    nombre: nuevo_nombre,
                                    s3_path: nuevaRutaS3,
                                    fecha_actualizacion: new Date()
                                }
                            })];
                        case 12:
                            carpetaActualizada = _b.sent();
                            // Actualizar las rutas S3 de todas las subcarpetas recursivamente
                            return [4 /*yield*/, actualizarRutasSubcarpetas(parseInt(id), carpeta.s3_path, nuevaRutaS3)];
                        case 13:
                            // Actualizar las rutas S3 de todas las subcarpetas recursivamente
                            _b.sent();
                            // Actualizar las rutas S3 de todos los documentos en esta carpeta
                            return [4 /*yield*/, prisma_1.prisma.$executeRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          UPDATE documentos \n          SET s3_path = REPLACE(s3_path, ", ", ", ")\n          WHERE carpeta_id = ", "\n        "], ["\n          UPDATE documentos \n          SET s3_path = REPLACE(s3_path, ", ", ", ")\n          WHERE carpeta_id = ", "\n        "])), carpeta.s3_path, nuevaRutaS3, parseInt(id))];
                        case 14:
                            // Actualizar las rutas S3 de todos los documentos en esta carpeta
                            _b.sent();
                            console.log("Carpeta renombrada exitosamente: ".concat(carpeta.nombre, " -> ").concat(nuevo_nombre, " (ID: ").concat(carpeta.id, ")"));
                            return [2 /*return*/, reply.send(__assign(__assign({}, carpetaActualizada), { message: "Carpeta renombrada exitosamente de \"".concat(carpeta.nombre, "\" a \"").concat(nuevo_nombre, "\"") }))];
                        case 15:
                            error_5 = _b.sent();
                            console.error('Error renombrando carpeta:', error_5);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 16: return [2 /*return*/];
                    }
                });
            }); })
                .put('/carpetas/:id/mover', {
                schema: {
                    tags: ['Carpetas'],
                    summary: 'Mover una carpeta a otra ubicación',
                    description: 'Mueve una carpeta de una ubicación a otra, actualizando tanto la base de datos como el almacenamiento MinIO. Permite mover carpetas entre diferentes proyectos, carpetas padre, o convertir carpetas en carpetas raíz. Actualiza automáticamente las rutas S3 de todas las subcarpetas y documentos asociados.',
                    params: zod_1.default.object({
                        id: zod_1.default.string()
                    }),
                    body: zod_1.default.object({
                        nueva_carpeta_padre_id: zod_1.default.number(),
                        usuario_modificador: zod_1.default.number()
                    }),
                    response: {
                        200: zod_1.default.object({
                            id: zod_1.default.number(),
                            nombre: zod_1.default.string(),
                            descripcion: zod_1.default.string().nullable(),
                            carpeta_padre_id: zod_1.default.number().nullable(),
                            proyecto_id: zod_1.default.number().nullable(),
                            s3_path: zod_1.default.string(),
                            s3_bucket_name: zod_1.default.string().nullable(),
                            s3_created: zod_1.default.boolean(),
                            orden_visualizacion: zod_1.default.number(),
                            max_tamaño_mb: zod_1.default.number().nullable(),
                            tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                            permisos_lectura: zod_1.default.array(zod_1.default.string()),
                            permisos_escritura: zod_1.default.array(zod_1.default.string()),
                            usuario_creador: zod_1.default.number(),
                            fecha_creacion: zod_1.default.date(),
                            fecha_actualizacion: zod_1.default.date(),
                            activa: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        400: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        404: zod_1.default.object({
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, nueva_carpeta_padre_id, usuario_modificador, carpeta, usuario, nuevaCarpetaPadre, carpetaPadre, nuevo_proyecto_id, carpetaExistente, nuevaRutaS3, carpetaPadreInfo, minioError_3, carpetaActualizada, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 15, , 16]);
                            id = request.params.id;
                            _a = request.body, nueva_carpeta_padre_id = _a.nueva_carpeta_padre_id, usuario_modificador = _a.usuario_modificador;
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: parseInt(id) }
                                })];
                        case 1:
                            carpeta = _b.sent();
                            if (!carpeta) {
                                return [2 /*return*/, reply.status(404).send({
                                        message: 'Carpeta no encontrada'
                                    })];
                            }
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { id: usuario_modificador }
                                })];
                        case 2:
                            usuario = _b.sent();
                            if (!usuario) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Usuario modificador no encontrado'
                                    })];
                            }
                            // Validar que no se está intentando mover la carpeta a sí misma
                            if (nueva_carpeta_padre_id === parseInt(id)) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'No se puede mover una carpeta a sí misma'
                                    })];
                            }
                            if (!nueva_carpeta_padre_id) return [3 /*break*/, 4];
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: nueva_carpeta_padre_id }
                                })];
                        case 3:
                            nuevaCarpetaPadre = _b.sent();
                            if (!nuevaCarpetaPadre) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Carpeta padre de destino no encontrada'
                                    })];
                            }
                            _b.label = 4;
                        case 4: return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                where: { id: nueva_carpeta_padre_id },
                                select: { proyecto_id: true }
                            })];
                        case 5:
                            carpetaPadre = _b.sent();
                            if (!carpetaPadre) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Carpeta padre de destino no encontrada'
                                    })];
                            }
                            nuevo_proyecto_id = carpetaPadre.proyecto_id;
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findFirst({
                                    where: {
                                        nombre: carpeta.nombre,
                                        carpeta_padre_id: nueva_carpeta_padre_id,
                                        proyecto_id: nuevo_proyecto_id,
                                        activa: true,
                                        id: { not: parseInt(id) }
                                    }
                                })];
                        case 6:
                            carpetaExistente = _b.sent();
                            if (carpetaExistente) {
                                return [2 /*return*/, reply.status(400).send({
                                        message: 'Ya existe una carpeta con ese nombre en el destino'
                                    })];
                            }
                            nuevaRutaS3 = '';
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                                    where: { id: nueva_carpeta_padre_id },
                                    select: { s3_path: true }
                                })];
                        case 7:
                            carpetaPadreInfo = _b.sent();
                            if (carpetaPadreInfo) {
                                nuevaRutaS3 = "".concat(carpetaPadreInfo.s3_path, "/").concat(carpeta.nombre);
                            }
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 10, , 11]);
                            return [4 /*yield*/, minio_utils_1.MinIOUtils.moveFolder(carpeta.s3_path, nuevaRutaS3)];
                        case 9:
                            _b.sent();
                            console.log("Carpeta movida en MinIO: ".concat(carpeta.s3_path, " -> ").concat(nuevaRutaS3));
                            return [3 /*break*/, 11];
                        case 10:
                            minioError_3 = _b.sent();
                            console.error('Error moviendo carpeta en MinIO:', minioError_3);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error moviendo carpeta en el almacenamiento'
                                })];
                        case 11: return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                                where: { id: parseInt(id) },
                                data: {
                                    carpeta_padre_id: nueva_carpeta_padre_id,
                                    proyecto_id: nuevo_proyecto_id,
                                    s3_path: nuevaRutaS3,
                                    fecha_actualizacion: new Date()
                                }
                            })];
                        case 12:
                            carpetaActualizada = _b.sent();
                            // Actualizar las rutas S3 de todas las subcarpetas recursivamente
                            return [4 /*yield*/, actualizarRutasSubcarpetas(parseInt(id), carpeta.s3_path, nuevaRutaS3)];
                        case 13:
                            // Actualizar las rutas S3 de todas las subcarpetas recursivamente
                            _b.sent();
                            // Actualizar las rutas S3 de todos los documentos en esta carpeta
                            return [4 /*yield*/, prisma_1.prisma.$executeRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n          UPDATE documentos \n          SET s3_path = REPLACE(s3_path, ", ", ", ")\n          WHERE carpeta_id = ", "\n        "], ["\n          UPDATE documentos \n          SET s3_path = REPLACE(s3_path, ", ", ", ")\n          WHERE carpeta_id = ", "\n        "])), carpeta.s3_path, nuevaRutaS3, parseInt(id))];
                        case 14:
                            // Actualizar las rutas S3 de todos los documentos en esta carpeta
                            _b.sent();
                            console.log("Carpeta movida exitosamente: ".concat(carpeta.nombre, " (ID: ").concat(carpeta.id, ")"));
                            return [2 /*return*/, reply.send(__assign(__assign({}, carpetaActualizada), { message: "Carpeta \"".concat(carpeta.nombre, "\" movida exitosamente") }))];
                        case 15:
                            error_6 = _b.sent();
                            console.error('Error moviendo carpeta:', error_6);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor'
                                })];
                        case 16: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
// Función auxiliar para actualizar rutas de subcarpetas recursivamente
function actualizarRutasSubcarpetas(carpetaId, rutaAntigua, rutaNueva) {
    return __awaiter(this, void 0, void 0, function () {
        var subcarpetas, _i, subcarpetas_1, subcarpeta, nuevaRutaSubcarpeta, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                            where: { carpeta_padre_id: carpetaId }
                        })];
                case 1:
                    subcarpetas = _a.sent();
                    _i = 0, subcarpetas_1 = subcarpetas;
                    _a.label = 2;
                case 2:
                    if (!(_i < subcarpetas_1.length)) return [3 /*break*/, 7];
                    subcarpeta = subcarpetas_1[_i];
                    nuevaRutaSubcarpeta = subcarpeta.s3_path.replace(rutaAntigua, rutaNueva);
                    // Actualizar la subcarpeta
                    return [4 /*yield*/, prisma_1.prisma.carpetas.update({
                            where: { id: subcarpeta.id },
                            data: {
                                s3_path: nuevaRutaSubcarpeta,
                                fecha_actualizacion: new Date()
                            }
                        })];
                case 3:
                    // Actualizar la subcarpeta
                    _a.sent();
                    // Actualizar documentos en esta subcarpeta
                    return [4 /*yield*/, prisma_1.prisma.$executeRaw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        UPDATE documentos \n        SET s3_path = REPLACE(s3_path, ", ", ", ")\n        WHERE carpeta_id = ", "\n      "], ["\n        UPDATE documentos \n        SET s3_path = REPLACE(s3_path, ", ", ", ")\n        WHERE carpeta_id = ", "\n      "])), subcarpeta.s3_path, nuevaRutaSubcarpeta, subcarpeta.id)];
                case 4:
                    // Actualizar documentos en esta subcarpeta
                    _a.sent();
                    // Recursivamente actualizar subcarpetas de esta subcarpeta
                    return [4 /*yield*/, actualizarRutasSubcarpetas(subcarpeta.id, subcarpeta.s3_path, nuevaRutaSubcarpeta)];
                case 5:
                    // Recursivamente actualizar subcarpetas de esta subcarpeta
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_7 = _a.sent();
                    console.error('Error actualizando rutas de subcarpetas:', error_7);
                    throw error_7;
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Función auxiliar para calcular el total de documentos de una carpeta incluyendo subcarpetas recursivamente
function calcularTotalDocumentosRecursivo(carpetaId) {
    return __awaiter(this, void 0, void 0, function () {
        var documentosDirectos, subcarpetas, documentosSubcarpetas, _i, subcarpetas_2, subcarpeta, _a, error_8;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, prisma_1.prisma.documentos.count({
                            where: {
                                carpeta_id: carpetaId,
                                eliminado: false
                            }
                        })];
                case 1:
                    documentosDirectos = _b.sent();
                    return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                            where: {
                                carpeta_padre_id: carpetaId,
                                activa: true
                            },
                            select: { id: true }
                        })];
                case 2:
                    subcarpetas = _b.sent();
                    documentosSubcarpetas = 0;
                    _i = 0, subcarpetas_2 = subcarpetas;
                    _b.label = 3;
                case 3:
                    if (!(_i < subcarpetas_2.length)) return [3 /*break*/, 6];
                    subcarpeta = subcarpetas_2[_i];
                    _a = documentosSubcarpetas;
                    return [4 /*yield*/, calcularTotalDocumentosRecursivo(subcarpeta.id)];
                case 4:
                    documentosSubcarpetas = _a + _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, documentosDirectos + documentosSubcarpetas];
                case 7:
                    error_8 = _b.sent();
                    console.error('Error calculando total de documentos recursivo:', error_8);
                    return [2 /*return*/, 0];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Función auxiliar para verificar si una carpeta es subcarpeta de otra
function esSubcarpetaDe(carpetaId, carpetaPadreId) {
    return __awaiter(this, void 0, void 0, function () {
        var carpeta, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                            where: { id: carpetaId },
                            select: { carpeta_padre_id: true }
                        })];
                case 1:
                    carpeta = _a.sent();
                    if (!carpeta) {
                        return [2 /*return*/, false];
                    }
                    // Si la carpeta no tiene padre, no es subcarpeta
                    if (!carpeta.carpeta_padre_id) {
                        return [2 /*return*/, false];
                    }
                    // Si el padre es el que estamos buscando, es subcarpeta
                    if (carpeta.carpeta_padre_id === carpetaPadreId) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, esSubcarpetaDe(carpeta.carpeta_padre_id, carpetaPadreId)];
                case 2: 
                // Recursivamente verificar el padre del padre
                return [2 /*return*/, _a.sent()];
                case 3:
                    error_9 = _a.sent();
                    console.error('Error verificando si es subcarpeta:', error_9);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Función auxiliar para determinar si una carpeta es la carpeta raíz de un proyecto
function esCarpetaRaizProyecto(carpetaId) {
    return __awaiter(this, void 0, void 0, function () {
        var carpeta, proyecto, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prisma_1.prisma.carpetas.findUnique({
                            where: { id: carpetaId },
                            select: {
                                id: true,
                                proyecto_id: true
                            }
                        })];
                case 1:
                    carpeta = _a.sent();
                    if (!carpeta || !carpeta.proyecto_id) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                            where: { id: carpeta.proyecto_id },
                            select: { carpeta_raiz_id: true }
                        })];
                case 2:
                    proyecto = _a.sent();
                    return [2 /*return*/, (proyecto === null || proyecto === void 0 ? void 0 : proyecto.carpeta_raiz_id) === carpetaId];
                case 3:
                    error_10 = _a.sent();
                    console.error('Error verificando si es carpeta raíz del proyecto:', error_10);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3;
