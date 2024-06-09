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
        query: { type: 'string' },
        page: { type: 'number', default: 1 },
      },
    },
  },
};

const ManhwaindoSearch = async (fastify: FastifyInstance) => {
  fastify.get<{ Params: { query: string; page: number } }>(
    '/:query/:page',
    opts,
    async (
      request: FastifyRequest<{ Params: { query: string; page: number } }>,
      reply: FastifyReply,
    ) => {
      let browser;
      let page;
      try {
        browser = await launchBrowser();
        page = await browser.newPage();

        const query = encodeURI(request.params.query);
        const pageNumber = request.params.page || 1;

        await page.goto(ManhwaindoUrlHelper.search(query, pageNumber), {
          waitUntil: 'networkidle0',
        });

        await page.waitForSelector('img', { timeout: 3000 });

        const searchResult = await page.evaluate(() => {
          const list = Array.from(document.querySelectorAll('.listupd .bs'));

          return list.map((el) => {
            const id = el
              .querySelector('a')
              ?.getAttribute('href')
              ?.split('/')[4];
            const title = el.querySelector('a')?.getAttribute('title') || '';
            const url = el.querySelector('a')?.getAttribute('href');
            const thumbnail = el
              .querySelector('.ts-post-image')
              ?.getAttribute('src');

            return {
              id,
              title,
              url,
              thumbnail,
            };
          });
        });

        if (searchResult.length === 0) {
          reply.status(404).send({
            message: `No results found for the query "${request.params.query}"`,
          });
        }

        reply.status(200).send(searchResult);
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

export default ManhwaindoSearch;
