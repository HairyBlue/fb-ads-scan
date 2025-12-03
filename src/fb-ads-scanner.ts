import { LaunchOptions, Browser, Page, HTTPResponse } from 'puppeteer';
import { PuppeteerInstance } from './puppeteer';

import * as fs from 'fs';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collections');

function readFile(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function fileWrite(path: string, data: { [key: string]: any }) {
  if (!fs.existsSync(collectionPath)) {
    fs.mkdirSync(collectionPath);
  }
}

interface IPageMetaData {
   page_id: string
   name: string
   last_sync: number
   ad_archive_ids: string[]
}

export class FbAdsScanner {
  private location: string;
  private pageId: string;
  private maxAds: number;
  private baseUrl: string;
  private qeuryParams: { [key: string]: any };
  private scrapper: PuppeteerInstance;

  private scanUrl: string = '';
  private pageCollectionPath: string = '';
  private pageMetaDataFile: string = '';
  private pageAdsDataFile: string = '';

  private pageMetaData!: IPageMetaData;
  private pageAdsData: Map<string, {[key: string]: any}> = new Map();

  private newAdsCount = 0;
  doneCollection = false;

  constructor(
    location: string,
    pageId: string,
    maxAds: number,
    baseUrl: string,
    qeuryParams: { [key: string]: any },
    scrapper: PuppeteerInstance
  ) {
    this.maxAds = maxAds;
    this.location = location;
    this.pageId = pageId;
    this.baseUrl = baseUrl;
    this.qeuryParams = qeuryParams;
    this.scrapper = scrapper;

    const checks = [location, pageId, baseUrl, qeuryParams];

    for (const check of checks) {
      if (!check) {
        throw new Error('Args must have a value');
      }
    }

    if (maxAds < 0) {
      throw new Error('Max ads should not be less than to zero');
    }

    const me = this;
    me.initialBuild();
  }

  private setScanUrl() {
    const newQuery = Object.assign({}, this.qeuryParams, { view_all_page_id: this.pageId });
    const params = new URLSearchParams(newQuery).toString();
    this.scanUrl = this.baseUrl + '?' + params;
  }

  private setSaveDir() {
    if (!fs.existsSync(collectionPath)) {
      fs.mkdirSync(collectionPath);
    }

    this.pageCollectionPath = path.join(collectionPath, `${this.location}_${this.pageId}`);
    if (!fs.existsSync(this.pageCollectionPath)) {
      fs.mkdirSync(this.pageCollectionPath);
    }

    this.pageMetaDataFile = path.join(this.pageCollectionPath, 'page-meta-data.json');
    this.pageAdsDataFile = path.join(this.pageCollectionPath, 'page-ads-data.json');
  }

  private setPreviousData() {
    if (!fs.existsSync(this.pageMetaDataFile) && !fs.existsSync(this.pageAdsDataFile)) {
      return;
    }

    this.pageMetaData = readFile(this.pageMetaDataFile);
    const adsData = readFile(this.pageAdsDataFile);
    const ad_archive_ids: string[] = [];

    for (const ad_archive_id in adsData) {
      this.pageAdsData.set(ad_archive_id, adsData[ad_archive_id]);
      ad_archive_ids.push(ad_archive_id)
    }

    this.pageMetaData.ad_archive_ids = ad_archive_ids;
  }

  private checkIfValidToSave(ad_archive_id: string, result: any): boolean {
   if (!this.pageAdsData.has(ad_archive_id)) {
      return true;
   }

   const prev = this.pageAdsData.get(ad_archive_id) as any;
   return prev.end_date !== result.end_date;
  }

  private handleDataReads(page: Page) {
   return (data: any) => {
      const mapKeys = ["ad_library_main", "search_results_connection", "edges"];
      const ignoreKey = "dynamic_filter_options";
      if (data.data) {
         let mapData = data.data;
         let prev = data.data;
   
         for (const key of mapKeys) {
            if (mapData[ignoreKey]) {
              return;
            }
        
            if (mapData) {
              mapData = mapData[key];
            }
        
            if (!mapData) {
              throw new Error(
                "It doesn't properly map the Ads, probably FB changed the structure\n" +
                  JSON.stringify(Object.entries(prev))
              );
            }
        
            prev = mapData;
          }
   
   
         // THis should be the edges now, should be an array
         if (Array.isArray(mapData)) {
           for (const egde of mapData) {
            const node = egde.node;
            const results = node.collated_results;
   
            if (Array.isArray(results)) {
               for (const result of results) {
                  const ad_archive_id = String(result.ad_archive_id);
                  const isValid = this.checkIfValidToSave(ad_archive_id, result);
                  if (!isValid) continue

                  this.pageAdsData.set(ad_archive_id, result);
                  this.pageMetaData.ad_archive_ids.push(ad_archive_id);
                  this.newAdsCount++;

                  if (this.maxAds > 0 && this.newAdsCount >= this.maxAds && !this.doneCollection) {
                     this.doneCollection = true;
                     return;
                  }
               }
            }

            if (this.doneCollection) {
               return
            }

           }
         } else {
            console.warn("Edge is emtpy or not found")
         }
      }
   }

  }

  private async responseReader(res: HTTPResponse, cb: any) {
   const url = res.url();
   if (url.indexOf('/api/graphql/') >= 0) {
      const data = await res.json();
      cb(data);
      // fs.appendFileSync('../sample.json', JSON.stringify(data, null, 4));
   }
  }

  initialBuild() {
    this.setScanUrl();
    this.setSaveDir();
    this.setPreviousData();

    if (!this.pageMetaData) {
      this.pageMetaData = {
         page_id: this.pageId,
         name: this.location,
         last_sync: 0, // 0 means no sync, wala na ads data nakuha ha! Gamit tag Date.now() dinhia ha
         ad_archive_ids: [],
      }
    }
  }

async startCollection() {
   try {
     const page = await this.scrapper.newPage();
     await this.scrapper.pageGoTo(page, this.scanUrl);
 
     const responseReader = this.responseReader.bind(this);
     const handleData = this.handleDataReads(page);
 
     await this.scrapper.setRequestInterception(page, responseReader, handleData);
 
     await page.exposeFunction('getDoneFlag', () => this.doneCollection);
     const result = await this.scrapper.setAutoScroll(page);
 
     if (result === "scroll_done") {
       await this.syncData(page);
     }
 
   } catch (e) {
     console.error(e);
   }
 }

 
  async syncData(page: Page) {
   if (this.newAdsCount > 0) {
      this.pageMetaData.last_sync = Date.now();
      console.log(this.pageMetaData, this.newAdsCount);

      fs.writeFileSync(this.pageMetaDataFile, JSON.stringify(this.pageMetaData, null, 4));
      fs.writeFileSync(this.pageAdsDataFile, JSON.stringify(Object.fromEntries(this.pageAdsData), null, 4))
   }

   if (page && !page.isClosed()) {
      await page.close();
   }
  }
}
