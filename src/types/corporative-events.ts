/** Generate an object to get the data */
export class StockCorporativeEventRequest {

  private language = 'pt-br';

  //? Using deprecated `atob` because Buffer isn't supported out-of-the-box in browsers
  private corporativeEvents = atob('aHR0cHM6Ly9zaXN0ZW1hc3dlYmIzLWxpc3RhZG9zLmIzLmNvbS5ici9saXN0ZWRDb21wYW5pZXNQcm94eS9Db21wYW55Q2FsbC9HZXRMaXN0ZWRTdXBwbGVtZW50Q29tcGFueS');

  /**
   * @param issuingCompany company code (letters only)
   */
  constructor(private issuingCompany: string) { }

  /**
   * Generate a URL page to get the information from
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.corporativeEvents}/${btoa(JSON.stringify({ issuingCompany: this.issuingCompany, language: this.language }))}`;
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
  constructor(private cnpj: string, private identifierFund: string) { }

  /**
   * Generate a URL page to get the information from
   * @returns the URL to retrieve the information
   */
  base64Url(): string {
    return `${this.corporativeEvents}/${btoa(JSON.stringify({ cnpj: this.cnpj, identifierFund: this.identifierFund, typeFund: this.typeFund }))}`;
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

/** How StockDividends are stored */
export interface StoredStockDividend {
  /** assetIssued */
  a: string;
  /** factor */
  b: string;
  /** approvedOn */
  c: string;
  /** isinCode */
  d: string;
  /** label */
  e: string;
  /** lastDatePrior */
  f: string;
  /** remarks */
  g: string;
}

/**
 * Represents a stock dividend paid out by a company to its shareholders.
 */
export class StockDividend {
  /**
   * The code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  assetIssued = '';
  /**
   * The factor by which the shares were split/multiplied, depending on `label`
   * @example "100,00000000000"
   */
  factor = '';
  /**
   * The date on which the dividend was approved
   * @example "27/04/2021"
   */
  approvedOn = '';
  /**
   * The ISIN code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  isinCode = '';
  /**
   * The label for this dividend
   * @example
   * "DESDOBRAMENTO"
   * "GRUPAMENTO"
   * "BONIFICACAO"
   */
  label = '';
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "27/04/2021"
   */
  lastDatePrior = '';
  /** Any additional remarks about the dividend */
  remarks = '';
  // Allow key mapping
  [key: string]: string;

  /**
   * Receives `StoredStockDividend` as the data stored and convert to an Object
   * @param stockDividend `StoredStockDividend` to be converted
   * @returns the converted `StockDividend`
   */
  static fromStoredStockDividend(stockDividend: StoredStockDividend): StockDividend {
    const result = new StockDividend();
    result.assetIssued = stockDividend.a;
    result.factor = stockDividend.b;
    result.approvedOn = stockDividend.c;
    result.isinCode = stockDividend.d;
    result.label = stockDividend.e;
    result.lastDatePrior = stockDividend.f;
    result.remarks = stockDividend.g;
    return result;
  }

  /**
   * Receives `StockDividend` as an Object and convert to a data to be stored
   * @param stockDividend `StockDividend` to be converted
   * @returns the converted `StoredStockDividend`
   */
  static toStoredStockDividend(stockDividend: StockDividend): StoredStockDividend {
    return {
      a: stockDividend.assetIssued,
      b: stockDividend.factor,
      c: stockDividend.approvedOn,
      d: stockDividend.isinCode,
      e: stockDividend.label,
      f: stockDividend.lastDatePrior,
      g: stockDividend.remarks,
    };
  }

}

/** How CashDividends are stored */
export interface StoredCashDividend {
  /** assetIssued */
  a: string;
  /** paymentDate */
  b: string;
  /** rate */
  c: string;
  /** relatedTo */
  d: string;
  /** approvedOn */
  e: string;
  /** isinCode */
  f: string;
  /** label */
  g: string;
  /** lastDatePrior */
  h: string;
  /** remarks */
  i: string;
}

/**
 * Represents a cash dividend paid out by a company to its shareholders.
 */
export class CashDividend {
  /**
   * The code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  assetIssued = '';
  /**
   * The date on which the dividend was paid out
   * @example "16/08/2023"
   */
  paymentDate = '';
  /**
   * The rate of the dividend, as a decimal
   * @example "0,05323529400"
   */
  rate = '';
  /**
   * The period to which the dividend relates
   * @example "1º Trimestre/2023"
   */
  relatedTo = '';
  /**
   * The date on which the dividend was approved
   * @example "14/03/2023"
   */
  approvedOn = '';
  /**
   * The ISIN code of the asset issued for this dividend
   * @example "BRWEGEACNOR0"
   */
  isinCode = '';
  /**
   * The label for this dividend
   * @example
   * "JRS CAP PROPRIO"
   * "DIVIDENDO"
   */
  label = '';
  /**
   * The last date prior to which the shareholder must own the shares in order to receive the dividend
   * @example "17/03/2023"
   */
  lastDatePrior = '';
  /** Any additional remarks about the dividend */
  remarks = '';
  // Allow key mapping
  [key: string]: string;

  /**
   * Receives `StoredCashDividend` as the data stored and convert to an Object
   * @param cashDividend `StoredCashDividend` to be converted
   * @returns the converted `CashDividend`
   */
  static fromStoredCashDividend(cashDividend: StoredCashDividend): CashDividend {
    const result = new CashDividend();
    result.assetIssued = cashDividend.a;
    result.paymentDate = cashDividend.b;
    result.rate = cashDividend.c;
    result.relatedTo = cashDividend.d;
    result.approvedOn = cashDividend.e;
    result.isinCode = cashDividend.f;
    result.label = cashDividend.g;
    result.lastDatePrior = cashDividend.h;
    result.remarks = cashDividend.i;
    return result;
  }

  /**
   * Receives `CashDividend` as an Object and convert to a data to be stored
   * @param cashDividend `CashDividend` to be converted
   * @returns the converted `StoredCashDividend`
   */
  static toStoredCashDividend(cashDividend: CashDividend): StoredCashDividend {
    return {
      a: cashDividend.assetIssued,
      b: cashDividend.paymentDate,
      c: cashDividend.rate,
      d: cashDividend.relatedTo,
      e: cashDividend.approvedOn,
      f: cashDividend.isinCode,
      g: cashDividend.label,
      h: cashDividend.lastDatePrior,
      i: cashDividend.remarks,
    };
  }

}

/** How Subscriptions are stored */
export interface StoredSubscription {
  /** assetIssued */
  a: string;
  /** percentage */
  b: string;
  /** priceUnit */
  c: string;
  /** tradingPeriod */
  d: string;
  /** approvedOn */
  e: string;
  /** isinCode */
  f: string;
  /** label */
  g: string;
  /** lastDatePrior */
  h: string;
  /** remarks */
  i: string;
  /** subscriptionDate */
  j: string;
}

/**
 * Represents a subscription to a stock.
 */
export class Subscription {
  /**
   * The asset issued for the subscription.
   * @example "BRALZRCTF006"
   */
  assetIssued = '';
  /**
   * The percentage of the subscription.
   * @example "33,77231146600"
   */
  percentage = '';
  /**
   * The unit price of the subscription.
   * @example "108,80000000000"
   */
  priceUnit = '';
  /**
   * The trading period of the subscription.
   * @example "10/05/2023 a 18/05/2023"
   */
  tradingPeriod = '';
  /**
   * The date of the subscription.
   * @example "28/07/2022"
   */
  subscriptionDate = '';
  /**
   * The date when the subscription was approved.
   * @example "08/07/2022"
   */
  approvedOn = '';
  /**
   * The ISIN code for the subscription.
   * @example "BRALZRCTF006"
   */
  isinCode = '';
  /**
   * The label for the subscription.
   * @example "SUBSCRICAO"
   */
  label = '';
  /**
   * The last date prior to the subscription.
   * @example "13/07/2022"
   */
  lastDatePrior = '';
  /** Any additional remarks for the subscription. */
  remarks = '';
  // Allow key mapping
  [key: string]: string;

  /**
   * Receives `StoredSubscription` as the data stored and convert to an Object
   * @param subscription `StoredSubscription` to be converted
   * @returns the converted `Subscription`
   */
  static fromStoredSubscription(subscription: StoredSubscription): Subscription {
    const result = new Subscription();
    result.assetIssued = subscription.a;
    result.percentage = subscription.b;
    result.priceUnit = subscription.c;
    result.tradingPeriod = subscription.d;
    result.approvedOn = subscription.e;
    result.isinCode = subscription.f;
    result.label = subscription.g;
    result.lastDatePrior = subscription.h;
    result.remarks = subscription.i;
    result.subscriptionDate = subscription.j;
    return result;
  }

  /**
   * Receives `Subscription` as an Object and convert to a data to be stored
   * @param subscription `Subscription` to be converted
   * @returns the converted `StoredSubscription`
   */
  static toStoredSubscription(subscription: Subscription): StoredSubscription {
    return {
      a: subscription.assetIssued,
      b: subscription.percentage,
      c: subscription.priceUnit,
      d: subscription.tradingPeriod,
      e: subscription.approvedOn,
      f: subscription.isinCode,
      g: subscription.label,
      h: subscription.lastDatePrior,
      i: subscription.remarks,
      j: subscription.subscriptionDate,
    };
  }

}
