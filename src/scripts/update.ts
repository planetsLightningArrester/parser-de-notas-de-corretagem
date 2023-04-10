import { AssetCrawler } from '../asset-crawler';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

async function main() {
  const crawler = new AssetCrawler(false, 'all');
  await crawler.fetchListedAssets();
  fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'assets.json'), JSON.stringify(_.sortBy(crawler['assets'], 'tradingName')));
}

main();
