import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import KusonimeInfo from './info';
import KusonimeSearch from './search';
import KusonimeUrlHelper from './url-helper';
import KusonimeWatch from './watch';

const Kusonime = async (fastify: FastifyInstance) => {
  await fastify.register(KusonimeInfo, { prefix: '/info' });
  await fastify.register(KusonimeSearch, { prefix: '/search' });
  await fastify.register(KusonimeWatch, { prefix: '/watch' });

  fastify.get(
    '/',
    {
      schema: {
        tags: ['Kusonime'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.status(200).send({
        message: `Welcome to Kusonime API! Please visit them at ${KusonimeUrlHelper.base}`,
        routes: [
          { name: 'Anime Details', path: '/info/:endpoint' },
          { name: 'Anime Search', path: '/search/:query/:page' },
          { name: 'Watch Anime Episodes', path: '/watch/:endpoint' },
        ],
      });
    },
  );
};

export default Kusonime;
