import { PageInfo } from "./common";
import { CashDividendShortVersion, StockDividendShortVersion } from "./corporative-events";

/** B3 request object constructor for FIIs */
export class ListedFIIsRequest {
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
export class GetFIIsRequest {
  typeFund = 7;
  identifierFund:string;
  private getFiiUrl = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9mdW5kc1Byb3h5L2Z1bmRzQ2FsbC9HZXREZXRhaWxGdW5kU0lH');

  constructor(code: string) {
    this.identifierFund = code;
  }

  /**
   * Generate a URL page to get the information from
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.getFiiUrl}/${btoa(JSON.stringify({typeFund: this.typeFund, identifierFund: this.identifierFund}))}`
  }

}

/** Different of Stock Crawler infos, CNPJ isn't available on the search results */
export interface FiiCrawlerInfos {
  segment: string;
  /** Fund code without numbers */
  acronym: string;
  fundName:string;
  companyName:string;
  /** Always null */
  cnpj: null
  /** Retries attempts to get the data */
  retry?: number;
}

export interface FiiRawInfos {
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

export class FiiInfos {
  /** Issuing Company (B3 Code - only letters) */
  issuingCompany: string;
  /** Company name */
  tradingName: string;
  /** Issuing Company (B3 Code) */
  tradingCode: string;
  /** Registration number (numbers only) */
  cnpj: string;
  /** Represents a stock dividend paid out by a company to its shareholders. (Short version) */
  stockDividends: StockDividendShortVersion[] = [];
  /** Represents a cash dividend paid out by a company to its shareholders. (Short version) */
  cashDividends: CashDividendShortVersion[] = [];

  constructor (tradingName: string, tradingCode: string, cnpj: string) {
    this.tradingName = tradingName;
    this.tradingCode = tradingCode;
    this.cnpj = cnpj;
    this.issuingCompany = this.tradingCode.slice(0, 4);
  }

}

/** Crawler result */
export interface FIICrawlerRequestResult {
  page: PageInfo;
  results: Array<FiiCrawlerInfos>;
}