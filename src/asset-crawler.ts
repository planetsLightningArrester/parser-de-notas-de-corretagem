import axios from "axios";
import assets from '../assets.json';
import { Asset } from "./types/common";
import { ListedStocksRequest, StockCrawlerRequestResult, StockInfos } from "./types/listed-stocks";
import { FIICrawlerRequestResult, FiiCrawlerInfos, FiiInfos, FiiRawInfos, GetFIIsRequest, ListedFIIsRequest } from "./types/listed-real-estates";
import { CashDividend, RealEstateCorporativeEventRequest, StockCorporativeEventRequest, StockCorporativeEventResponse, StockDividend, Subscription } from "./types/corporative-events";

/** Holds info about a listener event */
class UpdateListener {
  /** The unique listener key */
  key: number;
  /** The listener callback */
  callback: (assets: Array<StockInfos | FiiInfos>) => void;
  
  constructor(key: number, callback: (assets: Array<StockInfos | FiiInfos>) => void) {
    this.key = key;
    this.callback = callback;
  }
}

/** Types of asset verbosity */
export type AssetVerbosity = 'off' | 'all' | 'minimal';

/** Assets crawler manager */
export class AssetCrawler {

  /** Assets cached */
  protected assets: Array<StockInfos | FiiInfos>;
  /** Assets defined on runtime */
  customAssets: Asset[] = [];
  /** Auto-update flag */
  private _autoUpdate = false;

  /** Auto-update flag */
  public set autoUpdate(v : boolean) {
    const previousValue = this._autoUpdate;
    this._autoUpdate = v;

    if (previousValue === false && v === true) this.updater(0);
    else if (v === false && this.autoUpdateTimer) clearTimeout(this.autoUpdateTimer);
  }

  public get autoUpdate(): boolean {
    return this._autoUpdate;
  }
  
  private autoUpdateTimer: NodeJS.Timeout | undefined;
  /** Auto-update timeout */
  private updaterTimeout = 7*24*3600*1000;
  /** Auto-update timeout when any failure happens */
  private updaterTimeoutIfFailed = 24*3600*1000;
  /** Set the verbosity level */
  verbosity: AssetVerbosity;
  /** Max number of retries when fetching data. Default is 20 */
  maxRetries = 20;
  /** Manage the keys being listened to */
  private listenerKey = 0;
  /** Keys generated on update */
  private listeners: UpdateListener[] = [];

  /**
   * Instantiate a new `AssetCrawler`
   * @param autoUpdate whether the application should auto-update
   * the list of assets for new changes. Default is `false`. Require internet connection
   * @param verbose set the verbosity level. Default is `off`
   */
  constructor(autoUpdate?: boolean, verbose?: AssetVerbosity) {
    this.assets = assets as Array<StockInfos | FiiInfos>;
    this.verbosity = verbose || 'off';
    this.autoUpdate = autoUpdate || false;
  }

  /**
   * Update the listed assets after a timeout
   * @param timeout update after `timeout` milliseconds
   */
  private updater(timeout: number = this.updaterTimeout) {
    this.autoUpdateTimer = setTimeout(() => {
      if (this.verbosity !== 'off') console.log(`[AC] Fetching asset data`);
      this.fetchListedAssets()
      .catch(err => {
        console.log(`[AC] Error getting listed assets. Trying again in 1 day`);
        if (err instanceof Error) console.log(err.message);
        if (this.autoUpdate) this.updater(this.updaterTimeoutIfFailed);
      })
      .then(() => {
        if (this.verbosity !== 'off') console.log(`[AC] Asset data successfully fetched`);
        if (this.autoUpdate) this.updater();
      });
    }, timeout);
  }

  /**
   * Update the current listed assets. May take several minutes.
   * If `maxRetires` is reached, an Error is thrown and the fetch
   * process is interrupted
   */
  async fetchListedAssets(): Promise<void> {
    
    // Get listed stocks
    if (this.verbosity === 'all') console.log(`[AC] Getting listed stocks: page 1`);
    let getStockResult = await axios.get(new ListedStocksRequest(1).base64Url());
    if (!('data' in getStockResult)) throw new Error(`[AC] Unexpected response: ${getStockResult}`);

    let stockData: StockCrawlerRequestResult = getStockResult.data;
    
    while (stockData.page.totalPages >= stockData.page.pageNumber) {
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
          if (this.verbosity === 'all') console.log(`[AC] Getting corporative events for ${company.issuingCompany}`);
          
          // ? Not all companies have corporative events fields
          try {
            const getCorporativeEventsResult = await axios.get(new StockCorporativeEventRequest(company.issuingCompany).base64Url());
            if (!('status' in getCorporativeEventsResult) || getCorporativeEventsResult.status !== 200) throw new Error(`Error requesting ${company.issuingCompany}: code ${getCorporativeEventsResult.status ?? '[no code]'}`);
            // ? Stocks return as an Array with a single result. Real estate are just the element
            if (!('data' in getCorporativeEventsResult) || typeof getCorporativeEventsResult.data === 'undefined') throw new Error(`No data in response: ${getCorporativeEventsResult}`);
            if (typeof getCorporativeEventsResult.data === 'string' && getCorporativeEventsResult.data === '') throw new Error(`Empty data from response: ${getCorporativeEventsResult.data}`);
            const corporativeEvents: StockCorporativeEventResponse = getCorporativeEventsResult.data[0];
            if (!corporativeEvents) {
              company.stockDividends = [];
              company.cashDividends = [];
              company.subscriptions = [];
              if (this.verbosity === 'all') console.log(`[AC] No data for ${company.issuingCompany}`);                
            } else {
              if (corporativeEvents.stockDividends) company.stockDividends = corporativeEvents.stockDividends.map(s => s);
              else company.stockDividends = [];
              if (corporativeEvents.cashDividends) company.cashDividends = corporativeEvents.cashDividends.map(c => c);
              else company.cashDividends = [];
              if (corporativeEvents.subscriptions) company.subscriptions = corporativeEvents.subscriptions.map(s => s);
              else company.subscriptions = [];
              if (this.verbosity === 'all') console.log(`[AC] ${company.issuingCompany} done`);
            }

            // Remove the retry field from the JSON
            delete company.retry;

            // Merge with previous results
            const index = this.assets.findIndex(a => a.tradingName === company.tradingName);
            if (index !== -1) {
              const companyPreviousData = this.assets[index];
              // Merge removing duplicates. It's required to create an object to remove duplicates
              company.stockDividends = uniqueCorporativeEvent([
                ...company.stockDividends,
                ...companyPreviousData.stockDividends.map(d => d)
              ]);
              company.cashDividends = uniqueCorporativeEvent([
                ...company.cashDividends,
                ...companyPreviousData.cashDividends.map(c => c)
              ]);
              company.subscriptions = uniqueCorporativeEvent([
                ...company.subscriptions,
                ...companyPreviousData.subscriptions.map(s => s)
              ]);
              this.assets.splice(index, 1, company);
            } else this.assets.push(company);

          } catch (e) {
            if (e instanceof Error) {
              if (this.verbosity === 'all') console.log(`[AC] No data for ${company.issuingCompany} and error: ${e.message}`);
            } else if (this.verbosity === 'all') console.log(`[AC] No data for ${company.issuingCompany} and error: ${e}`);
            
            // Try again
            if (this.verbosity === 'all') console.log(`[AC] Retrying request for company ${company.issuingCompany}`);
            company.retry = company.retry?company.retry+1:1;
            if (company.retry !== this.maxRetries) stockData.results.unshift(company);
            else throw new Error(`[AC] Max retries reached for ${company.issuingCompany}`);

          }  
        }
        
      }

      if (this.verbosity === 'all') console.log(`[AC] Getting listed stocks: page ${stockData.page.pageNumber + 1}`);
      if (stockData.page.totalPages === stockData.page.pageNumber) break;
      else getStockResult = await axios.get(new ListedStocksRequest(stockData.page.pageNumber + 1).base64Url());
    }

    // Get listed FIIs
    if (this.verbosity === 'all') console.log(`[AC] Getting listed real estates: page 1`);
    let getFiiResult = await axios.get(new ListedFIIsRequest(1).base64Url());
    if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);

    let fiiData: FIICrawlerRequestResult = getFiiResult.data;
    
    while (fiiData.page.totalPages >= fiiData.page.pageNumber) {
      if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);
      fiiData = getFiiResult.data;
      fiiData.results.forEach(r => {
        r.retry = 0;
      });

      let _fii: FiiCrawlerInfos | undefined;
      while ((_fii = fiiData.results.shift()) !== undefined) {
        const fii = _fii;
        if (this.verbosity === 'all') console.log(`[AC] Getting corporative events for ${fii.acronym}`);
        
        try {
          const getFiiResult = await axios.get(new GetFIIsRequest(fii.acronym).base64Url());
          if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);
          const fiiInfo: FiiRawInfos = getFiiResult.data;
          let tradingCodes = fiiInfo.detailFund.tradingCode.trim();
          // ? Some funds don't have the trading code
          if (!tradingCodes) tradingCodes = `${fii.acronym}11`;

          // Get real estate's corporative events
          const fiiElement = new FiiInfos(
            fiiInfo.detailFund.tradingName.trim(),
            tradingCodes,
            fiiInfo.detailFund.cnpj.trim(),
            fii.acronym,
          );

          // Get stock's corporative events
          // ? Not all companies have corporative events fields
          const getCorporativeEventsResult = await axios.get(new RealEstateCorporativeEventRequest(fiiInfo.detailFund.cnpj, fii.acronym).base64Url());
          if (!('data' in getCorporativeEventsResult)) throw new Error(`Unexpected response: ${getCorporativeEventsResult}`);
          const corporativeEvents: StockCorporativeEventResponse = Array.isArray(getCorporativeEventsResult.data)?getCorporativeEventsResult.data[0]:getCorporativeEventsResult.data;

          if (!corporativeEvents.code) {
            fiiElement.stockDividends = [];
            fiiElement.cashDividends = [];
            fiiElement.subscriptions = [];
            if (this.verbosity === 'all') console.log(`[AC] No data for ${fii.acronym}`);
          } else {
            if (corporativeEvents.stockDividends) fiiElement.stockDividends = corporativeEvents.stockDividends.map(s => s);
            else fiiElement.stockDividends = [];
            if (corporativeEvents.cashDividends) fiiElement.cashDividends = corporativeEvents.cashDividends.map(c => c);
            else fiiElement.cashDividends = [];
            if (corporativeEvents.subscriptions) fiiElement.subscriptions = corporativeEvents.subscriptions.map(s => s);
            else fiiElement.subscriptions = [];
            if (this.verbosity === 'all') console.log(`[AC] ${fii.acronym} done`);
          }

          // Merge with previous results
          const index = this.assets.findIndex(a => a.tradingName === fiiElement.tradingName);
          if (index !== -1) {
            const companyPreviousData = this.assets[index];
            // Merge removing duplicates. It's required to create an object to remove duplicates
            fiiElement.stockDividends = uniqueCorporativeEvent([
              ...fiiElement.stockDividends,
              ...companyPreviousData.stockDividends.map(d =>d)
            ]);
            fiiElement.cashDividends = uniqueCorporativeEvent([
              ...fiiElement.cashDividends,
              ...companyPreviousData.cashDividends.map(c =>c)
            ]);
            fiiElement.subscriptions = uniqueCorporativeEvent([
              ...fiiElement.subscriptions,
              ...companyPreviousData.subscriptions.map(s =>s)
            ]);
            this.assets.splice(index, 1, fiiElement);
          } else this.assets.push(fiiElement);

        } catch (e) {
          if (e instanceof Error) {
            if (this.verbosity === 'all') console.log(`[AC] No data for ${fii.acronym} and error: ${e.message}`);
          } else if (this.verbosity === 'all') console.log(`[AC] No data for ${fii.acronym} and error: ${e}`);

          // Try again
          if (this.verbosity === 'all') console.log(`[AC] Retrying request for company ${fii.acronym}`);
          fii.retry = fii.retry?fii.retry+1:1;
          if (fii.retry !== this.maxRetries) fiiData.results.unshift(fii);
          else throw new Error(`[AC] Max retries reached for ${fii.acronym}`);

        }
      }

      if (this.verbosity === 'all') console.log(`[AC] Getting listed real estates: page ${fiiData.page.pageNumber + 1}`);
      if (fiiData.page.totalPages === fiiData.page.pageNumber) break;
      else getFiiResult = await axios.get(new ListedFIIsRequest(fiiData.page.pageNumber + 1).base64Url());
    }

    // Push updates to listeners
    this.listeners.forEach(sub => {
      sub.callback(this.assets);
    });
    
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
          const mainTradingCode = fii.tradingCode.split(/\s/).shift();
          if (!mainTradingCode) throw new Error(`[AC] Couldn't get the trading code for ${name}`);
          return {code: mainTradingCode, name, cnpj: fii.cnpj, isFII: true};
        }
      }
    }
    else {
      // Else, parse it
      let type: '3'|'4'|'11'|'31'|'32'|'33' = '3';
      let indexOf: number;
      if (name.indexOf(' ON') !== -1) { indexOf = name.indexOf(' ON'); type = '3' }
      else if (name.indexOf(' PN') !== -1) { indexOf = name.indexOf(' PN'); type = '4' }
      else if (name.indexOf(' UNT') !== -1) { indexOf = name.indexOf(' UNT'); type = '11' }
      else if (name.indexOf(' DR1') !== -1) { indexOf = name.indexOf(' DR1'); type = '31' }
      else if (name.indexOf(' DR2') !== -1) { indexOf = name.indexOf(' DR2'); type = '32' }
      else if (name.indexOf(' DR3') !== -1) { indexOf = name.indexOf(' DR3'); type = '33' }
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
  getDividends(code: string): [StockDividend[], CashDividend[]] {
    code = code.slice(0, 4);
    const asset = this.assets.find(a => a.issuingCompany === code);
    if (!asset) throw new Error(`[AC] No asset defined with code ${code}`);
    else return [asset.stockDividends, asset.cashDividends];
  }

  /**
   * Subscribe to updates when `autoUpdate` is `on` or
   * when `fetchListedAssets` is manually called
   * @param callback function to be called when the data is updated
   * @returns the key number referring to the listener. Can be used to `unsubscribeToUpdates`
   */
  subscribeToUpdates(callback: (assets: Array<StockInfos | FiiInfos>) => void): number {
    const subscriber = new UpdateListener(this.listenerKey++, callback);
    this.listeners.push(subscriber);
    return subscriber.key;
  }

  /**
   * Unsubscribe to updates when `autoUpdate` is `on` or
   * when `fetchListedAssets` is manually called
   * @param key the subscription key returned by `subscribeToUpdates`
   */
  unsubscribeToUpdates(key: number): void {
    const index = this.listeners.findIndex(l => l.key === key);
    if (index !== -1) this.listeners.splice(index, 1);
  }

}

/** Types of corporative events */
type CorporativeEvent = StockDividend | CashDividend | Subscription;

/**
 * Remove duplicated dividends
 * @param dividends an `Array` of `Dividend`
 * @returns the incoming array without the duplicates
 */
function uniqueCorporativeEvent<T extends CorporativeEvent>(dividends: T[]): T[] {
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
    if (!elementExist) {
      // Insert ordered
      const incomingDate = reference.lastDatePrior.split('/').reverse().join('-');
      let inserted = false;
      for (let j = 0; j < result.length; j++) {
        const element = result[j];
        const currentDate = element.lastDatePrior.split('/').reverse().join('-');
        if (currentDate < incomingDate) {
          result.splice(j, 0, reference);
          inserted = true;
          break;
        }
      }
      if (!inserted) result.push(reference);
    }
  }
  return result;
}