"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_1 = require("fastify");
var swagger_1 = require("@fastify/swagger");
var swagger_ui_1 = require("@fastify/swagger-ui");
var cors_1 = require("@fastify/cors");
var fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
var error_handler_1 = require("./error-handler");
var test_get_route_1 = require("./routes/auth/test-get-route");
var test_getData_route_1 = require("./routes/auth/test-getData-route");
var test_post_route_1 = require("./routes/auth/test-post-route");
var create_profile_1 = require("./routes/user/create-profile");
// division
var create_1 = require("./routes/division/create");
// departamento
var create_2 = require("./routes/departamento/create");
// unidad
var create_3 = require("./routes/unidad/create");
// user
var register_1 = require("./routes/user/register");
// resources
//import { uploadFile } from './routes/resources/upload-file';
//import { deleteFile } from './routes/resources/delete-file';
//import { downloadFile } from './routes/resources/download-file';
//import { getTree } from './routes/resources/get-tree';
// etapas
var etapas_1 = require("./routes/etapas/etapas");
var etapas_tipo_1 = require("./routes/etapas/etapas-tipo");
// provincias
var provincias_1 = require("./routes/provincias/provincias");
// comunas
var comunas_1 = require("./routes/comunas/comunas");
// regiones
var regiones_1 = require("./routes/regiones/regiones");
// tipos obra
var tipos_obra_1 = require("./routes/tipos-obra/tipos-obra");
// tipos iniciativas
var tipos_iniciativas_1 = require("./routes/tipos-iniciativas/tipos-iniciativas");
//proyectos
var proyectos_1 = require("./routes/proyectos/proyectos");
//carpetas
var carpetas_1 = require("./routes/carpetas/carpetas");
//documentos
var documentos_1 = require("./routes/documentos/documentos");
//busqueda
var busqueda_1 = require("./routes/busqueda/busqueda");
//health
var health_1 = require("./routes/health/health");
var app = (0, fastify_1.fastify)().withTypeProvider();
app.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
app.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
app.setErrorHandler(error_handler_1.errorHandler);
app.register(swagger_1.default, {
    openapi: {
        info: {
            title: 'Next.js SaaS',
            description: 'Full-stack SaaS app with multi-tenancy & RBAC',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: fastify_type_provider_zod_1.jsonSchemaTransform,
});
app.register(swagger_ui_1.default, {
    routePrefix: '/docs',
});
// app.register(fastifyJwt, {
//   secret: env.JWT_SECRET,
// });
app.register(cors_1.default, {
    origin: true, // Permite todas las origenes en desarrollo
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
});
app.register(test_get_route_1.testRoute);
app.register(test_post_route_1.testPostRoute);
app.register(test_getData_route_1.testGetDataRoute);
//app.register(uploadFile);
//app.register(getTree);
app.register(create_profile_1.createProfile);
app.register(create_1.createDivision);
app.register(create_2.createDepartamento);
app.register(create_3.createUnidad);
app.register(register_1.registerUser);
//app.register(deleteFile);
//app.register(downloadFile);
app.register(etapas_1.etapasRoutes);
app.register(etapas_tipo_1.etapasTipoRoutes);
app.register(provincias_1.provinciaRoutes);
app.register(comunas_1.comunaRoutes);
app.register(regiones_1.regionesRoutes);
app.register(tipos_obra_1.tiposObraRoutes);
app.register(tipos_iniciativas_1.tiposIniciativas);
app.register(proyectos_1.proyectosRoutes);
app.register(carpetas_1.carpetasRoutes);
app.register(documentos_1.documentosRoutes);
app.register(busqueda_1.busquedaRoutes);
app.register(health_1.healthRoute);
app.listen({ port: 3000, host: "0.0.0.0" }).then(function () {
    console.log('HTTP server running!');
});
