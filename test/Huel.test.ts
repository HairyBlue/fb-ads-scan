import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const collectionDir = path.join(__dirname, '../collections/Huel_282592881929497');

describe('Huel Facebook Ads JSON Validation', () => {
  let pageMetaData: any;
  let pageAdsData: Record<string, any>;

  beforeAll(() => {
    const metaPath = path.join(collectionDir, 'page-meta-data.json');
    const adsPath = path.join(collectionDir, 'page-ads-data.json');

    expect(fs.existsSync(metaPath)).toBe(true);
    expect(fs.existsSync(adsPath)).toBe(true);

    pageMetaData = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    pageAdsData = JSON.parse(fs.readFileSync(adsPath, 'utf-8'));
  });

  it('should have correct pageMetaData structure', () => {
    expect(pageMetaData).toHaveProperty('page_id');
    expect(pageMetaData).toHaveProperty('name');
    expect(pageMetaData).toHaveProperty('last_sync');
    expect(pageMetaData).toHaveProperty('ad_archive_ids');

    expect(Array.isArray(pageMetaData.ad_archive_ids)).toBe(true);
    expect(typeof pageMetaData.page_id).toBe('string');
    expect(typeof pageMetaData.name).toBe('string');
    expect(typeof pageMetaData.last_sync).toBe('number');
  });

  it('should have correct pageAdsData structure', () => {
    expect(typeof pageAdsData).toBe('object');
    const adIds = Object.keys(pageAdsData);
    expect(adIds.length).toBeGreaterThan(0);

    adIds.forEach((adId) => {
      const ad = pageAdsData[adId];

      expect(ad).toHaveProperty('ad_archive_id');
      expect(ad).toHaveProperty('collation_count');
      expect(ad).toHaveProperty('collation_id');
      expect(ad).toHaveProperty('page_id');
      expect(ad).toHaveProperty('snapshot');

      const snapshot = ad.snapshot;
      expect(snapshot).toHaveProperty('page_name');
      expect(snapshot).toHaveProperty('page_profile_uri');
      expect(snapshot).toHaveProperty('cta_type');
      expect(snapshot).toHaveProperty('title');
      expect(snapshot).toHaveProperty('body');

      expect(typeof ad.ad_archive_id).toBe('string');
      expect(typeof ad.collation_count).toBe('number');
      expect(typeof ad.page_id).toBe('string');
    });
  });

  it('all ad_archive_ids in meta match keys in pageAdsData', () => {
    const adIdsMeta = pageMetaData.ad_archive_ids;
    const adIdsData = Object.keys(pageAdsData);

    adIdsMeta.forEach((id: string) => {
      expect(adIdsData).toContain(id);
    });
  });
});
