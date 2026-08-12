/**
 * Bidi text helpers — decide whether a string of mixed-script text should
 * be rendered LTR or RTL based on the first *strong* directional character.
 *
 * The Unicode Bidirectional Algorithm (UAX #9) classifies every character
 * into a directional type: L (left), R (right), AL (Arabic letter), EN
 * (European number), NSM (nonspacing mark), etc. The first strong type
 * (L, R, or AL) sets the *paragraph embedding level*, which then drives
 * every subsequent reordering decision.
 *
 * For UI input direction we only need the first strong result — a Saudi
 * phone number in an otherwise-Arabic paragraph stays inside the RTL
 * flow, and a price tag in an English paragraph stays LTR. The browser
 * does this for us if we set `dir="auto"` on the element, but the
 * behaviour is uneven across engines (Safari historically renders
 * `dir="auto"` controls with the wrong caret on first focus). Doing it
 * ourselves removes that ambiguity and lets us style the input ourselves.
 *
 * NOTE: Whitespace, digits, punctuation, and combining marks are ignored
 * on purpose — they don't set the paragraph direction. We keep walking
 * until we hit a letter from a strong-script unicode block.
 */

/**
 * Unicode ranges for the script families we care about. Each block is
 * its own [\uXXXX-\uYYYY] range. Latin is split into Basic Latin and
 * Latin-1 Supplement; Arabic is a single contiguous block.
 */
const RTL_RANGES: Array<[number, number]> = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0700, 0x074f], // Syriac
  [0x0750, 0x077f], // Arabic Supplement
  [0x0780, 0x07bf], // Thaana
  [0x07c0, 0x07ff], // NKo
  [0x0800, 0x083f], // Samaritan
  [0x0840, 0x085f], // Mandaic
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb1d, 0xfb4f], // Hebrew Presentation Forms
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
];

const LTR_RANGES: Array<[number, number]> = [
  [0x0041, 0x005a], // Basic Latin A-Z
  [0x0061, 0x007a], // Basic Latin a-z
  [0x00c0, 0x024f], // Latin Extended (covers most European scripts)
  [0x0370, 0x03ff], // Greek
  [0x0400, 0x04ff], // Cyrillic
  [0x0530, 0x058f], // Armenian
  [0x10a0, 0x10ff], // Georgian
  [0x13a0, 0x13ff], // Cherokee
  [0x1e00, 0x1eff], // Latin Extended Additional
];

function inAnyRange(code: number, ranges: Array<[number, number]>): boolean {
  for (const [lo, hi] of ranges) {
    if (code >= lo && code <= hi) return true;
  }
  return false;
}

function isStrongRTL(code: number): boolean {
  return inAnyRange(code, RTL_RANGES);
}

function isStrongLTR(code: number): boolean {
  return inAnyRange(code, LTR_RANGES);
}

/**
 * Decide the paragraph direction for `text`. Walks the string left to
 * right looking for the first strong-LTR or strong-RTL character and
 * returns `'rtl'` / `'ltr'` accordingly. Whitespace, digits, and
 * punctuation are skipped.
 *
 * Defaults to `'ltr'` when no strong character is found (empty string,
 * digit-only, emoji-only, etc.). This matches the browser's own
 * `dir="auto"` fallback behaviour.
 */
export function fixRTLText(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr';
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code == null) continue;
    if (isStrongRTL(code)) return 'rtl';
    if (isStrongLTR(code)) return 'ltr';
  }
  return 'ltr';
}
