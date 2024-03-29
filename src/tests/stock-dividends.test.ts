import { NoteParser } from '../notes-parser';

const assets = new NoteParser();

describe('stock dividends', () => {
  test('real estate', async () => {

    // Both ways should work
    assets.getDividends('BTCI');
    assets.getDividends('BTCI11');

    // Get the dividends
    const [events,] = assets.getDividends('BTCI11');
    expect(events.length).toBeGreaterThan(0);

  });

  test('stock', async () => {

    // Both ways should work
    assets.getDividends('B3SA');
    assets.getDividends('B3SA3');

    // Get the dividends
    const [events,] = assets.getDividends('B3SA3');
    expect(events.length).toBeGreaterThan(0);

  });

});
