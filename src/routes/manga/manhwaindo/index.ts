import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import ManhwaindoInfo from './info';
import ManhwaindoRead from './read';
import ManhwaindoSearch from './search';
import ManhwaindoUrlHelper from './url-helper';

const Manhwaindo = async (fastify: FastifyInstance) => {
  await fastify.register(ManhwaindoInfo, { prefix: '/info' });
  await fastify.register(ManhwaindoRead, { prefix: '/read' });
  await fastify.register(ManhwaindoSearch, { prefix: '/search' });

  fastify.get(
    '/',
    {
      schema: {
        tags: ['ManhwaIndo'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.status(200).send({
        message: `Welcome to ManhwaIndo API! Please visit them at ${ManhwaindoUrlHelper.base}`,
        routes: [
          { name: 'Manga Details', path: '/info/:endpoint' },
          { name: 'Get Manga Chapter', path: '/read/:endpoint' },
          { name: 'Manga Search', path: '/search/:query/:page' },
        ],
      });
    },
  );
};

export default Manhwaindo;
