import axios from "axios";
import https from 'https';
import assets from '../assets.json';
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * B3 request object constructor
 */
class ListedStocksRequest {
  language = 'pt-br';
  pageNumber: number;
  pageSize: 20|40|60|120 = 120;
  
  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
    this.pageSize = 120;
  }

}

/**
 * Infos about the stock
 */
interface StockInfos {
  /**
   * CVM code
   */
  codeCVM: string;
  /**
   * Issuing Company (B3 Code)
   */
  issuingCompany: string;
  /**
   * Company name
   */
  companyName: string;
  /**
   * Trading name (same name as in the brokerage note)
   */
  tradingName: string;
  /**
   * Company's CNPJ
   */
  cnpj: string;
  marketIndicator: string;
  typeBDR: string;
  dateListing: string;
  status: string;
  segment: string;
  segmentEng: string;
  type: string;
  market: string;
}

/**
 * Infos about the page and the total amount of records
 */
interface PageInfo {
  /**
   * Current page number
   */
  pageNumber: number;
  /**
   * Number of results in the page (can be less if it's the last page)
   */
  pageSize: number;
  /**
   * Number of total records
   */
  totalRecords: number;
  /**
   * Number of total pages
   */
  totalPages: number;
}

/**
 * Crawler result
 */
interface CrawlerRequestResult {
  "page": PageInfo;
  "results": StockInfos[];
}

/**
 * Assets main infos
 */
export interface Asset {
  /**
   * Asset's code
   */
  code: string;
  /**
   * Asset's name
   */
  name: string;
  /**
   * Asset's cnpj
   */
  cnpj?: string;
}

/**
 * Assets crawler manager
 */
export class AssetCrawler {

  /**
   * Assets cached
   */
  protected assets: StockInfos[];
  /**
   * Assets defined on runtime
   */
  customAssets: Asset[] = [];
  /**
   * Auto-update flag
   */
  autoUpdate = false;
  /**
   * Auto-update timeout
   */
  private updaterTimeout = 7*24*3600*1000;
  /**
   * Auto-update timeout when any failure happens
   */
  private updaterTimeoutIfFailed = 24*3600*1000;

  /**
   * Crawler URLs
   */
  private urls = {
    listedStocks: Buffer.from('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9saXN0ZWRDb21wYW5pZXNQcm94eS9Db21wYW55Q2FsbC9HZXRJbml0aWFsQ29tcGFuaWVz', 'base64').toString('utf-8')
  }

  /**
   * Instantiate a new `AssetCrawler`
   * @param autoUpdate whether the application should auto-update
   * the list of assets for new changes. Default is `false`. Require internet connection
   */
  constructor(autoUpdate?: boolean) {
    this.assets = assets;
    this.autoUpdate = autoUpdate || false;
    if (this.autoUpdate) {
      this.updater(0);
    }
  }

  /**
   * Update the listed assets after a timeout
   * @param timeout update after `timeout` milliseconds
   */
  updater(timeout: number = this.updaterTimeout) {
    setTimeout(() => {
      this.getListedAssets()
      .catch(err => {
        console.log(`Error getting listed assets. Trying again in 1 day`);
        if (err instanceof Error) console.log(err.message);
        this.updater(this.updaterTimeoutIfFailed);
      })
      .then(() => {
        this.updater();
      })
    }, timeout);
  }

  /**
   * Generate a URL page to get the information from. Input is the page number.
   * @param page page number
   * @returns the URL to retrieve the information
   */
  private getUrlByPage(page: number): string {
    return `${this.urls.listedStocks}/${Buffer.from(JSON.stringify(new ListedStocksRequest(page))).toString('base64')}`
  }

  /**
   * Update the current listed assets
   */
  async getListedAssets(): Promise<void> {
    const firstResult = await axios.get(this.getUrlByPage(1), { httpsAgent });
    if (!('data' in firstResult)) throw new Error(`Unexpected response: ${firstResult}`);

    let data: CrawlerRequestResult = firstResult.data;
    const results: StockInfos[] = data.results;
    
    while(data.page.totalPages > data.page.pageNumber) {
      const getResult = await axios.get(this.getUrlByPage(data.page.pageNumber + 1), { httpsAgent });
      if (!('data' in getResult)) throw new Error(`Unexpected response: ${getResult}`);
      data = getResult.data;
      results.push(...data.results);
    }
    
    this.assets = results;

  }

  /**
   * Parse the stock name and returns the stock code
   * @param name title of the stock in the brokerage note
   * @returns the stock code
   */
  getCodeFromTitle(name: string): Asset {
    // If the stock was manually set
    const customDefined: Asset | undefined = this.customAssets.find(c => name.includes(c.name));
    if (customDefined) return customDefined

    // If it's a FII, the code is in the name
    const match = name.match(/FII\s.*?\s([^\s]+?)\sCI/i);
    if (match && match[1]) return {code: match[1], name};

    // Else, parse it
    let type: '3'|'4'|'11' = '3';
    let indexOf: number;
    if (name.indexOf(' ON') !== -1) { indexOf = name.indexOf(' ON'); type = '3'}
    else if (name.indexOf(' PN') !== -1) { indexOf = name.indexOf(' PN'); type = '4'}
    else if (name.indexOf(' UNT') !== -1) { indexOf = name.indexOf(' UNT'); type = '11'}
    else indexOf = name.length;
    const justTheName = name.slice(0, indexOf);
    const stock = this.assets.find(el => el.tradingName === justTheName);
    if (!stock) throw new Error(`No stock found for ${name}`);

    return {code: stock.issuingCompany + type, name, cnpj: stock.cnpj};

  }

}
