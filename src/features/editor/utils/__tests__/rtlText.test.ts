import { describe, expect, it } from 'vitest';
import { fixRTLText } from '../rtlText';

describe('fixRTLText', () => {
  it('returns ltr for an empty string', () => {
    expect(fixRTLText('')).toBe('ltr');
  });

  it('returns ltr for plain English', () => {
    expect(fixRTLText('Hello world')).toBe('ltr');
  });

  it('returns rtl for plain Arabic', () => {
    expect(fixRTLText('مرحبا بالعالم')).toBe('rtl');
  });

  it('returns rtl for Hebrew', () => {
    expect(fixRTLText('שלום עולם')).toBe('rtl');
  });

  it('skips leading whitespace, digits, and punctuation before deciding', () => {
    expect(fixRTLText('   123 - "مرحبا"')).toBe('rtl');
    expect(fixRTLText('   123 - "Hello"')).toBe('ltr');
  });

  it('returns rtl for a mixed Arabic-then-English value', () => {
    // First strong char is Arabic → rtl wins, English digits / Latin
    // words inside the paragraph still render correctly via the
    // browser's bidi algorithm.
    expect(fixRTLText('السعر 100 دولار')).toBe('rtl');
  });

  it('returns ltr for a mixed English-then-Arabic value', () => {
    expect(fixRTLText('Total: مرحبا')).toBe('ltr');
  });

  it('returns ltr for digits, punctuation, and emoji-only', () => {
    expect(fixRTLText('123456')).toBe('ltr');
    expect(fixRTLText('---!!!')).toBe('ltr');
    expect(fixRTLText('🎉🚀')).toBe('ltr');
  });

  it('returns ltr for Cyrillic and Greek', () => {
    expect(fixRTLText('Привет мир')).toBe('ltr');
    expect(fixRTLText('Γειά σου Κόσμε')).toBe('ltr');
  });
});
