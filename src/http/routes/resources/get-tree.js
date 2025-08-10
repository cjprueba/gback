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
exports.getTree = getTree;
var zod_1 = require("zod");
var bad_request_error_1 = require("../_errors/bad-request-error");
var minio_1 = require("minio");
// Initialize MinIO client
var minioClient = new minio_1.Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});
console.log("MINIO_ENDPOINT");
console.log(process.env.MINIO_ENDPOINT);
var BUCKET_NAME = process.env.MINIO_BUCKET || 'gestor-files';
function buildTree(items) {
    var tree = [];
    var pathMap = new Map();
    // Separar archivos y carpetas, y crear estructura
    items.forEach(function (item) {
        var _a;
        var pathParts = item.fullPath.split('/').filter(function (part) { return part.length > 0; });
        if (pathParts.length === 1 && !item.isFolder) {
            // Archivo en la raíz
            tree.push({
                name: item.name,
                type: 'file',
                size: item.size || 0,
                lastModified: ((_a = item.lastModified) === null || _a === void 0 ? void 0 : _a.toISOString()) || '',
                path: item.fullPath
            });
        }
        else {
            // Crear estructura de carpetas
            var currentPath_1 = '';
            var currentLevel_1 = tree;
            pathParts.forEach(function (part, index) {
                var _a;
                var isLast = index === pathParts.length - 1;
                currentPath_1 = currentPath_1 ? "".concat(currentPath_1, "/").concat(part) : part;
                if (isLast && !item.isFolder) {
                    // Es un archivo
                    currentLevel_1.push({
                        name: part,
                        type: 'file',
                        size: item.size || 0,
                        lastModified: ((_a = item.lastModified) === null || _a === void 0 ? void 0 : _a.toISOString()) || '',
                        path: currentPath_1
                    });
                }
                else {
                    // Es una carpeta
                    var folder = currentLevel_1.find(function (f) { return f.name === part && f.type === 'folder'; });
                    if (!folder) {
                        folder = {
                            name: part,
                            type: 'folder',
                            path: currentPath_1,
                            children: []
                        };
                        currentLevel_1.push(folder);
                        pathMap.set(currentPath_1, folder);
                    }
                    currentLevel_1 = folder.children;
                }
            });
        }
    });
    return tree;
}
function getTree(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Ruta para listar archivos de forma plana (original)
            app
                .withTypeProvider()
                .get('/files', {
                schema: {
                    tags: ['Resources'],
                    summary: 'List all files in bucket (flat structure)',
                    response: {
                        200: zod_1.default.object({
                            files: zod_1.default.array(zod_1.default.object({
                                name: zod_1.default.string(),
                                size: zod_1.default.number(),
                                lastModified: zod_1.default.string()
                            }))
                        }),
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var stream, files, _a, stream_1, stream_1_1, item, stat, e_1_1, error_1;
                var _b, e_1, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 14, , 15]);
                            stream = minioClient.listObjects(BUCKET_NAME, '', true);
                            files = [];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 7, 8, 13]);
                            _a = true, stream_1 = __asyncValues(stream);
                            _e.label = 2;
                        case 2: return [4 /*yield*/, stream_1.next()];
                        case 3:
                            if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 6];
                            _d = stream_1_1.value;
                            _a = false;
                            item = _d;
                            if (!(item.name && !item.name.endsWith('/'))) return [3 /*break*/, 5];
                            return [4 /*yield*/, minioClient.statObject(BUCKET_NAME, item.name)];
                        case 4:
                            stat = _e.sent();
                            files.push({
                                name: item.name,
                                size: stat.size,
                                lastModified: stat.lastModified.toISOString()
                            });
                            _e.label = 5;
                        case 5:
                            _a = true;
                            return [3 /*break*/, 2];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_1_1 = _e.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _e.trys.push([8, , 11, 12]);
                            if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _c.call(stream_1)];
                        case 9:
                            _e.sent();
                            _e.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13: return [2 /*return*/, reply.send({ files: files })];
                        case 14:
                            error_1 = _e.sent();
                            console.error(error_1);
                            throw new bad_request_error_1.BadRequestError('Failed to list files');
                        case 15: return [2 /*return*/];
                    }
                });
            }); });
            // Nueva ruta para listar archivos de forma estructurada
            app
                .withTypeProvider()
                .get('/files/tree', {
                schema: {
                    tags: ['Resources'],
                    summary: 'List all files and folders in bucket (tree structure)',
                    querystring: zod_1.default.object({
                        prefix: zod_1.default.string().optional().describe('Prefix to filter objects')
                    }),
                    response: {
                        200: zod_1.default.object({
                            tree: zod_1.default.array(zod_1.default.union([
                                zod_1.default.object({
                                    name: zod_1.default.string(),
                                    type: zod_1.default.literal('file'),
                                    size: zod_1.default.number(),
                                    lastModified: zod_1.default.string(),
                                    path: zod_1.default.string()
                                }),
                                zod_1.default.object({
                                    name: zod_1.default.string(),
                                    type: zod_1.default.literal('folder'),
                                    path: zod_1.default.string(),
                                    children: zod_1.default.array(zod_1.default.any()) // Recursivo
                                })
                            ]))
                        }),
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, prefix, stream, items, _b, stream_2, stream_2_1, item, stat, statError_1, e_2_1, tree, error_2;
                var _c, e_2, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 16, , 17]);
                            _a = request.query.prefix, prefix = _a === void 0 ? '' : _a;
                            stream = minioClient.listObjects(BUCKET_NAME, prefix, true);
                            items = [];
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 9, 10, 15]);
                            _b = true, stream_2 = __asyncValues(stream);
                            _f.label = 2;
                        case 2: return [4 /*yield*/, stream_2.next()];
                        case 3:
                            if (!(stream_2_1 = _f.sent(), _c = stream_2_1.done, !_c)) return [3 /*break*/, 8];
                            _e = stream_2_1.value;
                            _b = false;
                            item = _e;
                            if (!item.name) return [3 /*break*/, 7];
                            if (!item.name.endsWith('/')) return [3 /*break*/, 4];
                            // Es una carpeta
                            items.push({
                                name: item.name.slice(0, -1).split('/').pop() || '',
                                isFolder: true,
                                fullPath: item.name.slice(0, -1)
                            });
                            return [3 /*break*/, 7];
                        case 4:
                            _f.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, minioClient.statObject(BUCKET_NAME, item.name)];
                        case 5:
                            stat = _f.sent();
                            items.push({
                                name: item.name.split('/').pop() || '',
                                size: stat.size,
                                lastModified: stat.lastModified,
                                isFolder: false,
                                fullPath: item.name
                            });
                            return [3 /*break*/, 7];
                        case 6:
                            statError_1 = _f.sent();
                            console.warn("Could not get stats for ".concat(item.name, ":"), statError_1);
                            // Incluir el archivo sin stats
                            items.push({
                                name: item.name.split('/').pop() || '',
                                size: 0,
                                isFolder: false,
                                fullPath: item.name
                            });
                            return [3 /*break*/, 7];
                        case 7:
                            _b = true;
                            return [3 /*break*/, 2];
                        case 8: return [3 /*break*/, 15];
                        case 9:
                            e_2_1 = _f.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 15];
                        case 10:
                            _f.trys.push([10, , 13, 14]);
                            if (!(!_b && !_c && (_d = stream_2.return))) return [3 /*break*/, 12];
                            return [4 /*yield*/, _d.call(stream_2)];
                        case 11:
                            _f.sent();
                            _f.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            if (e_2) throw e_2.error;
                            return [7 /*endfinally*/];
                        case 14: return [7 /*endfinally*/];
                        case 15:
                            tree = buildTree(items);
                            return [2 /*return*/, reply.send({ tree: tree })];
                        case 16:
                            error_2 = _f.sent();
                            console.error(error_2);
                            throw new bad_request_error_1.BadRequestError('Failed to list files in tree structure');
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
            // Ruta para listar contenido de una carpeta específica
            app
                .withTypeProvider()
                .get('/files/folder/:path', {
                schema: {
                    tags: ['Resources'],
                    summary: 'List contents of a specific folder',
                    params: zod_1.default.object({
                        path: zod_1.default.string().describe('Folder path (use "root" for root folder)')
                    }),
                    response: {
                        200: zod_1.default.object({
                            folder: zod_1.default.string(),
                            contents: zod_1.default.array(zod_1.default.union([
                                zod_1.default.object({
                                    name: zod_1.default.string(),
                                    type: zod_1.default.literal('file'),
                                    size: zod_1.default.number(),
                                    lastModified: zod_1.default.string(),
                                    path: zod_1.default.string()
                                }),
                                zod_1.default.object({
                                    name: zod_1.default.string(),
                                    type: zod_1.default.literal('folder'),
                                    path: zod_1.default.string()
                                })
                            ]))
                        }),
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var path, folderPath, stream, contents, _a, stream_3, stream_3_1, item, itemName, stat, statError_2, e_3_1, error_3;
                var _b, e_3, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 16, , 17]);
                            path = request.params.path;
                            folderPath = path === 'root' ? '' : "".concat(path, "/");
                            stream = minioClient.listObjects(BUCKET_NAME, folderPath, false);
                            contents = [];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 9, 10, 15]);
                            _a = true, stream_3 = __asyncValues(stream);
                            _e.label = 2;
                        case 2: return [4 /*yield*/, stream_3.next()];
                        case 3:
                            if (!(stream_3_1 = _e.sent(), _b = stream_3_1.done, !_b)) return [3 /*break*/, 8];
                            _d = stream_3_1.value;
                            _a = false;
                            item = _d;
                            if (!(item.name && item.name !== folderPath)) return [3 /*break*/, 7];
                            itemName = item.name.replace(folderPath, '');
                            if (!item.name.endsWith('/')) return [3 /*break*/, 4];
                            // Es una subcarpeta
                            contents.push({
                                name: itemName.slice(0, -1),
                                type: 'folder',
                                path: item.name.slice(0, -1)
                            });
                            return [3 /*break*/, 7];
                        case 4:
                            _e.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, minioClient.statObject(BUCKET_NAME, item.name)];
                        case 5:
                            stat = _e.sent();
                            contents.push({
                                name: itemName,
                                type: 'file',
                                size: stat.size,
                                lastModified: stat.lastModified.toISOString(),
                                path: item.name
                            });
                            return [3 /*break*/, 7];
                        case 6:
                            statError_2 = _e.sent();
                            console.warn("Could not get stats for ".concat(item.name, ":"), statError_2);
                            contents.push({
                                name: itemName,
                                type: 'file',
                                size: 0,
                                lastModified: new Date().toISOString(),
                                path: item.name
                            });
                            return [3 /*break*/, 7];
                        case 7:
                            _a = true;
                            return [3 /*break*/, 2];
                        case 8: return [3 /*break*/, 15];
                        case 9:
                            e_3_1 = _e.sent();
                            e_3 = { error: e_3_1 };
                            return [3 /*break*/, 15];
                        case 10:
                            _e.trys.push([10, , 13, 14]);
                            if (!(!_a && !_b && (_c = stream_3.return))) return [3 /*break*/, 12];
                            return [4 /*yield*/, _c.call(stream_3)];
                        case 11:
                            _e.sent();
                            _e.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            if (e_3) throw e_3.error;
                            return [7 /*endfinally*/];
                        case 14: return [7 /*endfinally*/];
                        case 15: return [2 /*return*/, reply.send({
                                folder: path === 'root' ? '/' : path,
                                contents: contents
                            })];
                        case 16:
                            error_3 = _e.sent();
                            console.error(error_3);
                            throw new bad_request_error_1.BadRequestError('Failed to list folder contents');
                        case 17: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
