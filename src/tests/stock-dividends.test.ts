import { NoteParser } from '../notes-parser';

const assets = new NoteParser();

describe('stock dividends', () => {
  test('real estate', async () => {

    // Both ways should work
    assets.getDividends('ALZR');
    assets.getDividends('ALZR11');

    // Get the dividends
    const [, cash] = assets.getDividends('ALZR11');
    expect(cash.length).toBeGreaterThan(0);

  })
  
});
