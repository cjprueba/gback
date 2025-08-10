"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
var zod_1 = require("zod");
var bad_request_error_1 = require("./routes/_errors/bad-request-error");
var unauthorized_error_1 = require("./routes/_errors/unauthorized-error");
var errorHandler = function (error, request, reply) {
    if (error instanceof zod_1.ZodError) {
        return reply.status(400).send({
            message: 'Validation error',
            errors: error.flatten().fieldErrors,
        });
    }
    if (error instanceof bad_request_error_1.BadRequestError) {
        return reply.status(400).send({
            message: error.message,
        });
    }
    if (error instanceof unauthorized_error_1.UnauthorizedError) {
        return reply.status(401).send({
            message: error.message,
        });
    }
    console.error(error);
    // send error to some observability platform
    // like Sentry or Datadog
    return reply.status(500).send({
        message: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
