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
exports.etapasRoutes = etapasRoutes;
var zod_1 = require("zod");
var prisma_1 = require("@/lib/prisma");
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
// Esquema Zod para crear etapa
var createEtapaSchema = zod_1.default.object({
    etapa_tipo_id: zod_1.default.number().int().min(1, 'ID de tipo de etapa es requerido'),
    // Información de la etapa - usando IDs en lugar de strings
    tipo_iniciativa_id: zod_1.default.number().int().min(1).optional(),
    tipo_obra_id: zod_1.default.number().int().min(1).optional(),
    region_id: zod_1.default.number().int().min(1).optional(),
    provincia_id: zod_1.default.number().int().min(1).optional(),
    comuna_id: zod_1.default.number().int().min(1).optional(),
    volumen: zod_1.default.string().optional(),
    // Información financiera
    presupuesto_oficial: zod_1.default.string().max(100, 'Presupuesto oficial debe ser mayor 0').optional(),
    valor_referencia: zod_1.default.string().max(255).optional(),
    bip: zod_1.default.string().optional(),
    // Fechas importantes - usando string que se convertirá a Date
    fecha_llamado_licitacion: zod_1.default.string().datetime().optional(),
    fecha_recepcion_ofertas_tecnicas: zod_1.default.string().datetime().optional(),
    fecha_apertura_ofertas_economicas: zod_1.default.string().datetime().optional(),
    fecha_inicio_concesion: zod_1.default.string().datetime().optional(),
    plazo_total_concesion: zod_1.default.string().optional(),
    // Información de la adjudicación
    decreto_adjudicacion: zod_1.default.string().optional(),
    sociedad_concesionaria: zod_1.default.string().max(255, 'Sociedad concesionaria no puede exceder 255 caracteres').optional(),
    // Inspector fiscal asignado
    inspector_fiscal_id: zod_1.default.number().int().min(1).optional(),
    // Usuario creador (requerido)
    usuario_creador: zod_1.default.number().int().min(1, 'Usuario creador es requerido')
});
// Esquema para actualizar etapa (todos los campos opcionales excepto validaciones)
var updateEtapaSchema = createEtapaSchema.partial().extend({
    activa: zod_1.default.boolean().optional()
});
// Esquema para parámetros de ruta
var etapaParamsSchema = zod_1.default.object({
    id: zod_1.default.string().regex(/^\d+$/, 'ID debe ser un número válido').transform(Number)
});
function etapasRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        var _this = this;
        return __generator(this, function (_a) {
            server = app.withTypeProvider();
            // GET /etapas - Lista de etapas
            server.get('/etapas', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Obtener lista de etapas activas',
                    description: 'Retorna todas las etapas activas ordenadas por fecha de creación descendente. Incluye información completa con relaciones (tipo de etapa, iniciativa, obra, ubicación geográfica, inspector fiscal y usuario creador).',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                etapa_tipo_id: zod_1.default.number(),
                                tipo_iniciativa_id: zod_1.default.number().nullable(),
                                tipo_obra_id: zod_1.default.number().nullable(),
                                region_id: zod_1.default.number().nullable(),
                                provincia_id: zod_1.default.number().nullable(),
                                comuna_id: zod_1.default.number().nullable(),
                                volumen: zod_1.default.string().nullable(),
                                presupuesto_oficial: zod_1.default.string().nullable(),
                                valor_referencia: zod_1.default.string().nullable(),
                                bip: zod_1.default.string().nullable(),
                                fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                fecha_inicio_concesion: zod_1.default.date().nullable(),
                                plazo_total_concesion: zod_1.default.string().nullable(),
                                decreto_adjudicacion: zod_1.default.string().nullable(),
                                sociedad_concesionaria: zod_1.default.string().nullable(),
                                inspector_fiscal_id: zod_1.default.number().nullable(),
                                usuario_creador: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean(),
                                etapa_tipo: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable()
                                }),
                                tipo_iniciativa: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable(),
                                tipo_obra: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable(),
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
                                            region_id: zod_1.default.number()
                                        }),
                                        etapas_comunas: zod_1.default.array(zod_1.default.object({
                                            comuna: zod_1.default.object({
                                                id: zod_1.default.number(),
                                                nombre: zod_1.default.string(),
                                                provincia_id: zod_1.default.number(),
                                                region_id: zod_1.default.number()
                                            })
                                        }))
                                    }))
                                })).nullable(),
                                inspector_fiscal: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    correo_electronico: zod_1.default.string().nullable(),
                                    nombre_completo: zod_1.default.string().nullable()
                                }).nullable(),
                                usuario_creador_rel: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    correo_electronico: zod_1.default.string().nullable(),
                                    nombre_completo: zod_1.default.string().nullable()
                                })
                            }))
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var etapas, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: { activa: true },
                                    include: {
                                        etapa_tipo: true,
                                        tipo_iniciativa: true,
                                        tipo_obra: true,
                                        etapas_geografia: {
                                            include: {
                                                region: true,
                                                provincia: true,
                                                comuna: true
                                            }
                                        },
                                        inspector_fiscal: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        },
                                        usuario_creador_rel: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'desc' }
                                })];
                        case 1:
                            etapas = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Lista de etapas obtenida exitosamente',
                                    data: etapas.map(function (etapa) { return (__assign(__assign({}, etapa), { etapas_regiones: transformGeographicalData(etapa.etapas_geografia) })); })
                                }];
                        case 2:
                            error_1 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al obtener las etapas',
                                    error: error_1 instanceof Error ? error_1.message : 'Error desconocido'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // GET /etapas/:id - Detalle de etapa
            server.get('/etapas/:id', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Obtener detalle de etapa específica',
                    description: 'Obtiene información detallada de una etapa específica por su ID. Solo retorna etapas activas. Incluye todas las relaciones (tipo de etapa, iniciativa, obra, ubicación geográfica, inspector fiscal y usuario creador).',
                    params: etapaParamsSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                etapa_tipo_id: zod_1.default.number(),
                                tipo_iniciativa_id: zod_1.default.number().nullable(),
                                tipo_obra_id: zod_1.default.number().nullable(),
                                region_id: zod_1.default.number().nullable(),
                                provincia_id: zod_1.default.number().nullable(),
                                comuna_id: zod_1.default.number().nullable(),
                                volumen: zod_1.default.string().nullable(),
                                presupuesto_oficial: zod_1.default.string().nullable(),
                                valor_referencia: zod_1.default.string().nullable(),
                                fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                fecha_inicio_concesion: zod_1.default.date().nullable(),
                                plazo_total_concesion: zod_1.default.string().nullable(),
                                decreto_adjudicacion: zod_1.default.string().nullable(),
                                sociedad_concesionaria: zod_1.default.string().nullable(),
                                inspector_fiscal_id: zod_1.default.number().nullable(),
                                usuario_creador: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean(),
                                etapa_tipo: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable()
                                }),
                                tipo_iniciativa: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable(),
                                tipo_obra: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string()
                                }).nullable(),
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
                                    })),
                                })).nullable(),
                                inspector_fiscal: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    correo_electronico: zod_1.default.string().nullable(),
                                    nombre_completo: zod_1.default.string().nullable()
                                }).nullable(),
                                usuario_creador_rel: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    correo_electronico: zod_1.default.string().nullable(),
                                    nombre_completo: zod_1.default.string().nullable()
                                })
                            }).optional()
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, etapa, etapasRegiones, region_id, provincia_id, comuna_id, firstGeo, error_2;
                var _a, _b, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            id = request.params.id;
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findUnique({
                                    where: { id: id, activa: true },
                                    include: {
                                        etapa_tipo: true,
                                        tipo_iniciativa: true,
                                        tipo_obra: true,
                                        etapas_geografia: {
                                            include: {
                                                region: true,
                                                provincia: true,
                                                comuna: true
                                            }
                                        },
                                        inspector_fiscal: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        },
                                        usuario_creador_rel: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            etapa = _d.sent();
                            if (!etapa) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            etapasRegiones = null;
                            region_id = null;
                            provincia_id = null;
                            comuna_id = null;
                            if (etapa.etapas_geografia && etapa.etapas_geografia.length > 0) {
                                etapasRegiones = transformGeographicalData(etapa.etapas_geografia);
                                firstGeo = etapa.etapas_geografia[0];
                                region_id = ((_a = firstGeo.region) === null || _a === void 0 ? void 0 : _a.id) || null;
                                provincia_id = ((_b = firstGeo.provincia) === null || _b === void 0 ? void 0 : _b.id) || null;
                                comuna_id = ((_c = firstGeo.comuna) === null || _c === void 0 ? void 0 : _c.id) || null;
                            }
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Detalle de etapa ".concat(id, " obtenido exitosamente"),
                                    data: {
                                        id: etapa.id,
                                        etapa_tipo_id: etapa.etapa_tipo_id,
                                        tipo_iniciativa_id: etapa.tipo_iniciativa_id,
                                        tipo_obra_id: etapa.tipo_obra_id,
                                        region_id: region_id,
                                        provincia_id: provincia_id,
                                        comuna_id: comuna_id,
                                        volumen: etapa.volumen,
                                        presupuesto_oficial: etapa.presupuesto_oficial,
                                        valor_referencia: etapa.valor_referencia,
                                        fecha_llamado_licitacion: etapa.fecha_llamado_licitacion,
                                        fecha_recepcion_ofertas_tecnicas: etapa.fecha_recepcion_ofertas_tecnicas,
                                        fecha_apertura_ofertas_economicas: etapa.fecha_apertura_ofertas_economicas,
                                        fecha_inicio_concesion: etapa.fecha_inicio_concesion,
                                        plazo_total_concesion: etapa.plazo_total_concesion,
                                        decreto_adjudicacion: etapa.decreto_adjudicacion,
                                        sociedad_concesionaria: etapa.sociedad_concesionaria,
                                        inspector_fiscal_id: etapa.inspector_fiscal_id,
                                        usuario_creador: etapa.usuario_creador,
                                        fecha_creacion: etapa.fecha_creacion,
                                        fecha_actualizacion: etapa.fecha_actualizacion,
                                        activa: etapa.activa,
                                        etapa_tipo: etapa.etapa_tipo,
                                        tipo_iniciativa: etapa.tipo_iniciativa,
                                        tipo_obra: etapa.tipo_obra,
                                        etapas_regiones: etapasRegiones,
                                        inspector_fiscal: etapa.inspector_fiscal,
                                        usuario_creador_rel: etapa.usuario_creador_rel
                                    }
                                }];
                        case 3:
                            error_2 = _d.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al obtener el detalle de la etapa',
                                    error: error_2 instanceof Error ? error_2.message : 'Error desconocido'
                                }];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // POST /etapas - Crear nueva etapa
            server.post('/etapas', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Crear nueva etapa',
                    description: 'Crea una nueva etapa en el sistema. Requiere como mínimo el tipo de etapa y el usuario creador. Todos los demás campos son opcionales pero permiten almacenar información completa del proyecto de concesión, incluyendo datos financieros, fechas importantes del proceso de licitación y adjudicación, y ubicación geográfica.',
                    body: createEtapaSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                etapa_tipo_id: zod_1.default.number(),
                                tipo_iniciativa_id: zod_1.default.number().nullable(),
                                tipo_obra_id: zod_1.default.number().nullable(),
                                region_id: zod_1.default.number().nullable(),
                                provincia_id: zod_1.default.number().nullable(),
                                comuna_id: zod_1.default.number().nullable(),
                                volumen: zod_1.default.string().nullable(),
                                presupuesto_oficial: zod_1.default.string().nullable(),
                                valor_referencia: zod_1.default.string().nullable(),
                                bip: zod_1.default.string().nullable(),
                                fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                fecha_inicio_concesion: zod_1.default.date().nullable(),
                                plazo_total_concesion: zod_1.default.string().nullable(),
                                decreto_adjudicacion: zod_1.default.string().nullable(),
                                sociedad_concesionaria: zod_1.default.string().nullable(),
                                inspector_fiscal_id: zod_1.default.number().nullable(),
                                usuario_creador: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                fecha_actualizacion: zod_1.default.date(),
                                activa: zod_1.default.boolean()
                            })
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var body, etapaData, nuevaEtapa, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            body = request.body;
                            etapaData = {
                                etapa_tipo_id: body.etapa_tipo_id,
                                tipo_iniciativa_id: body.tipo_iniciativa_id,
                                tipo_obra_id: body.tipo_obra_id,
                                region_id: body.region_id,
                                provincia_id: body.provincia_id,
                                comuna_id: body.comuna_id,
                                volumen: body.volumen,
                                presupuesto_oficial: body.presupuesto_oficial,
                                valor_referencia: body.valor_referencia,
                                bip: body.bip,
                                decreto_adjudicacion: body.decreto_adjudicacion,
                                sociedad_concesionaria: body.sociedad_concesionaria,
                                inspector_fiscal_id: body.inspector_fiscal_id,
                                usuario_creador: body.usuario_creador,
                            };
                            // Convertir fechas si están presentes
                            if (body.fecha_llamado_licitacion) {
                                etapaData.fecha_llamado_licitacion = new Date(body.fecha_llamado_licitacion);
                            }
                            if (body.fecha_recepcion_ofertas_tecnicas) {
                                etapaData.fecha_recepcion_ofertas_tecnicas = new Date(body.fecha_recepcion_ofertas_tecnicas);
                            }
                            if (body.fecha_apertura_ofertas_economicas) {
                                etapaData.fecha_apertura_ofertas_economicas = new Date(body.fecha_apertura_ofertas_economicas);
                            }
                            if (body.fecha_inicio_concesion) {
                                etapaData.fecha_inicio_concesion = new Date(body.fecha_inicio_concesion);
                            }
                            if (body.plazo_total_concesion) {
                                etapaData.plazo_total_concesion = body.plazo_total_concesion;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.create({
                                    data: etapaData
                                })];
                        case 1:
                            nuevaEtapa = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Etapa creada exitosamente',
                                    data: nuevaEtapa
                                }];
                        case 2:
                            error_3 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al crear la etapa',
                                    error: error_3 instanceof Error ? error_3.message : 'Error desconocido'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // PUT /etapas/:id - Actualizar etapa
            server.put('/etapas/:id', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Actualizar etapa existente',
                    description: 'Actualiza una etapa existente permitiendo modificar cualquier campo. Todos los campos son opcionales en la actualización, permitiendo actualizaciones parciales. Las fechas se convierten automáticamente al formato Date si se proporcionan como strings datetime.',
                    params: etapaParamsSchema,
                    body: updateEtapaSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                cambios_aplicados: zod_1.default.record(zod_1.default.any())
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, body, updateData, etapaActualizada, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            body = request.body;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            updateData = __assign({}, body);
                            // Convertir fechas si están presentes
                            if (body.fecha_llamado_licitacion) {
                                updateData.fecha_llamado_licitacion = new Date(body.fecha_llamado_licitacion);
                            }
                            if (body.fecha_recepcion_ofertas_tecnicas) {
                                updateData.fecha_recepcion_ofertas_tecnicas = new Date(body.fecha_recepcion_ofertas_tecnicas);
                            }
                            if (body.fecha_apertura_ofertas_economicas) {
                                updateData.fecha_apertura_ofertas_economicas = new Date(body.fecha_apertura_ofertas_economicas);
                            }
                            if (body.fecha_inicio_concesion) {
                                updateData.fecha_inicio_concesion = new Date(body.fecha_inicio_concesion);
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: id },
                                    data: updateData
                                })];
                        case 2:
                            etapaActualizada = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Etapa ".concat(id, " actualizada exitosamente"),
                                    data: {
                                        id: id,
                                        cambios_aplicados: body
                                    }
                                }];
                        case 3:
                            error_4 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al actualizar la etapa',
                                    error: error_4 instanceof Error ? error_4.message : 'Error desconocido'
                                }];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // DELETE /etapas/:id - Eliminar etapa (soft delete)
            server.delete('/etapas/:id', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Eliminar etapa (soft delete)',
                    description: 'Elimina una etapa mediante soft delete, marcándola como inactiva en lugar de eliminarla físicamente de la base de datos. Esto permite mantener el historial y la integridad referencial de los datos.',
                    params: etapaParamsSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                eliminada: zod_1.default.boolean()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, etapaEliminada, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: id },
                                    data: { activa: false }
                                })];
                        case 2:
                            etapaEliminada = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Etapa ".concat(id, " eliminada exitosamente"),
                                    data: {
                                        id: id,
                                        eliminada: true
                                    }
                                }];
                        case 3:
                            error_5 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al eliminar la etapa',
                                    error: error_5 instanceof Error ? error_5.message : 'Error desconocido'
                                }];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // GET /etapas/:proyecto_id/avanzar - Obtener etapa actual y siguiente etapa del proyecto
            server.get('/etapas/:proyecto_id/avanzar', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Obtener etapa actual y siguiente etapa del proyecto',
                    description: 'Obtiene la información completa de la etapa actual del proyecto y determina cuál sería la siguiente etapa en el flujo. Incluye todos los datos de la etapa actual, la información del tipo de etapa siguiente y las carpetas transversales asociadas.',
                    params: zod_1.default.object({
                        proyecto_id: zod_1.default.string().regex(/^\d+$/, 'ID del proyecto debe ser un número válido').transform(Number)
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                siguiente_etapa: zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    descripcion: zod_1.default.string().nullable(),
                                    color: zod_1.default.string().nullable(),
                                    carpetas_iniciales: zod_1.default.record(zod_1.default.any()),
                                    // Campos booleanos que indican qué información requiere esta etapa
                                    tipo_iniciativa: zod_1.default.boolean(),
                                    tipo_obra: zod_1.default.boolean(),
                                    region: zod_1.default.boolean(),
                                    provincia: zod_1.default.boolean(),
                                    comuna: zod_1.default.boolean(),
                                    volumen: zod_1.default.boolean(),
                                    presupuesto_oficial: zod_1.default.boolean(),
                                    valor_referencia: zod_1.default.boolean(),
                                    bip: zod_1.default.boolean(),
                                    fecha_llamado_licitacion: zod_1.default.boolean(),
                                    fecha_recepcion_ofertas_tecnicas: zod_1.default.boolean(),
                                    fecha_apertura_ofertas_economicas: zod_1.default.boolean(),
                                    fecha_inicio_concesion: zod_1.default.boolean(),
                                    plazo_total_concesion: zod_1.default.boolean(),
                                    decreto_adjudicacion: zod_1.default.boolean(),
                                    sociedad_concesionaria: zod_1.default.boolean(),
                                    inspector_fiscal_id: zod_1.default.boolean(),
                                    carpetas_transversales: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        color: zod_1.default.string(),
                                        orden: zod_1.default.number().nullable(),
                                        activa: zod_1.default.boolean(),
                                        estructura_carpetas: zod_1.default.record(zod_1.default.any()).nullable()
                                    }))
                                }).nullable(),
                                etapas_anteriores: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    etapa_tipo_id: zod_1.default.number(),
                                    tipo_iniciativa_id: zod_1.default.number().nullable(),
                                    tipo_obra_id: zod_1.default.number().nullable(),
                                    volumen: zod_1.default.string().nullable(),
                                    presupuesto_oficial: zod_1.default.string().nullable(),
                                    valor_referencia: zod_1.default.string().nullable(),
                                    bip: zod_1.default.string().nullable(),
                                    fecha_llamado_licitacion: zod_1.default.date().nullable(),
                                    fecha_recepcion_ofertas_tecnicas: zod_1.default.date().nullable(),
                                    fecha_apertura_ofertas_economicas: zod_1.default.date().nullable(),
                                    fecha_inicio_concesion: zod_1.default.date().nullable(),
                                    plazo_total_concesion: zod_1.default.string().nullable(),
                                    decreto_adjudicacion: zod_1.default.string().nullable(),
                                    sociedad_concesionaria: zod_1.default.string().nullable(),
                                    inspector_fiscal_id: zod_1.default.number().nullable(),
                                    usuario_creador: zod_1.default.number(),
                                    fecha_creacion: zod_1.default.date(),
                                    fecha_actualizacion: zod_1.default.date(),
                                    activa: zod_1.default.boolean(),
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
                                    inspector_fiscal: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        correo_electronico: zod_1.default.string().nullable(),
                                        nombre_completo: zod_1.default.string().nullable()
                                    }).nullable(),
                                    usuario_creador_rel: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        correo_electronico: zod_1.default.string().nullable(),
                                        nombre_completo: zod_1.default.string().nullable()
                                    })
                                })),
                                es_ultima_etapa: zod_1.default.boolean()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var proyecto_id, etapaActual, etapasAnteriores, todasLasEtapasAnteriores, ultimoEtapaTipoId, siguienteEtapaTipoId, siguienteEtapa, esUltimaEtapa, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            proyecto_id = request.params.proyecto_id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findFirst({
                                    where: { proyecto_id: proyecto_id, activa: true },
                                    include: {
                                        etapa_tipo: true,
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
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        },
                                        usuario_creador_rel: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            etapaActual = _a.sent();
                            if (!etapaActual) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'No se encontró una etapa activa para este proyecto'
                                    }];
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: {
                                        proyecto_id: proyecto_id,
                                        id: { not: etapaActual.id } // Excluir la etapa actual
                                    },
                                    include: {
                                        etapa_tipo: true,
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
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        },
                                        usuario_creador_rel: {
                                            select: {
                                                id: true,
                                                correo_electronico: true,
                                                nombre_completo: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 3:
                            etapasAnteriores = _a.sent();
                            todasLasEtapasAnteriores = __spreadArray([etapaActual], etapasAnteriores, true);
                            ultimoEtapaTipoId = Math.max.apply(Math, todasLasEtapasAnteriores.map(function (etapa) { return etapa.etapa_tipo_id; }));
                            siguienteEtapaTipoId = ultimoEtapaTipoId + 1;
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: siguienteEtapaTipoId },
                                    include: {
                                        carpetas_transversales: {
                                            where: { activa: true },
                                            orderBy: { orden: 'asc' }
                                        }
                                    }
                                })];
                        case 4:
                            siguienteEtapa = _a.sent();
                            esUltimaEtapa = !siguienteEtapa;
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Informaci\u00F3n completa del proyecto ".concat(proyecto_id, " obtenida exitosamente"),
                                    data: {
                                        etapas_anteriores: todasLasEtapasAnteriores.map(function (etapa) { return (__assign(__assign({}, etapa), { etapas_regiones: transformGeographicalData(etapa.etapas_geografia) })); }),
                                        siguiente_etapa: siguienteEtapa ? __assign(__assign({}, siguienteEtapa), { carpetas_transversales: siguienteEtapa.carpetas_transversales.map(function (carpeta) { return ({
                                                id: carpeta.id,
                                                nombre: carpeta.nombre,
                                                descripcion: carpeta.descripcion,
                                                color: carpeta.color,
                                                orden: carpeta.orden,
                                                activa: carpeta.activa,
                                                estructura_carpetas: carpeta.estructura_carpetas || {}
                                            }); }) }) : null,
                                        es_ultima_etapa: esUltimaEtapa
                                    }
                                }];
                        case 5:
                            error_6 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al obtener la información de la etapa y siguiente etapa',
                                    error: error_6 instanceof Error ? error_6.message : 'Error desconocido'
                                }];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // GET /etapas/orden - Obtener orden actual de etapas
            server.get('/etapas/orden', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Obtener orden actual de etapas',
                    description: 'Retorna el orden actual de todas las etapas activas, ordenadas por su posición en el flujo. Útil para mostrar la jerarquía y secuencia de etapas en la interfaz de usuario.',
                    querystring: zod_1.default.object({
                        proyecto_id: zod_1.default.string().regex(/^\d+$/, 'ID del proyecto debe ser un número válido').transform(Number).optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                etapa_tipo_id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                color: zod_1.default.string().nullable(),
                                orden_actual: zod_1.default.number(),
                                fecha_creacion: zod_1.default.date(),
                                activa: zod_1.default.boolean()
                            }))
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var proyecto_id, whereClause, etapas, etapasConOrden, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            proyecto_id = request.query.proyecto_id;
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                id: true,
                                                nombre: true,
                                                descripcion: true,
                                                color: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 1:
                            etapas = _a.sent();
                            etapasConOrden = etapas.map(function (etapa, index) { return ({
                                id: etapa.id,
                                etapa_tipo_id: etapa.etapa_tipo_id,
                                nombre: etapa.etapa_tipo.nombre,
                                descripcion: etapa.etapa_tipo.descripcion,
                                color: etapa.etapa_tipo.color,
                                orden_actual: index + 1,
                                fecha_creacion: etapa.fecha_creacion,
                                activa: etapa.activa
                            }); });
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Orden de etapas obtenido exitosamente',
                                    data: etapasConOrden
                                }];
                        case 2:
                            error_7 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al obtener el orden de las etapas',
                                    error: error_7 instanceof Error ? error_7.message : 'Error desconocido'
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // PUT /etapas/:id/mover - Mover etapa a nueva posición
            server.put('/etapas/:id/mover', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Mover etapa a nueva posición',
                    description: 'Mueve una etapa específica a una nueva posición en el orden. Permite cambiar la jerarquía de las etapas moviendo una etapa hacia arriba o hacia abajo en la secuencia.',
                    params: etapaParamsSchema,
                    body: zod_1.default.object({
                        nueva_posicion: zod_1.default.number().int().min(1, 'Nueva posición debe ser mayor a 0'),
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                posicion_anterior: zod_1.default.number(),
                                nueva_posicion: zod_1.default.number(),
                                etapas_reordenadas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    orden: zod_1.default.number()
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
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, nueva_posicion, proyecto_id, etapa, whereClause, todasLasEtapas, posicionActual, etapasReordenadas, etapaAMover, i, nuevaFecha, error_8;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            id = request.params.id;
                            _a = request.body, nueva_posicion = _a.nueva_posicion, proyecto_id = _a.proyecto_id;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 8, , 9]);
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findUnique({
                                    where: { id: id, activa: true },
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    }
                                })];
                        case 2:
                            etapa = _b.sent();
                            if (!etapa) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 3:
                            todasLasEtapas = _b.sent();
                            posicionActual = todasLasEtapas.findIndex(function (etapa) { return etapa.id === id; }) + 1;
                            if (posicionActual === 0) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada en la lista'
                                    }];
                            }
                            // Validar que la nueva posición es válida
                            if (nueva_posicion < 1 || nueva_posicion > todasLasEtapas.length) {
                                reply.status(400);
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Nueva posici\u00F3n debe estar entre 1 y ".concat(todasLasEtapas.length)
                                    }];
                            }
                            // Si la posición es la misma, no hacer nada
                            if (posicionActual === nueva_posicion) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: 'La etapa ya está en la posición especificada',
                                        data: {
                                            id: id,
                                            posicion_anterior: posicionActual,
                                            nueva_posicion: nueva_posicion,
                                            etapas_reordenadas: todasLasEtapas.map(function (etapa, index) { return ({
                                                id: etapa.id,
                                                nombre: etapa.etapa_tipo.nombre,
                                                orden: index + 1
                                            }); })
                                        }
                                    }];
                            }
                            etapasReordenadas = __spreadArray([], todasLasEtapas, true);
                            etapaAMover = etapasReordenadas.splice(posicionActual - 1, 1)[0];
                            etapasReordenadas.splice(nueva_posicion - 1, 0, etapaAMover);
                            i = 0;
                            _b.label = 4;
                        case 4:
                            if (!(i < etapasReordenadas.length)) return [3 /*break*/, 7];
                            nuevaFecha = new Date();
                            nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapasReordenadas[i].id },
                                    data: { fecha_creacion: nuevaFecha }
                                })];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6:
                            i++;
                            return [3 /*break*/, 4];
                        case 7: return [2 /*return*/, {
                                success: true,
                                message: "Etapa \"".concat(etapa.etapa_tipo.nombre, "\" movida de posici\u00F3n ").concat(posicionActual, " a ").concat(nueva_posicion),
                                data: {
                                    id: id,
                                    posicion_anterior: posicionActual,
                                    nueva_posicion: nueva_posicion,
                                    etapas_reordenadas: etapasReordenadas.map(function (etapa, index) { return ({
                                        id: etapa.id,
                                        nombre: etapa.etapa_tipo.nombre,
                                        orden: index + 1
                                    }); })
                                }
                            }];
                        case 8:
                            error_8 = _b.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al mover la etapa',
                                    error: error_8 instanceof Error ? error_8.message : 'Error desconocido'
                                }];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // PUT /etapas/reordenar - Reordenar múltiples etapas
            server.put('/etapas/reordenar', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Reordenar múltiples etapas',
                    description: 'Reordena múltiples etapas a la vez especificando el nuevo orden. Permite reorganizar completamente la jerarquía de etapas de un proyecto.',
                    body: zod_1.default.object({
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional(),
                        etapas: zod_1.default.array(zod_1.default.object({
                            id: zod_1.default.number().int().min(1, 'ID de etapa es requerido'),
                            nueva_posicion: zod_1.default.number().int().min(1, 'Nueva posición es requerida')
                        })).min(1, 'Debe especificar al menos una etapa')
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                etapas_reordenadas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    orden: zod_1.default.number()
                                })),
                                cambios_aplicados: zod_1.default.number()
                            })
                        }),
                        400: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, proyecto_id, etapas, whereClause, todasLasEtapas_1, idsEtapas_1, etapasExistentes, posicionesValidas, mapaPosiciones_1, etapasReordenadas, i, nuevaFecha, error_9;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = request.body, proyecto_id = _a.proyecto_id, etapas = _a.etapas;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 7, , 8]);
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 2:
                            todasLasEtapas_1 = _b.sent();
                            idsEtapas_1 = etapas.map(function (e) { return e.id; });
                            etapasExistentes = todasLasEtapas_1.filter(function (etapa) { return idsEtapas_1.includes(etapa.id); });
                            if (etapasExistentes.length !== etapas.length) {
                                reply.status(400);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Algunas etapas especificadas no existen'
                                    }];
                            }
                            posicionesValidas = etapas.every(function (e) { return e.nueva_posicion >= 1 && e.nueva_posicion <= todasLasEtapas_1.length; });
                            if (!posicionesValidas) {
                                reply.status(400);
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Las posiciones deben estar entre 1 y ".concat(todasLasEtapas_1.length)
                                    }];
                            }
                            mapaPosiciones_1 = new Map();
                            etapas.forEach(function (etapa) {
                                mapaPosiciones_1.set(etapa.id, etapa.nueva_posicion);
                            });
                            etapasReordenadas = __spreadArray([], todasLasEtapas_1, true).sort(function (a, b) {
                                var posA = mapaPosiciones_1.get(a.id) || 999;
                                var posB = mapaPosiciones_1.get(b.id) || 999;
                                return posA - posB;
                            });
                            i = 0;
                            _b.label = 3;
                        case 3:
                            if (!(i < etapasReordenadas.length)) return [3 /*break*/, 6];
                            nuevaFecha = new Date();
                            nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapasReordenadas[i].id },
                                    data: { fecha_creacion: nuevaFecha }
                                })];
                        case 4:
                            _b.sent();
                            _b.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/, {
                                success: true,
                                message: "".concat(etapas.length, " etapas reordenadas exitosamente"),
                                data: {
                                    etapas_reordenadas: etapasReordenadas.map(function (etapa, index) { return ({
                                        id: etapa.id,
                                        nombre: etapa.etapa_tipo.nombre,
                                        orden: index + 1
                                    }); }),
                                    cambios_aplicados: etapas.length
                                }
                            }];
                        case 7:
                            error_9 = _b.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al reordenar las etapas',
                                    error: error_9 instanceof Error ? error_9.message : 'Error desconocido'
                                }];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // POST /etapas/:id/subir - Subir etapa una posición
            server.post('/etapas/:id/subir', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Subir etapa una posición',
                    description: 'Mueve una etapa hacia arriba una posición en el orden. Si la etapa ya está en la primera posición, no hace nada.',
                    params: etapaParamsSchema,
                    body: zod_1.default.object({
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                posicion_anterior: zod_1.default.number(),
                                nueva_posicion: zod_1.default.number(),
                                movida: zod_1.default.boolean()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto_id, whereClause, todasLasEtapas, posicionActual, etapaActual, etapaAnterior, fechaActual, fechaAnterior, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            proyecto_id = request.body.proyecto_id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 2:
                            todasLasEtapas = _a.sent();
                            posicionActual = todasLasEtapas.findIndex(function (etapa) { return etapa.id === id; }) + 1;
                            if (posicionActual === 0) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            // Si ya está en la primera posición, no hacer nada
                            if (posicionActual === 1) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: 'La etapa ya está en la primera posición',
                                        data: {
                                            id: id,
                                            posicion_anterior: posicionActual,
                                            nueva_posicion: posicionActual,
                                            movida: false
                                        }
                                    }];
                            }
                            etapaActual = todasLasEtapas[posicionActual - 1];
                            etapaAnterior = todasLasEtapas[posicionActual - 2];
                            fechaActual = etapaActual.fecha_creacion;
                            fechaAnterior = etapaAnterior.fecha_creacion;
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaActual.id },
                                    data: { fecha_creacion: fechaAnterior }
                                })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaAnterior.id },
                                    data: { fecha_creacion: fechaActual }
                                })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Etapa \"".concat(etapaActual.etapa_tipo.nombre, "\" subida de posici\u00F3n ").concat(posicionActual, " a ").concat(posicionActual - 1),
                                    data: {
                                        id: id,
                                        posicion_anterior: posicionActual,
                                        nueva_posicion: posicionActual - 1,
                                        movida: true
                                    }
                                }];
                        case 5:
                            error_10 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al subir la etapa',
                                    error: error_10 instanceof Error ? error_10.message : 'Error desconocido'
                                }];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // POST /etapas/:id/bajar - Bajar etapa una posición
            server.post('/etapas/:id/bajar', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Bajar etapa una posición',
                    description: 'Mueve una etapa hacia abajo una posición en el orden. Si la etapa ya está en la última posición, no hace nada.',
                    params: etapaParamsSchema,
                    body: zod_1.default.object({
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                posicion_anterior: zod_1.default.number(),
                                nueva_posicion: zod_1.default.number(),
                                movida: zod_1.default.boolean()
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto_id, whereClause, todasLasEtapas, posicionActual, etapaActual, etapaSiguiente, fechaActual, fechaSiguiente, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            proyecto_id = request.body.proyecto_id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 2:
                            todasLasEtapas = _a.sent();
                            posicionActual = todasLasEtapas.findIndex(function (etapa) { return etapa.id === id; }) + 1;
                            if (posicionActual === 0) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            // Si ya está en la última posición, no hacer nada
                            if (posicionActual === todasLasEtapas.length) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: 'La etapa ya está en la última posición',
                                        data: {
                                            id: id,
                                            posicion_anterior: posicionActual,
                                            nueva_posicion: posicionActual,
                                            movida: false
                                        }
                                    }];
                            }
                            etapaActual = todasLasEtapas[posicionActual - 1];
                            etapaSiguiente = todasLasEtapas[posicionActual];
                            fechaActual = etapaActual.fecha_creacion;
                            fechaSiguiente = etapaSiguiente.fecha_creacion;
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaActual.id },
                                    data: { fecha_creacion: fechaSiguiente }
                                })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: etapaSiguiente.id },
                                    data: { fecha_creacion: fechaActual }
                                })];
                        case 4:
                            _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Etapa \"".concat(etapaActual.etapa_tipo.nombre, "\" bajada de posici\u00F3n ").concat(posicionActual, " a ").concat(posicionActual + 1),
                                    data: {
                                        id: id,
                                        posicion_anterior: posicionActual,
                                        nueva_posicion: posicionActual + 1,
                                        movida: true
                                    }
                                }];
                        case 5:
                            error_11 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al bajar la etapa',
                                    error: error_11 instanceof Error ? error_11.message : 'Error desconocido'
                                }];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // POST /etapas/:id/ir-primero - Mover etapa al primer lugar
            server.post('/etapas/:id/ir-primero', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Mover etapa al primer lugar',
                    description: 'Mueve una etapa específica al primer lugar en el orden, desplazando todas las demás etapas hacia abajo.',
                    params: etapaParamsSchema,
                    body: zod_1.default.object({
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                posicion_anterior: zod_1.default.number(),
                                nueva_posicion: zod_1.default.number(),
                                etapas_reordenadas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    orden: zod_1.default.number()
                                }))
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto_id, whereClause, todasLasEtapas, posicionActual, etapaAMover, i, nuevaFecha, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            proyecto_id = request.body.proyecto_id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 2:
                            todasLasEtapas = _a.sent();
                            posicionActual = todasLasEtapas.findIndex(function (etapa) { return etapa.id === id; }) + 1;
                            if (posicionActual === 0) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            // Si ya está en la primera posición, no hacer nada
                            if (posicionActual === 1) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: 'La etapa ya está en la primera posición',
                                        data: {
                                            id: id,
                                            posicion_anterior: posicionActual,
                                            nueva_posicion: posicionActual,
                                            etapas_reordenadas: todasLasEtapas.map(function (etapa, index) { return ({
                                                id: etapa.id,
                                                nombre: etapa.etapa_tipo.nombre,
                                                orden: index + 1
                                            }); })
                                        }
                                    }];
                            }
                            etapaAMover = todasLasEtapas.splice(posicionActual - 1, 1)[0];
                            todasLasEtapas.unshift(etapaAMover);
                            i = 0;
                            _a.label = 3;
                        case 3:
                            if (!(i < todasLasEtapas.length)) return [3 /*break*/, 6];
                            nuevaFecha = new Date();
                            nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: todasLasEtapas[i].id },
                                    data: { fecha_creacion: nuevaFecha }
                                })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/, {
                                success: true,
                                message: "Etapa \"".concat(etapaAMover.etapa_tipo.nombre, "\" movida al primer lugar"),
                                data: {
                                    id: id,
                                    posicion_anterior: posicionActual,
                                    nueva_posicion: 1,
                                    etapas_reordenadas: todasLasEtapas.map(function (etapa, index) { return ({
                                        id: etapa.id,
                                        nombre: etapa.etapa_tipo.nombre,
                                        orden: index + 1
                                    }); })
                                }
                            }];
                        case 7:
                            error_12 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al mover la etapa al primer lugar',
                                    error: error_12 instanceof Error ? error_12.message : 'Error desconocido'
                                }];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // POST /etapas/:id/ir-ultimo - Mover etapa al último lugar
            server.post('/etapas/:id/ir-ultimo', {
                schema: {
                    tags: ['Etapas'],
                    summary: 'Mover etapa al último lugar',
                    description: 'Mueve una etapa específica al último lugar en el orden, desplazando todas las demás etapas hacia arriba.',
                    params: etapaParamsSchema,
                    body: zod_1.default.object({
                        proyecto_id: zod_1.default.number().int().min(1, 'ID del proyecto es requerido').optional()
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                posicion_anterior: zod_1.default.number(),
                                nueva_posicion: zod_1.default.number(),
                                etapas_reordenadas: zod_1.default.array(zod_1.default.object({
                                    id: zod_1.default.number(),
                                    nombre: zod_1.default.string(),
                                    orden: zod_1.default.number()
                                }))
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        }),
                        500: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            error: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, proyecto_id, whereClause, todasLasEtapas, posicionActual, etapaAMover, i, nuevaFecha, error_13;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            proyecto_id = request.body.proyecto_id;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 7, , 8]);
                            whereClause = { activa: true };
                            if (proyecto_id) {
                                whereClause.proyecto_id = proyecto_id;
                            }
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.findMany({
                                    where: whereClause,
                                    include: {
                                        etapa_tipo: {
                                            select: {
                                                nombre: true
                                            }
                                        }
                                    },
                                    orderBy: { fecha_creacion: 'asc' }
                                })];
                        case 2:
                            todasLasEtapas = _a.sent();
                            posicionActual = todasLasEtapas.findIndex(function (etapa) { return etapa.id === id; }) + 1;
                            if (posicionActual === 0) {
                                reply.status(404);
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            // Si ya está en la última posición, no hacer nada
                            if (posicionActual === todasLasEtapas.length) {
                                return [2 /*return*/, {
                                        success: true,
                                        message: 'La etapa ya está en la última posición',
                                        data: {
                                            id: id,
                                            posicion_anterior: posicionActual,
                                            nueva_posicion: posicionActual,
                                            etapas_reordenadas: todasLasEtapas.map(function (etapa, index) { return ({
                                                id: etapa.id,
                                                nombre: etapa.etapa_tipo.nombre,
                                                orden: index + 1
                                            }); })
                                        }
                                    }];
                            }
                            etapaAMover = todasLasEtapas.splice(posicionActual - 1, 1)[0];
                            todasLasEtapas.push(etapaAMover);
                            i = 0;
                            _a.label = 3;
                        case 3:
                            if (!(i < todasLasEtapas.length)) return [3 /*break*/, 6];
                            nuevaFecha = new Date();
                            nuevaFecha.setSeconds(nuevaFecha.getSeconds() + i); // Asegurar orden secuencial
                            return [4 /*yield*/, prisma_1.prisma.etapas_registro.update({
                                    where: { id: todasLasEtapas[i].id },
                                    data: { fecha_creacion: nuevaFecha }
                                })];
                        case 4:
                            _a.sent();
                            _a.label = 5;
                        case 5:
                            i++;
                            return [3 /*break*/, 3];
                        case 6: return [2 /*return*/, {
                                success: true,
                                message: "Etapa \"".concat(etapaAMover.etapa_tipo.nombre, "\" movida al \u00FAltimo lugar"),
                                data: {
                                    id: id,
                                    posicion_anterior: posicionActual,
                                    nueva_posicion: todasLasEtapas.length,
                                    etapas_reordenadas: todasLasEtapas.map(function (etapa, index) { return ({
                                        id: etapa.id,
                                        nombre: etapa.etapa_tipo.nombre,
                                        orden: index + 1
                                    }); })
                                }
                            }];
                        case 7:
                            error_13 = _a.sent();
                            reply.status(500);
                            return [2 /*return*/, {
                                    success: false,
                                    message: 'Error al mover la etapa al último lugar',
                                    error: error_13 instanceof Error ? error_13.message : 'Error desconocido'
                                }];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
