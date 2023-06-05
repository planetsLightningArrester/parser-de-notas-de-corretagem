import { AssetCrawler } from '../asset-crawler';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

async function main() {
  const pathToWrite = path.join(__dirname, '..', '..', '..', 'assets.json');
  const crawler = new AssetCrawler(false, 'all');
  await crawler.fetchListedAssets();
  fs.writeFileSync(pathToWrite, JSON.stringify(_.sortBy(crawler['assets'], 'tradingName'), null, 2));
}

main();
