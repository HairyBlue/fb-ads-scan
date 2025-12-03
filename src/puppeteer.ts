import puppeteer, { LaunchOptions, Browser, Page } from 'puppeteer';
import { FbAdsScanner } from './fb-ads-scanner';

export class PuppeteerInstance {
  private launchOptions: LaunchOptions;
  private browserType: 'chrome' | 'firefox';
  private page!: Page;
  private browser!: Browser;
  private scannerWatch!: FbAdsScanner;

  constructor(launchOptions: LaunchOptions, browserType: 'chrome' | 'firefox' = 'chrome') {
    this.launchOptions = launchOptions;
    this.browserType = browserType;

  }

accessScanner(scanner: FbAdsScanner) {
   this.scannerWatch = scanner;
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

  async setRequestInterception(page: Page, cb1: any, cb2: any) {
    await page.setRequestInterception(true);

    page.on('request', (req) => {
      req.continue();
    });

    page.on('response', (res) =>  {
      cb1(res, cb2);
    });
  }


async setAutoScroll(
   page: Page,
   distance: number = 100,
   intervalMs: number = 100,
   maxScrollTimeoutMs: number = 3600000
): Promise<"scroll_done" | "scroll_timeout" | "scroll_error"> {

 try {
   const result = await page.evaluate(
     async ({ distance, intervalMs, maxScrollTimeoutMs}) => {
       return new Promise<"scroll_done" | "scroll_error">((resolve, reject) => {
         try {
           let totalHeight = 0;

           const timer = setInterval(async () => {
             const scrollHeight = document.body.scrollHeight;
             window.scrollBy(0, distance);
             totalHeight += distance;

             const doneFlag = await (window as any).getDoneFlag();

             if (doneFlag || totalHeight >= scrollHeight) {
               clearInterval(timer);
               resolve("scroll_done");
             }
           }, intervalMs);
            // setTimeout(() => {
            //    clearInterval(timer);
            //    reject("scroll_timeout");
            //  }, maxScrollTimeoutMs);
         } catch (err) {
           reject("scroll_error");
         }
       });
     },
     { distance, intervalMs, maxScrollTimeoutMs }
   );

   return result;

 } catch (err) {
   console.error("Scroll evaluation error:", err);
   return "scroll_error";
 }
}

}
