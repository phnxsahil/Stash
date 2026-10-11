/** The export boundary uses image, while the listening stats use art. */
export interface ExportArtist {
  name: string;
  image: string;
}

export function toExportArtists(
  artists: readonly { name: string; art: string }[],
): ExportArtist[] {
  return artists.map(({ name, art }) => ({ name, image: art }));
}
