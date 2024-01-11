/** Infos about the page and the total amount of records */
export interface PageInfo {
  /** Current page number */
  pageNumber: number;
  /** Number of results in the page (can be less if it's the last page) */
  pageSize: number;
  /** Number of total records */
  totalRecords: number;
  /** Number of total pages */
  totalPages: number;
}

/** Assets main infos */
export class Asset {
  /** Asset's code */
  code: string;
  /** Asset's name */
  name: string;
  /** Asset's cnpj (registration number) */
  cnpj?: string;
  /** Whether the asset is a FII (real estate) */
  isFII: boolean;

  constructor(code: string, name: string, isFII: boolean, cnpj?: string) {
    this.code = code;
    this.name = name;
    this.cnpj = cnpj;
    this.isFII = isFII;
  }
}
