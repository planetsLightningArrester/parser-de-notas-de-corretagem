import fs from 'fs';
import path from 'path';
import { NoteParser, NegotiationNote } from '../notes-parser';

const assets = new NoteParser();
const possiblePasswords: string[] = ['123', '456'];

describe('single page', () => {
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
