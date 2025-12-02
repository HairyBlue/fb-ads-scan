import { fbAdsLibraryUrl, defaultChromeArgs, defaultFbAdsQrP } from '../constant';
import { LaunchOptions, Page } from 'puppeteer';
import { PuppeteerInstance } from '../puppeteer';
import { FbAdsScanner } from '../fb-ads-scanner';

const customArgs: string[] = [];
const setArgs = new Set(defaultChromeArgs.concat(customArgs));
const useArgs: string[] = [...setArgs];

const launchOptions: LaunchOptions = {
  headless: false,
  slowMo: 200,
  // args: useArgs,
};

const location = 'Huel';
const pageId = '282592881929497';
const baseUrl = cleanUrl(fbAdsLibraryUrl);

function cleanUrl(url: string) {
  return url.replace(/\/$/, '') + '/';
}

const scrapper = new PuppeteerInstance(launchOptions);
const scanner = new FbAdsScanner(location, pageId, 0, baseUrl, defaultFbAdsQrP, scrapper);

async function start() {
  await scrapper.launchBrowser();

  scanner.initialBuild();
  scanner.startCollection();
}

export { start };
