import axios from "axios";
import assets from '../assets.json';

/** B3 request object constructor for stocks */
class ListedStocksRequest {
  language = 'pt-br';
  pageNumber: number;
  pageSize: 20|40|60|120 = 120;
  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private listedStocksUrl = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9saXN0ZWRDb21wYW5pZXNQcm94eS9Db21wYW55Q2FsbC9HZXRJbml0aWFsQ29tcGFuaWVz');
  
  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  /**
   * Generate a URL page to get the information from. Input is the page number.
   * @param page page number
   * @returns the URL to retrieve the information
   */
  base64Url(page?: number): string {
    return `${this.listedStocksUrl}/${btoa(JSON.stringify({language: this.language, pageNumber: page ?? this.pageNumber, pageSize: this.pageSize}))}`
  }

}

/** B3 request object constructor for FIIs */
class ListedFIIsRequest {
  typeFund = 7;
  pageNumber: number;
  pageSize: 20|40|60 = 60;
  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private listedFIIsUrl = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9mdW5kc1Byb3h5L2Z1bmRzQ2FsbC9HZXRMaXN0ZWRGdW5kc1NJRw');
  
  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  /**
   * Generate a URL page to get the information from. Input is the page number.
   * @param page page number
   * @returns the URL to retrieve the information
   */
  base64Url(page?: number): string {
    return `${this.listedFIIsUrl}/${btoa(JSON.stringify({typeFund: this.typeFund, pageNumber: page ?? this.pageNumber, pageSize: this.pageSize}))}`
  }

}

/** B3 request object constructor for detailed info of FIIs */
class GetFIIsRequest {
  typeFund = 7;
  identifierFund:string;
  private getFiiUrl = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9mdW5kc1Byb3h5L2Z1bmRzQ2FsbC9HZXREZXRhaWxGdW5kU0lH');

  constructor(code: string) {
    this.identifierFund = code;
  }

  /**
   * Generate a URL page to get the information from. Input is the page number.
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.getFiiUrl}/${btoa(JSON.stringify({typeFund: this.typeFund, identifierFund: this.identifierFund}))}`
  }

}

/** Infos about the stock */
interface StockInfos {
  /** CVM code */
  codeCVM: string;
  /** Issuing Company (B3 Code) */
  issuingCompany: string;
  /** Company name */
  companyName: string;
  /** Trading name (same name as in the brokerage note) */
  tradingName: string;
  /** Company's CNPJ */
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

/** Different of Stock Crawler infos, CNPJ isn't available on the search results */
interface FiiCrawlerInfos {
  segment: string;
  /** Fund code without numbers */
  acronym: string;
  fundName:string;
  companyName:string;
  /** Always null */
  cnpj: null
}

interface FiiRawInfos {
  detailFund:{
    /** Fund code without numbers */
    acronym: string;
    /** Fund name in the brokerage note */
    tradingName: string;
    /** Fund code in the brokerage note */
    tradingCode: string;
    tradingCodeOthers: string;
    /** Numbers only */
    cnpj: string;
    classification: string;
    webSite: string;
    fundAddress: string;
    fundPhoneNumberDDD: string;
    fundPhoneNumber: string;
    fundPhoneNumberFax: string;
    positionManager: string;
    managerName: string;
    companyAddress: string;
    companyPhoneNumberDDD: string;
    companyPhoneNumber: string;
    companyPhoneNumberFax: string;
    companyEmail: string;
    companyName: string;
    quotaCount: string;
    quotaDateApproved: string;
    typeFNET:null,
    codes:null,
    codesOther:null,
    segment:null
  },
  shareHolder: {
    shareHolderName: string;
    shareHolderAddress: string;
    shareHolderPhoneNumberDDD: string;
    shareHolderPhoneNumber: string;
    shareHolderFaxNumber: string;
    shareHolderEmail: string;
  }
}

class FiiInfos {
  tradingName: string;
  tradingCode: string;
  cnpj: string;

  constructor (tradingName: string, tradingCode: string, cnpj: string) {
    this.tradingName = tradingName;
    this.tradingCode = tradingCode;
    this.cnpj = cnpj;
  }

}

/** Infos about the page and the total amount of records */
interface PageInfo {
  /** Current page number */
  pageNumber: number;
  /** Number of results in the page (can be less if it's the last page) */
  pageSize: number;
  /** Number of total records */
  totalRecords: number;
  /** Number of total pages */
  totalPages: number;
}

/** Crawler result */
interface StockCrawlerRequestResult {
  "page": PageInfo;
  "results": Array<StockInfos>;
}

/** Crawler result */
interface FIICrawlerRequestResult {
  "page": PageInfo;
  "results": Array<FiiCrawlerInfos>;
}

/** Assets main infos */
export interface Asset {
  /** Asset's code */
  code: string;
  /** Asset's name */
  name: string;
  /** Asset's cnpj (registration number) */
  cnpj?: string;
  /** Whether the asset is a FII (real estate) */
  isFII: boolean
}

/** Assets crawler manager */
export class AssetCrawler {

  /** Assets cached */
  protected assets: Array<StockInfos | FiiInfos>;
  /** Assets defined on runtime */
  customAssets: Asset[] = [];
  /** Auto-update flag */
  autoUpdate = false;
  /** Auto-update timeout */
  private updaterTimeout = 7*24*3600*1000;
  /** Auto-update timeout when any failure happens */
  private updaterTimeoutIfFailed = 24*3600*1000;

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

  /** Update the current listed assets */
  async getListedAssets(): Promise<void> {

    this.assets = [];
    
    // Get listed stocks
    let getStockResult = await axios.get(new ListedStocksRequest(1).base64Url());
    if (!('data' in getStockResult)) throw new Error(`Unexpected response: ${getStockResult}`);

    let stockData: StockCrawlerRequestResult = getStockResult.data;
    
    while(stockData.page.totalPages >= stockData.page.pageNumber) {
      if (!('data' in getStockResult)) throw new Error(`Unexpected response: ${getStockResult}`);
      stockData = getStockResult.data;
      this.assets.push(...stockData.results);
      if (stockData.page.totalPages === stockData.page.pageNumber) break;
      else getStockResult = await axios.get(new ListedStocksRequest(stockData.page.pageNumber + 1).base64Url());
    }

    // Get listed FIIs
    let getFiiResult = await axios.get(new ListedFIIsRequest(1).base64Url());
    if (!('data' in getFiiResult)) throw new Error(`Unexpected response: ${getFiiResult}`);

    let fiiData: FIICrawlerRequestResult = getFiiResult.data;
    
    while(fiiData.page.totalPages >= fiiData.page.pageNumber) {
      if (!('data' in getFiiResult)) throw new Error(`Unexpected response: ${getFiiResult}`);
      fiiData = getFiiResult.data;
      for await (const fii of fiiData.results) {
        const getFiiResult = await axios.get(new GetFIIsRequest(fii.acronym).base64Url());
        if (!('data' in getFiiResult)) throw new Error(`Unexpected response: ${getFiiResult}`);
        const fiiInfo: FiiRawInfos = getFiiResult.data;
        let tradingCode = fiiInfo.detailFund.tradingCode.trim()
        // ? Some funds don't have the trading code
        if (!tradingCode) tradingCode = `${fiiInfo.detailFund.acronym.trim()}11`;
        this.assets.push(new FiiInfos(
          fiiInfo.detailFund.tradingName.trim(),
          tradingCode,
          fiiInfo.detailFund.cnpj.trim()
          ));
      }
      if (fiiData.page.totalPages === fiiData.page.pageNumber) break;
      else getFiiResult = await axios.get(new ListedFIIsRequest(fiiData.page.pageNumber + 1).base64Url());
    }
    
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
    const match = name.match(/(FII\s.*?)\s([^\s]+?)\sCI/i);
    if (match && match[1]) {
      const tradingName = match[1].trim();
      for (const fii of this.assets) {
        if ('tradingCode' in fii && fii.tradingName === tradingName) {
          return {code: fii.tradingCode, name, cnpj: fii.cnpj, isFII: true};
        }
      }
    }
    else {
      // Else, parse it
      let type: '3'|'4'|'11' = '3';
      let indexOf: number;
      if (name.indexOf(' ON') !== -1) { indexOf = name.indexOf(' ON'); type = '3'}
      else if (name.indexOf(' PN') !== -1) { indexOf = name.indexOf(' PN'); type = '4'}
      else if (name.indexOf(' UNT') !== -1) { indexOf = name.indexOf(' UNT'); type = '11'}
      else indexOf = name.length;
      const justTheName = name.slice(0, indexOf);
      for (const stock of this.assets) {
        if (!('tradingCode' in stock) && stock.tradingName === justTheName) {
          return {code: stock.issuingCompany + type, name, cnpj: stock.cnpj, isFII: false};
        }
      }
    }
    
    throw new Error(`No stock found for ${name}`);

  }

}
