import { AssetCrawler } from '../asset-crawler';

const assetCrawler = new AssetCrawler();

test('simple parses', async () => {
  expect(assetCrawler.getCodeFromTitle('FII CSHGURB HGRU11 CI ER').code).toBe('HGRU11');
  expect(assetCrawler.getCodeFromTitle('ITAUSA PN N1').code).toBe('ITSA4');
}, 5000*1000);