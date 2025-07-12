import { fastify } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import fastifyMultipart  from '@fastify/multipart';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { errorHandler } from './error-handler';
import { testRoute } from './routes/auth/test-get-route';
import { testGetDataRoute } from './routes/auth/test-getData-route';
import { testPostRoute } from './routes/auth/test-post-route';

import { createProfile } from './routes/user/create-profile';

// division
import { createDivision } from './routes/division/create';

// departamento
import { createDepartamento } from './routes/departamento/create';

// unidad
import { createUnidad } from './routes/unidad/create';

// user
import { registerUser } from './routes/user/register';

// resources
import { uploadFile } from './routes/resources/upload-file';
import { deleteFile } from './routes/resources/delete-file';
import { downloadFile } from './routes/resources/download-file';
import { getTree } from './routes/resources/get-tree';

// etapas
import { etapasRoutes } from './routes/etapas/etapas';
import { etapasTipoRoutes } from './routes/etapas/etapas-tipo';

// provincias
import { provinciaRoutes } from './routes/provincias/provincias';

// comunas
import { comunaRoutes } from './routes/comunas/comunas';

// regiones
import { regionesRoutes } from './routes/regiones/regiones';

// tipos obra
import { tiposObraRoutes } from './routes/tipos-obra/tipos-obra';

// tipos iniciativas
import { tiposIniciativas } from './routes/tipos-iniciativas/tipos-iniciativas';

//proyectos
import { proyectosRoutes } from './routes/proyectos/proyectos';

//carpetas
import { carpetasRoutes } from './routes/carpetas/carpetas';

//documentos
import { documentosRoutes } from './routes/documentos/documentos';

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.setErrorHandler(errorHandler);

app.register(fastifySwagger, {
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
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

// app.register(fastifyJwt, {
//   secret: env.JWT_SECRET,
// });


app.register(fastifyCors);
app.register(testRoute);
app.register(testPostRoute);
app.register(testGetDataRoute);
app.register(uploadFile);
app.register(getTree);
app.register(createProfile);
app.register(createDivision);
app.register(createDepartamento);
app.register(createUnidad);
app.register(registerUser);
app.register(deleteFile);
app.register(downloadFile);
app.register(etapasRoutes);
app.register(etapasTipoRoutes);
app.register(provinciaRoutes);
app.register(comunaRoutes);
app.register(regionesRoutes);
app.register(tiposObraRoutes);
app.register(tiposIniciativas);
app.register(proyectosRoutes);
app.register(carpetasRoutes);
app.register(documentosRoutes);
app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log('HTTP server running!');
});
