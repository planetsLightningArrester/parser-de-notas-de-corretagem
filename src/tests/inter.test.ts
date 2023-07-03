import fs from 'fs';
import path from 'path';
import { NoteParser, NegotiationNote } from '../notes-parser';

const assets = new NoteParser();
const possiblePasswords: string[] = ['123', '456'];

describe('multiple KDIFs', () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];
  test('without password', async () => {
    const filePath: string = path.join(__dirname, 'notes', 'inter_single_page.pdf');
    if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
    
    const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
    expect<NegotiationNote[]>(parseResult).toEqual(expected);
  });
});

test('53 KDIFs', async () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];

  const filePath: string = path.join(__dirname, 'notes', 'inter_kdif_53.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
  
  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('ABEV', async () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];

  const filePath: string = path.join(__dirname, 'notes', 'inter_abev.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
  
  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('INBR', async () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];

  const filePath: string = path.join(__dirname, 'notes', 'inter_inbr32.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
  
  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('KDIF with another name', async () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];

  const filePath: string = path.join(__dirname, 'notes', 'inter_kdif_with_another_name.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
  
  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});

test('4 KDIFs', async () => {
  const expected: NegotiationNote[] = [
    {
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
    }
  ];

  const filePath: string = path.join(__dirname, 'notes', 'inter_4_kdif.pdf');
  if (!fs.existsSync(filePath)) throw new Error(`Path ${filePath} doesn't exist`);
  
  const parseResult = await assets.parseNote(filePath, fs.readFileSync(filePath), possiblePasswords);
  expect<NegotiationNote[]>(parseResult).toEqual(expected);
});
