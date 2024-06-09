import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import Anime from '@routes/anime';
import Manga from '@routes/manga';
import dotenv from 'dotenv';
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from 'fastify';


dotenv.config();

const fastify: FastifyInstance = Fastify({
  logger: false,
});

(async () => {
  const PORT = Number(process.env.PORT) || 3000;

  await fastify.register(fastifyCors, { origin: '*', methods: 'GET' });
  await fastify.register(fastifySwagger);
  await fastify.register(fastifySwaggerUi);

  await fastify.register(Anime, { prefix: '/anime' });
  await fastify.register(Manga, { prefix: '/manga' });

  try {
    fastify.get('/', (request: FastifyRequest, reply: FastifyReply) => {
      reply.status(200).send({
        message: 'Yet Another API for Anime and Stuff',
        repository: 'https://github.com/Aerysh/yaaas',
        routes: [
          { name: 'Documentation', path: '/documentation' },
          { name: 'Anime', path: '/anime' },
          { name: 'Manga', path: '/manga' },
        ],
      });
    });

    fastify.listen({ port: PORT, host: '0.0.0.0' }, (e, address) => {
      if (e) throw e;
      console.log(`server listening on ${address}`);
    });
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
})();
