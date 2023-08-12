import { PageInfo } from "./common";
import { CashDividend, StockDividend, StoredCashDividend, StoredStockDividend, StoredSubscription, Subscription } from "./corporative-events";

/** B3 request object constructor for stocks */
export class ListedStocksRequest {
  language = 'pt-br';
  pageNumber: number;
  pageSize: 20 | 40 | 60 | 120 = 120;
  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private listedStocksUrl = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9saXN0ZWRDb21wYW5pZXNQcm94eS9Db21wYW55Q2FsbC9HZXRJbml0aWFsQ29tcGFuaWVz');

  constructor(pageNumber: number) {
    this.pageNumber = pageNumber;
  }

  /**
   * Generate a URL page to get the information from
   * @param page page number
   * @returns the URL to retrieve the information
   */
  base64Url(page?: number): string {
    return `${this.listedStocksUrl}/${btoa(JSON.stringify({ language: this.language, pageNumber: page ?? this.pageNumber, pageSize: this.pageSize }))}`;
  }

}

/** How StockInfos are stored */
export interface StoredStockInfos {
  /** codeCVM */
  a: string
  /** issuingCompany */
  b: string
  /** companyName */
  c: string
  /** tradingName */
  d: string
  /** cnpj */
  e: string
  /** marketIndicator */
  f: string
  /** typeBDR */
  g: string
  /** dateListing */
  h: string
  /** status */
  i: string
  /** segment */
  j: string
  /** segmentEng */
  k: string
  /** type */
  l: string
  /** market */
  m: string
  /** stockDividends */
  n: StoredStockDividend[]
  /** cashDividends */
  o: StoredCashDividend[]
  /** subscriptions */
  p: StoredSubscription[]
  /** retry */
  q?: number
}

/** Infos about the stock */
export class StockInfos {
  /** CVM code */
  codeCVM = '';
  /** Issuing Company (B3 Code - only letters) */
  issuingCompany = '';
  /** Company name */
  companyName = '';
  /** Trading name (same name as in the brokerage note) */
  tradingName = '';
  /** Company's CNPJ */
  cnpj = '';
  marketIndicator = '';
  typeBDR = '';
  dateListing = '';
  status = '';
  segment = '';
  segmentEng = '';
  type = '';
  market = '';
  /** Represents a stock dividend paid out by a company to its shareholders. (Short version) */
  stockDividends: StockDividend[] = [];
  /** Represents a cash dividend paid out by a company to its shareholders. (Short version) */
  cashDividends: CashDividend[] = [];
  /** The subscriptions for the stock */
  subscriptions: Subscription[] = [];
  /** Retries attempts to get the data */
  retry?: number = 3;

  /**
   * Receives `StoredStockInfos` as the data stored and convert to an Object
   * @param stockInfos `StoredStockInfos` to be converted
   * @returns the converted `StockInfos`
   */
  static fromStoredStockInfos(stockInfos: StoredStockInfos): StockInfos {
    const result = new StockInfos();
    result.codeCVM = stockInfos.a;
    result.issuingCompany = stockInfos.b;
    result.companyName = stockInfos.c;
    result.tradingName = stockInfos.d;
    result.cnpj = stockInfos.e;
    result.marketIndicator = stockInfos.f;
    result.typeBDR = stockInfos.g;
    result.dateListing = stockInfos.h;
    result.status = stockInfos.i;
    result.segment = stockInfos.j;
    result.segmentEng = stockInfos.k;
    result.type = stockInfos.l;
    result.market = stockInfos.m;
    result.stockDividends = stockInfos.n.map(e => StockDividend.fromStoredStockDividend(e));
    result.cashDividends = stockInfos.o.map(e => CashDividend.fromStoredCashDividend(e));
    result.subscriptions = stockInfos.p.map(e => Subscription.fromStoredSubscription(e));
    result.retry = stockInfos.q;
    return result;
  }

  /**
   * Receives `StockInfos` as an Object and convert to a data to be stored
   * @param stockInfos `StockInfos` to be converted
   * @returns the converted `StoredStockInfos`
   */
  static toStored(stockInfos: StockInfos): StoredStockInfos {
    return {
      a: stockInfos.codeCVM,
      b: stockInfos.issuingCompany,
      c: stockInfos.companyName,
      d: stockInfos.tradingName,
      e: stockInfos.cnpj,
      f: stockInfos.marketIndicator,
      g: stockInfos.typeBDR,
      h: stockInfos.dateListing,
      i: stockInfos.status,
      j: stockInfos.segment,
      k: stockInfos.segmentEng,
      l: stockInfos.type,
      m: stockInfos.market,
      n: stockInfos.stockDividends.map(e => StockDividend.toStoredStockDividend(e)),
      o: stockInfos.cashDividends.map(e => CashDividend.toStoredCashDividend(e)),
      p: stockInfos.subscriptions.map(e => Subscription.toStoredSubscription(e)),
      q: stockInfos.retry,
    };
  }

}

/** Crawler result */
export interface StockCrawlerRequestResult {
  page: PageInfo;
  results: Array<StockInfos>;
}