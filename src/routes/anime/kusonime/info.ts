import launchBrowser from '@utils/puppeteer'
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteShorthandOptions,
} from 'fastify';

import KusonimeUrlHelper from './url-helper';

const opts: RouteShorthandOptions = {
  schema: {
    tags: ['Kusonime'],
    params: {
      type: 'object',
      properties: {
        endpoint: { type: 'string' },
      },
    },
  },
};

const KusonimeInfo = async (fastify: FastifyInstance) => {
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
          KusonimeUrlHelper.info(request.params.endpoint),
          {
            waitUntil: 'networkidle0',
          },
        );

        if (response && response.status() === 404) {
          throw new Error();
        }

        const animeInfo = await page.evaluate(() => {
          if (typeof window === 'undefined')
            throw new Error('window does not exists');

          const additionalInfoTags = Array.from(
            document.querySelectorAll('.info p'),
          ).map((p) => p.textContent);

          let releaseDate;
          let genres;
          let type;
          let status;

          let alternativeTitle;

          for (const tag of additionalInfoTags) {
            if (tag) {
              const [key, value] = tag.split(':').map((part) => part.trim());
              if (key === 'Released on') releaseDate = value;
              if (key === 'Type') type = value;
              if (key === 'Status') status = value;
              if (key === 'Japanese') alternativeTitle = value;
              if (key === 'Genre') genres = value;
            }
          }

          const lexotElement = document.querySelector('.lexot');
          if (!lexotElement) return null;

          const excludeClasses = ['.info', '.clear'];
          const excludeTags = ['b'];
          const descriptionElements = Array.from(
            lexotElement.querySelectorAll('p'),
          )
            .filter(
              (p) => !excludeClasses.some((cls) => p.classList.contains(cls)),
            )
            .filter(
              (p) =>
                !excludeTags.some(
                  (tag) => p.getElementsByTagName(tag).length > 0,
                ),
            );

          return {
            id: window.location.href?.split('/')[4],
            title: document.querySelector('h1.jdlz')?.textContent,
            url: window.location.href,
            thumbnail: document
              .querySelector('img.attachment-thumb-large')
              ?.getAttribute('src'),
            releaseDate,
            description: descriptionElements
              .map((p) => p.textContent?.trim())
              .join('\n'),
            genres,
            type,
            status,
            alternativeTitle,
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

export default KusonimeInfo;
