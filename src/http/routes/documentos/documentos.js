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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentosRoutes = documentosRoutes;
var prisma_1 = require("@/lib/prisma");
var minio_utils_1 = require("@/utils/minio-utils");
var zod_1 = require("zod");
var bad_request_error_1 = require("../_errors/bad-request-error");
var unauthorized_error_1 = require("../_errors/unauthorized-error");
var crypto_1 = require("crypto");
function documentosRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Register multipart plugin for file uploads
                return [4 /*yield*/, app.register(Promise.resolve().then(function () { return require('@fastify/multipart'); }), {
                        limits: {
                            fileSize: 100 * 1024 * 1024, // 100MB limit
                            files: 1, // Only one file at a time
                        },
                    })];
                case 1:
                    // Register multipart plugin for file uploads
                    _a.sent();
                    app
                        .withTypeProvider()
                        .post('/documentos/upload', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Subir un documento a una carpeta',
                            description: 'Sube un archivo a MinIO y crea un registro de documento en la base de datos con su primera versión. El proyecto_id se obtiene automáticamente de la carpeta especificada. El tipo_documento_id es obligatorio. Si se envía el parámetro reemplazar=true, se omite la validación de documento duplicado.',
                            consumes: ['multipart/form-data'],
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    documento: zod_1.default.object({
                                        id: zod_1.default.string(),
                                        nombre_archivo: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable().optional(),
                                        tipo_mime: zod_1.default.string().nullable().optional(),
                                        descripcion: zod_1.default.string().nullable().optional(),
                                        categoria: zod_1.default.string().nullable().optional(),
                                        estado: zod_1.default.string().nullable().optional(),
                                        carpeta_id: zod_1.default.number(),
                                        etiquetas: zod_1.default.array(zod_1.default.string()),
                                        proyecto_id: zod_1.default.number().nullable().optional(),
                                        subido_por: zod_1.default.number(),
                                        usuario_creador: zod_1.default.number(),
                                        fecha_creacion: zod_1.default.date(),
                                        fecha_ultima_actualizacion: zod_1.default.date(),
                                        version_actual: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            numero_version: zod_1.default.number(),
                                            s3_path: zod_1.default.string(),
                                            s3_bucket_name: zod_1.default.string().nullable().optional(),
                                            tamano: zod_1.default.number().nullable().optional(),
                                            hash_integridad: zod_1.default.string().nullable().optional(),
                                            comentario: zod_1.default.string().nullable().optional(),
                                            fecha_creacion: zod_1.default.date(),
                                            activa: zod_1.default.boolean(),
                                        }),
                                    }),
                                }),
                                400: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    error: zod_1.default.object({
                                        code: zod_1.default.string(),
                                        message: zod_1.default.string(),
                                    }),
                                }),
                                401: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var data, carpetaId, userId, tipoDocumentoId, descripcion, categoria, etiquetas, comentario, reemplazar, existingDocument, nextVersionNumber, highestVersion, carpeta, tipoDocumento, fileBuffer, hashIntegridad, s3Path, documento, version, error_1;
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        return __generator(this, function (_k) {
                            switch (_k.label) {
                                case 0:
                                    _k.trys.push([0, 17, , 18]);
                                    return [4 /*yield*/, request.file()];
                                case 1:
                                    data = _k.sent();
                                    if (!data) {
                                        throw new bad_request_error_1.BadRequestError('No file provided');
                                    }
                                    carpetaId = parseInt((_a = data.fields['carpeta_id']) === null || _a === void 0 ? void 0 : _a.value);
                                    userId = parseInt((_b = data.fields['user_id']) === null || _b === void 0 ? void 0 : _b.value) || 1;
                                    tipoDocumentoId = parseInt((_c = data.fields['tipo_documento_id']) === null || _c === void 0 ? void 0 : _c.value);
                                    descripcion = (_d = data.fields['descripcion']) === null || _d === void 0 ? void 0 : _d.value;
                                    categoria = (_e = data.fields['categoria']) === null || _e === void 0 ? void 0 : _e.value;
                                    etiquetas = ((_f = data.fields['etiquetas']) === null || _f === void 0 ? void 0 : _f.value) ? JSON.parse(data.fields['etiquetas'].value) : [];
                                    comentario = (_g = data.fields['comentario']) === null || _g === void 0 ? void 0 : _g.value;
                                    reemplazar = ((_h = data.fields['reemplazar']) === null || _h === void 0 ? void 0 : _h.value) === '1';
                                    // Validate required fields
                                    if (!tipoDocumentoId || isNaN(tipoDocumentoId)) {
                                        throw new bad_request_error_1.BadRequestError('tipo_documento_id is required and must be a valid number');
                                    }
                                    console.log('carpetaId', data.fields['carpeta_id']['value']);
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                nombre_archivo: data.filename,
                                                carpeta_id: carpetaId,
                                                eliminado: false,
                                            },
                                        })];
                                case 2:
                                    existingDocument = _k.sent();
                                    if (existingDocument && !reemplazar) {
                                        return [2 /*return*/, reply.status(400).send({
                                                success: false,
                                                error: {
                                                    code: 'DOCUMENT_ALREADY_EXISTS',
                                                    message: 'El documento ya existe en esta carpeta'
                                                }
                                            })];
                                    }
                                    nextVersionNumber = 1;
                                    if (!(existingDocument && reemplazar)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: existingDocument.id,
                                            },
                                            orderBy: {
                                                numero_version: 'desc',
                                            },
                                        })];
                                case 3:
                                    highestVersion = _k.sent();
                                    if (highestVersion) {
                                        nextVersionNumber = highestVersion.numero_version + 1;
                                    }
                                    _k.label = 4;
                                case 4: return [4 /*yield*/, prisma_1.prisma.carpetas.findFirst({
                                        where: {
                                            id: carpetaId,
                                        },
                                        include: {
                                            proyecto: {
                                                select: {
                                                    id: true,
                                                },
                                            },
                                        },
                                    })];
                                case 5:
                                    carpeta = _k.sent();
                                    if (!carpeta) {
                                        throw new bad_request_error_1.BadRequestError('Folder not found');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                id: tipoDocumentoId,
                                                activo: true,
                                            },
                                        })];
                                case 6:
                                    tipoDocumento = _k.sent();
                                    if (!tipoDocumento) {
                                        throw new bad_request_error_1.BadRequestError('Document type not found or is not active');
                                    }
                                    return [4 /*yield*/, data.toBuffer()];
                                case 7:
                                    fileBuffer = _k.sent();
                                    hashIntegridad = (0, crypto_1.createHash)('sha256').update(fileBuffer).digest('hex');
                                    s3Path = "".concat(carpeta.s3_path, "/version_").concat(nextVersionNumber, "_").concat(data.filename);
                                    // Upload file to MinIO
                                    return [4 /*yield*/, minio_utils_1.minioClient.putObject(minio_utils_1.BUCKET_NAME, s3Path, fileBuffer)];
                                case 8:
                                    // Upload file to MinIO
                                    _k.sent();
                                    documento = void 0;
                                    version = void 0;
                                    if (!(existingDocument && reemplazar)) return [3 /*break*/, 12];
                                    return [4 /*yield*/, prisma_1.prisma.documentos.update({
                                            where: { id: existingDocument.id },
                                            data: {
                                                extension: data.filename.split('.').pop() || null,
                                                tipo_mime: data.mimetype,
                                                descripcion: descripcion || null,
                                                categoria: categoria || null,
                                                fecha_ultima_actualizacion: new Date(),
                                            },
                                        })];
                                case 9:
                                    // Update existing document
                                    documento = _k.sent();
                                    // Deactivate all previous versions
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.updateMany({
                                            where: {
                                                documento_id: existingDocument.id,
                                                activa: true,
                                            },
                                            data: {
                                                activa: false,
                                            },
                                        })];
                                case 10:
                                    // Deactivate all previous versions
                                    _k.sent();
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.create({
                                            data: {
                                                documento_id: existingDocument.id,
                                                numero_version: nextVersionNumber,
                                                s3_path: s3Path,
                                                s3_bucket_name: minio_utils_1.BUCKET_NAME,
                                                tamano: BigInt(fileBuffer.length),
                                                hash_integridad: hashIntegridad,
                                                comentario: comentario || null,
                                                usuario_creador: userId,
                                                metadata: {
                                                    original_filename: data.filename,
                                                    mime_type: data.mimetype,
                                                    upload_timestamp: new Date().toISOString(),
                                                    replaced_previous_version: true,
                                                },
                                                activa: true,
                                            },
                                        })];
                                case 11:
                                    // Create new version record
                                    version = _k.sent();
                                    return [3 /*break*/, 15];
                                case 12: return [4 /*yield*/, prisma_1.prisma.documentos.create({
                                        data: {
                                            nombre_archivo: data.filename,
                                            extension: data.filename.split('.').pop() || null,
                                            tipo_mime: data.mimetype,
                                            descripcion: descripcion || null,
                                            categoria: categoria || null,
                                            estado: 'activo',
                                            carpeta_id: carpetaId,
                                            tipo_documento_id: tipoDocumentoId,
                                            etiquetas: etiquetas,
                                            proyecto_id: ((_j = carpeta.proyecto) === null || _j === void 0 ? void 0 : _j.id) || null,
                                            subido_por: userId,
                                            usuario_creador: userId,
                                        },
                                    })];
                                case 13:
                                    // Create new document record
                                    documento = _k.sent();
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.create({
                                            data: {
                                                documento_id: documento.id,
                                                numero_version: 1,
                                                s3_path: s3Path,
                                                s3_bucket_name: minio_utils_1.BUCKET_NAME,
                                                tamano: BigInt(fileBuffer.length),
                                                hash_integridad: hashIntegridad,
                                                comentario: comentario || null,
                                                usuario_creador: userId,
                                                metadata: {
                                                    original_filename: data.filename,
                                                    mime_type: data.mimetype,
                                                    upload_timestamp: new Date().toISOString(),
                                                },
                                                activa: true,
                                            },
                                        })];
                                case 14:
                                    // Create first version record
                                    version = _k.sent();
                                    _k.label = 15;
                                case 15: 
                                // Create audit record
                                return [4 /*yield*/, prisma_1.prisma.archivo_historial.create({
                                        data: {
                                            archivo_id: documento.id,
                                            usuario_id: userId,
                                            accion: existingDocument && reemplazar ? 'replace' : 'upload',
                                            descripcion: existingDocument && reemplazar
                                                ? "File replaced - new version ".concat(nextVersionNumber, " created")
                                                : 'File uploaded - first version created',
                                            version_anterior: existingDocument && reemplazar ? String(nextVersionNumber - 1) : null,
                                            version_nueva: String(version.numero_version),
                                        },
                                    })];
                                case 16:
                                    // Create audit record
                                    _k.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: existingDocument && reemplazar
                                                ? "Document replaced successfully with version ".concat(nextVersionNumber)
                                                : 'Document uploaded successfully',
                                            documento: {
                                                id: documento.id,
                                                nombre_archivo: documento.nombre_archivo,
                                                extension: documento.extension,
                                                tipo_mime: documento.tipo_mime,
                                                descripcion: documento.descripcion,
                                                categoria: documento.categoria,
                                                estado: documento.estado,
                                                carpeta_id: documento.carpeta_id,
                                                etiquetas: documento.etiquetas,
                                                proyecto_id: documento.proyecto_id,
                                                subido_por: documento.subido_por,
                                                usuario_creador: documento.usuario_creador,
                                                fecha_creacion: documento.fecha_creacion,
                                                fecha_ultima_actualizacion: documento.fecha_ultima_actualizacion,
                                                version_actual: {
                                                    id: version.id,
                                                    numero_version: version.numero_version,
                                                    s3_path: version.s3_path,
                                                    s3_bucket_name: version.s3_bucket_name,
                                                    tamano: Number(version.tamano),
                                                    hash_integridad: version.hash_integridad,
                                                    comentario: version.comentario,
                                                    fecha_creacion: version.fecha_creacion,
                                                    activa: version.activa,
                                                },
                                            },
                                        })];
                                case 17:
                                    error_1 = _k.sent();
                                    console.error('Error uploading document:', error_1);
                                    if (error_1 instanceof bad_request_error_1.BadRequestError || error_1 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_1;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to upload document');
                                case 18: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get documents by folder
                    app
                        .withTypeProvider()
                        .get('/documentos/folder/:carpetaId', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Obtener documentos en una carpeta',
                            description: 'Recupera todos los documentos en una carpeta específica',
                            params: zod_1.default.object({
                                carpetaId: zod_1.default.string().transform(function (val) { return parseInt(val); }),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    documentos: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.string(),
                                        nombre_archivo: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable().optional(),
                                        tipo_mime: zod_1.default.string().nullable().optional(),
                                        descripcion: zod_1.default.string().nullable().optional(),
                                        categoria: zod_1.default.string().nullable().optional(),
                                        estado: zod_1.default.string().nullable().optional(),
                                        carpeta_id: zod_1.default.number(),
                                        etiquetas: zod_1.default.array(zod_1.default.string()),
                                        proyecto_id: zod_1.default.number().nullable().optional(),
                                        subido_por: zod_1.default.number(),
                                        usuario_creador: zod_1.default.number(),
                                        fecha_creacion: zod_1.default.date(),
                                        fecha_ultima_actualizacion: zod_1.default.date(),
                                        creador: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable().optional(),
                                            correo_electronico: zod_1.default.string().nullable().optional(),
                                        }),
                                        version_actual: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            numero_version: zod_1.default.number(),
                                            s3_path: zod_1.default.string(),
                                            s3_bucket_name: zod_1.default.string().nullable().optional(),
                                            tamano: zod_1.default.number().nullable().optional(),
                                            hash_integridad: zod_1.default.string().nullable().optional(),
                                            comentario: zod_1.default.string().nullable().optional(),
                                            fecha_creacion: zod_1.default.date(),
                                            activa: zod_1.default.boolean(),
                                        }).nullable().optional(),
                                    })),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                401: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var carpetaId, carpeta, documentos, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    carpetaId = request.params.carpetaId;
                                    return [4 /*yield*/, prisma_1.prisma.carpetas.findFirst({
                                            where: {
                                                id: carpetaId,
                                            },
                                        })];
                                case 1:
                                    carpeta = _a.sent();
                                    if (!carpeta) {
                                        throw new bad_request_error_1.BadRequestError('Folder not found');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findMany({
                                            where: {
                                                carpeta_id: carpetaId,
                                                eliminado: false,
                                            },
                                            include: {
                                                creador: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                                versiones: {
                                                    where: {
                                                        activa: true,
                                                    },
                                                    orderBy: {
                                                        fecha_creacion: 'desc',
                                                    },
                                                    take: 1,
                                                },
                                            },
                                            orderBy: {
                                                fecha_creacion: 'desc',
                                            },
                                        })];
                                case 2:
                                    documentos = _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            documentos: documentos.map(function (doc) { return ({
                                                id: doc.id,
                                                nombre_archivo: doc.nombre_archivo,
                                                extension: doc.extension,
                                                tipo_mime: doc.tipo_mime,
                                                descripcion: doc.descripcion,
                                                categoria: doc.categoria,
                                                estado: doc.estado,
                                                carpeta_id: doc.carpeta_id,
                                                etiquetas: doc.etiquetas,
                                                proyecto_id: doc.proyecto_id,
                                                subido_por: doc.subido_por,
                                                usuario_creador: doc.usuario_creador,
                                                fecha_creacion: doc.fecha_creacion,
                                                fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
                                                creador: doc.creador,
                                                version_actual: doc.versiones && doc.versiones.length > 0 ? {
                                                    id: doc.versiones[0].id,
                                                    numero_version: doc.versiones[0].numero_version,
                                                    s3_path: doc.versiones[0].s3_path,
                                                    s3_bucket_name: doc.versiones[0].s3_bucket_name,
                                                    tamano: doc.versiones[0].tamano ? Number(doc.versiones[0].tamano) : null,
                                                    hash_integridad: doc.versiones[0].hash_integridad,
                                                    comentario: doc.versiones[0].comentario,
                                                    fecha_creacion: doc.versiones[0].fecha_creacion,
                                                    activa: doc.versiones[0].activa,
                                                } : null,
                                            }); }),
                                        })];
                                case 3:
                                    error_2 = _a.sent();
                                    console.error('Error getting documents:', error_2);
                                    if (error_2 instanceof bad_request_error_1.BadRequestError || error_2 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_2;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to get documents');
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Delete document
                    app
                        .withTypeProvider()
                        .delete('/documentos/:documentoId', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Eliminar documento',
                            description: 'Elimina un documento (soft delete en base de datos, hard delete en MinIO)',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                401: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, documento, currentVersion, error_3, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 9, , 10]);
                                    documentoId = request.params.documentoId;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                            },
                                        })];
                                case 1:
                                    documento = _a.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found');
                                    }
                                    // Check if document is already deleted
                                    if (documento.eliminado) {
                                        throw new bad_request_error_1.BadRequestError('Document is already deleted');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: documentoId,
                                                activa: true,
                                            },
                                        })];
                                case 2:
                                    currentVersion = _a.sent();
                                    // Create audit record first (before deleting the document)
                                    return [4 /*yield*/, prisma_1.prisma.archivo_historial.create({
                                            data: {
                                                archivo_id: documentoId,
                                                usuario_id: 1, // Default user ID - should be passed as parameter
                                                accion: 'soft_delete',
                                                descripcion: 'Document marked as deleted (soft delete in DB, hard delete in MinIO)',
                                                version_anterior: (currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.numero_version) ? String(currentVersion.numero_version) : 'unknown',
                                            },
                                        })];
                                case 3:
                                    // Create audit record first (before deleting the document)
                                    _a.sent();
                                    if (!(currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.s3_path)) return [3 /*break*/, 7];
                                    _a.label = 4;
                                case 4:
                                    _a.trys.push([4, 6, , 7]);
                                    return [4 /*yield*/, minio_utils_1.minioClient.removeObject(minio_utils_1.BUCKET_NAME, currentVersion.s3_path)];
                                case 5:
                                    _a.sent();
                                    console.log("File deleted from MinIO: ".concat(currentVersion.s3_path));
                                    return [3 /*break*/, 7];
                                case 6:
                                    error_3 = _a.sent();
                                    console.error('Error deleting from MinIO:', error_3);
                                    return [3 /*break*/, 7];
                                case 7: 
                                // Soft delete - mark as deleted in database but keep record
                                return [4 /*yield*/, prisma_1.prisma.documentos.update({
                                        where: {
                                            id: documentoId,
                                        },
                                        data: {
                                            eliminado: true,
                                            fecha_ultima_actualizacion: new Date(),
                                        },
                                    })];
                                case 8:
                                    // Soft delete - mark as deleted in database but keep record
                                    _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'Document deleted successfully (soft delete in DB, hard delete in MinIO)',
                                        })];
                                case 9:
                                    error_4 = _a.sent();
                                    console.error('Error deleting document:', error_4);
                                    if (error_4 instanceof bad_request_error_1.BadRequestError || error_4 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_4;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to delete document');
                                case 10: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Download document
                    app
                        .withTypeProvider()
                        .get('/documentos/:documentoId/download', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Descargar un documento',
                            description: 'Descarga un documento desde MinIO usando la ruta S3',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    url: zod_1.default.string().optional(),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                401: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, documento, currentVersion, presignedUrl, error_5;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    documentoId = request.params.documentoId;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                                eliminado: false,
                                            },
                                        })];
                                case 1:
                                    documento = _a.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found or has been deleted');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: documentoId,
                                                activa: true,
                                            },
                                        })];
                                case 2:
                                    currentVersion = _a.sent();
                                    // Check if document has a current version with S3 path
                                    if (!(currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.s3_path)) {
                                        throw new bad_request_error_1.BadRequestError('Document not found in storage');
                                    }
                                    return [4 /*yield*/, minio_utils_1.minioClient.presignedGetObject(minio_utils_1.BUCKET_NAME, currentVersion.s3_path, 24 * 60 * 60 // 24 hours expiration
                                        )];
                                case 3:
                                    presignedUrl = _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'Download URL generated successfully',
                                            url: presignedUrl,
                                        })];
                                case 4:
                                    error_5 = _a.sent();
                                    console.error('Error generating download URL:', error_5);
                                    if (error_5 instanceof bad_request_error_1.BadRequestError || error_5 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_5;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to generate download URL');
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get deleted documents (admin only)
                    app
                        .withTypeProvider()
                        .get('/documentos/deleted', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Obtener documentos eliminados',
                            description: 'Obtiene la lista de documentos marcados como eliminados',
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    documentos: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.string(),
                                        nombre_archivo: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable(),
                                        tipo_mime: zod_1.default.string().nullable(),
                                        descripcion: zod_1.default.string().nullable(),
                                        categoria: zod_1.default.string().nullable(),
                                        estado: zod_1.default.string().nullable(),
                                        carpeta_id: zod_1.default.number(),
                                        etiquetas: zod_1.default.array(zod_1.default.string()),
                                        proyecto_id: zod_1.default.number().nullable(),
                                        subido_por: zod_1.default.number(),
                                        usuario_creador: zod_1.default.number(),
                                        fecha_creacion: zod_1.default.date(),
                                        fecha_ultima_actualizacion: zod_1.default.date(),
                                        creador: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable(),
                                            correo_electronico: zod_1.default.string().nullable(),
                                        }),
                                    })),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                401: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentos, error_6;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findMany({
                                            where: {
                                                eliminado: true,
                                            },
                                            include: {
                                                creador: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                            },
                                            orderBy: {
                                                fecha_ultima_actualizacion: 'desc',
                                            },
                                        })];
                                case 1:
                                    documentos = _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            documentos: documentos.map(function (doc) { return ({
                                                id: doc.id,
                                                nombre_archivo: doc.nombre_archivo,
                                                extension: doc.extension,
                                                tipo_mime: doc.tipo_mime,
                                                descripcion: doc.descripcion,
                                                categoria: doc.categoria,
                                                estado: doc.estado,
                                                carpeta_id: doc.carpeta_id,
                                                etiquetas: doc.etiquetas,
                                                proyecto_id: doc.proyecto_id,
                                                subido_por: doc.subido_por,
                                                usuario_creador: doc.usuario_creador,
                                                fecha_creacion: doc.fecha_creacion,
                                                fecha_ultima_actualizacion: doc.fecha_ultima_actualizacion,
                                                creador: doc.creador,
                                            }); }),
                                        })];
                                case 2:
                                    error_6 = _a.sent();
                                    console.error('Error getting deleted documents:', error_6);
                                    if (error_6 instanceof bad_request_error_1.BadRequestError || error_6 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_6;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to get deleted documents');
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Enhanced direct download endpoint (alternative to presigned URLs)
                    app
                        .withTypeProvider()
                        .get('/documentos/:documentoId/download-direct', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Descargar documento directamente (alternativa a URLs presignadas)',
                            description: 'Descarga un documento directamente a través del servidor con características mejoradas como descargas por chunks',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            querystring: zod_1.default.object({
                                chunked: zod_1.default.boolean().optional().default(false),
                                filename: zod_1.default.string().optional()
                            }),
                            // No response schema - allows any response type including streams
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, _a, _b, chunked, filename, documento, currentVersion, path, fileName, stats, fileSize, contentType, range, supportsRange, parts, start, end, chunksize, stream, stream, error_7;
                        var _c, _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 8, , 9]);
                                    documentoId = request.params.documentoId;
                                    _a = request.query, _b = _a.chunked, chunked = _b === void 0 ? false : _b, filename = _a.filename;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                                eliminado: false,
                                            },
                                        })];
                                case 1:
                                    documento = _e.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found or has been deleted');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: documentoId,
                                                activa: true,
                                            },
                                        })];
                                case 2:
                                    currentVersion = _e.sent();
                                    // Check if document has a current version with S3 path
                                    if (!(currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.s3_path)) {
                                        throw new bad_request_error_1.BadRequestError('Document not found in storage');
                                    }
                                    path = currentVersion.s3_path;
                                    fileName = filename || documento.nombre_archivo || path.split('/').pop() || 'file';
                                    return [4 /*yield*/, minio_utils_1.minioClient.statObject(minio_utils_1.BUCKET_NAME, path)];
                                case 3:
                                    stats = _e.sent();
                                    fileSize = stats.size;
                                    contentType = ((_c = stats.metaData) === null || _c === void 0 ? void 0 : _c['content-type']) || documento.tipo_mime || 'application/octet-stream';
                                    range = request.headers.range;
                                    supportsRange = range && chunked;
                                    if (!supportsRange) return [3 /*break*/, 5];
                                    parts = range.replace(/bytes=/, "").split("-");
                                    start = parseInt(parts[0], 10);
                                    end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
                                    chunksize = (end - start) + 1;
                                    // Validate range
                                    if (start >= fileSize || end >= fileSize) {
                                        reply.status(416).send({
                                            error: 'Requested range not satisfiable'
                                        });
                                        return [2 /*return*/];
                                    }
                                    // Set headers for partial content
                                    reply.status(206);
                                    reply.header('Content-Range', "bytes ".concat(start, "-").concat(end, "/").concat(fileSize));
                                    reply.header('Accept-Ranges', 'bytes');
                                    reply.header('Content-Length', chunksize);
                                    reply.header('Content-Type', contentType);
                                    reply.header('Content-Disposition', "attachment; filename=\"".concat(fileName, "\""));
                                    return [4 /*yield*/, minio_utils_1.minioClient.getPartialObject(minio_utils_1.BUCKET_NAME, path, start, end)];
                                case 4:
                                    stream = _e.sent();
                                    return [2 /*return*/, reply.send(stream)];
                                case 5: return [4 /*yield*/, minio_utils_1.minioClient.getObject(minio_utils_1.BUCKET_NAME, path)];
                                case 6:
                                    stream = _e.sent();
                                    // Set headers
                                    reply.header('Content-Type', contentType);
                                    reply.header('Content-Disposition', "attachment; filename=\"".concat(fileName, "\""));
                                    reply.header('Content-Length', fileSize);
                                    reply.header('Accept-Ranges', 'bytes');
                                    // Return file info for non-streaming requests
                                    if ((_d = request.headers.accept) === null || _d === void 0 ? void 0 : _d.includes('application/json')) {
                                        return [2 /*return*/, reply.send({
                                                success: true,
                                                message: 'File information retrieved successfully',
                                                fileInfo: {
                                                    name: fileName,
                                                    size: fileSize,
                                                    type: contentType,
                                                    path: path
                                                }
                                            })];
                                    }
                                    // Return the stream
                                    return [2 /*return*/, reply.send(stream)];
                                case 7: return [3 /*break*/, 9];
                                case 8:
                                    error_7 = _e.sent();
                                    console.error('Error downloading document:', error_7);
                                    if (error_7 instanceof bad_request_error_1.BadRequestError || error_7 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_7;
                                    }
                                    if (error_7.code === 'NotFound') {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'File not found'
                                            })];
                                    }
                                    if (error_7.code === 'NoSuchBucket') {
                                        return [2 /*return*/, reply.status(500).send({
                                                error: 'Storage bucket not found'
                                            })];
                                    }
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to download file'
                                        })];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Download document with metadata
                    app
                        .withTypeProvider()
                        .get('/documentos/:documentoId/download-with-info', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Descargar documento con información de metadatos',
                            description: 'Obtiene información del documento y opcionalmente genera una URL de descarga',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            querystring: zod_1.default.object({
                                includeMetadata: zod_1.default.boolean().optional().default(true)
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    metadata: zod_1.default.object({
                                        name: zod_1.default.string(),
                                        size: zod_1.default.number(),
                                        type: zod_1.default.string(),
                                        path: zod_1.default.string(),
                                        lastModified: zod_1.default.date().optional(),
                                        etag: zod_1.default.string().optional(),
                                        versionId: zod_1.default.string().optional()
                                    }),
                                    downloadUrl: zod_1.default.string().optional()
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string()
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string()
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string()
                                })
                            }
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, _a, includeMetadata, documento, currentVersion, path, fileName, stats, metadata, downloadUrl, error_8;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 7, , 8]);
                                    documentoId = request.params.documentoId;
                                    _a = request.query.includeMetadata, includeMetadata = _a === void 0 ? true : _a;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                                eliminado: false,
                                            },
                                        })];
                                case 1:
                                    documento = _c.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found or has been deleted');
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: documentoId,
                                                activa: true,
                                            },
                                        })];
                                case 2:
                                    currentVersion = _c.sent();
                                    // Check if document has a current version with S3 path
                                    if (!(currentVersion === null || currentVersion === void 0 ? void 0 : currentVersion.s3_path)) {
                                        throw new bad_request_error_1.BadRequestError('Document not found in storage');
                                    }
                                    path = currentVersion.s3_path;
                                    fileName = documento.nombre_archivo || path.split('/').pop() || 'file';
                                    return [4 /*yield*/, minio_utils_1.minioClient.statObject(minio_utils_1.BUCKET_NAME, path)];
                                case 3:
                                    stats = _c.sent();
                                    metadata = {
                                        name: fileName,
                                        size: stats.size,
                                        type: ((_b = stats.metaData) === null || _b === void 0 ? void 0 : _b['content-type']) || documento.tipo_mime || 'application/octet-stream',
                                        path: path,
                                        lastModified: stats.lastModified,
                                        etag: stats.etag,
                                        versionId: stats.versionId
                                    };
                                    if (!includeMetadata) return [3 /*break*/, 4];
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'File metadata retrieved successfully',
                                            metadata: metadata
                                        })];
                                case 4: return [4 /*yield*/, minio_utils_1.minioClient.presignedGetObject(minio_utils_1.BUCKET_NAME, path, 60 * 60 // 1 hour expiration
                                    )];
                                case 5:
                                    downloadUrl = _c.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'File information and download URL generated',
                                            metadata: metadata,
                                            downloadUrl: downloadUrl
                                        })];
                                case 6: return [3 /*break*/, 8];
                                case 7:
                                    error_8 = _c.sent();
                                    console.error('Error getting document info:', error_8);
                                    if (error_8 instanceof bad_request_error_1.BadRequestError || error_8 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_8;
                                    }
                                    if (error_8.code === 'NotFound') {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'File not found'
                                            })];
                                    }
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to get file information'
                                        })];
                                case 8: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Download document as base64
                    app
                        .withTypeProvider()
                        .get('/documentos/:documentoId/download-base64', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Descargar documento como string base64',
                            description: 'Descarga un documento como string codificado en base64, útil para archivos pequeños o incrustar en respuestas JSON',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            querystring: zod_1.default.object({
                                maxSize: zod_1.default.number().optional().default(10 * 1024 * 1024), // 10MB default max
                                version: zod_1.default.number().optional() // Optional version number to download specific version
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    data: zod_1.default.object({
                                        filename: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable(),
                                        size: zod_1.default.number(),
                                        type: zod_1.default.string(),
                                        base64: zod_1.default.string(),
                                        path: zod_1.default.string()
                                    })
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string()
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string()
                                }),
                                413: zod_1.default.object({
                                    error: zod_1.default.string()
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string()
                                })
                            }
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, _a, _b, maxSize, version, documento, targetVersion, path, fileName, fileExtension, stats, fileSize, contentType, stream, chunks, _c, stream_1, stream_1_1, chunk, e_1_1, buffer, base64, error_9;
                        var _d, e_1, _e, _f;
                        var _g;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    _h.trys.push([0, 20, , 21]);
                                    documentoId = request.params.documentoId;
                                    _a = request.query, _b = _a.maxSize, maxSize = _b === void 0 ? 10 * 1024 * 1024 : _b, version = _a.version;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                                eliminado: false,
                                            },
                                        })];
                                case 1:
                                    documento = _h.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found or has been deleted');
                                    }
                                    targetVersion = void 0;
                                    if (!(version !== undefined)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                            where: {
                                                documento_id: documentoId,
                                                numero_version: version,
                                            },
                                        })];
                                case 2:
                                    // Look for specific version
                                    targetVersion = _h.sent();
                                    if (!targetVersion) {
                                        throw new bad_request_error_1.BadRequestError("Version ".concat(version, " not found for this document"));
                                    }
                                    return [3 /*break*/, 5];
                                case 3: return [4 /*yield*/, prisma_1.prisma.documento_versiones.findFirst({
                                        where: {
                                            documento_id: documentoId,
                                            activa: true,
                                        },
                                    })];
                                case 4:
                                    // Get the current active version
                                    targetVersion = _h.sent();
                                    _h.label = 5;
                                case 5:
                                    // Check if document has a target version with S3 path
                                    if (!(targetVersion === null || targetVersion === void 0 ? void 0 : targetVersion.s3_path)) {
                                        throw new bad_request_error_1.BadRequestError('Document not found in storage');
                                    }
                                    path = targetVersion.s3_path;
                                    fileName = documento.nombre_archivo || path.split('/').pop() || 'file';
                                    fileExtension = documento.extension;
                                    return [4 /*yield*/, minio_utils_1.minioClient.statObject(minio_utils_1.BUCKET_NAME, path)];
                                case 6:
                                    stats = _h.sent();
                                    fileSize = stats.size;
                                    contentType = ((_g = stats.metaData) === null || _g === void 0 ? void 0 : _g['content-type']) || documento.tipo_mime || 'application/octet-stream';
                                    // Check file size limit
                                    if (fileSize > maxSize) {
                                        return [2 /*return*/, reply.status(413).send({
                                                error: "File too large. Maximum size allowed is ".concat(Math.round(maxSize / 1024 / 1024), "MB")
                                            })];
                                    }
                                    return [4 /*yield*/, minio_utils_1.minioClient.getObject(minio_utils_1.BUCKET_NAME, path)];
                                case 7:
                                    stream = _h.sent();
                                    chunks = [];
                                    _h.label = 8;
                                case 8:
                                    _h.trys.push([8, 13, 14, 19]);
                                    _c = true, stream_1 = __asyncValues(stream);
                                    _h.label = 9;
                                case 9: return [4 /*yield*/, stream_1.next()];
                                case 10:
                                    if (!(stream_1_1 = _h.sent(), _d = stream_1_1.done, !_d)) return [3 /*break*/, 12];
                                    _f = stream_1_1.value;
                                    _c = false;
                                    chunk = _f;
                                    chunks.push(chunk);
                                    _h.label = 11;
                                case 11:
                                    _c = true;
                                    return [3 /*break*/, 9];
                                case 12: return [3 /*break*/, 19];
                                case 13:
                                    e_1_1 = _h.sent();
                                    e_1 = { error: e_1_1 };
                                    return [3 /*break*/, 19];
                                case 14:
                                    _h.trys.push([14, , 17, 18]);
                                    if (!(!_c && !_d && (_e = stream_1.return))) return [3 /*break*/, 16];
                                    return [4 /*yield*/, _e.call(stream_1)];
                                case 15:
                                    _h.sent();
                                    _h.label = 16;
                                case 16: return [3 /*break*/, 18];
                                case 17:
                                    if (e_1) throw e_1.error;
                                    return [7 /*endfinally*/];
                                case 18: return [7 /*endfinally*/];
                                case 19:
                                    buffer = Buffer.concat(chunks);
                                    base64 = buffer.toString('base64');
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'File downloaded successfully as base64',
                                            data: {
                                                filename: fileName,
                                                extension: fileExtension,
                                                size: fileSize,
                                                type: contentType,
                                                base64: base64,
                                                path: path
                                            }
                                        })];
                                case 20:
                                    error_9 = _h.sent();
                                    console.error('Error downloading document as base64:', error_9);
                                    if (error_9 instanceof bad_request_error_1.BadRequestError || error_9 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_9;
                                    }
                                    if (error_9.code === 'NotFound') {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'File not found'
                                            })];
                                    }
                                    if (error_9.code === 'NoSuchBucket') {
                                        return [2 /*return*/, reply.status(500).send({
                                                error: 'Storage bucket not found'
                                            })];
                                    }
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to download file as base64'
                                        })];
                                case 21: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get all document types
                    app
                        .withTypeProvider()
                        .get('/documentos/tipos', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Obtener todos los tipos de documentos',
                            description: 'Recupera todos los tipos de documentos disponibles con sus requisitos',
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    tipos_documentos: zod_1.default.array(zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        requiere_nro_pro_exp: zod_1.default.boolean(),
                                        requiere_saf_exp: zod_1.default.boolean(),
                                        requiere_numerar: zod_1.default.boolean(),
                                        requiere_tramitar: zod_1.default.boolean(),
                                        activo: zod_1.default.boolean(),
                                        created_at: zod_1.default.date(),
                                        updated_at: zod_1.default.date(),
                                    })),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var tiposDocumentos, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findMany({
                                            where: {
                                                activo: true,
                                            },
                                            orderBy: {
                                                nombre: 'asc',
                                            },
                                        })];
                                case 1:
                                    tiposDocumentos = _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            tipos_documentos: tiposDocumentos,
                                        })];
                                case 2:
                                    error_10 = _a.sent();
                                    console.error('Error getting document types:', error_10);
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to get document types',
                                        })];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get document properties by ID
                    app
                        .withTypeProvider()
                        .get('/documentos/:documentoId', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Obtener propiedades de un documento',
                            description: 'Recupera todas las propiedades y metadatos de un documento específico',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    documento: zod_1.default.object({
                                        id: zod_1.default.string(),
                                        nombre_archivo: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable(),
                                        tipo_mime: zod_1.default.string().nullable(),
                                        descripcion: zod_1.default.string().nullable(),
                                        categoria: zod_1.default.string().nullable(),
                                        estado: zod_1.default.string().nullable(),
                                        carpeta_id: zod_1.default.number(),
                                        tipo_documento_id: zod_1.default.number().nullable(),
                                        etiquetas: zod_1.default.array(zod_1.default.string()),
                                        proyecto_id: zod_1.default.number().nullable(),
                                        usuario_creador: zod_1.default.number(),
                                        subido_por: zod_1.default.number(),
                                        eliminado: zod_1.default.boolean(),
                                        fecha_creacion: zod_1.default.date(),
                                        fecha_ultima_actualizacion: zod_1.default.date(),
                                        // Información relacionada
                                        carpeta: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string(),
                                            descripcion: zod_1.default.string().nullable(),
                                            s3_path: zod_1.default.string().nullable(),
                                        }),
                                        creador: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable(),
                                            correo_electronico: zod_1.default.string().nullable(),
                                        }),
                                        subio_por: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable(),
                                            correo_electronico: zod_1.default.string().nullable(),
                                        }),
                                        proyecto: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string()
                                        }).nullable(),
                                        tipo_documento: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string(),
                                            descripcion: zod_1.default.string().nullable(),
                                            requiere_nro_pro_exp: zod_1.default.boolean(),
                                            requiere_saf_exp: zod_1.default.boolean(),
                                            requiere_numerar: zod_1.default.boolean(),
                                            requiere_tramitar: zod_1.default.boolean(),
                                        }).nullable(),
                                        version_actual: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            numero_version: zod_1.default.number(),
                                            s3_path: zod_1.default.string(),
                                            s3_bucket_name: zod_1.default.string().nullable().optional(),
                                            tamano: zod_1.default.number().nullable().optional(),
                                            hash_integridad: zod_1.default.string().nullable().optional(),
                                            comentario: zod_1.default.string().nullable().optional(),
                                            fecha_creacion: zod_1.default.date(),
                                            activa: zod_1.default.boolean(),
                                            metadata: zod_1.default.any().nullable().optional(),
                                        }).nullable().optional(),
                                        versiones: zod_1.default.array(zod_1.default.object({
                                            id: zod_1.default.number(),
                                            numero_version: zod_1.default.number(),
                                            s3_path: zod_1.default.string(),
                                            s3_bucket_name: zod_1.default.string().nullable().optional(),
                                            tamano: zod_1.default.number().nullable().optional(),
                                            hash_integridad: zod_1.default.string().nullable().optional(),
                                            comentario: zod_1.default.string().nullable().optional(),
                                            fecha_creacion: zod_1.default.date(),
                                            activa: zod_1.default.boolean(),
                                            metadata: zod_1.default.any().nullable().optional(),
                                        })),
                                    }),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, documento, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    documentoId = request.params.documentoId;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                            },
                                            include: {
                                                carpeta: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        descripcion: true,
                                                        s3_path: true,
                                                    },
                                                },
                                                creador: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                                subio_por: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                                proyecto: {
                                                    select: {
                                                        id: true,
                                                        nombre: true
                                                    },
                                                },
                                                tipo_documento: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        descripcion: true,
                                                        requiere_nro_pro_exp: true,
                                                        requiere_saf_exp: true,
                                                        requiere_numerar: true,
                                                        requiere_tramitar: true,
                                                    },
                                                },
                                                versiones: {
                                                    orderBy: {
                                                        numero_version: 'desc',
                                                    },
                                                },
                                            },
                                        })];
                                case 1:
                                    documento = _a.sent();
                                    if (!documento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found');
                                    }
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            documento: {
                                                id: documento.id,
                                                nombre_archivo: documento.nombre_archivo,
                                                extension: documento.extension,
                                                tipo_mime: documento.tipo_mime,
                                                descripcion: documento.descripcion,
                                                categoria: documento.categoria,
                                                estado: documento.estado,
                                                carpeta_id: documento.carpeta_id,
                                                tipo_documento_id: documento.tipo_documento_id,
                                                etiquetas: documento.etiquetas,
                                                proyecto_id: documento.proyecto_id,
                                                usuario_creador: documento.usuario_creador,
                                                subido_por: documento.subido_por,
                                                eliminado: documento.eliminado,
                                                fecha_creacion: documento.fecha_creacion,
                                                fecha_ultima_actualizacion: documento.fecha_ultima_actualizacion,
                                                carpeta: documento.carpeta,
                                                creador: documento.creador,
                                                subio_por: documento.subio_por,
                                                proyecto: documento.proyecto,
                                                tipo_documento: documento.tipo_documento,
                                                version_actual: documento.versiones && documento.versiones.length > 0 ? {
                                                    id: documento.versiones[0].id,
                                                    numero_version: documento.versiones[0].numero_version,
                                                    s3_path: documento.versiones[0].s3_path,
                                                    s3_bucket_name: documento.versiones[0].s3_bucket_name,
                                                    tamano: documento.versiones[0].tamano ? Number(documento.versiones[0].tamano) : null,
                                                    hash_integridad: documento.versiones[0].hash_integridad,
                                                    comentario: documento.versiones[0].comentario,
                                                    fecha_creacion: documento.versiones[0].fecha_creacion,
                                                    activa: documento.versiones[0].activa,
                                                    metadata: documento.versiones[0].metadata,
                                                } : null,
                                                versiones: documento.versiones.map(function (version) { return ({
                                                    id: version.id,
                                                    numero_version: version.numero_version,
                                                    s3_path: version.s3_path,
                                                    s3_bucket_name: version.s3_bucket_name,
                                                    tamano: version.tamano ? Number(version.tamano) : null,
                                                    hash_integridad: version.hash_integridad,
                                                    comentario: version.comentario,
                                                    fecha_creacion: version.fecha_creacion,
                                                    activa: version.activa,
                                                    metadata: version.metadata,
                                                }); }),
                                            },
                                        })];
                                case 2:
                                    error_11 = _a.sent();
                                    console.error('Error getting document properties:', error_11);
                                    if (error_11 instanceof bad_request_error_1.BadRequestError || error_11 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_11;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to get document properties');
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Get document type by ID
                    app
                        .withTypeProvider()
                        .get('/documentos/tipos/:id', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Obtener un tipo de documento específico',
                            description: 'Recupera un tipo de documento específico por su ID',
                            params: zod_1.default.object({
                                id: zod_1.default.string().transform(function (val) { return parseInt(val); }),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    tipo_documento: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        requiere_nro_pro_exp: zod_1.default.boolean(),
                                        requiere_saf_exp: zod_1.default.boolean(),
                                        requiere_numerar: zod_1.default.boolean(),
                                        requiere_tramitar: zod_1.default.boolean(),
                                        activo: zod_1.default.boolean(),
                                        created_at: zod_1.default.date(),
                                        updated_at: zod_1.default.date(),
                                    }),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var id, tipoDocumento, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    id = request.params.id;
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                id: id,
                                                activo: true,
                                            },
                                        })];
                                case 1:
                                    tipoDocumento = _a.sent();
                                    if (!tipoDocumento) {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'Document type not found',
                                            })];
                                    }
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            tipo_documento: tipoDocumento,
                                        })];
                                case 2:
                                    error_12 = _a.sent();
                                    console.error('Error getting document type:', error_12);
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to get document type',
                                        })];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Create new document type
                    app
                        .withTypeProvider()
                        .post('/documentos/tipos', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Crear un nuevo tipo de documento',
                            description: 'Crea un nuevo tipo de documento con sus requisitos',
                            body: zod_1.default.object({
                                nombre: zod_1.default.string().min(1, 'Name is required'),
                                descripcion: zod_1.default.string().nullable().optional(),
                                requiere_nro_pro_exp: zod_1.default.boolean().default(false),
                                requiere_saf_exp: zod_1.default.boolean().default(false),
                                requiere_numerar: zod_1.default.boolean().default(false),
                                requiere_tramitar: zod_1.default.boolean().default(false),
                            }),
                            response: {
                                201: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    tipo_documento: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        requiere_nro_pro_exp: zod_1.default.boolean(),
                                        requiere_saf_exp: zod_1.default.boolean(),
                                        requiere_numerar: zod_1.default.boolean(),
                                        requiere_tramitar: zod_1.default.boolean(),
                                        activo: zod_1.default.boolean(),
                                        created_at: zod_1.default.date(),
                                        updated_at: zod_1.default.date(),
                                    }),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var _a, nombre, descripcion, requiere_nro_pro_exp, requiere_saf_exp, requiere_numerar, requiere_tramitar, existingTipo, tipoDocumento, error_13;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 3, , 4]);
                                    _a = request.body, nombre = _a.nombre, descripcion = _a.descripcion, requiere_nro_pro_exp = _a.requiere_nro_pro_exp, requiere_saf_exp = _a.requiere_saf_exp, requiere_numerar = _a.requiere_numerar, requiere_tramitar = _a.requiere_tramitar;
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                nombre: nombre,
                                                activo: true,
                                            },
                                        })];
                                case 1:
                                    existingTipo = _b.sent();
                                    if (existingTipo) {
                                        return [2 /*return*/, reply.status(400).send({
                                                error: 'Document type with this name already exists',
                                            })];
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.create({
                                            data: {
                                                nombre: nombre,
                                                descripcion: descripcion,
                                                requiere_nro_pro_exp: requiere_nro_pro_exp,
                                                requiere_saf_exp: requiere_saf_exp,
                                                requiere_numerar: requiere_numerar,
                                                requiere_tramitar: requiere_tramitar,
                                            },
                                        })];
                                case 2:
                                    tipoDocumento = _b.sent();
                                    return [2 /*return*/, reply.status(201).send({
                                            success: true,
                                            message: 'Document type created successfully',
                                            tipo_documento: tipoDocumento,
                                        })];
                                case 3:
                                    error_13 = _b.sent();
                                    console.error('Error creating document type:', error_13);
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to create document type',
                                        })];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Update document type
                    app
                        .withTypeProvider()
                        .put('/documentos/tipos/:id', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Actualizar un tipo de documento',
                            description: 'Actualiza un tipo de documento existente',
                            params: zod_1.default.object({
                                id: zod_1.default.string().transform(function (val) { return parseInt(val); }),
                            }),
                            body: zod_1.default.object({
                                nombre: zod_1.default.string().min(1, 'Name is required').optional(),
                                descripcion: zod_1.default.string().nullable().optional(),
                                requiere_nro_pro_exp: zod_1.default.boolean().optional(),
                                requiere_saf_exp: zod_1.default.boolean().optional(),
                                requiere_numerar: zod_1.default.boolean().optional(),
                                requiere_tramitar: zod_1.default.boolean().optional(),
                                activo: zod_1.default.boolean().optional(),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    tipo_documento: zod_1.default.object({
                                        id: zod_1.default.number(),
                                        nombre: zod_1.default.string(),
                                        descripcion: zod_1.default.string().nullable(),
                                        requiere_nro_pro_exp: zod_1.default.boolean(),
                                        requiere_saf_exp: zod_1.default.boolean(),
                                        requiere_numerar: zod_1.default.boolean(),
                                        requiere_tramitar: zod_1.default.boolean(),
                                        activo: zod_1.default.boolean(),
                                        created_at: zod_1.default.date(),
                                        updated_at: zod_1.default.date(),
                                    }),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var id, updateData, existingTipo, duplicateTipo, tipoDocumento, error_14;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 5, , 6]);
                                    id = request.params.id;
                                    updateData = request.body;
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                id: id,
                                            },
                                        })];
                                case 1:
                                    existingTipo = _a.sent();
                                    if (!existingTipo) {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'Document type not found',
                                            })];
                                    }
                                    if (!(updateData.nombre && updateData.nombre !== existingTipo.nombre)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                nombre: updateData.nombre,
                                                id: { not: id },
                                                activo: true,
                                            },
                                        })];
                                case 2:
                                    duplicateTipo = _a.sent();
                                    if (duplicateTipo) {
                                        return [2 /*return*/, reply.status(400).send({
                                                error: 'Document type with this name already exists',
                                            })];
                                    }
                                    _a.label = 3;
                                case 3: return [4 /*yield*/, prisma_1.prisma.tipos_documentos.update({
                                        where: {
                                            id: id,
                                        },
                                        data: updateData,
                                    })];
                                case 4:
                                    tipoDocumento = _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'Document type updated successfully',
                                            tipo_documento: tipoDocumento,
                                        })];
                                case 5:
                                    error_14 = _a.sent();
                                    console.error('Error updating document type:', error_14);
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to update document type',
                                        })];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Delete document type (soft delete)
                    app
                        .withTypeProvider()
                        .delete('/documentos/tipos/:id', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Eliminar un tipo de documento',
                            description: 'Elimina un tipo de documento (soft delete)',
                            params: zod_1.default.object({
                                id: zod_1.default.string().transform(function (val) { return parseInt(val); }),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var id, existingTipo, documentosUsingTipo, error_15;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    id = request.params.id;
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                id: id,
                                            },
                                        })];
                                case 1:
                                    existingTipo = _a.sent();
                                    if (!existingTipo) {
                                        return [2 /*return*/, reply.status(404).send({
                                                error: 'Document type not found',
                                            })];
                                    }
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                tipo_documento_id: id,
                                                eliminado: false,
                                            },
                                        })];
                                case 2:
                                    documentosUsingTipo = _a.sent();
                                    if (documentosUsingTipo) {
                                        return [2 /*return*/, reply.status(400).send({
                                                error: 'Cannot delete document type that is being used by documents',
                                            })];
                                    }
                                    // Soft delete by setting activo to false
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.update({
                                            where: {
                                                id: id,
                                            },
                                            data: {
                                                activo: false,
                                            },
                                        })];
                                case 3:
                                    // Soft delete by setting activo to false
                                    _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'Document type deleted successfully',
                                        })];
                                case 4:
                                    error_15 = _a.sent();
                                    console.error('Error deleting document type:', error_15);
                                    return [2 /*return*/, reply.status(500).send({
                                            error: 'Failed to delete document type',
                                        })];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Edit document properties
                    app
                        .withTypeProvider()
                        .put('/documentos/:documentoId', {
                        schema: {
                            tags: ['Documentos'],
                            summary: 'Editar propiedades de un documento',
                            description: 'Actualiza las propiedades de un documento existente',
                            params: zod_1.default.object({
                                documentoId: zod_1.default.string().uuid(),
                            }),
                            body: zod_1.default.object({
                                nombre_archivo: zod_1.default.string().optional(),
                                descripcion: zod_1.default.string().nullable().optional(),
                                categoria: zod_1.default.string().nullable().optional(),
                                estado: zod_1.default.string().nullable().optional(),
                                tipo_documento_id: zod_1.default.number().nullable().optional(),
                                etiquetas: zod_1.default.array(zod_1.default.string()).optional(),
                            }),
                            response: {
                                200: zod_1.default.object({
                                    success: zod_1.default.boolean(),
                                    message: zod_1.default.string(),
                                    documento: zod_1.default.object({
                                        id: zod_1.default.string(),
                                        nombre_archivo: zod_1.default.string(),
                                        extension: zod_1.default.string().nullable(),
                                        tipo_mime: zod_1.default.string().nullable(),
                                        descripcion: zod_1.default.string().nullable(),
                                        categoria: zod_1.default.string().nullable(),
                                        estado: zod_1.default.string().nullable(),
                                        carpeta_id: zod_1.default.number(),
                                        tipo_documento_id: zod_1.default.number().nullable(),
                                        etiquetas: zod_1.default.array(zod_1.default.string()),
                                        proyecto_id: zod_1.default.number().nullable(),
                                        usuario_creador: zod_1.default.number(),
                                        subido_por: zod_1.default.number(),
                                        eliminado: zod_1.default.boolean(),
                                        fecha_creacion: zod_1.default.date(),
                                        fecha_ultima_actualizacion: zod_1.default.date(),
                                        // Información relacionada
                                        carpeta: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string(),
                                            descripcion: zod_1.default.string().nullable(),
                                            s3_path: zod_1.default.string().nullable(),
                                        }),
                                        creador: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable(),
                                            correo_electronico: zod_1.default.string().nullable(),
                                        }),
                                        subio_por: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre_completo: zod_1.default.string().nullable(),
                                            correo_electronico: zod_1.default.string().nullable(),
                                        }),
                                        proyecto: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string()
                                        }).nullable(),
                                        tipo_documento: zod_1.default.object({
                                            id: zod_1.default.number(),
                                            nombre: zod_1.default.string(),
                                            descripcion: zod_1.default.string().nullable(),
                                            requiere_nro_pro_exp: zod_1.default.boolean(),
                                            requiere_saf_exp: zod_1.default.boolean(),
                                            requiere_numerar: zod_1.default.boolean(),
                                            requiere_tramitar: zod_1.default.boolean(),
                                        }).nullable(),
                                    }),
                                }),
                                400: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                404: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                                500: zod_1.default.object({
                                    error: zod_1.default.string(),
                                }),
                            },
                        },
                    }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                        var documentoId, updateData, existingDocumento, tipoDocumento, dataToUpdate, documentoActualizado, error_16;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 6, , 7]);
                                    documentoId = request.params.documentoId;
                                    updateData = request.body;
                                    return [4 /*yield*/, prisma_1.prisma.documentos.findFirst({
                                            where: {
                                                id: documentoId,
                                                eliminado: false,
                                            },
                                        })];
                                case 1:
                                    existingDocumento = _a.sent();
                                    if (!existingDocumento) {
                                        throw new bad_request_error_1.BadRequestError('Document not found or has been deleted');
                                    }
                                    if (!(updateData.tipo_documento_id !== undefined && updateData.tipo_documento_id !== null)) return [3 /*break*/, 3];
                                    return [4 /*yield*/, prisma_1.prisma.tipos_documentos.findFirst({
                                            where: {
                                                id: updateData.tipo_documento_id,
                                                activo: true,
                                            },
                                        })];
                                case 2:
                                    tipoDocumento = _a.sent();
                                    if (!tipoDocumento) {
                                        throw new bad_request_error_1.BadRequestError('Document type not found or is not active');
                                    }
                                    _a.label = 3;
                                case 3:
                                    dataToUpdate = __assign(__assign({}, updateData), { fecha_ultima_actualizacion: new Date() });
                                    return [4 /*yield*/, prisma_1.prisma.documentos.update({
                                            where: {
                                                id: documentoId,
                                            },
                                            data: dataToUpdate,
                                            include: {
                                                carpeta: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        descripcion: true,
                                                        s3_path: true,
                                                    },
                                                },
                                                creador: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                                subio_por: {
                                                    select: {
                                                        id: true,
                                                        nombre_completo: true,
                                                        correo_electronico: true,
                                                    },
                                                },
                                                proyecto: {
                                                    select: {
                                                        id: true,
                                                        nombre: true
                                                    },
                                                },
                                                tipo_documento: {
                                                    select: {
                                                        id: true,
                                                        nombre: true,
                                                        descripcion: true,
                                                        requiere_nro_pro_exp: true,
                                                        requiere_saf_exp: true,
                                                        requiere_numerar: true,
                                                        requiere_tramitar: true,
                                                    },
                                                },
                                            },
                                        })];
                                case 4:
                                    documentoActualizado = _a.sent();
                                    // Create audit record
                                    return [4 /*yield*/, prisma_1.prisma.archivo_historial.create({
                                            data: {
                                                archivo_id: documentoId,
                                                usuario_id: 1, // Default user ID - should be passed as parameter
                                                accion: 'update',
                                                descripcion: 'Document properties updated',
                                            },
                                        })];
                                case 5:
                                    // Create audit record
                                    _a.sent();
                                    return [2 /*return*/, reply.send({
                                            success: true,
                                            message: 'Document updated successfully',
                                            documento: {
                                                id: documentoActualizado.id,
                                                nombre_archivo: documentoActualizado.nombre_archivo,
                                                extension: documentoActualizado.extension,
                                                tipo_mime: documentoActualizado.tipo_mime,
                                                descripcion: documentoActualizado.descripcion,
                                                categoria: documentoActualizado.categoria,
                                                estado: documentoActualizado.estado,
                                                carpeta_id: documentoActualizado.carpeta_id,
                                                tipo_documento_id: documentoActualizado.tipo_documento_id,
                                                etiquetas: documentoActualizado.etiquetas,
                                                proyecto_id: documentoActualizado.proyecto_id,
                                                usuario_creador: documentoActualizado.usuario_creador,
                                                subido_por: documentoActualizado.subido_por,
                                                eliminado: documentoActualizado.eliminado,
                                                fecha_creacion: documentoActualizado.fecha_creacion,
                                                fecha_ultima_actualizacion: documentoActualizado.fecha_ultima_actualizacion,
                                                carpeta: documentoActualizado.carpeta,
                                                creador: documentoActualizado.creador,
                                                subio_por: documentoActualizado.subio_por,
                                                proyecto: documentoActualizado.proyecto,
                                                tipo_documento: documentoActualizado.tipo_documento,
                                            },
                                        })];
                                case 6:
                                    error_16 = _a.sent();
                                    console.error('Error updating document:', error_16);
                                    if (error_16 instanceof bad_request_error_1.BadRequestError || error_16 instanceof unauthorized_error_1.UnauthorizedError) {
                                        throw error_16;
                                    }
                                    throw new bad_request_error_1.BadRequestError('Failed to update document');
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
