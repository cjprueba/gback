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
Object.defineProperty(exports, "__esModule", { value: true });
exports.busquedaRoutes = busquedaRoutes;
var zod_1 = require("zod");
var prisma_1 = require("@/lib/prisma");
function busquedaRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            fastify.withTypeProvider()
                .get('/busqueda', {
                schema: {
                    tags: ['Búsqueda'],
                    summary: 'Búsqueda general de archivos y carpetas',
                    description: 'Realiza una búsqueda general en archivos y carpetas con múltiples opciones de filtrado',
                    querystring: zod_1.default.object({
                        // Parámetros de búsqueda
                        query: zod_1.default.string().min(1, 'La consulta de búsqueda es requerida'),
                        tipo_busqueda: zod_1.default.enum(['general', 'archivos', 'carpetas']).optional().default('general'),
                        // Filtros de archivos
                        extension: zod_1.default.string().optional(),
                        categoria: zod_1.default.string().optional(),
                        estado: zod_1.default.string().optional(),
                        etiquetas: zod_1.default.string().optional(), // Array separado por comas
                        tamano_min: zod_1.default.string().optional(),
                        tamano_max: zod_1.default.string().optional(),
                        fecha_desde: zod_1.default.string().optional(),
                        fecha_hasta: zod_1.default.string().optional(),
                        // Filtros de carpetas
                        carpeta_padre_id: zod_1.default.string().optional(),
                        proyecto_id: zod_1.default.string().optional(),
                        usuario_creador: zod_1.default.string().optional(),
                        // Filtros generales
                        activo: zod_1.default.string().optional(),
                        // Paginación
                        page: zod_1.default.string().optional().default('1'),
                        limit: zod_1.default.string().optional().default('20'),
                        // Ordenamiento
                        sort_by: zod_1.default.enum(['nombre', 'fecha_creacion', 'tamano', 'relevancia']).optional().default('relevancia'),
                        sort_order: zod_1.default.enum(['asc', 'desc']).optional().default('desc'),
                        // Incluir relaciones
                        include_creador: zod_1.default.string().optional(),
                        include_carpeta: zod_1.default.string().optional(),
                        include_proyecto: zod_1.default.string().optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            resultados: zod_1.default.object({
                                archivos: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.string(),
                                    nombre_archivo: zod_1.default.string(),
                                    extension: zod_1.default.string().nullable(),
                                    tamano: zod_1.default.number().nullable(),
                                    tipo_mime: zod_1.default.string().nullable(),
                                    descripcion: zod_1.default.string().nullable(),
                                    categoria: zod_1.default.string().nullable(),
                                    estado: zod_1.default.string().nullable(),
                                    version: zod_1.default.string().nullable(),
                                    carpeta_id: zod_1.default.number(),
                                    s3_path: zod_1.default.string().nullable(),
                                    etiquetas: zod_1.default.array(zod_1.default.string()),
                                    proyecto_id: zod_1.default.number().nullable(),
                                    subido_por: zod_1.default.number(),
                                    fecha_creacion: zod_1.default.date(),
                                    fecha_ultima_actualizacion: zod_1.default.date(),
                                    creador: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre_completo: zod_1.default.string().nullable(),
                                        correo_electronico: zod_1.default.string().nullable()
                                    }).optional(),
                                    carpeta: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        s3_path: zod_1.default.string()
                                    }).optional(),
                                    proyecto: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).optional()
                                })),
                                carpetas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    carpeta_padre_id: zod_1.default.number().nullable(),
                                    proyecto_id: zod_1.default.number().nullable(),
                                    s3_path: zod_1.default.string(),
                                    orden_visualizacion: zod_1.default.number(),
                                    max_tamaño_mb: zod_1.default.number().nullable(),
                                    tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                                    permisos_lectura: zod_1.default.array(zod_1.default.string()),
                                    permisos_escritura: zod_1.default.array(zod_1.default.string()),
                                    usuario_creador: zod_1.default.number(),
                                    fecha_creacion: zod_1.default.date(),
                                    fecha_actualizacion: zod_1.default.date(),
                                    activa: zod_1.default.boolean(),
                                    creador: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre_completo: zod_1.default.string().nullable(),
                                        correo_electronico: zod_1.default.string().nullable()
                                    }).optional(),
                                    carpeta_padre: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).optional(),
                                    proyecto: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string()
                                    }).optional()
                                }))
                            }),
                            paginacion: zod_1.default.object({
                                page: zod_1.default.number(),
                                limit: zod_1.default.number(),
                                total_archivos: zod_1.default.number(),
                                total_carpetas: zod_1.default.number(),
                                total_resultados: zod_1.default.number(),
                                total_pages: zod_1.default.number()
                            }),
                            estadisticas: zod_1.default.object({
                                tiempo_busqueda_ms: zod_1.default.number(),
                                consulta_original: zod_1.default.string(),
                                tipo_busqueda: zod_1.default.string()
                            })
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
                var startTime, _a, query, _b, tipo_busqueda, extension, categoria, estado, etiquetas, tamano_min, tamano_max, fecha_desde, fecha_hasta, carpeta_padre_id, proyecto_id, usuario_creador, activo, _c, page, _d, limit, _e, sort_by, _f, sort_order, include_creador, include_carpeta, include_proyecto, pageNum, limitNum, offset, archivosWhere, carpetasWhere, searchCondition, carpetasSearchCondition, etiquetasArray, archivosInclude, carpetasInclude, archivosOrderBy, carpetasOrderBy, archivos, carpetas, totalArchivos, totalCarpetas, _g, archivosResult, archivosCount, _h, carpetasResult, carpetasCount, tiempoBusqueda, totalResultados, totalPages, archivosTransformados, carpetasTransformadas, error_1;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            _j.trys.push([0, 5, , 6]);
                            startTime = Date.now();
                            _a = request.query, query = _a.query, _b = _a.tipo_busqueda, tipo_busqueda = _b === void 0 ? 'general' : _b, extension = _a.extension, categoria = _a.categoria, estado = _a.estado, etiquetas = _a.etiquetas, tamano_min = _a.tamano_min, tamano_max = _a.tamano_max, fecha_desde = _a.fecha_desde, fecha_hasta = _a.fecha_hasta, carpeta_padre_id = _a.carpeta_padre_id, proyecto_id = _a.proyecto_id, usuario_creador = _a.usuario_creador, activo = _a.activo, _c = _a.page, page = _c === void 0 ? '1' : _c, _d = _a.limit, limit = _d === void 0 ? '20' : _d, _e = _a.sort_by, sort_by = _e === void 0 ? 'relevancia' : _e, _f = _a.sort_order, sort_order = _f === void 0 ? 'desc' : _f, include_creador = _a.include_creador, include_carpeta = _a.include_carpeta, include_proyecto = _a.include_proyecto;
                            pageNum = parseInt(page);
                            limitNum = parseInt(limit);
                            offset = (pageNum - 1) * limitNum;
                            archivosWhere = {
                                eliminado: false
                            };
                            carpetasWhere = {
                                activa: true
                            };
                            searchCondition = {
                                OR: [
                                    { nombre_archivo: { contains: query, mode: 'insensitive' } },
                                    { descripcion: { contains: query, mode: 'insensitive' } }
                                ]
                            };
                            carpetasSearchCondition = {
                                OR: [
                                    { nombre: { contains: query, mode: 'insensitive' } },
                                    { descripcion: { contains: query, mode: 'insensitive' } }
                                ]
                            };
                            // Aplicar filtros específicos para archivos
                            if (extension) {
                                archivosWhere.extension = { contains: extension, mode: 'insensitive' };
                            }
                            if (categoria) {
                                archivosWhere.categoria = { contains: categoria, mode: 'insensitive' };
                            }
                            if (estado) {
                                archivosWhere.estado = { contains: estado, mode: 'insensitive' };
                            }
                            if (etiquetas) {
                                etiquetasArray = etiquetas.split(',').map(function (tag) { return tag.trim(); });
                                archivosWhere.etiquetas = { hasSome: etiquetasArray };
                            }
                            if (tamano_min) {
                                archivosWhere.tamano = { gte: BigInt(parseInt(tamano_min) * 1024 * 1024) };
                            }
                            if (tamano_max) {
                                archivosWhere.tamano = __assign(__assign({}, archivosWhere.tamano), { lte: BigInt(parseInt(tamano_max) * 1024 * 1024) });
                            }
                            if (fecha_desde) {
                                archivosWhere.fecha_creacion = { gte: new Date(fecha_desde) };
                            }
                            if (fecha_hasta) {
                                archivosWhere.fecha_creacion = __assign(__assign({}, archivosWhere.fecha_creacion), { lte: new Date(fecha_hasta) });
                            }
                            if (proyecto_id) {
                                archivosWhere.proyecto_id = parseInt(proyecto_id);
                                carpetasWhere.proyecto_id = parseInt(proyecto_id);
                            }
                            if (usuario_creador) {
                                archivosWhere.subido_por = parseInt(usuario_creador);
                                carpetasWhere.usuario_creador = parseInt(usuario_creador);
                            }
                            if (carpeta_padre_id) {
                                carpetasWhere.carpeta_padre_id = parseInt(carpeta_padre_id);
                            }
                            // Combinar condiciones de búsqueda
                            archivosWhere.AND = [searchCondition];
                            carpetasWhere.AND = [carpetasSearchCondition];
                            archivosInclude = {};
                            carpetasInclude = {};
                            if (include_creador === 'true') {
                                archivosInclude.creador = {
                                    select: {
                                        id: true,
                                        nombre_completo: true,
                                        correo_electronico: true
                                    }
                                };
                                carpetasInclude.creador = {
                                    select: {
                                        id: true,
                                        nombre_completo: true,
                                        correo_electronico: true
                                    }
                                };
                            }
                            if (include_carpeta === 'true') {
                                archivosInclude.carpeta = {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        s3_path: true
                                    }
                                };
                            }
                            if (include_proyecto === 'true') {
                                archivosInclude.proyecto = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                                carpetasInclude.proyecto = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                            }
                            if (include_carpeta === 'true') {
                                carpetasInclude.carpeta_padre = {
                                    select: {
                                        id: true,
                                        nombre: true
                                    }
                                };
                            }
                            archivosOrderBy = {};
                            carpetasOrderBy = {};
                            if (sort_by === 'relevancia') {
                                // Ordenar por relevancia (simulado por fecha de creación)
                                archivosOrderBy.fecha_creacion = sort_order;
                                carpetasOrderBy.fecha_creacion = sort_order;
                            }
                            else if (sort_by === 'nombre') {
                                archivosOrderBy.nombre_archivo = sort_order;
                                carpetasOrderBy.nombre = sort_order;
                            }
                            else if (sort_by === 'fecha_creacion') {
                                archivosOrderBy.fecha_creacion = sort_order;
                                carpetasOrderBy.fecha_creacion = sort_order;
                            }
                            else if (sort_by === 'tamano') {
                                archivosOrderBy.tamano = sort_order;
                                // Para carpetas no hay tamaño, usar fecha
                                carpetasOrderBy.fecha_creacion = sort_order;
                            }
                            archivos = [];
                            carpetas = [];
                            totalArchivos = 0;
                            totalCarpetas = 0;
                            if (!(tipo_busqueda === 'general' || tipo_busqueda === 'archivos')) return [3 /*break*/, 2];
                            return [4 /*yield*/, Promise.all([
                                    prisma_1.prisma.documentos.findMany({
                                        where: archivosWhere,
                                        include: archivosInclude,
                                        orderBy: archivosOrderBy,
                                        skip: offset,
                                        take: limitNum
                                    }),
                                    prisma_1.prisma.documentos.count({ where: archivosWhere })
                                ])];
                        case 1:
                            _g = _j.sent(), archivosResult = _g[0], archivosCount = _g[1];
                            archivos = archivosResult;
                            totalArchivos = archivosCount;
                            _j.label = 2;
                        case 2:
                            if (!(tipo_busqueda === 'general' || tipo_busqueda === 'carpetas')) return [3 /*break*/, 4];
                            return [4 /*yield*/, Promise.all([
                                    prisma_1.prisma.carpetas.findMany({
                                        where: carpetasWhere,
                                        include: carpetasInclude,
                                        orderBy: carpetasOrderBy,
                                        skip: offset,
                                        take: limitNum
                                    }),
                                    prisma_1.prisma.carpetas.count({ where: carpetasWhere })
                                ])];
                        case 3:
                            _h = _j.sent(), carpetasResult = _h[0], carpetasCount = _h[1];
                            carpetas = carpetasResult;
                            totalCarpetas = carpetasCount;
                            _j.label = 4;
                        case 4:
                            tiempoBusqueda = Date.now() - startTime;
                            totalResultados = totalArchivos + totalCarpetas;
                            totalPages = Math.ceil(totalResultados / limitNum);
                            archivosTransformados = archivos.map(function (archivo) { return (__assign(__assign({}, archivo), { tamano: archivo.tamano ? Number(archivo.tamano) : null })); });
                            carpetasTransformadas = carpetas.map(function (carpeta) { return (__assign(__assign({}, carpeta), { max_tamaño_mb: carpeta.max_tamaño_mb ? Number(carpeta.max_tamaño_mb) : null })); });
                            return [2 /*return*/, reply.send({
                                    resultados: {
                                        archivos: archivosTransformados,
                                        carpetas: carpetasTransformadas
                                    },
                                    paginacion: {
                                        page: pageNum,
                                        limit: limitNum,
                                        total_archivos: totalArchivos,
                                        total_carpetas: totalCarpetas,
                                        total_resultados: totalResultados,
                                        total_pages: totalPages
                                    },
                                    estadisticas: {
                                        tiempo_busqueda_ms: tiempoBusqueda,
                                        consulta_original: query,
                                        tipo_busqueda: tipo_busqueda
                                    }
                                })];
                        case 5:
                            error_1 = _j.sent();
                            console.error('Error en búsqueda:', error_1);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor durante la búsqueda'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); })
                .get('/busqueda/archivos', {
                schema: {
                    tags: ['Búsqueda'],
                    summary: 'Búsqueda específica de archivos',
                    description: 'Realiza una búsqueda específica en archivos con filtros avanzados',
                    querystring: zod_1.default.object({
                        query: zod_1.default.string().min(1, 'La consulta de búsqueda es requerida'),
                        extension: zod_1.default.string().optional(),
                        categoria: zod_1.default.string().optional(),
                        estado: zod_1.default.string().optional(),
                        etiquetas: zod_1.default.string().optional(),
                        tamano_min: zod_1.default.string().optional(),
                        tamano_max: zod_1.default.string().optional(),
                        fecha_desde: zod_1.default.string().optional(),
                        fecha_hasta: zod_1.default.string().optional(),
                        proyecto_id: zod_1.default.string().optional(),
                        carpeta_id: zod_1.default.string().optional(),
                        usuario_creador: zod_1.default.string().optional(),
                        page: zod_1.default.string().optional().default('1'),
                        limit: zod_1.default.string().optional().default('20'),
                        sort_by: zod_1.default.enum(['nombre', 'fecha_creacion', 'tamano', 'relevancia']).optional().default('relevancia'),
                        sort_order: zod_1.default.enum(['asc', 'desc']).optional().default('desc'),
                        include_creador: zod_1.default.string().optional(),
                        include_carpeta: zod_1.default.string().optional(),
                        include_proyecto: zod_1.default.string().optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            archivos: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.string(),
                                nombre_archivo: zod_1.default.string(),
                                extension: zod_1.default.string().nullable(),
                                tamano: zod_1.default.number().nullable(),
                                tipo_mime: zod_1.default.string().nullable(),
                                descripcion: zod_1.default.string().nullable(),
                                categoria: zod_1.default.string().nullable(),
                                estado: zod_1.default.string().nullable(),
                                version: zod_1.default.string().nullable(),
                                carpeta_id: zod_1.default.number(),
                                s3_path: zod_1.default.string().nullable(),
                                etiquetas: zod_1.default.array(zod_1.default.string()),
                                proyecto_id: zod_1.default.number().nullable(),
                                subido_por: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_ultima_actualizacion: zod_1.default.date(),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable(),
                                    correo_electronico: zod_1.default.string().nullable()
                                }).optional(),
                                carpeta: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    s3_path: zod_1.default.string()
                                }).optional(),
                                proyecto: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).optional()
                            })),
                            paginacion: zod_1.default.object({
                                page: zod_1.default.number(),
                                limit: zod_1.default.number(),
                                total: zod_1.default.number(),
                                total_pages: zod_1.default.number()
                            }),
                            estadisticas: zod_1.default.object({
                                tiempo_busqueda_ms: zod_1.default.number(),
                                consulta_original: zod_1.default.string()
                            })
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
                var startTime, _a, query, extension, categoria, estado, etiquetas, tamano_min, tamano_max, fecha_desde, fecha_hasta, proyecto_id, carpeta_id, usuario_creador, _b, page, _c, limit, _d, sort_by, _e, sort_order, include_creador, include_carpeta, include_proyecto, pageNum, limitNum, offset, where, etiquetasArray, include, orderBy, _f, archivos, total, archivosTransformados, tiempoBusqueda, totalPages, error_2;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 2, , 3]);
                            startTime = Date.now();
                            _a = request.query, query = _a.query, extension = _a.extension, categoria = _a.categoria, estado = _a.estado, etiquetas = _a.etiquetas, tamano_min = _a.tamano_min, tamano_max = _a.tamano_max, fecha_desde = _a.fecha_desde, fecha_hasta = _a.fecha_hasta, proyecto_id = _a.proyecto_id, carpeta_id = _a.carpeta_id, usuario_creador = _a.usuario_creador, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '20' : _c, _d = _a.sort_by, sort_by = _d === void 0 ? 'relevancia' : _d, _e = _a.sort_order, sort_order = _e === void 0 ? 'desc' : _e, include_creador = _a.include_creador, include_carpeta = _a.include_carpeta, include_proyecto = _a.include_proyecto;
                            pageNum = parseInt(page);
                            limitNum = parseInt(limit);
                            offset = (pageNum - 1) * limitNum;
                            where = {
                                eliminado: false,
                                OR: [
                                    { nombre_archivo: { contains: query, mode: 'insensitive' } },
                                    { descripcion: { contains: query, mode: 'insensitive' } }
                                ]
                            };
                            // Aplicar filtros
                            if (extension) {
                                where.extension = { contains: extension, mode: 'insensitive' };
                            }
                            if (categoria) {
                                where.categoria = { contains: categoria, mode: 'insensitive' };
                            }
                            if (estado) {
                                where.estado = { contains: estado, mode: 'insensitive' };
                            }
                            if (etiquetas) {
                                etiquetasArray = etiquetas.split(',').map(function (tag) { return tag.trim(); });
                                where.etiquetas = { hasSome: etiquetasArray };
                            }
                            if (tamano_min) {
                                where.tamano = { gte: BigInt(parseInt(tamano_min) * 1024 * 1024) };
                            }
                            if (tamano_max) {
                                where.tamano = __assign(__assign({}, where.tamano), { lte: BigInt(parseInt(tamano_max) * 1024 * 1024) });
                            }
                            if (fecha_desde) {
                                where.fecha_creacion = { gte: new Date(fecha_desde) };
                            }
                            if (fecha_hasta) {
                                where.fecha_creacion = __assign(__assign({}, where.fecha_creacion), { lte: new Date(fecha_hasta) });
                            }
                            if (proyecto_id) {
                                where.proyecto_id = parseInt(proyecto_id);
                            }
                            if (carpeta_id) {
                                where.carpeta_id = parseInt(carpeta_id);
                            }
                            if (usuario_creador) {
                                where.subido_por = parseInt(usuario_creador);
                            }
                            include = {};
                            if (include_creador === 'true') {
                                include.creador = {
                                    select: {
                                        id: true,
                                        nombre_completo: true,
                                        correo_electronico: true
                                    }
                                };
                            }
                            if (include_carpeta === 'true') {
                                include.carpeta = {
                                    select: {
                                        id: true,
                                        nombre: true,
                                        s3_path: true
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
                            orderBy = {};
                            if (sort_by === 'relevancia') {
                                orderBy.fecha_creacion = sort_order;
                            }
                            else if (sort_by === 'nombre') {
                                orderBy.nombre_archivo = sort_order;
                            }
                            else if (sort_by === 'fecha_creacion') {
                                orderBy.fecha_creacion = sort_order;
                            }
                            else if (sort_by === 'tamano') {
                                orderBy.tamano = sort_order;
                            }
                            return [4 /*yield*/, Promise.all([
                                    prisma_1.prisma.documentos.findMany({
                                        where: where,
                                        include: include,
                                        orderBy: orderBy,
                                        skip: offset,
                                        take: limitNum
                                    }),
                                    prisma_1.prisma.documentos.count({ where: where })
                                ])
                                // Transformar resultados
                            ];
                        case 1:
                            _f = _g.sent(), archivos = _f[0], total = _f[1];
                            archivosTransformados = archivos.map(function (archivo) { return (__assign(__assign({}, archivo), { tamano: archivo.tamano ? Number(archivo.tamano) : null })); });
                            tiempoBusqueda = Date.now() - startTime;
                            totalPages = Math.ceil(total / limitNum);
                            return [2 /*return*/, reply.send({
                                    archivos: archivosTransformados,
                                    paginacion: {
                                        page: pageNum,
                                        limit: limitNum,
                                        total: total,
                                        total_pages: totalPages
                                    },
                                    estadisticas: {
                                        tiempo_busqueda_ms: tiempoBusqueda,
                                        consulta_original: query
                                    }
                                })];
                        case 2:
                            error_2 = _g.sent();
                            console.error('Error en búsqueda de archivos:', error_2);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor durante la búsqueda de archivos'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); })
                .get('/busqueda/carpetas', {
                schema: {
                    tags: ['Búsqueda'],
                    summary: 'Búsqueda específica de carpetas',
                    description: 'Realiza una búsqueda específica en carpetas con filtros avanzados',
                    querystring: zod_1.default.object({
                        query: zod_1.default.string().min(1, 'La consulta de búsqueda es requerida'),
                        carpeta_padre_id: zod_1.default.string().optional(),
                        proyecto_id: zod_1.default.string().optional(),
                        usuario_creador: zod_1.default.string().optional(),
                        activa: zod_1.default.string().optional(),
                        fecha_desde: zod_1.default.string().optional(),
                        fecha_hasta: zod_1.default.string().optional(),
                        page: zod_1.default.string().optional().default('1'),
                        limit: zod_1.default.string().optional().default('20'),
                        sort_by: zod_1.default.enum(['nombre', 'fecha_creacion', 'relevancia']).optional().default('relevancia'),
                        sort_order: zod_1.default.enum(['asc', 'desc']).optional().default('desc'),
                        include_creador: zod_1.default.string().optional(),
                        include_padre: zod_1.default.string().optional(),
                        include_proyecto: zod_1.default.string().optional()
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
                                orden_visualizacion: zod_1.default.number(),
                                max_tamaño_mb: zod_1.default.number().nullable(),
                                tipos_archivo_permitidos: zod_1.default.array(zod_1.default.string()),
                                permisos_lectura: zod_1.default.array(zod_1.default.string()),
                                permisos_escritura: zod_1.default.array(zod_1.default.string()),
                                usuario_creador: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean(),
                                creador: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre_completo: zod_1.default.string().nullable(),
                                    correo_electronico: zod_1.default.string().nullable()
                                }).optional(),
                                carpeta_padre: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).optional(),
                                proyecto: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).optional()
                            })),
                            paginacion: zod_1.default.object({
                                page: zod_1.default.number(),
                                limit: zod_1.default.number(),
                                total: zod_1.default.number(),
                                total_pages: zod_1.default.number()
                            }),
                            estadisticas: zod_1.default.object({
                                tiempo_busqueda_ms: zod_1.default.number(),
                                consulta_original: zod_1.default.string()
                            })
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
                var startTime, _a, query, carpeta_padre_id, proyecto_id, usuario_creador, activa, fecha_desde, fecha_hasta, _b, page, _c, limit, _d, sort_by, _e, sort_order, include_creador, include_padre, include_proyecto, pageNum, limitNum, offset, where, include, orderBy, _f, carpetas, total, carpetasTransformadas, tiempoBusqueda, totalPages, error_3;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            _g.trys.push([0, 2, , 3]);
                            startTime = Date.now();
                            _a = request.query, query = _a.query, carpeta_padre_id = _a.carpeta_padre_id, proyecto_id = _a.proyecto_id, usuario_creador = _a.usuario_creador, activa = _a.activa, fecha_desde = _a.fecha_desde, fecha_hasta = _a.fecha_hasta, _b = _a.page, page = _b === void 0 ? '1' : _b, _c = _a.limit, limit = _c === void 0 ? '20' : _c, _d = _a.sort_by, sort_by = _d === void 0 ? 'relevancia' : _d, _e = _a.sort_order, sort_order = _e === void 0 ? 'desc' : _e, include_creador = _a.include_creador, include_padre = _a.include_padre, include_proyecto = _a.include_proyecto;
                            pageNum = parseInt(page);
                            limitNum = parseInt(limit);
                            offset = (pageNum - 1) * limitNum;
                            where = {
                                activa: true,
                                OR: [
                                    { nombre: { contains: query, mode: 'insensitive' } },
                                    { descripcion: { contains: query, mode: 'insensitive' } }
                                ]
                            };
                            // Aplicar filtros
                            if (carpeta_padre_id) {
                                where.carpeta_padre_id = parseInt(carpeta_padre_id);
                            }
                            if (proyecto_id) {
                                where.proyecto_id = parseInt(proyecto_id);
                            }
                            if (usuario_creador) {
                                where.usuario_creador = parseInt(usuario_creador);
                            }
                            if (activa !== undefined) {
                                where.activa = activa === 'true';
                            }
                            if (fecha_desde) {
                                where.fecha_creacion = { gte: new Date(fecha_desde) };
                            }
                            if (fecha_hasta) {
                                where.fecha_creacion = __assign(__assign({}, where.fecha_creacion), { lte: new Date(fecha_hasta) });
                            }
                            include = {};
                            if (include_creador === 'true') {
                                include.creador = {
                                    select: {
                                        id: true,
                                        nombre_completo: true,
                                        correo_electronico: true
                                    }
                                };
                            }
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
                            orderBy = {};
                            if (sort_by === 'relevancia') {
                                orderBy.fecha_creacion = sort_order;
                            }
                            else if (sort_by === 'nombre') {
                                orderBy.nombre = sort_order;
                            }
                            else if (sort_by === 'fecha_creacion') {
                                orderBy.fecha_creacion = sort_order;
                            }
                            return [4 /*yield*/, Promise.all([
                                    prisma_1.prisma.carpetas.findMany({
                                        where: where,
                                        include: include,
                                        orderBy: orderBy,
                                        skip: offset,
                                        take: limitNum
                                    }),
                                    prisma_1.prisma.carpetas.count({ where: where })
                                ])
                                // Transformar resultados
                            ];
                        case 1:
                            _f = _g.sent(), carpetas = _f[0], total = _f[1];
                            carpetasTransformadas = carpetas.map(function (carpeta) { return (__assign(__assign({}, carpeta), { max_tamaño_mb: carpeta.max_tamaño_mb ? Number(carpeta.max_tamaño_mb) : null })); });
                            tiempoBusqueda = Date.now() - startTime;
                            totalPages = Math.ceil(total / limitNum);
                            return [2 /*return*/, reply.send({
                                    carpetas: carpetasTransformadas,
                                    paginacion: {
                                        page: pageNum,
                                        limit: limitNum,
                                        total: total,
                                        total_pages: totalPages
                                    },
                                    estadisticas: {
                                        tiempo_busqueda_ms: tiempoBusqueda,
                                        consulta_original: query
                                    }
                                })];
                        case 2:
                            error_3 = _g.sent();
                            console.error('Error en búsqueda de carpetas:', error_3);
                            return [2 /*return*/, reply.status(500).send({
                                    message: 'Error interno del servidor durante la búsqueda de carpetas'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
