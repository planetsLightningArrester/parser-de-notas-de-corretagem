/** Generate an object to get the data */
export class StockCorporativeEventRequest {

  private language = 'pt-br';

  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private corporativeEvents = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9saXN0ZWRDb21wYW5pZXNQcm94eS9Db21wYW55Q2FsbC9HZXRMaXN0ZWRTdXBwbGVtZW50Q29tcGFueS');

  /**
   * @param issuingCompany company code (letters only)
   */
  constructor(private issuingCompany: string) {}

  /**
   * Generate a URL page to get the information from
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.corporativeEvents}/${btoa(JSON.stringify({issuingCompany: this.issuingCompany, language: this.language}))}`
  }

}

/** Generate an object to get the data */
export class RealEstateCorporativeEventRequest {

  private typeFund = 7;
  
  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private corporativeEvents = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9mdW5kc1Byb3h5L2Z1bmRzQ2FsbC9HZXRMaXN0ZWRTdXBwbGVtZW50RnVuZHM');
  
  /**
   * @param cnpj company registration number
   * @param identifierFund company code (letters only)
   */
  constructor(private cnpj: string, private identifierFund: string) {}

  /**
   * Generate a URL page to get the information from
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.corporativeEvents}/${btoa(JSON.stringify({cnpj:this.cnpj, identifierFund: this.identifierFund, typeFund: this.typeFund}))}`
  }

}

/**
 * Represents a corporative event response
 */
export interface StockCorporativeEventResponse {
  /**
   * The stock's capital value
   * @example "6.504.516.508,00"
   */
  stockCapital: string;
  /**
   * The date since the stock is quoted per share
   * @example "02/08/2004"
   */
  quotedPerSharSince: string;
  /**
   * The form of the common shares
   * @example "Escritural"
   */
  commonSharesForm: string;
  /**
   * The form of the preferred shares
   * @example "Escritural"
   */
  preferredSharesForm: string;
  /**
   * The name of the company with common shares
   * @example "BRADESCO"
   */
  hasCommom: string;
  /**
   * The name of the company with preferred shares
   * @example "BRADESCO"
   */
  hasPreferred: string;
  /**
   * The number of shares in a round lot
   * @example "100"
   */
  roundLot: string;
  /**
   * The trading name of the stock
   * @example "WEG         "
   */
  tradingName: string;
  /**
   * The number of common shares
   * @example "4.197.317.998"
   */
  numberCommonShares: string;
  /**
   * The number of preferred shares
   * @example "0"
   */
  numberPreferredShares: string;
  /**
   * The total number of shares
   * @example "4.197.317.998"
   */
  totalNumberShares: string;
  /**
   * The stock code
   * @example "WEGE"
   */
  code: string;
  /**
   * The stock code in the CVM
   * @example "5410"
   */
  codeCVM: string;
  /**
   * The stock segment
   * @example "NM"
   */
  segment: string;
  /** The cash dividends paid by the stock */
  cashDividends?: CashDividend[];
  /** The stock dividends */
  stockDividends?: StockDividend[];
  /** The subscriptions for the stock */
  subscriptions?: Subscription[];
}

/**
 * Real Estate Corporative Event Response interface
 */
export interface RealEstateCorporativeEventResponse {
  /**
   * Date of quotation
   * @example "16/11/2017"
  */
  quotedPer: string;
  /**
   * Form of ownership
   * @example "Escritural"
  */
  form: string;
  /**
   * Real estate fund name
   * @example "FII ALIANZA "
  */
  fund: string;
  /**
   * Institution responsible for managing the fund
   * @example "BTG PACTUAL SERVIÇOS FINANC. S.A. DTVM"
  */
  ifd: string;
  /**
   * Minimum amount of shares for negotiation
   * @example "1"
  */
  tradingLot: string;
  /**
   * Number of shares held by the investor
   * @example "7.311.700"
  */
  quantity: string;
  /**
   * Fund code in the stock exchange
   * @example "ALZR"
  */
  code: string;
  /**
   * CVM code of the fund
   * @example null
  */
  codeCVM: string | null;
  /**
   * Type of asset in the stock exchange
   * @example "BOLSA"
  */
  segment: string;
  /** Cash dividends distributed by the fund */
  cashDividends?: CashDividend[];
  /** Stock dividends distributed by the fund */
  stockDividends?: StockDividend[];
  /** Subscriptions made by the investor */
  subscriptions?: Subscription[];
}

/**
 * Represents a stock dividend paid out by a company to its shareholders.
 */
export interface StockDividend {
  /**
   * The code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  assetIssued: string;
  /**
   * The factor by which the shares were split/multiplied, depending on `label`
   * @example "100,00000000000"
   */
  factor: string;
  /**
   * The date on which the dividend was approved
   * @example "27/04/2021"
   */
  approvedOn: string;
  /**
   * The ISIN code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  isinCode: string;
  /**
   * The label for this dividend
   * @example
   * "DESDOBRAMENTO"
   * "GRUPAMENTO"
   * "BONIFICACAO"
   */
  label: string;
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "27/04/2021"
   */
  lastDatePrior: string;
  /** Any additional remarks about the dividend */
  remarks: string;
}

/**
 * Represents a cash dividend paid out by a company to its shareholders.
 */
export interface CashDividend {
  /**
   * The code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  assetIssued: string;
  /**
   * The date on which the dividend was paid out
   * @example "16/08/2023"
   */
  paymentDate: string;
  /**
   * The rate of the dividend, as a decimal
   * @example "0,05323529400"
   */
  rate: string;
  /**
   * The period to which the dividend relates
   * @example "1º Trimestre/2023"
   */
  relatedTo: string;
  /**
   * The date on which the dividend was approved
   * @example "14/03/2023"
   */
  approvedOn: string;
  /**
   * The ISIN code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  isinCode: string;
  /**
   * The label for this dividend
   * @example
   * "JRS CAP PROPRIO"
   * "DIVIDENDO"
   */
  label: string;
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "17/03/2023"
   */
  lastDatePrior: string;
  /** Any additional remarks about the dividend */
  remarks: string;
}

/**
 * Represents a stock dividend paid out by a company to its shareholders. (Short version)
 */
export class StockDividendShortVersion {
  /**
   * The factor by which the shares were split/multiplied, depending on label
   * @example "100,00000000000"
   */
  factor: string;
  /**
   * The label for this dividend
   * @example
   * "DESDOBRAMENTO"
   * "GRUPAMENTO"
   * "BONIFICACAO"
   */
  label: string;
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "27/04/2021"
   */
  lastDatePrior: string;
  // Allow key mapping
  [key: string]: string;

  constructor(factor: string, label: string, lastDatePrior: string) {
    this.factor = factor;
    this.label = label;
    this.lastDatePrior = lastDatePrior;
  }

  /**
   * Create a `StockDividendShortVersion` from a `StockDividend`
   * @param stockDividend the `StockDividend`
   * @returns the short version of `StockDividendShortVersion` with only the relevant fields
   */
  static fromStockDividend(stockDividend: StockDividend): StockDividendShortVersion {
    return new StockDividendShortVersion(stockDividend.factor, stockDividend.label, stockDividend.lastDatePrior);
  }

}

/**
 * Represents a cash dividend paid out by a company to its shareholders. (Short version)
 */
export class CashDividendShortVersion {
  /**
   * The date on which the dividend was paid out
   * @example "16/08/2023"
   */
  paymentDate: string;
  /**
   * The rate of the dividend, as a decimal
   * @example "0,05323529400"
   */
  rate: string;
  /**
   * The label for this dividend
   * @example
   * "JRS CAP PROPRIO"
   * "DIVIDENDO"
   */
  label: string;
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "17/03/2023"
   */
  lastDatePrior: string;
  // Allow key mapping
  [key: string]: string;

  constructor(paymentDate: string, rate: string, label: string, lastDatePrior: string) {
    this.paymentDate = paymentDate;
    this.rate = rate;
    this.label = label;
    this.lastDatePrior = lastDatePrior;
  }

  /**
   * Create a `CashDividendShortVersion` from a `CashDividend`
   * @param cashDividend the `CashDividend`
   * @returns the short version of `CashDividendShortVersion` with only the relevant fields
   */
  static fromCashDividend(cashDividend: CashDividend): CashDividendShortVersion {
    return new CashDividendShortVersion(cashDividend.paymentDate, cashDividend.rate, cashDividend.label, cashDividend.lastDatePrior);
  }

}

/**
 * Represents a subscription to a stock.
 */
interface Subscription {
  /**
   * The asset issued for the subscription.
   * @example "BRALZRCTF006"
   */
  assetIssued: string;
  /**
   * The percentage of the subscription.
   * @example "33,77231146600"
   */
  percentage: string;
  /**
   * The unit price of the subscription.
   * @example "108,80000000000"
   */
  priceUnit: string;
  /**
   * The trading period of the subscription.
   * @example "31/12/9999 a 25/07/2022"
   */
  tradingPeriod: string;
  /**
   * The date of the subscription.
   * @example "28/07/2022"
   */
  subscriptionDate: string;
  /**
   * The date when the subscription was approved.
   * @example "08/07/2022"
   */
  approvedOn: string;
  /**
   * The ISIN code for the subscription.
   * @example "BRALZRCTF006"
   */
  isinCode: string;
  /**
   * The label for the subscription.
   * @example "SUBSCRICAO"
   */
  label: string;
  /**
   * The last date prior to the subscription.
   * @example "13/07/2022"
   */
  lastDatePrior: string;
  /** Any additional remarks for the subscription. */
  remarks: string;
}
