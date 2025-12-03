import { fbAdsLibraryUrl, defaultChromeArgs, defaultFbAdsQrP } from '../constant';
import { LaunchOptions, Page } from 'puppeteer';
import { PuppeteerInstance } from '../puppeteer';
import { FbAdsScanner } from '../fb-ads-scanner';

const customArgs: string[] = [];
const setArgs = new Set(defaultChromeArgs.concat(customArgs));
const useArgs: string[] = [...setArgs];

const launchOptions: LaunchOptions = {
  headless: true,
  slowMo: 200,
  args: [
   '--no-sandbox',
   '--disable-setuid-sandbox',
   '--disable-blink-features=AutomationControlled',
   '--disable-dev-shm-usage'
  ],
   protocolTimeout: 3600000 // 1hr
};

const location = 'Huel';
const pageId = '282592881929497';
const maxAdds = 2; // 0 is no limit
const baseUrl = cleanUrl(fbAdsLibraryUrl);


function cleanUrl(url: string) {
  return url.replace(/\/$/, '') + '/';
}

const scrapper = new PuppeteerInstance(launchOptions);
const scanner = new FbAdsScanner(location, pageId, maxAdds, baseUrl, defaultFbAdsQrP, scrapper);

async function start() {
  scrapper.accessScanner(scanner);
  await scrapper.launchBrowser();

  scanner.initialBuild();
  scanner.startCollection();
}

export { start };
