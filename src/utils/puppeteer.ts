import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

const launchBrowser = async () => {
  try {
    puppeteer.use(StealthPlugin());

    const browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
      ],
    });
    return browserInstance;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export default launchBrowser;
