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

  private pageMetaData: { [key: string]: any } = {};
  private pageAdsData: Map<string, { [key: string]: any }> = new Map();

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

    this.pageMetaDataFile = path.join(this.pageCollectionPath, 'page-meta-data');
    this.pageAdsDataFile = path.join(this.pageCollectionPath, 'page-odds-data');
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

  private handleDataReads(data: any) {
   if (data) {
     console.log(data);
     // TODO
     // read path data here
   }
  }

  private async responseReader(res: HTTPResponse) {
    const url = res.url();
    if (url.indexOf('/api/graphql/') >= 0) {
      const data = await res.json();
      this.handleDataReads(data);
      // fs.appendFileSync('../sample.json', JSON.stringify(data, null, 4));
    }
  }

  initialBuild() {
    this.setScanUrl();
    this.setSaveDir();
    this.setPreviousData();

    if (Object.keys(this.pageMetaData).length <= 0) {
      this.pageMetaData = {
         page_id: this.pageId,
         name: this.location,
         lastUpdate: Date.now(),
         ad_archive_ids: [],
      }
    }
  }

  async startCollection() {
    const handler = this.responseReader.bind(this);

    const page = await this.scrapper.newPage();
    await this.scrapper.pageGoTo(page, this.scanUrl);
    await this.scrapper.setRequestInterception(page, handler);
    await this.scrapper.setAutoScroll(page);
  }
}
