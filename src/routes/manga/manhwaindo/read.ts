import launchBrowser from '@utils/puppeteer';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions,
} from 'fastify';


import ManhwaindoUrlHelper from './url-helper';

const opts: RouteShorthandOptions = {
  schema: {
    tags: ['ManhwaIndo'],
    params: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
      },
    },
  },
};

const ManhwaindoRead = async (fastify: FastifyInstance) => {
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

        await page.goto(ManhwaindoUrlHelper.read(request.params.endpoint), {
          waitUntil: 'networkidle0',
        });

        const chapterInfo = await page.evaluate(() => {
          const imageElements = Array.from(
            document.querySelectorAll('#readerarea img'),
          );
          return imageElements.map((imageElement) => ({
            id: `image_${Math.random().toString(36).substring(2, 10)}`, // Random ID cuz if I only return image src it's kinda boring
            src: imageElement.getAttribute('data-lazy-src'),
          }));
        });

        if (chapterInfo.length === 0) {
          reply.status(404).send({
            message: 'The page you are looking for does not exist.',
          });
        }

        reply.status(200).send(chapterInfo);
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

export default ManhwaindoRead;
