/** Some existing AVIFs contain an all-zero clean-aperture (clap) property.
 * Browsers display the full coded frame, but libheif rejects its 0 denominators.
 * Normalize ONLY that invalid property in an in-memory copy. Do not touch the
 * compressed image, ICC data, valid crop metadata, or the original file. */
export function avifInput(bytes) {
  if (bytes.toString('ascii', 4, 8) !== 'ftyp' || !bytes.subarray(8, 32).includes(Buffer.from('avif'))) return bytes;
  let aperture, dimensions;
  function walk(start, end) {
    for (let offset = start; offset + 8 <= end;) {
      const size = bytes.readUInt32BE(offset);
      if (size < 8 || offset + size > end) return;
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      if (type === 'ispe' && size === 20) dimensions = [bytes.readUInt32BE(offset + 12), bytes.readUInt32BE(offset + 16)];
      if (type === 'clap' && size === 40 && bytes.subarray(offset + 8, offset + 40).every(value => value === 0)) aperture = offset + 8;
      if (['meta', 'iprp', 'ipco'].includes(type)) walk(offset + (type === 'meta' ? 12 : 8), offset + size);
      offset += size;
    }
  }
  walk(0, bytes.length);
  if (aperture === undefined || !dimensions?.every(value => value > 0)) return bytes;
  const normalized = Buffer.from(bytes);
  [dimensions[0], 1, dimensions[1], 1, 0, 1, 0, 1].forEach((value, index) => normalized.writeUInt32BE(value, aperture + index * 4));
  return normalized;
}
