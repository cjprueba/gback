const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

// Registrar el plugin multipart
fastify.register(require('@fastify/multipart'));

fastify.get('/', async (request, reply) => {
  return { message: 'Hello from Fastify in Docker!' };
});

// Nueva ruta para subir archivos (modificada)
fastify.post('/upload', async (request, reply) => {
  const data = await request.file({
    limits: {
      fileSize: 10 * 1024 * 1024 // Límite de 10MB
    },
    allow: ['application/pdf', 'image/*'] // Tipos MIME permitidos
  });
  
  const uploadDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
  
  const filePath = path.join(uploadDir, data.filename);
  await fs.promises.writeFile(filePath, await data.toBuffer());
  
  return { message: 'Archivo subido exitosamente', filename: data.filename };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();