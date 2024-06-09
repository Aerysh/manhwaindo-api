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

const AnoboyInfo = async (fastify: FastifyInstance) => {
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

        const response = await page
          .goto(AnoboyUrlHelper.info(request.params.endpoint), {
            waitUntil: 'networkidle0',
          })
          .catch((error) => {
            console.error(error);
            reply.status(500).send({
              message: 'Failed to load the page, please try again later.',
            });
            return;
          });

        if (response && response.status() === 404) {
          reply.status(404).send({
            message: 'The page you are looking for was not found',
          });
          return;
        }

        const animeInfo = await page.evaluate(() => {
          if (typeof window === 'undefined')
            throw new Error('window does not exiest');

          const additionalInfoSpans = Array.from(
            document.querySelectorAll('.info-content span'),
          ).map((span) => span.textContent);
          let type;
          let releaseDate;
          let status;

          for (const span of additionalInfoSpans) {
            if (span) {
              const [key, value] = span.split(':').map((part) => part.trim());
              if (key === 'Type') type = value;
              if (key === 'Status') status = value;
              if (key === 'Released on') releaseDate = value;
            }
          }

          const genres = Array.from(document.querySelectorAll('.genxed a')).map(
            (link) => link.textContent,
          );

          const episodes = Array.from(
            document.querySelectorAll('.eplister li'),
          ).map((li) => {
            const id = li
              .querySelector('a')
              ?.getAttribute('href')
              ?.split('/')[3];
            const episodeNumber = li.querySelector('.epl-num')?.textContent;
            const url = li.querySelector('a')?.getAttribute('href');
            return {
              id,
              episodeNumber,
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
              .querySelector('.alter')
              ?.textContent?.split(', '),
            episodes,
          };
        });

        reply.status(200).send(animeInfo);
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

export default AnoboyInfo;
