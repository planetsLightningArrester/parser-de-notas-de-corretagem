import axios from "axios";
import assets from '../assets.json';
import { Asset } from "./types/common";
import { ListedStocksRequest, StockCrawlerRequestResult, StockInfos } from "./types/listed-stocks";
import { FIICrawlerRequestResult, FiiCrawlerInfos, FiiInfos, FiiRawInfos, GetFIIsRequest, ListedFIIsRequest } from "./types/listed-real-estates";
import { CashDividendShortVersion, RealEstateCorporativeEventRequest, StockCorporativeEventRequest, StockCorporativeEventResponse, StockDividendShortVersion } from "./types/corporative-events";

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
  /** Enable verbose calls */
  verbose: boolean;
  /** Max number of retries when fetching data */
  maxRetries = 20;

  /**
   * Instantiate a new `AssetCrawler`
   * @param autoUpdate whether the application should auto-update
   * the list of assets for new changes. Default is `false`. Require internet connection
   * @param verbose enable verbose calls
   */
  constructor(autoUpdate?: boolean, verbose?: boolean) {
    this.assets = assets;
    this.autoUpdate = autoUpdate || false;
    if (this.autoUpdate) {
      this.updater(0);
    }
    this.verbose = !!verbose;
  }

  /**
   * Update the listed assets after a timeout
   * @param timeout update after `timeout` milliseconds
   */
  updater(timeout: number = this.updaterTimeout) {
    setTimeout(() => {
      this.getListedAssets()
      .catch(err => {
        console.log(`[AC] Error getting listed assets. Trying again in 1 day`);
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
    
    // Get listed stocks
    if (this.verbose) console.log(`[AC] Getting listed stocks: page 1`);
    let getStockResult = await axios.get(new ListedStocksRequest(1).base64Url());
    if (!('data' in getStockResult)) throw new Error(`[AC] Unexpected response: ${getStockResult}`);

    let stockData: StockCrawlerRequestResult = getStockResult.data;
    
    while(stockData.page.totalPages >= stockData.page.pageNumber) {
      if (!('data' in getStockResult)) throw new Error(`[AC] Unexpected response: ${getStockResult}`);
      stockData = getStockResult.data;
      stockData.results.forEach(r => {
        r.retry = 0;
      });
      
      // Get stock's corporative events
      let _company: StockInfos | undefined;
      while ((_company = stockData.results.shift()) !== undefined) {
        const company = _company;
        // ? Company types other than 1 do not have much info. Not sure what this is about tho
        if (company.type === '1') {
          if (this.verbose) console.log(`[AC] Getting corporative events for ${company.issuingCompany}`);
          
          // ? Not all companies have corporative events fields
          try {
            const getCorporativeEventsResult = await axios.get(new StockCorporativeEventRequest(company.issuingCompany).base64Url());
            if (!('status' in getCorporativeEventsResult) || getCorporativeEventsResult.status !== 200) throw new Error(`[AC] Error requesting ${company.issuingCompany}: code ${getCorporativeEventsResult.status ?? '[no code]'}`);
            // ? Stocks return as an Array with a single result. Real estate are just the element
            if (!('data' in getCorporativeEventsResult) || typeof getCorporativeEventsResult.data === 'undefined') throw new Error(`[AC] No data in response: ${getCorporativeEventsResult}`);
            if (typeof getCorporativeEventsResult.data === 'string' && getCorporativeEventsResult.data === '') throw new Error(`[AC] Empty data from response: ${getCorporativeEventsResult.data}`);
            const corporativeEvents: StockCorporativeEventResponse = getCorporativeEventsResult.data[0];
            if (!corporativeEvents) {
              company.stockDividends = [];
              company.cashDividends = [];
              if (this.verbose) console.log(`[AC] No data for ${company.issuingCompany}`)                
            } else {
              if (corporativeEvents.stockDividends) {
                company.stockDividends = corporativeEvents.stockDividends.map(s => StockDividendShortVersion.fromStockDividend(s))
              } else company.stockDividends = [];
              
              if (corporativeEvents.cashDividends) {
                company.cashDividends = corporativeEvents.cashDividends.map(s => CashDividendShortVersion.fromCashDividend(s))
              } else company.cashDividends = [];

              if (this.verbose) console.log(`[AC] ${company.issuingCompany} done`);
            }

            // Remove the retry field from the JSON
            delete company.retry;

            // Merge with previous results
            const index = this.assets.findIndex(a => a.tradingName === company.tradingName);
            if (index !== -1) {
              const companyPreviousData = this.assets[index];
              // Merge removing duplicates. It's required to create an object to remove duplicates
              company.stockDividends = uniqueDividends([
                ...company.stockDividends,
                ...companyPreviousData.stockDividends.map(d => new StockDividendShortVersion(d.factor, d.label, d.lastDatePrior))
              ]);
              company.cashDividends = uniqueDividends([
                ...company.cashDividends,
                ...companyPreviousData.cashDividends.map(c => new CashDividendShortVersion(c.paymentDate, c.rate, c.label, c.lastDatePrior))
              ]);
              this.assets.splice(index, 1, company);
            } else this.assets.push(company);

          } catch (e) {
            company.stockDividends = [];
            company.cashDividends = [];
            if (e instanceof Error) {
              if (this.verbose) console.log(`[AC] No data for ${company.issuingCompany} and error: ${e.message}`);
            } else if (this.verbose) console.log(`[AC] No data for ${company.issuingCompany} and error: ${e}`);
            
            // Try again
            if (this.verbose) console.log(`[AC] Retrying request for company ${company.issuingCompany}`);
            company.retry = company.retry?company.retry+1:1;
            if (company.retry !== this.maxRetries) stockData.results.unshift(company);
            else throw new Error(`[AC] Max retries reached for ${company.issuingCompany}`);

          }  
        }
        
      }

      if (this.verbose) console.log(`[AC] Getting listed stocks: page ${stockData.page.pageNumber + 1}`);
      if (stockData.page.totalPages === stockData.page.pageNumber) break;
      else getStockResult = await axios.get(new ListedStocksRequest(stockData.page.pageNumber + 1).base64Url());
    }

    // Get listed FIIs
    if (this.verbose) console.log(`[AC] Getting listed real estates: page 1`);
    let getFiiResult = await axios.get(new ListedFIIsRequest(1).base64Url());
    if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);

    let fiiData: FIICrawlerRequestResult = getFiiResult.data;
    
    while(fiiData.page.totalPages >= fiiData.page.pageNumber) {
      if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);
      fiiData = getFiiResult.data;
      fiiData.results.forEach(r => {
        r.retry = 0;
      })

      let _fii: FiiCrawlerInfos | undefined;
      while ((_fii = fiiData.results.shift()) !== undefined) {
        const fii = _fii;
        if (this.verbose) console.log(`[AC] Getting corporative events for ${fii.acronym}`);
        
        const getFiiResult = await axios.get(new GetFIIsRequest(fii.acronym).base64Url());
        if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);
        const fiiInfo: FiiRawInfos = getFiiResult.data;
        let tradingCode = fiiInfo.detailFund.tradingCode.trim()
        // ? Some funds don't have the trading code
        if (!tradingCode) tradingCode = `${fiiInfo.detailFund.acronym.trim()}11`;

        // Get real estate's corporative events
        const fiiElement = new FiiInfos(
          fiiInfo.detailFund.tradingName.trim(),
          tradingCode,
          fiiInfo.detailFund.cnpj.trim()
        );

        // Get stock's corporative events
        // ? Not all companies have corporative events fields

        try {
          const getCorporativeEventsResult = await axios.get(new RealEstateCorporativeEventRequest(fiiInfo.detailFund.cnpj, tradingCode.slice(0, -2)).base64Url());
          if (!('data' in getCorporativeEventsResult)) throw new Error(`[AC] Unexpected response: ${getCorporativeEventsResult}`);
          const corporativeEvents: StockCorporativeEventResponse = Array.isArray(getCorporativeEventsResult.data)?getCorporativeEventsResult.data[0]:getCorporativeEventsResult.data;

          if (!corporativeEvents.code) {
            fiiElement.stockDividends = [];
            fiiElement.cashDividends = [];
            if (this.verbose) console.log(`[AC] No data for ${fii.acronym}`);
          } else {
            if (corporativeEvents.stockDividends) {
              fiiElement.stockDividends = corporativeEvents.stockDividends.map(s => StockDividendShortVersion.fromStockDividend(s));
            } else fiiElement.stockDividends = [];

            if (corporativeEvents.cashDividends) {
              fiiElement.cashDividends = corporativeEvents.cashDividends.map(s => CashDividendShortVersion.fromCashDividend(s));
            } else fiiElement.cashDividends = [];
            if (this.verbose) console.log(`[AC] ${fii.acronym} done`)
          }

          // Merge with previous results
          const index = this.assets.findIndex(a => a.tradingName === fiiElement.tradingName);
          if (index !== -1) {
            const companyPreviousData = this.assets[index];
            // Merge removing duplicates. It's required to create an object to remove duplicates
            fiiElement.stockDividends = uniqueDividends([
              ...fiiElement.stockDividends,
              ...companyPreviousData.stockDividends.map(d => new StockDividendShortVersion(d.factor, d.label, d.lastDatePrior))
            ]);
            fiiElement.cashDividends = uniqueDividends([
              ...fiiElement.cashDividends,
              ...companyPreviousData.cashDividends.map(c => new CashDividendShortVersion(c.paymentDate, c.rate, c.label, c.lastDatePrior))
            ]);
            this.assets.splice(index, 1, fiiElement);
          } else this.assets.push(fiiElement);

        } catch (e) {
          fiiElement.stockDividends = [];
          fiiElement.cashDividends = [];
          if (e instanceof Error) {
            if (this.verbose) console.log(`[AC] No data for ${fii.acronym} and error: ${e.message}`);
          } else if (this.verbose) console.log(`[AC] No data for ${fii.acronym} and error: ${e}`);

          // Try again
          if (this.verbose) console.log(`[AC] Retrying request for company ${fii.acronym}`);
          fii.retry = fii.retry?fii.retry+1:1;
          if (fii.retry !== this.maxRetries) fiiData.results.unshift(fii);
          else throw new Error(`[AC] Max retries reached for ${fii.acronym}`);

        }
      }

      if (this.verbose) console.log(`[AC] Getting listed real estates: page ${fiiData.page.pageNumber + 1}`);
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
    
    throw new Error(`[AC] No stock found for ${name}`);

  }

  /**
   * Get the stock dividends and the cash dividends of a given asset, if any
   * @param code the asset code (letter only)
   * @returns and `Array` where the first position is the list of stock dividends
   * and the second position is a list of the cash dividends
   */
  getDividends(code: string): [StockDividendShortVersion[], CashDividendShortVersion[]] {
    code = code.slice(0, 4);
    const asset = this.assets.find(a => a.issuingCompany === code);
    if (!asset) throw new Error(`[AC] No asset defined with code ${code}`);
    else return [asset.stockDividends, asset.cashDividends];
  }

}

/** Types of dividend */
type Dividend = StockDividendShortVersion | CashDividendShortVersion;

/**
 * Remove duplicated dividends
 * @param dividends an `Array` of `Dividend`
 * @returns the incoming array without the duplicates
 */
function uniqueDividends<T extends Dividend>(dividends: T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < dividends.length; i++) {
    const reference = dividends[i];
    let elementExist = false;
    for (let j = 0; j < result.length; j++) {
      const element = result[j];
      let numberOfEqualKeys = 0;
      Object.keys(reference).forEach(key => {
        if (reference[key] === element[key]) numberOfEqualKeys++; 
      });
      if (numberOfEqualKeys === Object.keys(reference).length) {
        elementExist = true;
        break;
      }
    }
    if (!elementExist) result.push(reference);
  }
  return result;
}