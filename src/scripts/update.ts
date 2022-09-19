import { AssetCrawler } from '../asset-crawler';

async function main() {
  const crawler = new AssetCrawler();
  await crawler.getListedAssets();
}

main();
