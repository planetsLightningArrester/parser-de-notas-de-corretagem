# Parse Brazilian brokerage notes PDFs (Rico, Clear, and Inter holders available)

![npm](https://img.shields.io/npm/v/parser-de-notas-de-corretagem) [![CI](https://github.com/planetsLightningArrester/parser-de-notas-de-corretagem/actions/workflows/ci.yml/badge.svg)](https://github.com/planetsLightningArrester/parser-de-notas-de-corretagem/actions/workflows/ci.yml) [![Assets auto update](https://github.com/planetsLightningArrester/parser-de-notas-de-corretagem/actions/workflows/assets-auto-update.yml/badge.svg)](https://github.com/planetsLightningArrester/parser-de-notas-de-corretagem/actions/workflows/assets-auto-update.yml)

Easing the PITA of making IRPF

> Note: This is a JS/TS package. If you want the end-user solution, check the [Leitor de notas de corretagem](https://github.com/planetsLightningArrester/leitor-de-notas-de-corretagem)

> Note: Inter support only v0.8.0 onwards

## Example result

> The `price` and `average` fields already include the fees paid
```JSON
[
  {
    "number": "11111",    // Brokerage note number
    "buyTotal": "4054.58",
    "sellTotal": "0.00",
    "buyFees": "1.24",
    "sellFees": "0.00",
    "fees": "1.24",
    "date": "02/02/2022", // Can also output in yyyy-MM-dd format changing `NoteParser.dateFormat`
    "holder": "rico",
    "deals": [
      {
        "type": "buy",
        "code": "FLRY3",
        "quantity": 62,
        "average": "16.30",
        "price": "1010.91",
        "date": "02/02/2022",
        "cnpj": "60.840.055/0001-31",
        "isFII": false
      },
      {
        "type": "buy",
        "code": "ALZR11",
        "quantity": 5,
        "average": "112.80",
        "price": "564.02",
        "date": "02/02/2022",
        "cnpj": "28.737.771/0001-85",
        "isFII": true
      },
      {
        "type": "buy",
        "code": "HGRU11",
        "quantity": 5,
        "average": "112.03",
        "price": "560.17",
        "date": "02/02/2022",
        "cnpj": "29.641.226/0001-53",
        "isFII": true
      },
      {
        "type": "buy",
        "code": "VISC11",
        "quantity": 15,
        "average": "97.38",
        "price": "1460.69",
        "date": "02/02/2022",
        "cnpj": "17.554.274/0001-25",
        "isFII": true
      },
      {
        "type": "buy",
        "code": "XPML11",
        "quantity": 5,
        "average": "91.76",
        "price": "458.79",
        "date": "02/02/2022",
        "cnpj": "28.757.546/0001-00",
        "isFII": true
      }
    ]
  }
]
``` 

## Install
> npm i parser-de-notas-de-corretagem

## Usage

### Full NodeJS example
```Typescript
import fs from 'fs';
import path from 'path';
import { Deal, NoteParser } from 'parser-de-notas-de-corretagem';

async function main() {

  console.log(`Leitor de Notas de Negociação - GNU GPLv3`);
  
  const assets = new NoteParser();
  try {

    // Get all negotiation notes inside a PDF, even with password
    const possiblePDFpasswords: string[] = ['123', '456'];
    let pdfPath = path.join(__dirname, 'note.pdf');
    let parseResult = await assets.parseNote(path.basename(pdfPath), fs.readFileSync(pdfPath), possiblePDFpasswords);
    
    // Merge all negotiation notes
    let allDeals: Deal[][] = [];
    parseResult.forEach(note => {
      note.deals.forEach(deal => {
        let index = allDeals.findIndex(el => el.some(subEl => subEl.code === deal.code));
        if (index === -1) {
          allDeals.push([deal]);
        } else {
          allDeals[index].push(deal);
        }
      })
    })
    
    // Generate a .csv result
    let result: string = `Código\tCNPJ\tData\tC/V\tQuantidade\tPreço+custos\n`;
    allDeals.forEach(asset => {
      asset.forEach(deal => {
        result += `${deal.code}\t${deal.cnpj}\t${deal.date}\t${deal.type=='buy'?'C':'V'}\t${deal.quantity}\t${deal.price.replace(/\./g, ',')}\n`;
      })
      result += `\n`;
    });
    
    fs.writeFileSync(path.join(__dirname, '..', '..', 'Resultado.csv'), result);
    
    console.log(`Todas as ${parseResult.length} notas foram processadas`);
    console.log(`O arquivo "Resultado.csv" foi gerado no diretório atual.`);

  } catch (error) {
    console.log(error);
  }
}

main();
```

### Browser
Since only `Uint8Array` is accepted, use the following code to convert a string using the browser
```JavaScript
if (typeof fileContent === 'string') fileContent = Uint8Array.from(fileContent, x => x.charCodeAt(0));
assetsParser.parseNote(filePath, fileContent, filePasswords);
```

### Add a custom stock
```Typescript
const assets = new NoteParser();
// Old stocks aren't available by default, but you can add them.
// CNPJ as the third argument is optional
assets.defineStock('BIDI3', 'BANCO INTER ON');
assets.defineStock('BIDI11', 'BANCO INTER UNT');
// If the same asset can have multiple codes, add a "_2", "_3", etc. with the names
this.defineStock('KDIF11', 'KINEA INFRAF FIDC', '26.324.298/0001-89');
this.defineStock('KDIF11_2', 'FDC KINEAINF FIDC', '26.324.298/0001-89');
```

## P.S.
* Total values include fees
* The values can deviate from cents. It's always a good call to double-check if the result is as expected. Check the [License](#license)
* Inter broker has only a few tests, so please open [Issues](https://github.com/planetsLightningArrester/parser-de-notas-de-corretagem/issues) if you find something wrong
* Local auto-update isn't persistent. New releases are done everyday with persistent updates
* Other brokers may work with the internal PDF architecture is the same as the supported brokers

## Contributors
Thanks to whom sent the notes for the tests ❤️. Personal data is not stored neither used on tests, only the notes' content.

## Thanks? U welcome
Consider thanking me: send a "Thanks!" 👋 by [PIX](https://www.bcb.gov.br/en/financialstability/pix_en) 😊
> a09e5878-2355-45f7-9f36-6df4ccf383cf

## License
As license, this software is provided as is, free of charge, **without any warranty whatsoever**. Its author is not responsible for its usage. Use it by your own risk.

[GNU GPLv3](https://choosealicense.com/licenses/gpl-3.0/)
