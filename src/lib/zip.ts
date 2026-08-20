/**
 * Minimal store-only ZIP encoder.
 *
 * Produces a valid ZIP file (PKZIP 2.04) without compression. The output
 * is downloadable in the browser via `URL.createObjectURL(blob)`.
 *
 * Each entry is encoded with method 0 (stored) so we don't need a
 * deflate implementation. CRC32 is computed per entry as required by
 * the ZIP spec.
 *
 * No external dependencies.
 */

const CRC_TABLE: Uint32Array = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * DOS date+time encoding for `lastModFileDate` / `lastModFileTime`.
 * Defaults to the current local time.
 */
function dosDateTime(date: Date): { date: number; time: number } {
  const t =
    date.getTime() && !Number.isNaN(date.getTime()) ? date : new Date();
  const year = Math.max(1980, t.getFullYear());
  const month = t.getMonth() + 1;
  const day = t.getDate();
  const hours = t.getHours();
  const minutes = t.getMinutes();
  const seconds = Math.floor(t.getSeconds() / 2); // DOS 2-second resolution
  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds,
  };
}

export type ZipEntry = {
  /** Path inside the archive, e.g. "slides/slide-01.html". Forward slashes only. */
  name: string;
  /** File contents (string is UTF-8 encoded). */
  data: string | Uint8Array;
};

const SIG_LOCAL_FILE_HEADER = 0x04034b50;
const SIG_CENTRAL_DIR_HEADER = 0x02014b50;
const SIG_END_OF_CENTRAL_DIR = 0x06054b50;

/**
 * Build a ZIP archive as a single Uint8Array. Stores entries without
 * compression (method 0).
 *
 * Forward slashes are normalized to the ZIP-required form. Duplicate
 * names are de-duplicated by appending `_N` before the extension.
 */
export function buildZip(entries: ZipEntry[]): Uint8Array {
  const seen = new Set<string>();
  const resolved: { name: string; bytes: Uint8Array }[] = entries.map((e) => {
    const name = e.name.replace(/\\/g, '/');
    let unique = name;
    let n = 1;
    while (seen.has(unique)) {
      const dot = name.lastIndexOf('.');
      const slash = name.lastIndexOf('/');
      const ext = dot > slash ? name.slice(dot) : '';
      const stem = dot > slash ? name.slice(0, dot) : name;
      unique = `${stem}_${n}${ext}`;
      n++;
    }
    seen.add(unique);
    return {
      name: unique,
      bytes: typeof e.data === 'string' ? encodeUtf8(e.data) : e.data,
    };
  });

  const { date: dosDate, time: dosTime } = dosDateTime(new Date());

  // Pre-compute CRCs and pass 1: local headers + data
  type LocalRec = {
    nameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
  };
  const localRecords: LocalRec[] = [];
  let cursor = 0;

  for (const entry of resolved) {
    const nameBytes = encodeUtf8(entry.name);
    const crc = crc32(entry.bytes);

    // Local file header: 30 bytes + name
    const lh = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, SIG_LOCAL_FILE_HEADER, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, 0x0800, true); // general purpose flag: UTF-8 names
    lv.setUint16(8, 0, true); // method 0 = stored
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, entry.bytes.length, true); // compressed size
    lv.setUint32(22, entry.bytes.length, true); // uncompressed size (same, stored)
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // extra field length
    lh.set(nameBytes, 30);

    localRecords.push({
      nameBytes,
      dataBytes: entry.bytes,
      crc,
      offset: cursor,
    });
    cursor += lh.length + entry.bytes.length;
  }

  // Pass 2: central directory
  const cdStart = cursor;
  for (const rec of localRecords) {
    const ch = new Uint8Array(46 + rec.nameBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, SIG_CENTRAL_DIR_HEADER, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, 0x0800, true); // general purpose flag
    cv.setUint16(10, 0, true); // method 0 = stored
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, rec.crc, true);
    cv.setUint32(20, rec.dataBytes.length, true); // compressed size
    cv.setUint32(24, rec.dataBytes.length, true); // uncompressed size
    cv.setUint16(28, rec.nameBytes.length, true);
    cv.setUint16(30, 0, true); // extra field length
    cv.setUint16(32, 0, true); // comment length
    cv.setUint16(34, 0, true); // disk number
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, rec.offset, true);
    ch.set(rec.nameBytes, 46);
    cursor += ch.length;
  }
  const cdSize = cursor - cdStart;

  // End of central directory
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, SIG_END_OF_CENTRAL_DIR, true);
  ev.setUint16(4, 0, true); // disk number
  ev.setUint16(6, 0, true); // start disk
  ev.setUint16(8, localRecords.length, true); // entries on this disk
  ev.setUint16(10, localRecords.length, true); // total entries
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, cdStart, true);
  ev.setUint16(20, 0, true); // comment length

  // Concatenate everything
  const total = cursor + eocd.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const rec of localRecords) {
    const lh = new Uint8Array(30 + rec.nameBytes.length);
    const lv = new DataView(lh.buffer);
    lv.setUint32(0, SIG_LOCAL_FILE_HEADER, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, rec.crc, true);
    lv.setUint32(18, rec.dataBytes.length, true);
    lv.setUint32(22, rec.dataBytes.length, true);
    lv.setUint16(26, rec.nameBytes.length, true);
    lv.setUint16(28, 0, true);
    lh.set(rec.nameBytes, 30);
    out.set(lh, off);
    off += lh.length;
    out.set(rec.dataBytes, off);
    off += rec.dataBytes.length;
  }
  // re-walk central dir (same construction)
  for (const rec of localRecords) {
    const ch = new Uint8Array(46 + rec.nameBytes.length);
    const cv = new DataView(ch.buffer);
    cv.setUint32(0, SIG_CENTRAL_DIR_HEADER, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, rec.crc, true);
    cv.setUint32(20, rec.dataBytes.length, true);
    cv.setUint32(24, rec.dataBytes.length, true);
    cv.setUint16(28, rec.nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, rec.offset, true);
    ch.set(rec.nameBytes, 46);
    out.set(ch, off);
    off += ch.length;
  }
  out.set(eocd, off);
  return out;
}

/**
 * Trigger a browser download of `bytes` as a file named `filename`.
 */
export function downloadBytes(bytes: Uint8Array, filename: string, mime = 'application/octet-stream'): void {
  // Copy into a fresh ArrayBuffer to satisfy Blob's stricter ArrayBuffer
  // typing in newer TS lib defs (Uint8Array<ArrayBufferLike>).
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  const blob = new Blob([buf], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
