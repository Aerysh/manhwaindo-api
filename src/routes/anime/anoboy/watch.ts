import launchBrowser from '@utils/puppeteer';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions,
} from 'fastify';

import AnoboyUrlHelper from './url-helper';

const opts: RouteShorthandOptions = {
  schema: {
    tags: ['Anoboy'],
    params: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
      },
    },
  },
};

const AnoboyWatch = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { endpoint: string } }>(
    '/:endpoint',
    opts,
    async (
      request: FastifyRequest<{ Params: { endpoint: string } }>,
      reply: FastifyReply,
    ) => {
      let browser;
      let page;
      try {
        browser = await launchBrowser();
        page = await browser.newPage();

        await page
          .goto(`${AnoboyUrlHelper.watch(request.params.endpoint)}`, {
            waitUntil: 'networkidle0',
          })
          .catch((error) => {
            console.error(error);
            reply.status(500).send({
              message: 'Failed to load the page, please try again later.',
            });
            return;
          });

        const videoInfo = await page.evaluate(() => {
          const iframe = document.querySelector(
            '#pembed iframe',
          ) as HTMLIFrameElement;

          return {
            id: window.location.href?.split('/')[3],
            source: iframe ? iframe.src : null,
          };
        });

        if (!videoInfo.source) {
          reply.status(404).send({
            message: `The page you're looking for doesn't exist.`,
          });
        }

        reply.status(200).send(videoInfo);
      } catch (error) {
        console.error(error);
        reply.status(500).send({
          message: 'An unexpected error occurred, please try again later.',
        });
      } finally {
        if (page) {
          await page.close().catch(console.error);
        }
        if (browser) {
          await browser.close().catch(console.error);
        }
      }
    },
  );
};

export default AnoboyWatch;
