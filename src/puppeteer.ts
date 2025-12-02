import puppeteer, { LaunchOptions, Browser, Page } from 'puppeteer';

export class PuppeteerInstance {
  private launchOptions: LaunchOptions;
  private browserType: 'chrome' | 'firefox';
  private page!: Page;
  private browser!: Browser;

  constructor(launchOptions: LaunchOptions, browserType: 'chrome' | 'firefox' = 'chrome') {
    this.launchOptions = launchOptions;
    this.browserType = browserType;
  }

  private async useBrowser(): Promise<Browser> {
    const options = this.launchOptions;
    return await puppeteer.launch(Object.assign({}, options, { browser: this.browserType }));
  }

  async launchBrowser() {
    const browserInstanse = await this.useBrowser();
    this.browser = browserInstanse;
    // return browserInstanse;
  }

  getBrowser(): Browser {
    if (!this.browser) {
      throw new Error('Need to launch first');
    }

    return this.browser;
  }

  getInitialPage() {
    if (!this.page) {
      throw new Error('Need to new Page');
    }

    return this.page;
  }

  async newPage(): Promise<Page> {
    const page = await this.browser.newPage();
    if (!this.page) {
      this.page = page;
    }

    return page;
  }

  async pageGoTo(page: Page, url: string, timeout: number = 180_000) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout });
  }

  async setRequestInterception(page: Page, cb: any) {
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      req.continue();
    });

    page.on('response', (res) => [cb(res)]);
  }

  async setAutoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const intervalId = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(intervalId);
            resolve();
          }
        }, 100);
      });
    });

    await page.close();
  }
}
