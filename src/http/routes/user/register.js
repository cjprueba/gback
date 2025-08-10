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
exports.registerUser = registerUser;
var prisma_1 = require("@/lib/prisma");
var zod_1 = require("zod");
var bad_request_error_1 = require("../_errors/bad-request-error");
function registerUser(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app
                .withTypeProvider()
                .post('/user/register', {
                schema: {
                    tags: ['User Authentication'],
                    summary: 'Register a new user',
                    body: zod_1.default.object({
                        nombre_completo: zod_1.default.string().min(1).max(100),
                        correo_electronico: zod_1.default.string().email().max(50),
                        perfil_id: zod_1.default.number().int().positive(),
                        division_id: zod_1.default.number().int().positive().optional(),
                        departamento_id: zod_1.default.number().int().positive().optional(),
                        unidad_id: zod_1.default.number().int().positive().optional()
                    }),
                    response: {
                        201: zod_1.default.object({
                            message: zod_1.default.string(),
                            user: zod_1.default.object({
                                id: zod_1.default.number(),
                                nombre_completo: zod_1.default.string().nullable(),
                                correo_electronico: zod_1.default.string().nullable()
                            })
                        }),
                        400: zod_1.default.object({
                            message: zod_1.default.string()
                        })
                    }
                }
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, nombre_completo, correo_electronico, perfil_id, division_id, departamento_id, unidad_id, existingUser, user;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = request.body, nombre_completo = _a.nombre_completo, correo_electronico = _a.correo_electronico, perfil_id = _a.perfil_id, division_id = _a.division_id, departamento_id = _a.departamento_id, unidad_id = _a.unidad_id;
                            return [4 /*yield*/, prisma_1.prisma.usuarios.findUnique({
                                    where: { correo_electronico: correo_electronico }
                                })];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                throw new bad_request_error_1.BadRequestError('Email already exists');
                            }
                            return [4 /*yield*/, prisma_1.prisma.usuarios.create({
                                    data: {
                                        nombre_completo: nombre_completo,
                                        correo_electronico: correo_electronico,
                                        perfil_id: Number(perfil_id), // Explicitly convert to Number if needed
                                        division_id: division_id ? Number(division_id) : null,
                                        departamento_id: departamento_id ? Number(departamento_id) : null,
                                        unidad_id: unidad_id ? Number(unidad_id) : null
                                    }
                                })];
                        case 2:
                            user = _b.sent();
                            return [2 /*return*/, reply.status(201).send({
                                    message: 'User registered successfully',
                                    user: {
                                        id: user.id,
                                        nombre_completo: user.nombre_completo,
                                        correo_electronico: user.correo_electronico
                                    }
                                })];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
