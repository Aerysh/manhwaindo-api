import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import AnoboyInfo from './info';
import AnoboySearch from './search';
import AnoboyUrlHelper from './url-helper';
import AnoboyWatch from './watch';

const Anoboy = async (fastify: FastifyInstance) => {
  await fastify.register(AnoboyInfo, { prefix: '/info' });
  await fastify.register(AnoboySearch, { prefix: '/search' });
  await fastify.register(AnoboyWatch, { prefix: '/watch' });

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Anoboy'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.status(200).send({
        message: `Welcome to Anoboy API! Please visit them at ${AnoboyUrlHelper.base}`,
        routes: [
          { name: 'Anime Details', path: '/info/:endpoint' },
          { name: 'Anime Search', path: '/search/:query/:page' },
          { name: 'Watch Anime Episodes', path: '/watch/:endpoint' },
        ],
      });
    },
  );
};

export default Anoboy;
