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

const ManhwaindoInfo = async (fastify: FastifyInstance) => {
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

        const response = await page.goto(
          ManhwaindoUrlHelper.info(request.params.endpoint),
          {
            waitUntil: 'networkidle0',
          },
        );

        await page.waitForSelector('img', { timeout: 3000 });

        if (response && response.status() === 404) {
          reply.status(404).send({
            message: 'The page you are looking for was not found',
          });
          return;
        }

        const mangaInfo = await page.evaluate(() => {
          if (typeof window === 'undefined')
            throw new Error('window does not exists');

          const additionalInfo = Array.from(
            document.querySelectorAll('.tsinfo div'),
          ).map((div) => div.textContent);

          let releaseDate;
          let status;
          let type;

          for (const div of additionalInfo) {
            if (div) {
              const [key, value] = div.split(' ').map((part) => part.trim());
              if (key === 'Status') status = value;
              if (key === 'Released') releaseDate = value; // sometimes an entry doesn't have release date
              if (key === 'Type') type = value;
            }
          }

          const genres = Array.from(document.querySelectorAll('.mgen a')).map(
            (link) => link.textContent,
          );

          const chapters = Array.from(
            document.querySelectorAll('.eplister li'),
          ).map((li) => {
            const id = li
              .querySelector('a')
              ?.getAttribute('href')
              ?.split('/')[3];
            const chapterNumber = li.querySelector('.chapternum')?.textContent;
            const url = li.querySelector('a')?.getAttribute('href');
            return {
              id,
              chapterNumber,
              url,
            };
          });

          return {
            id: window.location.href?.split('/')[4],
            title: document.querySelector('.entry-title')?.textContent,
            url: window.location.href,
            thumbnail: document
              .querySelector('.thumb img')
              ?.getAttribute('src'),
            releaseDate,
            description: document.querySelector('.entry-content')?.textContent,
            genres,
            type,
            status,
            alternativeTitle: document
              .querySelector('.alternative')
              ?.textContent?.split(':')[1]
              .split(', '),
            chapters,
          };
        });

        reply.status(200).send(mangaInfo);
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

export default ManhwaindoInfo;
