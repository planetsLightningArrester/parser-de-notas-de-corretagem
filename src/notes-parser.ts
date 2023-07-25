import { isNodeJS } from './utils';
import { Asset } from './types/common';
import { AssetCrawler, AssetVerbosity } from "./asset-crawler";
import { CashDividend, StockDividend } from './types/corporative-events';
import { getDocument as openPDF, PDFDocumentProxy as PDFDocument, GlobalWorkerOptions, version as pdfjsVersion } from 'pdfjs-dist';

export {
  AssetCrawler,
  CashDividend,
  StockDividend
};

export type {
  AssetVerbosity
};

/** Deal made in a `NegotiationNote` type */
export interface Deal {
  /** Deal type */
  type: 'buy' | 'sell'
  /** Stock/FII code */
  code: string
  /** Amount bought/sold */
  quantity: number
  /** Average value bought/sold with fees applied */
  average: string
  /** Total amount bought/sold with fees applied */
  price: string
  /** Deal date in format yyyy-MM-dd */
  date: string
  /** Asset's CNPJ */
  cnpj: string
  /** Whether the asset is a FII (real estate) */
  isFII: boolean
}

/** A parsed Negotiation Note type */
export class NegotiationNote {
  /** Negotiation note number */
  number = '';
  /** The total amount bought with fees applied */
  buyTotal = '0.00';
  /** The total amount sold with fees applied */
  sellTotal = '0.00';
  /** The total amount of buy fees */
  buyFees = '0.00';
  /** The total amount of sell fees */
  sellFees = '0.00';
  /** The total amount of fees */
  fees = '0.00';
  /** Negotiation note date in format yyyy-MM-dd */
  date = '';
  /** Negotiation note holder */
  holder = '';
  /** Array of deals with buys and sells */
  deals: Deal[] = [];
}

/** Possible date formats to be used */
export type DateFormat = "dd/MM/yyyy" | "yyyy-MM-dd";

/** Wrong password error */
export class WrongPassword extends Error {}
/** Empty document error */
export class EmptyDocument extends Error {}
/** Document without note number error */
export class MissingNoteNumber extends Error {}
/** Document without holder error */
export class MissingHolder extends Error {}
/** Document without date error */
export class MissingDate extends Error {}
/** Missing Buy or Sell sums */
export class MissingBuyOrSellSums extends Error {}
/** Unknown Asset error error */
export class UnknownAsset extends Error {}

/** Brokerage notes parser */
export class NoteParser {

  /** Info about the assets */
  assetCrawler: AssetCrawler;
  /** The date format used. Default is `dd/MM/yyyy` */
  private dateFormat: DateFormat = "dd/MM/yyyy";
  /** Set the verbosity level. Actually it's the same as the crawler */
  private _verbosity: AssetVerbosity;

  /** Set the verbosity level */
  public set verbosity(v : AssetVerbosity) {
    this._verbosity = v;
    this.assetCrawler.verbosity = this._verbosity;
  }

  public get verbosity() : AssetVerbosity {
    return this._verbosity;
  }

  /**
   * Instantiate a new `NoteParser`
   * @param autoUpdateLookUpList whether the application should auto-update
   * the list of assets for new changes every week. Default is `false`. Require internet connection.
   * Updating this package to the latest version also gets the latest infos
   */
  constructor(autoUpdateLookUpList?: boolean, verbosity?: AssetVerbosity) {

    if (!isNodeJS) GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
    this.assetCrawler = new AssetCrawler(autoUpdateLookUpList, verbosity);
    this._verbosity = this.assetCrawler.verbosity;

    // Some manually defined stocks
    this.defineStock('TIET11', 'AES TIETE E UNT', '37.663.076/0001-07');
    this.defineStock('BIDI3', 'BANCO INTER ON', '00.416.968/0001-01');
    this.defineStock('BIDI11', 'BANCO INTER UNT', '00.416.968/0001-01');
    this.defineStock('KDIF11', 'KINEA INFRAF FIDC', '26.324.298/0001-89');
    this.defineStock('KDIF11_2', 'FDC KINEAINF FIDC', '26.324.298/0001-89');
  }

  /**
   * Set the date format
   * @param format a `DateFormat`
   */
  setDateFormat(format: DateFormat) {
    this.dateFormat = format;
  }

  /**
   * Read and parse a given PDF negotiation note by its full path
   * @param name PDF name
   * @param content PDF content
   * @returns an `Array` of `NegotiationNote`
   */
  async parseNote(noteName: string, content: Uint8Array, possiblePasswords?: string[]): Promise<NegotiationNote[]> {
    
    // Prevent warning "Deprecated API usage: Please provide binary data as `Uint8Array`, rather than `Buffer`"
    if (typeof Buffer !== "undefined" && content instanceof Buffer) content = Uint8Array.from(content);

    // Try to open the PDF using the provided passwords, if any
    const parseResults: NegotiationNote[] = [];
    let invalidPassword = false;
    let pdf: PDFDocument | undefined;
    if (!possiblePasswords || !possiblePasswords.length) {
      pdf = await openPDF(content).promise;
    } else {
      for await (const pass of possiblePasswords) {
        try {
          // ? pdf.js caches the data in the first attempt and tries to get from it
          // ? even passing different PDFs. So, creating a new array is required
          // ? to prevent "Unable to deserialize cloned data"
          pdf = await openPDF({data: Uint8Array.from(content), password: pass, useSystemFonts: true}).promise;
          break;
        } catch (error: unknown) {
          /** Prevent the  failure and try again with another password */
          if (error instanceof Error) {
            if (!error.message.includes('No password given') && !error.message.includes('Incorrect Password')) throw error;
            else invalidPassword = true;
          } else if (typeof error === 'string') {
            if (!error.includes('No password given') && !error.includes('Incorrect Password')) throw error;
            else invalidPassword = true;
          } else throw error;
        }
      }
    }

    // Check if the open result
    if (!pdf && invalidPassword) throw new WrongPassword(`None of the provided passwords could open the note ${noteName}`);
    else if (!pdf) throw new EmptyDocument(`Can't open note ${noteName}. The document returned no content`);

    // Parse the PDF content
    const holderPattern = /data.*\s+\d{2}\/\d{2}\/\d{4}\s+(\w+)/i;
    const noteNumberPattern = /Nr\. nota\s+(\d+)/i;
    const datePattern = /data.*\s+(\d{2}\/\d{2}\/\d{4})/i;
    // ?* Clear and Rico summary pattern
    // ? Debentures
    // ? Vendas a vista
    // ? Compras a vista
    // ? Opções - compras
    // ? Opções - vendas
    // ? Operações a termo
    // ? Valor das oper/ c/títulos públ. (v. nom.)
    // ? Valor das operações
    const buysAndSellsClearRicoPattern = /\d[\d,.]*\s+(\d[\d,.]*)\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\n\nResumo dos Negócios/;
    // ?* Inter summary pattern
    // ? Valor das oper/ c/títulos públ. (v. nom.)
    // ? Valor das operações
    // ? Opções - compras
    // ? Debentures
    // ? Operações a termo
    // ? Opções - vendas
    // ? Compras a vista
    // ? Vendas a vista
    const buysAndSellsInterPattern = /Debêntures\n\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)\s+(\d[\d,.]*)/;
    // ?* Clear and Rico fees pattern
    const feesClearRicoPattern = [
      /(\d[\d,.]*)\nTaxa de liquidação/,
      /(\d[\d,.]*)\nTaxa de Registro/,
      /(\d[\d,.]*)\nTaxa de termo\/opções/,
      /(\d[\d,.]*)\nTaxa A.N.A./,
      /(\d[\d,.]*)\nEmolumentos/,
      /(\d[\d,.]*)\nTaxa Operacional/,
      /(\d[\d,.]*)\nExecução/,
      /(\d[\d,.]*)\nTaxa de Custódia/,
      /(\d[\d,.]*)\nImpostos/,
      /(\d[\d,.]*)\nI\.R\.R\.F\. s\/ operações, base/,
      /(\d[\d,.]*)\nOutros/
    ];
    // ?* Inter fees pattern
    const feesInterPattern = [
      // Taxa de Liquidação
      /Taxa de Registro\s+\w+\s+\w+\s+\w+\s+Total\s+\d[\d,.]*\s+\w+\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*/,
      // Taxa de Registro
      /Taxa de Registro\s+\w+\s+\w+\s+\w+\s+Total\s+\d[\d,.]*\s+\w+\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)/,
      // Emolumentos
      /Emolumentos\s+\w+\s+\w+\s+\w+\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*/,
      // Taxa A.N.A.
      /Emolumentos\s+\w+\s+\w+\s+\w+\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*/,
      // Taxa de opções/futuro
      /Emolumentos\s+\w+\s+\w+\s+\w+\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)/,
      // Clearing
      /Clearing\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*/,
      // Execução
      /Clearing\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*/,
      // Execução casa
      /Clearing\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*/,
      // Impostos
      /Clearing\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*\s+\d[\d,.]*/,
      // IRRF s/ operações
      /Clearing\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)\s+\d[\d,.]*/,
      // Outras
      /Clearing\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+\d[\d,.]*\s+(\d[\d,.]*)/,
    ];
    // ?* Clear and Rico stock pattern. This is also the default in case the holder isn't defined
    const stockClearRicoPattern = /1-BOVESPA\s+(\w)\s+(\w+)\s+([\t \s+\w/.]+)\s+(?:#\w*\s+)?(\d+)\s+([\w,]+)\s+([\w,.]+)\s+/g;
    // ?* Inter stock pattern
    const stockInterPattern = /Bovespa\s+(\w+)\s+(\w+)\s+(\d+)\s+(\d+[\d,.]*)\s+(\d+[\d,.]*)\s+\w+\s(\w[\w \t]+\s+)([ \t\w/.]+)/g;
    let match: RegExpMatchArray | null;

    // Iterate over the pages
    let pageContent = '';
    for await (const index of Array(pdf.numPages).keys()) {
      const i = index + 1;
      const page = await pdf.getPage(i);
      const data = await page.getTextContent();
      // Get page content
      for (let j = 0; j < data.items.length; j++) {
        const item = data.items[j];
        if ('str' in item) pageContent += `${item.str}\n`;
      }
      if ((pageContent.match(buysAndSellsClearRicoPattern) || pageContent.match(buysAndSellsInterPattern)) && pageContent.match(noteNumberPattern)) {

        // Get note's number
        let noteNumber: string | undefined;
        match = pageContent.match(noteNumberPattern);
        if (match && match[1]) noteNumber = match[1];
        else throw new MissingNoteNumber(`No note number found for the negotiation note '${noteName}'`);
        let parseResult = parseResults.find(el => el.number === noteNumber);
        if (!parseResult) {
          parseResult = new NegotiationNote();
          parseResults.push(parseResult);
        }
        parseResult.number = noteNumber;

        // Get the holder
        let holder: string | undefined;
        match = pageContent.match(holderPattern);
        if (match && match[1]) holder = match[1][0].toUpperCase() + match[1].slice(1).toLowerCase();
        else throw new MissingHolder(`No holder found for the negotiation note '${noteName}'`);
        parseResult.holder = holder.toLocaleLowerCase();

        // Get the date
        let date: string | undefined;
        match = pageContent.match(datePattern);
        if (match && match[1]) date = this.formatDate(match[1]);
        else throw new MissingDate(`No date found for the negotiation note '${noteName}'`);
        parseResult.date = date;

        // Note total
        let buyTotal = 0;
        let sellTotal = 0;
        if ((match = pageContent.match(buysAndSellsClearRicoPattern)) !== null) {
          sellTotal = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          buyTotal = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
        } else if ((match = pageContent.match(buysAndSellsInterPattern)) !== null) {
          buyTotal = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          sellTotal = parseFloat(match[2].replace(/\./g, '').replace(',', '.'));
        } else throw new MissingBuyOrSellSums(`Error parsing note '${noteName}'. Couldn't get note buys and sells values`);

        // Get the fees
        let fees = 0;
        const _pageContent = pageContent;
        if (parseResult.holder.toLowerCase() !== 'inter') {
          feesClearRicoPattern.forEach(fee => {
            const match = _pageContent.match(fee);
            if (match && match[1]) {
              fees += parseFloat(match[1].replace(/\./g, '').replace(',', '.')); 
            }
          });
        } else {
          feesInterPattern.forEach(fee => {
            const match = _pageContent.match(fee);
            if (match && match[1]) {
              fees += parseFloat(match[1].replace(/\./g, '').replace(',', '.')); 
            }
          });
        }
        if (fees) parseResult.fees = (parseFloat(parseResult.fees) + fees).toFixed(2);

        // Generate the Checkout for the value bought
        if (buyTotal) parseResult.buyTotal = buyTotal.toFixed(2);
        
        // Generate the Check in for the value sold
        if (sellTotal) parseResult.sellTotal = sellTotal.toFixed(2);

        // Use the stock pattern based on the holder
        const stockPattern = parseResult.holder.toLowerCase() !== 'inter'?stockClearRicoPattern:stockInterPattern;

        while ((match = stockPattern.exec(pageContent)) !== null) {
          let op: string;
          // let market: string = match[2];
          let stock: Asset;
          let quantity: number;
          // let each: number = parseFloat(match[5].replace('.', '').replace(',', '.'));
          let transactionValue: number;

          if (parseResult.holder.toLowerCase() !== 'inter') {
            op = match[1];
            // market = match[2];
            stock = this.assetCrawler.getCodeFromTitle(match[3].replace(/\s+/g, ' '));
            quantity = parseInt(match[4]);
            // each = parseFloat(match[5].replace('.', '').replace(',', '.'));
            transactionValue = parseFloat(match[6].replace('.', '').replace(',', '.'));
          } else {
            op = match[2] || '';
            // market = match[1] || '';
            // ? Inter gives ON AMBEV S/A instead of AMBEV S/A ON
            const stockTitle = `${match[7].trim()} ${match[6].trim()}`;
            stock = this.assetCrawler.getCodeFromTitle(stockTitle);
            quantity = parseInt(match[3] || '');
            // each = parseFloat(match[4].replace('.', '').replace(',', '.'));
            transactionValue = parseFloat(match[5].replace('.', '').replace(',', '.'));
          }

          if (!stock) throw new UnknownAsset(`Can't find ${match[3]}`);

          // if (market === 'FRACIONARIO') stock += 'F';
          
          // Set 'buy' or 'sell'
          if (op === 'C') {
            let deal = parseResult.deals.find(el => el.code === stock.code && el.type === 'buy');
            if (!deal) {
              deal = {
                type: 'buy',
                code: stock.code,
                quantity: quantity,
                average: '0.00',
                price: transactionValue.toFixed(2),
                date: parseResult.date,
                cnpj: stock.cnpj?stock.cnpj:'',
                isFII: stock.isFII
              };
              parseResult.deals.push(deal);
            } else {
              deal.price = (parseFloat(deal.price) + transactionValue).toString();
              deal.quantity = deal.quantity + quantity;
            }
          } else {
            let deal = parseResult.deals.find(el => el.code === stock.code && el.type === 'sell');
            if (!deal) {
              deal = {
                type: 'sell',
                code: stock.code,
                quantity: quantity,
                average: '0.00',
                price: transactionValue.toFixed(2),
                date: parseResult.date,
                cnpj: stock.cnpj?stock.cnpj:'',
                isFII: stock.isFII
              };
              parseResult.deals.push(deal);
            } else {
              deal.price = (parseFloat(deal.price) + transactionValue).toString();
              deal.quantity = deal.quantity - quantity;
            }
          }

        }

        pageContent = '';
      }
    }

    // Process the fees
    parseResults.forEach(note => {
      const fees: number = parseFloat(note.fees);
      const buyTotal: number = parseFloat(note.buyTotal);
      const sellTotal: number = parseFloat(note.sellTotal);
      const buyFees: number = fees*buyTotal/(buyTotal+sellTotal);
      const sellFees: number = fees*sellTotal/(buyTotal+sellTotal);
      note.deals.forEach(deal => {
        const price: number = parseFloat(deal.price);
        if (deal.type === 'buy') {
          deal.price = (Math.fround(10*(price + buyFees*price/buyTotal))/10).toFixed(2);
        } else {
          deal.price = (Math.fround(10*(price - sellFees*price/sellTotal))/10).toFixed(2);
        }
        deal.average = (parseFloat(deal.price)/Math.abs(deal.quantity)).toFixed(2);
      });
      note.buyFees = buyFees.toFixed(2);
      note.sellFees = sellFees.toFixed(2);
      note.buyTotal = (buyTotal + buyFees).toFixed(2);
      note.sellTotal = (sellTotal - sellFees).toFixed(2);
    });

    // Format the CNPJs
    parseResults.forEach(el => {
      el.deals.forEach(deal => {
        // For some reason, CNPJs starting wit zeros have them suppressed, even thought it's a string and not a number ¯\_(ツ)_/¯
        if (deal.cnpj.length < 14) deal.cnpj = new Array(14 - deal.cnpj.length).fill('0').join('') + deal.cnpj;

        deal.cnpj = deal.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      });
    });

    return parseResults;
  }

  /**
   * Add stock definition
   * @param code stock code
   * @param name stock name
   * @param cnpj stock CNPJ
   */
  defineStock(code: string, name: string, cnpj?: string, isFII?: boolean): void {
    // Skip duplicates
    if (!this.assetCrawler.customAssets.some(a => a.code === code)) {
      this.assetCrawler.customAssets.push({code, name, cnpj, isFII: !!isFII});
    }
  }

  /**
   * Get the stock dividends and the cash dividends of a given asset, if any
   * @param code the asset code (letter only)
   * @returns and `Array` where the first position is the list of stock dividends
   * and the second position is a list of the cash dividends
   */
  getDividends(code: string): [StockDividend[], CashDividend[]] {
    return this.assetCrawler.getDividends(code);
  }
  
  /**
   * Convert a date according to `dateFormat`
   * @param date the date to be formatted
   * @returns the formatted date
   */
  private formatDate (date: string) {
    if (date.match(/\d{4}-\d{2}-\d{2}/)) {
      if (this.dateFormat === 'yyyy-MM-dd') return date;
      else return date.split('-').reverse().join('/');
    } else {
      if (this.dateFormat === 'dd/MM/yyyy') return date;
      else return date.split('/').reverse().join('-');
    }
  }

}