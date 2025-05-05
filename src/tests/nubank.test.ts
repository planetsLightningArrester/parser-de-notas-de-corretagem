import fs from 'fs';
import path from 'path';
import { NoteParser, NegotiationNote } from '../notes-parser';

const assets = new NoteParser();
const possiblePasswords: string[] = ['123', '456'];

describe('11 FIIs', () => {
  const expected: NegotiationNote[] = [{
    "number": "8242",
    "buyTotal": "19213.30",
    "sellTotal": "0.00",
    "buyFees": "6.14",
    "sellFees": "0.00",
    "fees": "6.14",
    "date": "24/01/2025",
    "holder": "nubank",
    "deals": [{
      "type": "buy",
      "code": "ALZR11",
      "quantity": 24,
      "average": "98.59",
      "price": "2366.20",
      "date": "24/01/2025",
      "cnpj": "28.737.771/0001-85",
      "isFII": true
    }, {
      "type": "buy",
      "code": "HGBS11",
      "quantity": 13,
      "average": "175.92",
      "price": "2286.91",
      "date": "24/01/2025",
      "cnpj": "08.431.747/0001-06",
      "isFII": true
    }, {
      "average": "149.45",
      "cnpj": "11.728.688/0001-47",
      "code": "HGLG11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "298.90",
      "quantity": 2,
      "type": "buy",
    }, {
      "average": "95.81",
      "cnpj": "09.072.017/0001-29",
      "code": "HGRE11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "95.81",
      "quantity": 1,
      "type": "buy",
    }, {
      "average": "113.83",
      "cnpj": "29.641.226/0001-53",
      "code": "HGRU11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "1935.05",
      "quantity": 17,
      "type": "buy",
    },
    {
      "average": "62.62",
      "cnpj": "28.830.325/0001-10",
      "code": "IRDM11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "1252.40",
      "quantity": 20,
      "type": "buy",
    },
    {
      "average": "131.19",
      "cnpj": "12.005.956/0001-65",
      "code": "KNRI11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "2755.03",
      "quantity": 21,
      "type": "buy",
    },
    {
      "average": "71.07",
      "cnpj": "28.152.272/0001-26",
      "code": "RECR11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "6538.69",
      "quantity": 92,
      "type": "buy",
    },
    {
      "average": "94.13",
      "cnpj": "17.554.274/0001-25",
      "code": "VISC11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "1129.56",
      "quantity": 12,
      "type": "buy",
    },
    {
      "average": "91.17",
      "cnpj": "26.502.794/0001-85",
      "code": "XPLG11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "364.68",
      "quantity": 4,
      "type": "buy",
    },
    {
      "average": "95.04",
      "cnpj": "28.757.546/0001-00",
      "code": "XPML11",
      "date": "24/01/2025",
      "isFII": true,
      "price": "190.08",
      "quantity": 2,
      "type": "buy",
    }]
  }];
  test('without password', async () => {
    const filePath: string = path.join(__dirname, 'notes', 'nubank_single_page.pdf');
    if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

    const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
    expect<NegotiationNote[]>(parseResult).toEqual(expected);
  });
});

test('Fractional assets', async () => {
  const expected: NegotiationNote[] = [{
    "buyFees": "3.01",
    "buyTotal": "10062.89",
    "date": "25/02/2025",
    "deals": [{
      "average": "10.82",
      "cnpj": "09.346.601/0001-25",
      "code": "B3SA3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "681.70",
      "quantity": 63,
      "type": "buy",
    },
    {
      "average": "7.22",
      "cnpj": "50.746.577/0001-15",
      "code": "CSAN3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "1798.32",
      "quantity": 249,
      "type": "buy",
    },
    {
      "average": "7.57",
      "cnpj": "15.141.799/0001-03",
      "code": "FESA4",
      "date": "25/02/2025",
      "isFII": false,
      "price": "946.72",
      "quantity": 125,
      "type": "buy",
    },
    {
      "average": "11.51",
      "cnpj": "60.840.055/0001-31",
      "code": "FLRY3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "552.62",
      "quantity": 48,
      "type": "buy",
    },
    {
      "average": "9.08",
      "cnpj": "61.532.644/0001-15",
      "code": "ITSA4",
      "date": "25/02/2025",
      "isFII": false,
      "price": "672.07",
      "quantity": 74,
      "type": "buy",
    },
    {
      "average": "4.16",
      "cnpj": "89.637.490/0001-45",
      "code": "KLBN4",
      "date": "25/02/2025",
      "isFII": false,
      "price": "766.15",
      "quantity": 184,
      "type": "buy",
    },
    {
      "average": "18.72",
      "cnpj": "61.585.865/0001-51",
      "code": "RADL3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "2040.18",
      "quantity": 109,
      "type": "buy",
    },
    {
      "average": "5.36",
      "cnpj": "76.484.013/0001-45",
      "code": "SAPR4",
      "date": "25/02/2025",
      "isFII": false,
      "price": "257.36",
      "quantity": 48,
      "type": "buy",
    },
    {
      "average": "22.05",
      "cnpj": "51.466.860/0001-56",
      "code": "SMTO3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "1124.46",
      "quantity": 51,
      "type": "buy",
    },
    {
      "average": "5.87",
      "cnpj": "84.693.183/0001-68",
      "code": "SHUL4",
      "date": "25/02/2025",
      "isFII": false,
      "price": "751.58",
      "quantity": 128,
      "type": "buy",
    },
    {
      "average": "52.41",
      "cnpj": "84.429.695/0001-11",
      "code": "WEGE3",
      "date": "25/02/2025",
      "isFII": false,
      "price": "471.73",
      "quantity": 9,
      "type": "buy",
    },
    ],
    "fees": "3.01",
    "holder": "nubank",
    "number": "8738",
    "sellFees": "0.00",
    "sellTotal": "0.00",
  }];

  const filePath: string = path.join(__dirname, 'notes', 'nubank_fractional.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});