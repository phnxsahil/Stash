import { describe, expect, it } from 'vitest';
import { toExportArtists } from './exportArtists';

describe('artist export contract', () => {
  it('maps artwork to the image field in the same order', () => {
    expect(toExportArtists([
      { name: 'First', art: '/first.png' },
      { name: 'Second', art: '/second.png' },
    ])).toEqual([
      { name: 'First', image: '/first.png' },
      { name: 'Second', image: '/second.png' },
    ]);
  });

  it('does not mutate or alias the stats objects', () => {
    const artist = Object.freeze({ name: 'Artist', art: '/art.png', count: 3 });
    const artists = Object.freeze([artist]);
    const exported = toExportArtists(artists);
    expect(exported[0]).not.toBe(artist);
    expect(artist).toEqual({ name: 'Artist', art: '/art.png', count: 3 });
    expect(exported[0]).toEqual({ name: 'Artist', image: '/art.png' });
  });

  it('accepts empty history and preserves missing artwork as an empty string', () => {
    expect(toExportArtists([])).toEqual([]);
    expect(toExportArtists([{ name: 'Artist', art: '' }])).toEqual([
      { name: 'Artist', image: '' },
    ]);
  });
});
