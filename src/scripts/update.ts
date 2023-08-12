import { AssetCrawler } from '../asset-crawler';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { StockInfos } from '../types/listed-stocks';
import { FiiInfos } from '../types/listed-real-estates';

async function main() {
  const pathToWrite = path.join(__dirname, '..', '..', '..', 'assets.json');
  const crawler = new AssetCrawler(false, 'all');
  await crawler.fetchListedAssets();
  fs.writeFileSync(pathToWrite, JSON.stringify(_.sortBy(crawler['assets'], 'tradingName').map(a => 'typeBDR' in a ? StockInfos.toStored(a) : FiiInfos.toStored(a)), null, 2));
}

main();
