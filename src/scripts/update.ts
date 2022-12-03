import { AssetCrawler } from '../asset-crawler';
import fs from 'fs';
import path from 'path';

async function main() {
  const crawler = new AssetCrawler();
  await crawler.getListedAssets();
  fs.writeFileSync(path.join(__dirname, '..', '..', '..', 'assets.json'), JSON.stringify(crawler['assets']));
}

main();
