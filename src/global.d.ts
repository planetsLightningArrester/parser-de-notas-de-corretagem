
// The following declarations are required to test if running in NodeJS
declare interface PDFJSDevType {
  test: (str: string) => void
}
declare namespace NodeJS {
  interface Process {
    type: string
  }
}
declare const PDFJSDev: PDFJSDevType;
