import fs from 'fs';
import path from 'path';
import { NoteParser, NegotiationNote, UnknownAsset } from '../notes-parser';

const assets = new NoteParser();
const possiblePasswords: string[] = ['123', '456'];

describe('single page with buy and sell and undef', () => {

  const expected: NegotiationNote[] = [
    {
      "number": "44444",
      "buyTotal": "3148.35",
      "sellTotal": "3135.75",
      "buyFees": "1.03",
      "sellFees": "1.03",
      "fees": "2.06",
      "date": "29/09/2020",
      "holder": "clear",
      "deals": [
        {
          "type": "buy",
          "code": "BIDI3",
          "quantity": 141,
          "average": "16.57",
          "price": "2335.73",
          "date": "29/09/2020",
          "cnpj": "00.416.968/0001-01",
          "isFII": false
        },
        {
          "type": "sell",
          "code": "UNDEF: BANCO INTER UNT",
          "quantity": 45,
          "average": "51.92",
          "price": "2336.53",
          "date": "29/09/2020",
          "cnpj": "00.000.000/0000-00",
          "isFII": false
        },
        {
          "type": "sell",
          "code": "ITSA3",
          "quantity": 79,
          "average": "10.12",
          "price": "799.22",
          "date": "29/09/2020",
          "cnpj": "61.532.644/0001-15",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "ITSA4",
          "quantity": 92,
          "average": "8.83",
          "price": "812.63",
          "date": "29/09/2020",
          "cnpj": "61.532.644/0001-15",
          "isFII": false
        }
      ]
    }
  ];

  assets.defineStock('BIDI3', 'BANCO INTER ON', '00.416.968/0001-01');

  test('with password', async () => {
    const filePath: string = path.join(__dirname, 'notes', 'clear_single_page_sell_pwd.pdf');
    if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

    const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords, true);
    expect<NegotiationNote[]>(parseResult).toEqual(expected);
  });
  test('without password', async () => {
    const filePath: string = path.join(__dirname, 'notes', 'clear_single_page_sell.pdf');
    if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

    const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), [], true);
    expect<NegotiationNote[]>(parseResult).toEqual(expected);
  });
});

test('throw error for unknown asset', async () => {
  const filePath: string = path.join(__dirname, 'notes', 'clear_single_page_sell.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  await expect(assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords)).rejects.toThrow(UnknownAsset);
});

test('multi page', async () => {
  const filePath: string = path.join(__dirname, 'notes', 'clear_multi_page.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath));
  expect<NegotiationNote[]>(parseResult).toEqual([
    {
      "number": "33333",
      "buyTotal": "9901.48",
      "sellTotal": "0.00",
      "buyFees": "2.96",
      "sellFees": "0.00",
      "fees": "2.96",
      "date": "18/05/2021",
      "holder": "clear",
      "deals": [
        {
          "type": "buy",
          "code": "AESB3",
          "quantity": 35,
          "average": "14.46",
          "price": "505.94",
          "date": "18/05/2021",
          "cnpj": "37.663.076/0001-07",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "ABEV3",
          "quantity": 29,
          "average": "17.42",
          "price": "505.04",
          "date": "18/05/2021",
          "cnpj": "07.526.557/0001-00",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "B3SA3",
          "quantity": 29,
          "average": "17.47",
          "price": "506.49",
          "date": "18/05/2021",
          "cnpj": "09.346.601/0001-25",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "CSAN3",
          "quantity": 22,
          "average": "22.60",
          "price": "497.13",
          "date": "18/05/2021",
          "cnpj": "50.746.577/0001-15",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "EGIE3",
          "quantity": 13,
          "average": "40.04",
          "price": "520.55",
          "date": "18/05/2021",
          "cnpj": "02.474.103/0001-19",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "FLRY3",
          "quantity": 19,
          "average": "26.45",
          "price": "502.51",
          "date": "18/05/2021",
          "cnpj": "60.840.055/0001-31",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "ITSA4",
          "quantity": 47,
          "average": "10.68",
          "price": "502.11",
          "date": "18/05/2021",
          "cnpj": "61.532.644/0001-15",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "KLBN4",
          "quantity": 94,
          "average": "5.28",
          "price": "496.47",
          "date": "18/05/2021",
          "cnpj": "89.637.490/0001-45",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "MDIA3",
          "quantity": 19,
          "average": "26.67",
          "price": "506.69",
          "date": "18/05/2021",
          "cnpj": "07.206.816/0001-15",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "RADL3",
          "quantity": 19,
          "average": "26.26",
          "price": "498.90",
          "date": "18/05/2021",
          "cnpj": "61.585.865/0001-51",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "SAPR4",
          "quantity": 121,
          "average": "4.13",
          "price": "499.88",
          "date": "18/05/2021",
          "cnpj": "76.484.013/0001-45",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "TRPL4",
          "quantity": 20,
          "average": "26.11",
          "price": "522.16",
          "date": "18/05/2021",
          "cnpj": "02.998.611/0001-04",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "WEGE3",
          "quantity": 16,
          "average": "32.19",
          "price": "515.03",
          "date": "18/05/2021",
          "cnpj": "84.429.695/0001-11",
          "isFII": false
        },
        {
          "type": "buy",
          "code": "ALZR11",
          "quantity": 4,
          "average": "126.44",
          "price": "505.78",
          "date": "18/05/2021",
          "cnpj": "28.737.771/0001-85",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "HGLG11",
          "quantity": 3,
          "average": "170.90",
          "price": "512.70",
          "date": "18/05/2021",
          "cnpj": "11.728.688/0001-47",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "HGRU11",
          "quantity": 5,
          "average": "118.29",
          "price": "591.47",
          "date": "18/05/2021",
          "cnpj": "29.641.226/0001-53",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "HGBS11",
          "quantity": 3,
          "average": "202.69",
          "price": "608.06",
          "date": "18/05/2021",
          "cnpj": "08.431.747/0001-06",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "HGRE11",
          "quantity": 4,
          "average": "130.62",
          "price": "522.46",
          "date": "18/05/2021",
          "cnpj": "09.072.017/0001-29",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "KNRI11",
          "quantity": 1,
          "average": "148.69",
          "price": "148.69",
          "date": "18/05/2021",
          "cnpj": "12.005.956/0001-65",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "VISC11",
          "quantity": 1,
          "average": "109.40",
          "price": "109.40",
          "date": "18/05/2021",
          "cnpj": "17.554.274/0001-25",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "XPLG11",
          "quantity": 1,
          "average": "114.98",
          "price": "114.98",
          "date": "18/05/2021",
          "cnpj": "26.502.794/0001-85",
          "isFII": true
        },
        {
          "type": "buy",
          "code": "XPML11",
          "quantity": 2,
          "average": "104.52",
          "price": "209.03",
          "date": "18/05/2021",
          "cnpj": "28.757.546/0001-00",
          "isFII": true
        }
      ]
    }
  ]);

});
