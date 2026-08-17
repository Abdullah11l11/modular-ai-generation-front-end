import { describe, expect, it } from 'vitest';
import { pdfPageDimensionsInches } from '../exportPdf';

/**
 * Pure-function tests for the exportPdf page-size math. The actual
 * jsPDF round-trip is verified manually via Playwright (canvas /
 * binary output is not representable in jsdom).
 */

describe('pdfPageDimensionsInches', () => {
  it('returns slide dimensions 1:1 for pageSize="slide" (1280x720)', () => {
    const { wIn, hIn } = pdfPageDimensionsInches(1280, 720, 'slide');
    expect(wIn).toBeCloseTo(1280 / 96, 5);
    expect(hIn).toBeCloseTo(720 / 96, 5);
    expect(wIn / hIn).toBeCloseTo(16 / 9, 4);
  });

  it('returns A4 dimensions for pageSize="a4"', () => {
    const { wIn, hIn } = pdfPageDimensionsInches(1280, 720, 'a4');
    expect(wIn).toBeCloseTo(210 / 25.4, 5);
    expect(hIn).toBeCloseTo(297 / 25.4, 5);
  });

  it('returns Letter dimensions for pageSize="letter"', () => {
    const { wIn, hIn } = pdfPageDimensionsInches(1280, 720, 'letter');
    expect(wIn).toBeCloseTo(8.5, 5);
    expect(hIn).toBeCloseTo(11, 5);
  });

  it('preserves the aspect ratio regardless of slide dimensions', () => {
    const a = pdfPageDimensionsInches(1240, 1754, 'slide');
    expect(a.wIn / a.hIn).toBeCloseTo(1240 / 1754, 4);
    const b = pdfPageDimensionsInches(1080, 1080, 'slide');
    expect(b.wIn / b.hIn).toBeCloseTo(1, 4);
  });
});
