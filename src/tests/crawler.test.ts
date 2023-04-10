import { AssetCrawler } from '../asset-crawler';

const assetCrawler = new AssetCrawler(false, 'all');

test('simple parses', async () => {
  expect(assetCrawler.getCodeFromTitle('FII CSHG URB HGRU11 CI ER').code).toBe('HGRU11');
  expect(assetCrawler.getCodeFromTitle('ITAUSA PN N1').code).toBe('ITSA4');
}, 5000*1000);

test('listed assets', async () => {
  await new Promise<void>(resolve => {
    const key = assetCrawler.subscribeToUpdates(data => {
      expect(data.length).toBeGreaterThan(0);
      resolve();
    });
    expect(key).toBe(0);
    assetCrawler.fetchListedAssets();
  })
}, 20*60*1000);