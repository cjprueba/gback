const fastify = require('fastify')({ logger: true })

// Definimos nuestra ruta
fastify.get('/', async (request, reply) => {
  return { Hello: 'World' }
})

// Ejecutamos el servidor
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()