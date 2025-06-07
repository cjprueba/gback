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
import { uploadFile } from './routes/resources/upload-file';
import { createProfile } from './routes/user/create-profile';

// division
import { createDivision } from './routes/division/create';

// departamento
import { createDepartamento } from './routes/departamento/create';

// unidad
import { createUnidad } from './routes/unidad/create';

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
app.register(createProfile);
app.register(createDivision);
app.register(createDepartamento);
app.register(createUnidad);

app.listen({ port: 3000, host: "0.0.0.0" }).then(() => {
  console.log('HTTP server running!');
});
