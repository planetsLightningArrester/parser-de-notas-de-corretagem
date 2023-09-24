import fs from 'fs';
import path from 'path';
import { NoteParser, NegotiationNote } from '../notes-parser';

const assets = new NoteParser();
const possiblePasswords: string[] = ['123', '456'];

describe('multiple KDIFs', () => {
  const expected: NegotiationNote[] = [{
    "number": "18772836",
    "buyTotal": "2056.61",
    "sellTotal": "0.00",
    "buyFees": "0.61",
    "sellFees": "0.00",
    "fees": "0.61",
    "date": "29/11/2022",
    "holder": "inter",
    "deals": [{
      "type": "buy",
      "code": "KDIF11",
      "quantity": 16,
      "average": "128.54",
      "price": "2056.61",
      "date": "29/11/2022",
      "cnpj": "26.324.298/0001-89",
      "isFII": false
    }]
  }];
  test('without password', async () => {
    const filePath: string = path.join(__dirname, 'notes', 'inter_single_page.pdf');
    if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

    const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
    expect<NegotiationNote[]>(parseResult).toEqual(expected);
  });
});

test('53 KDIFs', async () => {
  const expected: NegotiationNote[] = [{
    "number": "12694096",
    "buyTotal": "6971.58",
    "sellTotal": "0.00",
    "buyFees": "2.08",
    "sellFees": "0.00",
    "fees": "2.08",
    "date": "16/08/2021",
    "holder": "inter",
    "deals": [{
      "type": "buy",
      "code": "KDIF11",
      "quantity": 53,
      "average": "131.54",
      "price": "6971.58",
      "date": "16/08/2021",
      "cnpj": "26.324.298/0001-89",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_kdif_53.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('sell 250 KDIFs', async () => {
  const expected: NegotiationNote[] = [{
    "number": "22710914",
    "buyTotal": "30309.08",
    "sellTotal": "34176.02",
    "buyFees": "9.09",
    "sellFees": "10.25",
    "fees": "19.34",
    "date": "19/09/2023",
    "holder": "inter",
    "deals": [{
      "type": "sell",
      "code": "KDIF11",
      "quantity": 250,
      "average": "136.70",
      "price": "34176.02",
      "date": "19/09/2023",
      "cnpj": "26.324.298/0001-89",
      "isFII": false
    }, {
      "type": "buy",
      "code": "CPTI11",
      "quantity": 300,
      "average": "101.03",
      "price": "30309.08",
      "date": "19/09/2023",
      "cnpj": "38.065.012/0001-77",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_kdif_250.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('ABEV', async () => {
  const expected: NegotiationNote[] = [{
    "number": "16682230",
    "buyTotal": "2656.79",
    "sellTotal": "0.00",
    "buyFees": "0.79",
    "sellFees": "0.00",
    "fees": "0.79",
    "date": "13/06/2022",
    "holder": "inter",
    "deals": [{
      "type": "buy",
      "code": "ABEV3",
      "quantity": 200,
      "average": "13.28",
      "price": "2656.79",
      "date": "13/06/2022",
      "cnpj": "07.526.557/0001-00",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_abev.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('INBR', async () => {
  const expected: NegotiationNote[] = [{
    "number": "20961166",
    "buyTotal": "0.00",
    "sellTotal": "12.17",
    "buyFees": "0.00",
    "sellFees": "0.00",
    "fees": "0.00",
    "date": "25/05/2023",
    "holder": "inter",
    "deals": [{
      "type": "sell",
      "code": "INBR32",
      "quantity": 1,
      "average": "12.17",
      "price": "12.17",
      "date": "25/05/2023",
      "cnpj": "42.737.954/0001-21",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_inbr32.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('KDIF with another name', async () => {
  const expected: NegotiationNote[] = [{
    "number": "16097271",
    "buyTotal": "1077.91",
    "sellTotal": "0.00",
    "buyFees": "0.32",
    "sellFees": "0.00",
    "fees": "0.32",
    "date": "26/04/2022",
    "holder": "inter",
    "deals": [{
      "type": "buy",
      "code": "KDIF11",
      "quantity": 8,
      "average": "134.74",
      "price": "1077.91",
      "date": "26/04/2022",
      "cnpj": "26.324.298/0001-89",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_kdif_with_another_name.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('4 KDIFs', async () => {
  const expected: NegotiationNote[] = [{
    "number": "11184165",
    "buyTotal": "538.27",
    "sellTotal": "0.00",
    "buyFees": "0.15",
    "sellFees": "0.00",
    "fees": "0.15",
    "date": "26/05/2021",
    "holder": "inter",
    "deals": [{
      "type": "buy",
      "code": "KDIF11",
      "quantity": 4,
      "average": "134.57",
      "price": "538.27",
      "date": "26/05/2021",
      "cnpj": "26.324.298/0001-89",
      "isFII": false
    }]
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_4_kdif.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('Real estate', async () => {
  const expected: NegotiationNote[] = [{
    "buyFees": "7.74",
    "buyTotal": "25819.58",
    "date": "20/07/2023",
    "deals": [{
      "average": "40.43",
      "cnpj": "02.558.157/0001-62",
      "code": "VIVT3",
      "date": "20/07/2023",
      "isFII": false,
      "price": "4043.21",
      "quantity": 100,
      "type": "buy",
    }, {
      "average": "87.26",
      "cnpj": "28.830.325/0001-10",
      "code": "IRDM11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "959.82",
      "quantity": 11,
      "type": "buy",
    }, {
      "average": "142.41",
      "cnpj": "09.072.017/0001-29",
      "code": "HGRE11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "996.89",
      "quantity": 7,
      "type": "buy",
    }, {
      "average": "1050.12",
      "cnpj": "32.317.313/0001-64",
      "code": "KEVE11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "2100.23",
      "quantity": 2,
      "type": "buy",
    }, {
      "average": "12.05",
      "cnpj": "07.859.971/0001-30",
      "code": "TAEE3",
      "date": "20/07/2023",
      "isFII": false,
      "price": "2410.72",
      "quantity": 200,
      "type": "buy",
    }, {
      "average": "161.03",
      "cnpj": "12.005.956/0001-65",
      "code": "KNRI11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "1610.28",
      "quantity": 10,
      "type": "buy",
    }, {
      "average": "88.75",
      "cnpj": "28.152.272/0001-26",
      "code": "RECR11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "1508.69",
      "quantity": 17,
      "type": "buy",
    }, {
      "average": "222.59",
      "cnpj": "08.431.747/0001-06",
      "code": "HGBS11",
      "date": "20/07/2023",
      "isFII": true,
      "price": "890.35",
      "quantity": 4,
      "type": "buy",
    }, {
      "average": "4.14",
      "cnpj": "76.484.013/0001-45",
      "code": "SAPR4",
      "date": "20/07/2023",
      "isFII": false,
      "price": "2070.62",
      "quantity": 500,
      "type": "buy",
    }, {
      "average": "11.71",
      "cnpj": "37.663.076/0001-07",
      "code": "AESB3",
      "date": "20/07/2023",
      "isFII": false,
      "price": "2342.70",
      "quantity": 200,
      "type": "buy",
    }, {
      "average": "28.47",
      "cnpj": "53.113.791/0001-22",
      "code": "TOTS3",
      "date": "20/07/2023",
      "isFII": false,
      "price": "2846.85",
      "quantity": 100,
      "type": "buy",
    }, {
      "average": "9.69",
      "cnpj": "61.532.644/0001-15",
      "code": "ITSA4",
      "date": "20/07/2023",
      "isFII": false,
      "price": "1938.58",
      "quantity": 200,
      "type": "buy",
    }, {
      "average": "4.20",
      "cnpj": "89.637.490/0001-45",
      "code": "KLBN4",
      "date": "20/07/2023",
      "isFII": false,
      "price": "2100.63",
      "quantity": 500,
      "type": "buy",
    }],
    "fees": "7.74",
    "holder": "inter",
    "number": "21748806",
    "sellFees": "0.00",
    "sellTotal": "0.00",
  }];

  const filePath: string = path.join(__dirname, 'notes', 'inter_real_state.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);

  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});