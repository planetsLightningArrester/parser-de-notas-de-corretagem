import { NoteParser } from '../notes-parser';

const assets = new NoteParser();

describe('cash dividends', () => {
  test('real estate', async () => {

    // Both ways should work
    assets.getDividends('BTCI');
    assets.getDividends('BTCI11');

    // Get the dividends
    const [, cash] = assets.getDividends('BTCI11');
    expect(cash.length).toBeGreaterThan(0);

  });

  test('stock', async () => {

    // Both ways should work
    assets.getDividends('B3SA3');
    assets.getDividends('B3SA3');

    // Get the dividends
    const [, cash] = assets.getDividends('B3SA3');
    expect(cash.length).toBeGreaterThan(0);

  })
  
});
