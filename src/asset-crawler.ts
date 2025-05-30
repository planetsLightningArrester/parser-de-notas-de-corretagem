import https from 'https';
import axios, { AxiosResponse } from "axios";
import assets from '../assets.json';
import { Asset } from "./types/common";
import { ListedStocksRequest, StockCrawlerRequestResult, StockInfos, StoredStockInfos } from "./types/listed-stocks";
import { FIICrawlerRequestResult, FiiCrawlerInfos, FiiInfos, FiiRawInfos, GetFIIsRequest, ListedFIIsRequest, StoredFiiInfos } from "./types/listed-real-estates";
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

/** Unexpected Axios response when getting listed assets */
class UnexpectedAxiosResponse extends Error { }
/** Fewer corporative events when merging the current and the fetched data. */
class FewerCorporativeEvents extends Error { }

/** Types of asset verbosity */
export type AssetVerbosity = 'off' | 'all' | 'minimal';

/** Asset type code number */
type AssetType = '3' | '4' | '5' | '11' | '31' | '32' | '33' | '34' | '35' | '36' | '37' | '38' | '39';

/** Assets crawler manager */
export class AssetCrawler {

  /** Assets cached */
  protected assets: Array<StockInfos | FiiInfos>;
  /** Assets defined on runtime */
  customAssets: Asset[] = [];
  /** Unprotected HTTPS agent for un-safe requests */
  private unprotectedHttpsAgent = new https.Agent({ rejectUnauthorized: false });
  /** Auto-update flag */
  private _autoUpdate = false;

  /** Auto-update flag */
  public set autoUpdate(v: boolean) {
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
  private updaterTimeout = 7 * 24 * 3600 * 1000;
  /** Auto-update timeout when any failure happens */
  private updaterTimeoutIfFailed = 24 * 3600 * 1000;
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
    this.assets = (assets as Array<StoredStockInfos | StoredFiiInfos>).map(e => 'p' in e ? StockInfos.fromStoredStockInfos(e) : FiiInfos.fromStoredFiiInfos(e));
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

    let fetchRetries = 0;
    const stockPage = { number: 1 };
    let stocksFetched = false;
    while (!stocksFetched) {
      try {
        await this.fetchStocks(stockPage);
        stocksFetched = true;
      } catch (error) {
        if (error instanceof FewerCorporativeEvents && this.verbosity === 'all') console.log(error.message);
        // Try again
        if (error instanceof UnexpectedAxiosResponse || error instanceof FewerCorporativeEvents) {
          fetchRetries++;
          if (this.verbosity === 'all') console.log(`[AC] Retrying getting listed assets`);
          if (fetchRetries === this.maxRetries) throw new Error(`[AC] Max retries reached for fetching data`);
        } else throw error;
      }
    }

    fetchRetries = 0;
    const fiisPage = { number: 1 };
    let fiisFetched = false;
    while (!fiisFetched) {
      try {
        await this.fetchFIIs(fiisPage);
        fiisFetched = true;
      } catch (error) {
        // Try again
        if (error instanceof UnexpectedAxiosResponse) {
          fetchRetries++;
          if (this.verbosity === 'all') console.log(`[AC] Retrying getting listed assets`);
          if (fetchRetries === this.maxRetries) throw new Error(`[AC] Max retries reached for fetching data`);
        } else throw error;
      }
    }

    // Push updates to listeners
    this.listeners.forEach(sub => {
      sub.callback(this.assets);
    });

  }

  private async fetchStocks(page = { number: 1 }): Promise<void> {
    // Get listed stocks
    if (this.verbosity === 'all') console.log(`[AC] Getting listed stocks: page 1 (takes longer)`);
    let getStockResult = await axios.get(new ListedStocksRequest(page.number).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
    if (!getStockResult || !('data' in getStockResult)) throw new UnexpectedAxiosResponse(`[AC] Unexpected response: ${getStockResult}`);

    let stockData: StockCrawlerRequestResult = getStockResult.data;

    while (stockData.page.totalPages >= stockData.page.pageNumber) {
      if (!getStockResult || !('data' in getStockResult)) throw new UnexpectedAxiosResponse(`[AC] Unexpected response: ${getStockResult}`);
      page.number = stockData.page.pageNumber;
      stockData = getStockResult.data;
      stockData.results.forEach(r => {
        r.retry = 0;
      });

      // Get stock's corporative events
      let _company: StockInfos | undefined;
      while ((_company = stockData.results.shift()) !== undefined) {
        const company = _company;
        let dataFetched = false;
        // ? Company types other than 1 do not have much info. Not sure what this is about tho
        if (company.type === '1') {
          if (this.verbosity === 'all') console.log(`[AC] Getting corporative events for ${company.issuingCompany}`);

          // ? Not all companies have corporative events fields
          try {
            const getCorporativeEventsResult = await axios.get(new StockCorporativeEventRequest(company.issuingCompany).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
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
            dataFetched = true;

          } catch (e) {
            if (e instanceof Error) {
              if (this.verbosity === 'all') {
                if (e.message.includes("code 429")) {
                  console.log(`[AC] Too many requests. Waiting for a few seconds before retrying`);
                  await new Promise<void>((resolve) => {setTimeout(() => {resolve();}, 5000 + Math.random() * 1000);});
                } else console.log(`[AC] No data for ${company.issuingCompany} and error: ${e.message}`);
              }
            } else if (this.verbosity === 'all') console.log(`[AC] No data for ${company.issuingCompany} and error: ${e}`);

            // Try again
            if (this.verbosity === 'all') console.log(`[AC] Retrying request for company ${company.issuingCompany}`);
            company.retry = company.retry ? company.retry + 1 : 1;
            if (company.retry !== this.maxRetries) stockData.results.unshift(company);
            else throw new Error(`[AC] Max retries reached for ${company.issuingCompany}`);
          }
        } else dataFetched = true;

        if (dataFetched) {
          // Remove the retry field from the JSON
          delete company.retry;

          // Make sure the field is filled
          if (!company.stockDividends) company.stockDividends = [];
          if (!company.cashDividends) company.cashDividends = [];
          if (!company.subscriptions) company.subscriptions = [];

          // Merge with previous results
          const index = this.assets.findIndex(a => a.tradingName === company.tradingName);
          if (index !== -1) {
            const companyPreviousData = this.assets[index];
            // Merge removing duplicates. It's required to create an object to remove duplicates
            const stockDividends = uniqueCorporativeEvent([
              ...company.stockDividends,
              ...companyPreviousData.stockDividends.map(d => d)
            ]);
            if (companyPreviousData.stockDividends.length > stockDividends.length) {
              throw new FewerCorporativeEvents(`[AC] '${company.issuingCompany}' had ${companyPreviousData.stockDividends.length} stock dividends, now it has '${company.stockDividends.length}'. Missing: \n${getDiff(companyPreviousData.stockDividends, stockDividends)}`);
            } else company.stockDividends = stockDividends;

            const cashDividends = uniqueCorporativeEvent([
              ...company.cashDividends,
              ...companyPreviousData.cashDividends.map(c => c)
            ]);
            if (companyPreviousData.cashDividends.length > cashDividends.length) {
              throw new FewerCorporativeEvents(`[AC] '${company.issuingCompany}' had ${companyPreviousData.cashDividends.length} cash dividends, now it has '${company.cashDividends.length}'. Missing: \n${getDiff(companyPreviousData.cashDividends, cashDividends)}`);
            } else company.cashDividends = cashDividends;

            const subscriptions = uniqueCorporativeEvent([
              ...company.subscriptions,
              ...companyPreviousData.subscriptions.map(s => s)
            ]);
            if (companyPreviousData.subscriptions.length > subscriptions.length) {
              throw new FewerCorporativeEvents(`[AC] '${company.issuingCompany}' had ${companyPreviousData.subscriptions.length} subscriptions, now it has '${company.subscriptions.length}'. Missing: \n${getDiff(companyPreviousData.subscriptions, subscriptions)}`);
            } else company.subscriptions = subscriptions;

            this.assets.splice(index, 1, company);
          } else this.assets.push(company);

        }

      }

      if (this.verbosity === 'all') console.log(`[AC] Getting listed stocks: page ${stockData.page.pageNumber + 1}`);
      if (stockData.page.totalPages === stockData.page.pageNumber) break;
      else {
        let retries = 0;
        while (this.maxRetries > retries) {
          try {
            getStockResult = await axios.get(new ListedStocksRequest(stockData.page.pageNumber + 1).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
            break;
          } catch (e) {
            if (e instanceof Error) {
              if (this.verbosity === 'all') {
                if (e.message.includes("code 429")) {
                  console.log(`[AC] Too many requests. Waiting for a few seconds before retrying`);
                  await new Promise<void>((resolve) => {setTimeout(() => {resolve();}, 5000 + Math.random() * 1000);});
                } else console.log(`[AC] No data for page ${stockData.page.pageNumber + 1} and error: ${e.message}`);
              }
            } else if (this.verbosity === 'all') console.log(`[AC] No data for page ${stockData.page.pageNumber + 1} and error: ${e}`);
            retries++;
  
            // Try again
            if (this.verbosity === 'all') console.log(`[AC] Retrying request for getting next page`);
          }
        }
        if (retries >= this.maxRetries) {
          throw new Error(`[AC] Max retries reached for getting page ${stockData.page.pageNumber + 1}`);
        }
      }
    }
  }

  private async fetchFIIs(page = { number: 1 }): Promise<void> {
    // Get listed FIIs
    if (this.verbosity === 'all') console.log(`[AC] Getting listed real estates: page 1 (takes longer)`);
    let retries = 0;
    let _getFiiResult: AxiosResponse | undefined;
    while (this.maxRetries > retries) {
      try {
        _getFiiResult = await axios.get(new ListedFIIsRequest(1).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
        break;
      } catch (e) {
        if (e instanceof Error) {
          if (this.verbosity === 'all') {
            if (e.message.includes("code 429")) {
              console.log(`[AC] Too many requests. Waiting for a few seconds before retrying`);
              await new Promise<void>((resolve) => {setTimeout(() => {resolve();}, 5000 + Math.random() * 1000);});
            } else console.log(`[AC] No data for page 1 and error: ${e.message}`);
          }
        } else if (this.verbosity === 'all') console.log(`[AC] No data for page 1 and error: ${e}`);
        retries++;

        // Try again
        if (this.verbosity === 'all') console.log(`[AC] Retrying request for getting next page`);
      }
    }
    if (typeof _getFiiResult === 'undefined' || retries >= this.maxRetries) {
      throw new Error(`[AC] Max retries reached for getting page 1`);
    }
    let getFiiResult = _getFiiResult;
    if (!('data' in getFiiResult)) throw new UnexpectedAxiosResponse(`[AC] Unexpected response: ${getFiiResult}`);

    let fiiData: FIICrawlerRequestResult = getFiiResult.data;

    while (fiiData.page.totalPages >= fiiData.page.pageNumber) {
      if (!('data' in getFiiResult)) throw new Error(`[AC] Unexpected response: ${getFiiResult}`);
      page.number = fiiData.page.pageNumber;
      fiiData = getFiiResult.data;
      fiiData.results.forEach(r => {
        r.retry = 0;
      });

      let _fii: FiiCrawlerInfos | undefined;
      while ((_fii = fiiData.results.shift()) !== undefined) {
        const fii = _fii;
        if (this.verbosity === 'all') console.log(`[AC] Getting corporative events for ${fii.acronym}`);

        try {
          const getFiiResult = await axios.get(new GetFIIsRequest(fii.acronym).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
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
          const getCorporativeEventsResult = await axios.get(new RealEstateCorporativeEventRequest(fiiInfo.detailFund.cnpj, fii.acronym).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
          if (!('data' in getCorporativeEventsResult)) throw new Error(`Unexpected response: ${getCorporativeEventsResult}`);
          const corporativeEvents: StockCorporativeEventResponse = Array.isArray(getCorporativeEventsResult.data) ? getCorporativeEventsResult.data[0] : getCorporativeEventsResult.data;

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
            const stockDividends = uniqueCorporativeEvent([
              ...fiiElement.stockDividends,
              ...companyPreviousData.stockDividends.map(d => d)
            ]);
            if (companyPreviousData.stockDividends.length > stockDividends.length) {
              throw new FewerCorporativeEvents(`[AC] '${fiiElement.issuingCompany}' had ${companyPreviousData.stockDividends.length} stock dividends, now it has '${fiiElement.stockDividends.length}'. Missing: \n${getDiff(companyPreviousData.stockDividends, stockDividends)}`);
            } else fiiElement.stockDividends = stockDividends;

            const cashDividends = uniqueCorporativeEvent([
              ...fiiElement.cashDividends,
              ...companyPreviousData.cashDividends.map(c => c)
            ]);
            if (companyPreviousData.cashDividends.length > cashDividends.length) {
              throw new FewerCorporativeEvents(`[AC] '${fiiElement.issuingCompany}' had ${companyPreviousData.cashDividends.length} cash dividends, now it has '${fiiElement.cashDividends.length}'. Missing: \n${getDiff(companyPreviousData.cashDividends, cashDividends)}`);
            } else fiiElement.cashDividends = cashDividends;

            const subscriptions = uniqueCorporativeEvent([
              ...fiiElement.subscriptions,
              ...companyPreviousData.subscriptions.map(s => s)
            ]);
            if (companyPreviousData.subscriptions.length > subscriptions.length) {
              throw new FewerCorporativeEvents(`[AC] '${fiiElement.issuingCompany}' had ${companyPreviousData.subscriptions.length} subscriptions, now it has '${fiiElement.subscriptions.length}'. Missing: \n${getDiff(companyPreviousData.subscriptions, subscriptions)}`);
            } else fiiElement.subscriptions = subscriptions;

            this.assets.splice(index, 1, fiiElement);
          } else this.assets.push(fiiElement);

        } catch (e) {
          if (e instanceof FewerCorporativeEvents) {
            if (this.verbosity === 'all') console.log(e.message);
          } else if (e instanceof Error) {
            if (this.verbosity === 'all') {
              if (e.message.includes("code 429")) {
                console.log(`[AC] Too many requests. Waiting for a few seconds before retrying`);
                await new Promise<void>((resolve) => {setTimeout(() => {resolve();}, 5000 + Math.random() * 1000);});
              } else console.log(`[AC] No data for ${fii.acronym} and error: ${e.message}`);
            }
          } else if (this.verbosity === 'all') console.log(`[AC] No data for ${fii.acronym} and error: ${e}`);

          // Try again
          if (this.verbosity === 'all') console.log(`[AC] Retrying request for company ${fii.acronym}`);
          fii.retry = fii.retry ? fii.retry + 1 : 1;
          if (fii.retry !== this.maxRetries) fiiData.results.unshift(fii);
          else throw new Error(`[AC] Max retries reached for ${fii.acronym}`);

        }
      }

      if (this.verbosity === 'all') console.log(`[AC] Getting listed real estates: page ${fiiData.page.pageNumber + 1}`);
      if (fiiData.page.totalPages === fiiData.page.pageNumber) break;
      else {
        let retries = 0;
        while (this.maxRetries > retries) {
          try {
            getFiiResult = await axios.get(new ListedFIIsRequest(fiiData.page.pageNumber + 1).base64Url(), { httpsAgent: this.unprotectedHttpsAgent });
            break;
          } catch (e) {
            if (e instanceof Error) {
              if (this.verbosity === 'all') {
                if (e.message.includes("code 429")) {
                  console.log(`[AC] Too many requests. Waiting for a few seconds before retrying`);
                  await new Promise<void>((resolve) => {setTimeout(() => {resolve();}, 5000 + Math.random() * 1000);});
                } else console.log(`[AC] No data for page ${fiiData.page.pageNumber + 1} and error: ${e.message}`);
              }
            } else if (this.verbosity === 'all') console.log(`[AC] No data for page ${fiiData.page.pageNumber + 1} and error: ${e}`);
            retries++;
  
            // Try again
            if (this.verbosity === 'all') console.log(`[AC] Retrying request for getting next page`);
          }
        }
        if (retries >= this.maxRetries) {
          throw new Error(`[AC] Max retries reached for getting page ${fiiData.page.pageNumber + 1}`);
        }
      }
    }
  }

  /**
   * Parse the stock name and returns the stock code
   * @param name title of the stock in the brokerage note
   * @param kind asset kind (like ON, PN, DR2)
   * @returns the stock code
   */
  getCodeFromTitle(name: string, kind: string = ''): Asset {
    // If the stock was manually set
    // ? Some pre-defined stocks can refer to multiple names
    // ? KDIF11=KINEA INFRAF FIDC
    // ? KDIF11_2=FDC KINEAINF FIDC
    // ? In that case, consider the same stock by removing the _
    let customDefined: Asset | undefined;
    if (typeof (customDefined = this.customAssets.find(c => `${name} ${kind}`.startsWith(c.name))) !== 'undefined' || typeof (customDefined = this.customAssets.find(c => name === c.code)) !== 'undefined') {
      customDefined.code = customDefined.code.replace(/(.*)_.*/, "$1");
      return customDefined;
    }

    // If it's a FII, the code is in the name
    const match = name.trim().match(/^FII(?:[ \t]+(?!\w*?11|CI ER|CI$)\w+)*/im);
    if (match) {
      const tradingName1 = match[0].trim();
      for (const fii of this.assets) {
        if ('tradingCode' in fii && fii.tradingName === tradingName1) {
          const mainTradingCode = fii.tradingCode.split(/\s/).shift();
          if (!mainTradingCode) throw new Error(`[AC] Couldn't get the trading code for ${name}`);
          return { code: mainTradingCode, name, cnpj: fii.cnpj, isFII: true };
        }
      }
    } else {
      // Else, parse it
      let type: AssetType | Array<AssetType> = '3';

      if (kind.match(/\bON\b/)) { type = '3'; }
      else if (kind.match(/\bPN\b/)) { type = '4'; }
      else if (kind.match(/\bPNA\b/)) { type = '4'; }
      else if (kind.match(/\bPNB\b/)) { type = '5'; }
      else if (kind.match(/\bUNT\b/)) { type = '11'; }
      else if (kind.match(/\bDR1\b/)) { type = '31'; }
      else if (kind.match(/\bDR2\b/)) { type = '32'; }
      else if (kind.match(/\bDR3\b/)) { type = '33'; }
      else if (kind.match(/\bBDR\b/)) { type = ['34', '35', '36', '37', '38', '39']; }
      else if (kind.match(/\bREIT\b/)) { type = ['35', '36']; }

      const nameWithoutTrailingNumbers = name.trim().replace(/(.*)\d+$/m, "$1"); // Remove the last numbers
      for (const stockOrFii of this.assets) {
        if (!('tradingCode' in stockOrFii) && stockOrFii.tradingName === name) {
          // WARN: We're setting BDRs and REITs codes as the first one available
          return { code: stockOrFii.issuingCompany + (Array.isArray(type) ? type[0] : type), name, cnpj: stockOrFii.cnpj, isFII: false };
        } else if ('tradingCode' in stockOrFii && (stockOrFii.tradingCode === name || stockOrFii.tradingCode === name)) {
          const mainTradingCode = stockOrFii.tradingCode.split(/\s/).shift();
          if (!mainTradingCode) throw new Error(`[AC] Couldn't get the trading code for ${name}`);
          return { code: mainTradingCode, name, cnpj: stockOrFii.cnpj, isFII: true };
        } else if ('issuingCompany' in stockOrFii && stockOrFii.issuingCompany === nameWithoutTrailingNumbers) {
          const mainTradingCode = stockOrFii.issuingCompany.split(/\s/).shift() + (Array.isArray(type) ? type[0] : type);
          if (!mainTradingCode) throw new Error(`[AC] Couldn't get the trading code for ${name}`);
          return { code: mainTradingCode, name: stockOrFii.tradingName, cnpj: stockOrFii.cnpj, isFII: false };
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

/**
 * Assumes `to.length > from.length` and get the elements present in `to`
 * and not present in `from`
 * @param from an `Array` of `CorporativeEvent`s with fewer elements than `to`
 * @param to an `Array` of `CorporativeEvent`s with more elements than `from`
 * @returns the elements present in `to` and not present in `from`
 */
function getDiff<T extends CorporativeEvent>(from: T[], to: T[]): T[] {
  const result: T[] = [];
  for (const income of to) {
    let found = false;
    for (const reference of from) {
      let counter = 0;
      for (const key of Object.keys(reference)) {
        if (reference[key] === income[key]) counter++;
      }
      if (counter === Object.keys(reference).length) found = true;
    }
    if (!found) result.push(income);
  }
  return result;
}