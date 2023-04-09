import { PageInfo } from "./common";
import { CashDividendShortVersion, StockDividendShortVersion } from "./corporative-events";

/** B3 request object constructor for stocks */
export class ListedStocksRequest {
  language = 'pt-br';
  pageNumber: number;
  pageSize: 20|40|60|120 = 120;
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
    return `${this.listedStocksUrl}/${btoa(JSON.stringify({language: this.language, pageNumber: page ?? this.pageNumber, pageSize: this.pageSize}))}`
  }

}

/** Infos about the stock */
export interface StockInfos {
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
  /** Represents a stock dividend paid out by a company to its shareholders. (Short version) */
  stockDividends: StockDividendShortVersion[];
  /** Represents a cash dividend paid out by a company to its shareholders. (Short version) */
  cashDividends: CashDividendShortVersion[];
  /** Retries attempts to get the data */
  retry?: number;
}

/** Crawler result */
export interface StockCrawlerRequestResult {
  page: PageInfo;
  results: Array<StockInfos>;
}