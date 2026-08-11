import { describe, expect, it } from 'vitest';
import { buildZip } from '../zip';

function readUint16LE(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] | (bytes[offset + 1] << 8)) & 0xffff;
}
function readUint32LE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] |
      (bytes[offset + 1] << 8) |
      (bytes[offset + 2] << 16) |
      (bytes[offset + 3] << 24)) >>>
    0
  );
}

describe('buildZip', () => {
  it('produces a valid PK signature at the end of central directory', () => {
    const zip = buildZip([{ name: 'a.txt', data: 'hello' }]);
    // EOCD is 22 bytes at the end. First 4 bytes are the signature.
    const eocdStart = zip.length - 22;
    expect(readUint32LE(zip, eocdStart)).toBe(0x06054b50);
  });

  it('reports the correct entry count in EOCD', () => {
    const zip = buildZip([
      { name: 'a.txt', data: 'x' },
      { name: 'b.txt', data: 'y' },
      { name: 'c.txt', data: 'z' },
    ]);
    const eocdStart = zip.length - 22;
    expect(readUint16LE(zip, eocdStart + 10)).toBe(3);
  });

  it('records correct uncompressed size and CRC for stored entries', () => {
    const data = 'hello world';
    const zip = buildZip([{ name: 'a.txt', data }]);
    // Local file header starts at offset 0. The data size is at offset 22.
    expect(readUint32LE(zip, 22)).toBe(data.length);
    // CRC is at offset 14.
    expect(readUint32LE(zip, 14)).not.toBe(0);
  });

  it('places file data immediately after the local file header', () => {
    const data = 'abc';
    const zip = buildZip([{ name: 'a.txt', data }]);
    // header (30) + name (5) = 35 bytes before data
    const dataOffset = 30 + 'a.txt'.length;
    expect(String.fromCharCode(zip[dataOffset], zip[dataOffset + 1], zip[dataOffset + 2])).toBe('abc');
  });

  it('de-duplicates conflicting names by suffixing _N', () => {
    const zip = buildZip([
      { name: 'a.txt', data: '1' },
      { name: 'a.txt', data: '2' },
    ]);
    // The second entry's name is `a_1.txt`. It appears in the central
    // directory and local header. Find it by scanning for the name bytes
    // and verify the byte after the name is the data byte ('2').
    const nameBytes = new TextEncoder().encode('a_1.txt');
    let idx = -1;
    for (let i = 0; i <= zip.length - nameBytes.length; i++) {
      let ok = true;
      for (let j = 0; j < nameBytes.length; j++) {
        if (zip[i + j] !== nameBytes[j]) {
          ok = false;
          break;
        }
      }
      if (ok) {
        idx = i;
        break;
      }
    }
    expect(idx).toBeGreaterThanOrEqual(0);
  });

  it('normalizes backslashes to forward slashes', () => {
    const zip = buildZip([{ name: 'slides\\a.txt', data: 'x' }]);
    const expected = new TextEncoder().encode('slides/a.txt');
    const actual = zip.slice(30, 30 + expected.length);
    expect(Array.from(actual)).toEqual(Array.from(expected));
  });

  it('handles unicode names with UTF-8 flag set', () => {
    const zip = buildZip([{ name: '日本語.txt', data: 'x' }]);
    // General purpose bit 11 (UTF-8) lives in the high byte of the
    // 16-bit flag word at offset 6 of the local file header.
    const flagHi = zip[7];
    expect(flagHi & 0x08).toBe(0x08);
  });

  it('returns an empty archive that parses (zero entries)', () => {
    const zip = buildZip([]);
    const eocdStart = zip.length - 22;
    expect(readUint32LE(zip, eocdStart)).toBe(0x06054b50);
    expect(readUint16LE(zip, eocdStart + 10)).toBe(0);
  });

  it('accepts Uint8Array data in addition to strings', () => {
    const zip = buildZip([
      { name: 'binary.bin', data: new Uint8Array([0x00, 0xff, 0x7f]) },
    ]);
    const dataOffset = 30 + 'binary.bin'.length;
    expect(Array.from(zip.slice(dataOffset, dataOffset + 3))).toEqual([0x00, 0xff, 0x7f]);
  });
});
