import { describe, expect, it } from 'vitest';
import { getSharedUrlFromSearch } from './shareTarget';

describe('share target parsing', () => {
  it.each([
    ['?url=https%3A%2F%2Fwww.instagram.com%2Freel%2Fabc%2F', 'https://www.instagram.com/reel/abc/'],
    ['?text=Listen%20to%20this%20https%3A%2F%2Fyoutu.be%2Fabc123%3Fsi%3Dxyz', 'https://youtu.be/abc123?si=xyz'],
    ['?title=Found%20it%20https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dabc.', 'https://www.youtube.com/watch?v=abc'],
  ])('extracts a URL from %s', (search, expected) => {
    expect(getSharedUrlFromSearch(search)).toBe(expected);
  });

  it('ignores share payloads without a URL', () => {
    expect(getSharedUrlFromSearch('?text=Just%20a%20song%20title')).toBeNull();
  });
});
