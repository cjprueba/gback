"use strict";
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
exports.etapasTipoRoutes = etapasTipoRoutes;
var zod_1 = require("zod");
var prisma_1 = require("@/lib/prisma");
// Esquema Zod para crear etapa tipo
var createEtapaTipoSchema = zod_1.default.object({
    nombre: zod_1.default.string().min(1, 'Nombre es requerido').max(100, 'Nombre no puede exceder 100 caracteres'),
    descripcion: zod_1.default.string().optional(),
    color: zod_1.default.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser un código hexadecimal válido (ej: #3498DB)').optional(),
    carpetas_iniciales: zod_1.default.record(zod_1.default.any()).optional().default({}),
    // Campos booleanos para configurar qué información se requiere
    tipo_iniciativa: zod_1.default.boolean().default(true),
    tipo_obra: zod_1.default.boolean().default(true),
    region: zod_1.default.boolean().default(true),
    provincia: zod_1.default.boolean().default(true),
    comuna: zod_1.default.boolean().default(true),
    volumen: zod_1.default.boolean().default(true),
    presupuesto_oficial: zod_1.default.boolean().default(true),
    bip: zod_1.default.boolean().default(true),
    fecha_llamado_licitacion: zod_1.default.boolean().default(true),
    fecha_recepcion_ofertas_tecnicas: zod_1.default.boolean().default(true),
    fecha_apertura_ofertas_economicas: zod_1.default.boolean().default(true),
    fecha_inicio_concesion: zod_1.default.boolean().default(true),
    plazo_total_concesion: zod_1.default.boolean().default(true),
    decreto_adjudicacion: zod_1.default.boolean().default(true),
    sociedad_concesionaria: zod_1.default.boolean().default(true),
    inspector_fiscal_id: zod_1.default.boolean().default(true)
});
// Esquema para actualizar etapa tipo
var updateEtapaTipoSchema = createEtapaTipoSchema.partial();
// Esquema para parámetros de ruta
var etapaTipoParamsSchema = zod_1.default.object({
    id: zod_1.default.string().regex(/^\d+$/, 'ID debe ser un número válido').transform(Number)
});
function etapasTipoRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var server;
        var _this = this;
        return __generator(this, function (_a) {
            server = app.withTypeProvider();
            // GET /etapas-tipo - Lista de tipos de etapa
            server.get('/etapas-tipo', {
                schema: {
                    tags: ['Etapas Tipo'],
                    summary: 'Obtener lista de tipos de etapa',
                    description: 'Retorna una lista completa de todos los tipos de etapa disponibles en el sistema. Cada tipo de etapa define qué campos son requeridos para las etapas de un proyecto.',
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.array(zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                color: zod_1.default.string().nullable(),
                                carpetas_iniciales: zod_1.default.record(zod_1.default.any())
                            }))
                        })
                    }
                }
            }, function () { return __awaiter(_this, void 0, void 0, function () {
                var etapasTipo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findMany()];
                        case 1:
                            etapasTipo = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Lista de tipos de etapa obtenida exitosamente',
                                    data: etapasTipo
                                }];
                    }
                });
            }); });
            // GET /etapas-tipo-obra - Lista de tipos de etapa con sus tipos de obra asociados
            /*server.get('/etapas-tipo-obra', {
              schema: {
                tags: ['Etapas Tipo'],
                summary: 'Obtener tipos de etapa con sus tipos de obra asociados',
                description: 'Retorna una lista de tipos de etapa incluyendo los tipos de obra que están asociados a cada uno. Esta información es útil para mostrar las relaciones entre etapas y tipos de obra en la interfaz de usuario.',
                querystring: z.object({
                  etapa_tipo_id: z.string().regex(/^\d+$/, 'Etapa tipo ID debe ser un número válido').transform(Number).optional()
                }),
                response: {
                  200: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    data: z.array(z.object({
                      id: z.number(),
                      nombre: z.string(),
                      descripcion: z.string().nullable(),
                      color: z.string().nullable(),
                      carpetas_iniciales: z.record(z.any()),
                      tipos_obra: z.array(z.object({
                        id: z.number(),
                        nombre: z.string()
                      }))
                    }))
                  })
                }
              }
            }, async (request) => {
              const { etapa_tipo_id } = request.query;
              
              const whereClause = etapa_tipo_id ? { id: etapa_tipo_id } : {};
              
              const etapasTipo = await prisma.etapas_tipo.findMany({
                where: whereClause,
                include: {
                  etapas_tipo_obras: {
                    include: {
                      tipo_obra: {
                        select: {
                          id: true,
                          nombre: true
                        }
                      }
                    }
                  }
                }
              });
              
              // Transform the data to match the expected response format
              const etapasTipoConObras = etapasTipo.map(etapa => ({
                id: etapa.id,
                nombre: etapa.nombre,
                descripcion: etapa.descripcion,
                color: (etapa as any).color || null,
                carpetas_iniciales: etapa.carpetas_iniciales || {},
                tipos_obra: etapa.etapas_tipo_obras.map(etapaTipoObra => ({
                  id: etapaTipoObra.tipo_obra.id,
                  nombre: etapaTipoObra.tipo_obra.nombre
                }))
              }));
              
              return {
                success: true,
                message: etapa_tipo_id
                  ? `Tipo de etapa ${etapa_tipo_id} con sus tipos de obra obtenido exitosamente`
                  : 'Lista de tipos de etapa con sus tipos de obra obtenida exitosamente',
                data: etapasTipoConObras
              };
            });*/
            // POST /etapas-tipo - Crear nuevo tipo de etapa
            server.post('/etapas-tipo', {
                schema: {
                    tags: ['Etapas Tipo'],
                    summary: 'Crear nuevo tipo de etapa',
                    description: 'Crea un nuevo tipo de etapa en el sistema. Un tipo de etapa define qué campos son requeridos para las etapas de un proyecto, incluyendo información geográfica, financiera, fechas importantes y datos de adjudicación.',
                    body: createEtapaTipoSchema,
                    response: {
                        201: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                color: zod_1.default.string().nullable(),
                                carpetas_iniciales: zod_1.default.record(zod_1.default.any())
                            })
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var body, etapaTipoData, nuevaEtapaTipo;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            body = request.body;
                            etapaTipoData = {
                                nombre: body.nombre,
                                descripcion: body.descripcion || null,
                                color: body.color || null,
                                carpetas_iniciales: body.carpetas_iniciales || {},
                                tipo_iniciativa: body.tipo_iniciativa,
                                tipo_obra: body.tipo_obra,
                                region: body.region,
                                provincia: body.provincia,
                                comuna: body.comuna,
                                volumen: body.volumen,
                                presupuesto_oficial: body.presupuesto_oficial,
                                bip: body.bip,
                                fecha_llamado_licitacion: body.fecha_llamado_licitacion,
                                fecha_recepcion_ofertas_tecnicas: body.fecha_recepcion_ofertas_tecnicas,
                                fecha_apertura_ofertas_economicas: body.fecha_apertura_ofertas_economicas,
                                fecha_inicio_concesion: body.fecha_inicio_concesion,
                                plazo_total_concesion: body.plazo_total_concesion,
                                decreto_adjudicacion: body.decreto_adjudicacion,
                                sociedad_concesionaria: body.sociedad_concesionaria,
                                inspector_fiscal_id: body.inspector_fiscal_id
                            };
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.create({
                                    data: etapaTipoData
                                })];
                        case 1:
                            nuevaEtapaTipo = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Tipo de etapa creado exitosamente',
                                    data: nuevaEtapaTipo
                                }];
                    }
                });
            }); });
            // PUT /etapas-tipo/:id - Actualizar tipo de etapa
            server.put('/etapas-tipo/:id', {
                schema: {
                    tags: ['Etapas Tipo'],
                    summary: 'Actualizar tipo de etapa existente',
                    description: 'Actualiza un tipo de etapa existente. Permite modificar el nombre, descripción, color, carpetas iniciales y los campos requeridos para las etapas de este tipo.',
                    params: etapaTipoParamsSchema,
                    body: updateEtapaTipoSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                color: zod_1.default.string().nullable(),
                                carpetas_iniciales: zod_1.default.record(zod_1.default.any())
                            })
                        })
                    }
                }
            }, function (request) { return __awaiter(_this, void 0, void 0, function () {
                var id, body, etapaTipoActualizada;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            body = request.body;
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.update({
                                    where: { id: id },
                                    data: body
                                })];
                        case 1:
                            etapaTipoActualizada = _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Tipo de etapa actualizado exitosamente',
                                    data: etapaTipoActualizada
                                }];
                    }
                });
            }); });
            // GET /etapas-tipo/etapa/:etapaId - Obtener tipo de etapa por etapa ID
            server.get('/etapas-tipo/etapa/:etapaId', {
                schema: {
                    tags: ['Etapas Tipo'],
                    summary: 'Obtener tipo de etapa por ID de etapa',
                    description: 'Retorna la información completa del tipo de etapa asociado a una etapa específica. Incluye todos los campos de configuración que definen qué información es requerida para este tipo de etapa, así como las carpetas transversales asociadas.',
                    params: zod_1.default.object({
                        etapaId: zod_1.default.string().regex(/^\d+$/, 'Etapa ID debe ser un número válido').transform(Number)
                    }),
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre: zod_1.default.string(),
                                descripcion: zod_1.default.string().nullable(),
                                color: zod_1.default.string().nullable(),
                                carpetas_iniciales: zod_1.default.record(zod_1.default.any()),
                                tipo_iniciativa: zod_1.default.boolean(),
                                tipo_obra: zod_1.default.boolean(),
                                bip: zod_1.default.boolean(),
                                region: zod_1.default.boolean(),
                                provincia: zod_1.default.boolean(),
                                comuna: zod_1.default.boolean(),
                                volumen: zod_1.default.boolean(),
                                presupuesto_oficial: zod_1.default.boolean(),
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
                            })
                        }),
                        404: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request) { return __awaiter(_this, void 0, void 0, function () {
                var etapaId, etapa;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            etapaId = request.params.etapaId;
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.findUnique({
                                    where: { id: etapaId },
                                    include: {
                                        carpetas_transversales: {
                                            where: { activa: true },
                                            orderBy: { orden: 'asc' }
                                        }
                                    }
                                })];
                        case 1:
                            etapa = _a.sent();
                            if (!etapa) {
                                return [2 /*return*/, {
                                        success: false,
                                        message: 'Etapa no encontrada'
                                    }];
                            }
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Tipo de etapa obtenido exitosamente',
                                    data: {
                                        id: etapa.id,
                                        nombre: etapa.nombre,
                                        descripcion: etapa.descripcion,
                                        color: etapa.color || null,
                                        carpetas_iniciales: etapa.carpetas_iniciales || {},
                                        tipo_iniciativa: etapa.tipo_iniciativa,
                                        tipo_obra: etapa.tipo_obra,
                                        bip: etapa.bip,
                                        region: etapa.region,
                                        provincia: etapa.provincia,
                                        comuna: etapa.comuna,
                                        volumen: etapa.volumen,
                                        presupuesto_oficial: etapa.presupuesto_oficial,
                                        fecha_llamado_licitacion: etapa.fecha_llamado_licitacion,
                                        fecha_recepcion_ofertas_tecnicas: etapa.fecha_recepcion_ofertas_tecnicas,
                                        fecha_apertura_ofertas_economicas: etapa.fecha_apertura_ofertas_economicas,
                                        fecha_inicio_concesion: etapa.fecha_inicio_concesion,
                                        plazo_total_concesion: etapa.plazo_total_concesion,
                                        decreto_adjudicacion: etapa.decreto_adjudicacion,
                                        sociedad_concesionaria: etapa.sociedad_concesionaria,
                                        inspector_fiscal_id: etapa.inspector_fiscal_id,
                                        carpetas_transversales: etapa.carpetas_transversales.map(function (carpeta) { return ({
                                            id: carpeta.id,
                                            nombre: carpeta.nombre,
                                            descripcion: carpeta.descripcion,
                                            color: carpeta.color,
                                            orden: carpeta.orden,
                                            activa: carpeta.activa,
                                            estructura_carpetas: carpeta.estructura_carpetas || {}
                                        }); })
                                    }
                                }];
                    }
                });
            }); });
            // DELETE /etapas-tipo/:id - Eliminar tipo de etapa
            server.delete('/etapas-tipo/:id', {
                schema: {
                    tags: ['Etapas Tipo'],
                    summary: 'Eliminar tipo de etapa',
                    description: 'Elimina permanentemente un tipo de etapa del sistema. Esta operación no se puede deshacer y eliminará todas las referencias a este tipo de etapa.',
                    params: etapaTipoParamsSchema,
                    response: {
                        200: zod_1.default.object({
                            success: zod_1.default.boolean(),
                            message: zod_1.default.string(),
                            data: zod_1.default.object({
                                id: zod_1.default.number(),
                                eliminado: zod_1.default.boolean()
                            })
                        })
                    }
                }
            }, function (request) { return __awaiter(_this, void 0, void 0, function () {
                var id;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            id = request.params.id;
                            return [4 /*yield*/, prisma_1.prisma.etapas_tipo.delete({
                                    where: { id: id }
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, {
                                    success: true,
                                    message: 'Tipo de etapa eliminado exitosamente',
                                    data: {
                                        id: id,
                                        eliminado: true
                                    }
                                }];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
