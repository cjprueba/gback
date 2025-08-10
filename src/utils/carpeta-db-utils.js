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
exports.CarpetaDBUtils = void 0;
var prisma_1 = require("@/lib/prisma");
var CarpetaDBUtils = /** @class */ (function () {
    function CarpetaDBUtils() {
    }
    /**
     * Creates a folder record in the database
     */
    CarpetaDBUtils.createCarpeta = function (carpetaData) {
        return __awaiter(this, void 0, void 0, function () {
            var userExists, carpeta, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('Creating carpeta DB record with data:', {
                            nombre: carpetaData.nombre,
                            proyecto_id: carpetaData.proyecto_id,
                            s3_path: carpetaData.s3_path,
                            usuario_creador: carpetaData.usuario_creador
                        });
                        return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                where: { id: carpetaData.usuario_creador },
                                select: { id: true, nombre_completo: true }
                            })];
                    case 1:
                        userExists = _a.sent();
                        if (!userExists) {
                            throw new Error("User with ID ".concat(carpetaData.usuario_creador, " does not exist"));
                        }
                        console.log("\u2705 User verified: ".concat(userExists.nombre_completo, " (ID: ").concat(userExists.id, ")"));
                        return [4 /*yield*/, prisma_1.prisma.carpetas.create({
                                data: {
                                    nombre: carpetaData.nombre,
                                    descripcion: carpetaData.descripcion,
                                    carpeta_padre_id: carpetaData.carpeta_padre_id,
                                    proyecto_id: carpetaData.proyecto_id,
                                    etapa_tipo_id: carpetaData.etapa_tipo_id,
                                    carpeta_transversal_id: carpetaData.carpeta_transversal_id,
                                    concesion_id: carpetaData.concesion_id,
                                    s3_path: carpetaData.s3_path,
                                    s3_bucket_name: carpetaData.s3_bucket_name || process.env.MINIO_BUCKET || 'gestor-files',
                                    s3_created: true,
                                    orden_visualizacion: carpetaData.orden_visualizacion || 0,
                                    max_tamaño_mb: carpetaData.max_tamaño_mb,
                                    tipos_archivo_permitidos: carpetaData.tipos_archivo_permitidos || [],
                                    permisos_lectura: carpetaData.permisos_lectura || [],
                                    permisos_escritura: carpetaData.permisos_escritura || [],
                                    usuario_creador: carpetaData.usuario_creador,
                                    activa: true
                                }
                            })];
                    case 2:
                        carpeta = _a.sent();
                        console.log("\u2705 Carpeta DB record created successfully: ".concat(carpeta.nombre, " (ID: ").concat(carpeta.id, ")"));
                        console.log("   - proyecto_id: ".concat(carpeta.proyecto_id));
                        console.log("   - s3_path: ".concat(carpeta.s3_path));
                        console.log("   - s3_bucket_name: ".concat(carpeta.s3_bucket_name));
                        console.log("   - s3_created: ".concat(carpeta.s3_created));
                        return [2 /*return*/, carpeta];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ Error creating carpeta DB record:', error_1);
                        console.error('Error details:', {
                            message: error_1.message,
                            code: error_1.code,
                            meta: error_1.meta
                        });
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates the main project folder record
     * This creates a folder with the project name as the root folder
     */
    CarpetaDBUtils.createProjectRootFolder = function (projectId, projectName, projectFolderPath, usuarioCreador) {
        return __awaiter(this, void 0, void 0, function () {
            var carpetaRaiz, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log("\uD83D\uDD04 Starting createProjectRootFolder for project: ".concat(projectName, " (ID: ").concat(projectId, ")"));
                        console.log("   - projectFolderPath: ".concat(projectFolderPath));
                        console.log("   - usuarioCreador: ".concat(usuarioCreador));
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: projectName, // Use project name as folder name
                                descripcion: "Carpeta ra\u00EDz del proyecto: ".concat(projectName),
                                proyecto_id: projectId,
                                s3_path: projectFolderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: 0
                            })];
                    case 1:
                        carpetaRaiz = _a.sent();
                        console.log("\u2705 Root folder created successfully with ID: ".concat(carpetaRaiz.id));
                        // Update the project with the root folder ID
                        console.log("\uD83D\uDD04 Updating project ".concat(projectId, " with carpeta_raiz_id: ").concat(carpetaRaiz.id));
                        return [4 /*yield*/, prisma_1.prisma.proyectos.update({
                                where: { id: projectId },
                                data: {
                                    carpeta_raiz_id: carpetaRaiz.id
                                }
                            })];
                    case 2:
                        _a.sent();
                        console.log("\u2705 Project ".concat(projectId, " linked to root folder ").concat(carpetaRaiz.id));
                        console.log("\u2705 Project root folder DB record created for project: ".concat(projectName, " with ID: ").concat(carpetaRaiz.id));
                        return [2 /*return*/, carpetaRaiz];
                    case 3:
                        error_2 = _a.sent();
                        console.error('❌ Error creating project root folder DB record:', error_2);
                        console.error('Error details:', {
                            message: error_2.message,
                            code: error_2.code,
                            meta: error_2.meta
                        });
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates folder records for initial folders
     * Now supports both flat and nested structures
     */
    CarpetaDBUtils.createInitialFoldersDB = function (projectId, projectFolderPath, carpetaInicial, usuarioCreador, carpetaPadreId, etapaTipoId) {
        return __awaiter(this, void 0, void 0, function () {
            var carpetasCreadas, i, folder, folderPath, carpeta, nestedCarpetas, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        carpetasCreadas = [];
                        if (!(carpetaInicial && carpetaInicial.carpetas && Array.isArray(carpetaInicial.carpetas))) return [3 /*break*/, 5];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < carpetaInicial.carpetas.length)) return [3 /*break*/, 4];
                        folder = carpetaInicial.carpetas[i];
                        folderPath = "".concat(projectFolderPath, "/").concat(folder.nombre);
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: folder.nombre,
                                descripcion: "Carpeta inicial del proyecto",
                                proyecto_id: projectId,
                                carpeta_padre_id: carpetaPadreId,
                                etapa_tipo_id: etapaTipoId,
                                s3_path: folderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: i + 1
                            })];
                    case 2:
                        carpeta = _a.sent();
                        carpetasCreadas.push(carpeta);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.createNestedFolderStructureDB(projectId, projectFolderPath, carpetaInicial, usuarioCreador, carpetaPadreId, etapaTipoId, 'Carpeta inicial del proyecto' // Pass description for initial folders
                        )];
                    case 6:
                        nestedCarpetas = _a.sent();
                        carpetasCreadas.push.apply(carpetasCreadas, nestedCarpetas);
                        _a.label = 7;
                    case 7:
                        console.log("Created ".concat(carpetasCreadas.length, " initial folder DB records"));
                        return [2 /*return*/, carpetasCreadas];
                    case 8:
                        error_3 = _a.sent();
                        console.error('Error creating initial folders DB records:', error_3);
                        throw error_3;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates folder records for etapa tipo folders
     * Now supports both flat and nested structures
     */
    CarpetaDBUtils.createEtapaTipoFoldersDB = function (projectId, projectFolderPath, etapaTipoCarpetas, usuarioCreador, carpetaPadreId, etapaTipoId) {
        return __awaiter(this, void 0, void 0, function () {
            var carpetasCreadas, carpetasIniciales, orden, _i, _a, folder, folderPath, carpeta, _b, carpetasIniciales_1, folder, folderPath, carpeta, hasNestedStructure, nestedCarpetas, _c, _d, _e, folderName, folderData, folderPath, carpeta, error_4;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 17, , 18]);
                        carpetasCreadas = [];
                        carpetasIniciales = etapaTipoCarpetas.carpetas_iniciales;
                        orden = 1;
                        if (!(carpetasIniciales && typeof carpetasIniciales === 'object')) return [3 /*break*/, 16];
                        if (!(carpetasIniciales.carpetas && Array.isArray(carpetasIniciales.carpetas))) return [3 /*break*/, 5];
                        _i = 0, _a = carpetasIniciales.carpetas;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        folder = _a[_i];
                        if (!folder.nombre) return [3 /*break*/, 3];
                        folderPath = "".concat(projectFolderPath, "/").concat(folder.nombre);
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: folder.nombre,
                                descripcion: "Carpeta del tipo de etapa",
                                proyecto_id: projectId,
                                carpeta_padre_id: carpetaPadreId,
                                etapa_tipo_id: etapaTipoId,
                                s3_path: folderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: orden++
                            })];
                    case 2:
                        carpeta = _f.sent();
                        carpetasCreadas.push(carpeta);
                        _f.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 16];
                    case 5:
                        if (!Array.isArray(carpetasIniciales)) return [3 /*break*/, 10];
                        _b = 0, carpetasIniciales_1 = carpetasIniciales;
                        _f.label = 6;
                    case 6:
                        if (!(_b < carpetasIniciales_1.length)) return [3 /*break*/, 9];
                        folder = carpetasIniciales_1[_b];
                        if (!folder.nombre) return [3 /*break*/, 8];
                        folderPath = "".concat(projectFolderPath, "/").concat(folder.nombre);
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: folder.nombre,
                                descripcion: "Carpeta del tipo de etapa",
                                proyecto_id: projectId,
                                carpeta_padre_id: carpetaPadreId,
                                etapa_tipo_id: etapaTipoId,
                                s3_path: folderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: orden++
                            })];
                    case 7:
                        carpeta = _f.sent();
                        carpetasCreadas.push(carpeta);
                        _f.label = 8;
                    case 8:
                        _b++;
                        return [3 /*break*/, 6];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        if (!(typeof carpetasIniciales === 'object')) return [3 /*break*/, 16];
                        hasNestedStructure = Object.values(carpetasIniciales).some(function (value) {
                            return typeof value === 'object' && value !== null && Object.keys(value).length > 0;
                        });
                        if (!hasNestedStructure) return [3 /*break*/, 12];
                        return [4 /*yield*/, this.createNestedFolderStructureDB(projectId, projectFolderPath, carpetasIniciales, usuarioCreador, carpetaPadreId, etapaTipoId, 'Carpeta del tipo de etapa' // Pass description for etapa tipo folders
                            )];
                    case 11:
                        nestedCarpetas = _f.sent();
                        carpetasCreadas.push.apply(carpetasCreadas, nestedCarpetas);
                        return [3 /*break*/, 16];
                    case 12:
                        _c = 0, _d = Object.entries(carpetasIniciales);
                        _f.label = 13;
                    case 13:
                        if (!(_c < _d.length)) return [3 /*break*/, 16];
                        _e = _d[_c], folderName = _e[0], folderData = _e[1];
                        if (!(typeof folderName === 'string')) return [3 /*break*/, 15];
                        folderPath = "".concat(projectFolderPath, "/").concat(folderName);
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: folderName,
                                descripcion: "Carpeta del tipo de etapa",
                                proyecto_id: projectId,
                                carpeta_padre_id: carpetaPadreId,
                                etapa_tipo_id: etapaTipoId,
                                s3_path: folderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: orden++
                            })];
                    case 14:
                        carpeta = _f.sent();
                        carpetasCreadas.push(carpeta);
                        _f.label = 15;
                    case 15:
                        _c++;
                        return [3 /*break*/, 13];
                    case 16:
                        console.log("Created ".concat(carpetasCreadas.length, " etapa tipo folder DB records"));
                        return [2 /*return*/, carpetasCreadas];
                    case 17:
                        error_4 = _f.sent();
                        console.error('Error creating etapa tipo folders DB records:', error_4);
                        throw error_4;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursively creates nested folder structure database records
     */
    CarpetaDBUtils.createNestedFolderStructureDB = function (projectId, basePath, folderStructure, usuarioCreador, carpetaPadreId, etapaTipoId, descripcion, carpetaTransversalId) {
        return __awaiter(this, void 0, void 0, function () {
            var carpetasCreadas, orden, _i, _a, _b, folderName, subStructure, folderPath, carpeta, subCarpetas;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        carpetasCreadas = [];
                        orden = 1;
                        _i = 0, _a = Object.entries(folderStructure);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], folderName = _b[0], subStructure = _b[1];
                        folderPath = "".concat(basePath, "/").concat(folderName);
                        return [4 /*yield*/, this.createCarpeta({
                                nombre: folderName,
                                descripcion: descripcion || "Carpeta inicial del proyecto",
                                proyecto_id: projectId,
                                carpeta_padre_id: carpetaPadreId,
                                etapa_tipo_id: etapaTipoId,
                                carpeta_transversal_id: carpetaTransversalId,
                                s3_path: folderPath,
                                usuario_creador: usuarioCreador,
                                orden_visualizacion: orden++
                            })];
                    case 2:
                        carpeta = _c.sent();
                        carpetasCreadas.push(carpeta);
                        if (!(typeof subStructure === 'object' && subStructure !== null && Object.keys(subStructure).length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createNestedFolderStructureDB(projectId, folderPath, subStructure, usuarioCreador, carpeta.id, etapaTipoId, descripcion, // Pass the same description to subfolders
                            carpetaTransversalId // Pass the same carpeta_transversal_id to subfolders
                            )];
                    case 3:
                        subCarpetas = _c.sent();
                        carpetasCreadas.push.apply(carpetasCreadas, subCarpetas);
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/, carpetasCreadas];
                }
            });
        });
    };
    /**
     * Gets all folders for a project, including child projects if it's a parent project
     */
    CarpetaDBUtils.getProjectFolders = function (projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var proyecto, proyectosHijos, projectIds, carpetas, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        // First, check if this project is a parent project
                        return [4 /*yield*/, prisma_1.prisma.proyectos.findUnique({
                                where: { id: projectId },
                                select: {
                                    id: true,
                                    es_proyecto_padre: true,
                                    proyecto_padre_id: true
                                }
                            })];
                    case 1:
                        proyecto = _a.sent();
                        if (!proyecto) {
                            throw new Error("Project with ID ".concat(projectId, " not found"));
                        }
                        // If it's a parent project, get folders from all child projects as well
                        if (proyecto.es_proyecto_padre) {
                            // Get child project IDs
                            return [4 /*yield*/, prisma_1.prisma.proyectos.findMany({
                                    where: {
                                        proyecto_padre_id: projectId,
                                        eliminado: false
                                    },
                                    select: { id: true }
                                })];
                        case 2:
                            proyectosHijos = _a.sent();
                            projectIds = [projectId].concat(proyectosHijos.map(function (p) { return p.id; }));
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                                    where: {
                                        proyecto_id: { in: projectIds },
                                        activa: true
                                    },
                                    include: {
                                        carpetas_hijas: {
                                            where: { activa: true }
                                        }
                                    },
                                    orderBy: {
                                        orden_visualizacion: 'asc'
                                    }
                                })];
                        case 3:
                            carpetas = _a.sent();
                            return [2 /*return*/, carpetas];
                        } else {
                            // If it's not a parent project, get only its own folders
                            return [4 /*yield*/, prisma_1.prisma.carpetas.findMany({
                                    where: {
                                        proyecto_id: projectId,
                                        activa: true
                                    },
                                    include: {
                                        carpetas_hijas: {
                                            where: { activa: true }
                                        }
                                    },
                                    orderBy: {
                                        orden_visualizacion: 'asc'
                                    }
                                })];
                        case 4:
                            carpetas = _a.sent();
                            return [2 /*return*/, carpetas];
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        console.error('Error getting project folders:', error_5);
                        throw error_5;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return CarpetaDBUtils;
}());
exports.CarpetaDBUtils = CarpetaDBUtils;
