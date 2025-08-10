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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.minioClient = exports.MinIOUtils = void 0;
var minio_1 = require("minio");
// Initialize MinIO client
var minioClient = new minio_1.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});
exports.minioClient = minioClient;
var BUCKET_NAME = process.env.MINIO_BUCKET || 'gestor-files';
exports.BUCKET_NAME = BUCKET_NAME;
// Validate MinIO configuration
if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
    console.warn('MinIO environment variables not fully configured. Using default values.');
}
var MinIOUtils = /** @class */ (function () {
    function MinIOUtils() {
    }
    /**
     * Ensures the bucket exists, creates it if it doesn't
     */
    MinIOUtils.ensureBucketExists = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exists, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, minioClient.bucketExists(BUCKET_NAME)];
                    case 1:
                        exists = _a.sent();
                        if (!!exists) return [3 /*break*/, 3];
                        return [4 /*yield*/, minioClient.makeBucket(BUCKET_NAME)];
                    case 2:
                        _a.sent();
                        console.log("Bucket '".concat(BUCKET_NAME, "' created successfully"));
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Error ensuring bucket exists: ".concat(error_1));
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a folder in MinIO (by creating an empty object with trailing slash)
     */
    MinIOUtils.createFolder = function (folderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedPath, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        normalizedPath = folderPath.endsWith('/') ? folderPath : "".concat(folderPath, "/");
                        // Create an empty object with trailing slash to represent a folder
                        return [4 /*yield*/, minioClient.putObject(BUCKET_NAME, normalizedPath, Buffer.from(''))];
                    case 1:
                        // Create an empty object with trailing slash to represent a folder
                        _a.sent();
                        console.log("Folder created successfully: ".concat(normalizedPath));
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error creating folder ".concat(folderPath, ":"), error_2);
                        throw new Error("Failed to create folder: ".concat(folderPath));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a project folder structure
     */
    MinIOUtils.createProjectFolder = function (projectName, projectId) {
        return __awaiter(this, void 0, void 0, function () {
            var sanitizedName, projectFolderPath, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Ensure bucket exists
                        return [4 /*yield*/, this.ensureBucketExists()];
                    case 1:
                        // Ensure bucket exists
                        _a.sent();
                        sanitizedName = projectName
                            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
                            .replace(/\s+/g, '_') // Replace spaces with underscores
                            .toLowerCase();
                        projectFolderPath = "proyectos/".concat(sanitizedName, "_").concat(projectId);
                        // Create the main project folder
                        return [4 /*yield*/, this.createFolder(projectFolderPath)];
                    case 2:
                        // Create the main project folder
                        _a.sent();
                        console.log("Project folder created: ".concat(projectFolderPath));
                        return [2 /*return*/, projectFolderPath];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error creating project folder:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates initial folders based on the carpeta_inicial JSON structure
     * Now supports both flat and nested structures
     */
    MinIOUtils.createInitialFolders = function (projectFolderPath, carpetaInicial) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, folder, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        if (!('carpetas' in carpetaInicial && Array.isArray(carpetaInicial.carpetas))) return [3 /*break*/, 5];
                        _i = 0, _a = carpetaInicial.carpetas;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        folder = _a[_i];
                        return [4 /*yield*/, this.createFolderStructure(projectFolderPath, folder)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5: 
                    // Handle new nested structure
                    return [4 /*yield*/, this.createNestedFolderStructure(projectFolderPath, carpetaInicial)];
                    case 6:
                        // Handle new nested structure
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        console.log('Initial folders created successfully');
                        return [3 /*break*/, 9];
                    case 8:
                        error_4 = _b.sent();
                        console.error('Error creating initial folders:', error_4);
                        throw error_4;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates folders based on etapa_tipo carpetas_iniciales
     * Now supports both flat and nested structures
     */
    MinIOUtils.createEtapaTipoFolders = function (projectFolderPath, etapaTipoCarpetas) {
        return __awaiter(this, void 0, void 0, function () {
            var carpetasIniciales, _i, _a, folder, _b, carpetasIniciales_1, folder, hasNestedStructure, _c, _d, _e, folderName, folderData, error_5;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 17, , 18]);
                        carpetasIniciales = etapaTipoCarpetas.carpetas_iniciales;
                        if (!(carpetasIniciales && typeof carpetasIniciales === 'object')) return [3 /*break*/, 16];
                        if (!(carpetasIniciales.carpetas && Array.isArray(carpetasIniciales.carpetas))) return [3 /*break*/, 5];
                        _i = 0, _a = carpetasIniciales.carpetas;
                        _f.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        folder = _a[_i];
                        if (!folder.nombre) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createFolderStructure(projectFolderPath, { nombre: folder.nombre })];
                    case 2:
                        _f.sent();
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
                        return [4 /*yield*/, this.createFolderStructure(projectFolderPath, { nombre: folder.nombre })];
                    case 7:
                        _f.sent();
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
                        // Handle nested structure
                        return [4 /*yield*/, this.createNestedFolderStructure(projectFolderPath, carpetasIniciales)];
                    case 11:
                        // Handle nested structure
                        _f.sent();
                        return [3 /*break*/, 16];
                    case 12:
                        _c = 0, _d = Object.entries(carpetasIniciales);
                        _f.label = 13;
                    case 13:
                        if (!(_c < _d.length)) return [3 /*break*/, 16];
                        _e = _d[_c], folderName = _e[0], folderData = _e[1];
                        if (!(typeof folderName === 'string')) return [3 /*break*/, 15];
                        return [4 /*yield*/, this.createFolderStructure(projectFolderPath, { nombre: folderName })];
                    case 14:
                        _f.sent();
                        _f.label = 15;
                    case 15:
                        _c++;
                        return [3 /*break*/, 13];
                    case 16:
                        console.log('Etapa tipo folders created successfully');
                        return [3 /*break*/, 18];
                    case 17:
                        error_5 = _f.sent();
                        console.error('Error creating etapa tipo folders:', error_5);
                        throw error_5;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursively creates nested folder structure
     */
    MinIOUtils.createNestedFolderStructure = function (basePath, folderStructure) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, folderName, subStructure, folderPath;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = Object.entries(folderStructure);
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], folderName = _b[0], subStructure = _b[1];
                        folderPath = "".concat(basePath, "/").concat(folderName);
                        // Create the current folder
                        return [4 /*yield*/, this.createFolder(folderPath)];
                    case 2:
                        // Create the current folder
                        _c.sent();
                        if (!(typeof subStructure === 'object' && subStructure !== null && Object.keys(subStructure).length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.createNestedFolderStructure(folderPath, subStructure)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursively creates folder structure (for backward compatibility)
     */
    MinIOUtils.createFolderStructure = function (basePath, folder) {
        return __awaiter(this, void 0, void 0, function () {
            var folderPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        folderPath = "".concat(basePath, "/").concat(folder.nombre);
                        // Create the current folder
                        return [4 /*yield*/, this.createFolder(folderPath)];
                    case 1:
                        // Create the current folder
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if a folder exists in MinIO
     */
    MinIOUtils.folderExists = function (folderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedPath, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        normalizedPath = folderPath.endsWith('/') ? folderPath : "".concat(folderPath, "/");
                        return [4 /*yield*/, minioClient.statObject(BUCKET_NAME, normalizedPath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 2:
                        error_6 = _a.sent();
                        if (error_6.code === 'NotFound') {
                            return [2 /*return*/, false];
                        }
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Lists all objects in a folder
     */
    MinIOUtils.listFolderContents = function (folderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedPath, stream, contents, _a, stream_1, stream_1_1, item, e_1_1, error_7;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 13, , 14]);
                        normalizedPath = folderPath.endsWith('/') ? folderPath : "".concat(folderPath, "/");
                        stream = minioClient.listObjects(BUCKET_NAME, normalizedPath, true);
                        contents = [];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 6, 7, 12]);
                        _a = true, stream_1 = __asyncValues(stream);
                        _e.label = 2;
                    case 2: return [4 /*yield*/, stream_1.next()];
                    case 3:
                        if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 5];
                        _d = stream_1_1.value;
                        _a = false;
                        item = _d;
                        if (item.name) {
                            contents.push(item.name);
                        }
                        _e.label = 4;
                    case 4:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 12];
                    case 7:
                        _e.trys.push([7, , 10, 11]);
                        if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 9];
                        return [4 /*yield*/, _c.call(stream_1)];
                    case 8:
                        _e.sent();
                        _e.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 11: return [7 /*endfinally*/];
                    case 12: return [2 /*return*/, contents];
                    case 13:
                        error_7 = _e.sent();
                        console.error("Error listing folder contents for ".concat(folderPath, ":"), error_7);
                        throw error_7;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renames a folder in MinIO by copying all objects to the new location and removing the old ones
     */
    MinIOUtils.renameFolder = function (oldFolderPath, newFolderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedOldPath, normalizedNewPath, oldFolderExists, newFolderExists, objects, _i, objects_1, objectPath, relativePath, newObjectPath, error_8, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 15, , 16]);
                        normalizedOldPath = oldFolderPath.endsWith('/') ? oldFolderPath : "".concat(oldFolderPath, "/");
                        normalizedNewPath = newFolderPath.endsWith('/') ? newFolderPath : "".concat(newFolderPath, "/");
                        return [4 /*yield*/, this.folderExists(oldFolderPath)];
                    case 1:
                        oldFolderExists = _a.sent();
                        if (!oldFolderExists) {
                            throw new Error("Old folder does not exist: ".concat(oldFolderPath));
                        }
                        return [4 /*yield*/, this.folderExists(newFolderPath)];
                    case 2:
                        newFolderExists = _a.sent();
                        if (newFolderExists) {
                            throw new Error("New folder already exists: ".concat(newFolderPath));
                        }
                        return [4 /*yield*/, this.listFolderContents(oldFolderPath)];
                    case 3:
                        objects = _a.sent();
                        if (!(objects.length === 0)) return [3 /*break*/, 6];
                        // If folder is empty, just create the new folder and remove the old one
                        return [4 /*yield*/, this.createFolder(newFolderPath)];
                    case 4:
                        // If folder is empty, just create the new folder and remove the old one
                        _a.sent();
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, normalizedOldPath)];
                    case 5:
                        _a.sent();
                        console.log("Empty folder renamed from ".concat(oldFolderPath, " to ").concat(newFolderPath));
                        return [2 /*return*/];
                    case 6:
                        _i = 0, objects_1 = objects;
                        _a.label = 7;
                    case 7:
                        if (!(_i < objects_1.length)) return [3 /*break*/, 11];
                        objectPath = objects_1[_i];
                        if (!objectPath.startsWith(normalizedOldPath)) return [3 /*break*/, 10];
                        relativePath = objectPath.substring(normalizedOldPath.length);
                        newObjectPath = "".concat(normalizedNewPath).concat(relativePath);
                        // Copy object to new location
                        return [4 /*yield*/, minioClient.copyObject(BUCKET_NAME, newObjectPath, "".concat(BUCKET_NAME, "/").concat(objectPath))];
                    case 8:
                        // Copy object to new location
                        _a.sent();
                        // Remove object from old location
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, objectPath)];
                    case 9:
                        // Remove object from old location
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11:
                        _a.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, normalizedOldPath)];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_8 = _a.sent();
                        // Ignore error if folder marker doesn't exist
                        console.log("Old folder marker already removed or doesn't exist: ".concat(normalizedOldPath));
                        return [3 /*break*/, 14];
                    case 14:
                        console.log("Folder renamed successfully from ".concat(oldFolderPath, " to ").concat(newFolderPath));
                        return [3 /*break*/, 16];
                    case 15:
                        error_9 = _a.sent();
                        console.error("Error renaming folder from ".concat(oldFolderPath, " to ").concat(newFolderPath, ":"), error_9);
                        throw error_9;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Moves a folder from one location to another in MinIO
     * This is similar to renameFolder but specifically for moving between different parent folders
     */
    MinIOUtils.moveFolder = function (oldFolderPath, newFolderPath) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedOldPath, normalizedNewPath, oldFolderExists, newFolderExists, objects, _i, objects_2, objectPath, relativePath, newObjectPath, error_10, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 15, , 16]);
                        normalizedOldPath = oldFolderPath.endsWith('/') ? oldFolderPath : "".concat(oldFolderPath, "/");
                        normalizedNewPath = newFolderPath.endsWith('/') ? newFolderPath : "".concat(newFolderPath, "/");
                        return [4 /*yield*/, this.folderExists(oldFolderPath)];
                    case 1:
                        oldFolderExists = _a.sent();
                        if (!oldFolderExists) {
                            throw new Error("Source folder does not exist: ".concat(oldFolderPath));
                        }
                        return [4 /*yield*/, this.folderExists(newFolderPath)];
                    case 2:
                        newFolderExists = _a.sent();
                        if (newFolderExists) {
                            throw new Error("Destination folder already exists: ".concat(newFolderPath));
                        }
                        return [4 /*yield*/, this.listFolderContents(oldFolderPath)];
                    case 3:
                        objects = _a.sent();
                        if (!(objects.length === 0)) return [3 /*break*/, 6];
                        // If folder is empty, just create the new folder and remove the old one
                        return [4 /*yield*/, this.createFolder(newFolderPath)];
                    case 4:
                        // If folder is empty, just create the new folder and remove the old one
                        _a.sent();
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, normalizedOldPath)];
                    case 5:
                        _a.sent();
                        console.log("Empty folder moved from ".concat(oldFolderPath, " to ").concat(newFolderPath));
                        return [2 /*return*/];
                    case 6:
                        _i = 0, objects_2 = objects;
                        _a.label = 7;
                    case 7:
                        if (!(_i < objects_2.length)) return [3 /*break*/, 11];
                        objectPath = objects_2[_i];
                        if (!objectPath.startsWith(normalizedOldPath)) return [3 /*break*/, 10];
                        relativePath = objectPath.substring(normalizedOldPath.length);
                        newObjectPath = "".concat(normalizedNewPath).concat(relativePath);
                        // Copy object to new location
                        return [4 /*yield*/, minioClient.copyObject(BUCKET_NAME, newObjectPath, "".concat(BUCKET_NAME, "/").concat(objectPath))];
                    case 8:
                        // Copy object to new location
                        _a.sent();
                        // Remove object from old location
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, objectPath)];
                    case 9:
                        // Remove object from old location
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11:
                        _a.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, minioClient.removeObject(BUCKET_NAME, normalizedOldPath)];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        error_10 = _a.sent();
                        // Ignore error if folder marker doesn't exist
                        console.log("Old folder marker already removed or doesn't exist: ".concat(normalizedOldPath));
                        return [3 /*break*/, 14];
                    case 14:
                        console.log("Folder moved successfully from ".concat(oldFolderPath, " to ").concat(newFolderPath));
                        return [3 /*break*/, 16];
                    case 15:
                        error_11 = _a.sent();
                        console.error("Error moving folder from ".concat(oldFolderPath, " to ").concat(newFolderPath, ":"), error_11);
                        throw error_11;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return MinIOUtils;
}());
exports.MinIOUtils = MinIOUtils;
