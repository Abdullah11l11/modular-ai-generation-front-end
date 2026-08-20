import { describe, expect, it } from 'vitest';
import {
  diffClasses,
  extractDefinedClassesFromCss,
  extractDefinedClassesFromMarkdown,
  extractUsedClassesFromHtml,
  resolveVocabulary,
} from '../classVocabulary';

/**
 * Locks the contract the Structure modal relies on:
 *   1. Defined classes are pulled from layout.css (or fallback MD).
 *   2. Used classes are pulled from generated HTML.
 *   3. Unknown classes (invented by the model) are surfaced to the UI.
 *
 * If these regress, the modal's "⚠ invented classes" warning stops
 * working and the user gets messy unstyled slides again.
 */
describe('classVocabulary.extractDefinedClassesFromCss', () => {
  it('finds single-class selectors', () => {
    const out = extractDefinedClassesFromCss('.foo { color: red; }');
    expect(out.has('foo')).toBe(true);
  });

  it('finds every token in a multi-class chain', () => {
    const out = extractDefinedClassesFromCss('.a.b.c { display: grid; }');
    expect(out.has('a')).toBe(true);
    expect(out.has('b')).toBe(true);
    expect(out.has('c')).toBe(true);
  });

  it('strips pseudo-classes and pseudo-elements', () => {
    const out = extractDefinedClassesFromCss('.foo:hover { color: red; } .bar::before { content: ""; }');
    expect(out.has('foo')).toBe(true);
    expect(out.has('foo:hover')).toBe(false);
    expect(out.has('bar')).toBe(true);
    expect(out.has('bar::before')).toBe(false);
  });

  it('ignores commented-out selectors', () => {
    const out = extractDefinedClassesFromCss('/* .hidden { display: none; } */ .visible { }');
    expect(out.has('hidden')).toBe(false);
    expect(out.has('visible')).toBe(true);
  });

  it('handles empty input', () => {
    expect(extractDefinedClassesFromCss('').size).toBe(0);
  });

  it('only matches proper identifiers (no spaces in name)', () => {
    const out = extractDefinedClassesFromCss('.foo .bar { } .baz { }');
    expect(out.has('foo')).toBe(true);
    expect(out.has('bar')).toBe(true);
    expect(out.has('baz')).toBe(true);
  });
});

describe('classVocabulary.extractUsedClassesFromHtml', () => {
  it('extracts mgf-* tokens from class attributes', () => {
    const html = '<mgf-slide class="mgf-cover mgf-flex">…</mgf-slide>';
    const out = extractUsedClassesFromHtml(html);
    expect(out.has('mgf-cover')).toBe(true);
    expect(out.has('mgf-flex')).toBe(true);
  });

  it('ignores non-mgf classes', () => {
    const html = '<div class="foo mgf-card bar">…</div>';
    const out = extractUsedClassesFromHtml(html);
    expect(out.has('foo')).toBe(false);
    expect(out.has('bar')).toBe(false);
    expect(out.has('mgf-card')).toBe(true);
  });

  it('handles single-quoted attributes', () => {
    const html = "<div class='mgf-cta-solid'>x</div>";
    const out = extractUsedClassesFromHtml(html);
    expect(out.has('mgf-cta-solid')).toBe(true);
  });

  it('returns empty set on empty input', () => {
    expect(extractUsedClassesFromHtml('').size).toBe(0);
  });

  it('walks every class attribute in the document', () => {
    const html = `
      <mgf-slide class="mgf-cover">
        <div class="mgf-card mgf-cta-solid">
          <span class="mgf-eyebrow">x</span>
        </div>
      </mgf-slide>`;
    const out = extractUsedClassesFromHtml(html);
    expect(out.size).toBe(4);
    expect(out.has('mgf-cover')).toBe(true);
    expect(out.has('mgf-card')).toBe(true);
    expect(out.has('mgf-cta-solid')).toBe(true);
    expect(out.has('mgf-eyebrow')).toBe(true);
  });
});

describe('classVocabulary.extractDefinedClassesFromMarkdown', () => {
  it('pulls mgf-* names out of a markdown table', () => {
    const md = `
| Class                | Notes                          |
| -------------------- | ------------------------------ |
| \`mgf-grid-2\`        | Two-column grid.               |
| \`mgf-grid-3\`        | Three-column grid.             |
`;
    const out = extractDefinedClassesFromMarkdown(md);
    expect(out.has('mgf-grid-2')).toBe(true);
    expect(out.has('mgf-grid-3')).toBe(true);
  });

  it('pulls mgf-* names out of inline code spans', () => {
    const md = 'Use `mgf-card-accent` for the left-bordered card variant.';
    const out = extractDefinedClassesFromMarkdown(md);
    expect(out.has('mgf-card-accent')).toBe(true);
  });

  it('ignores non-mgf identifiers', () => {
    const md = '`foo` and `bar` are not framework classes.';
    const out = extractDefinedClassesFromMarkdown(md);
    expect(out.size).toBe(0);
  });
});

describe('classVocabulary.diffClasses', () => {
  it('partitions used into known and unknown', () => {
    const def = new Set(['mgf-card', 'mgf-grid-3']);
    const used = new Set(['mgf-card', 'mgf-invented', 'mgf-grid-3']);
    const { known, unknown } = diffClasses(def, used);
    expect(known).toEqual(['mgf-card', 'mgf-grid-3']);
    expect(unknown).toEqual(['mgf-invented']);
  });

  it('returns sorted arrays for stable UI display', () => {
    const def = new Set(['mgf-z']);
    const used = new Set(['mgf-b', 'mgf-a', 'mgf-z']);
    const { known, unknown } = diffClasses(def, used);
    expect(known).toEqual(['mgf-z']);
    expect(unknown).toEqual(['mgf-a', 'mgf-b']);
  });

  it('handles empty inputs', () => {
    const { known, unknown } = diffClasses(new Set(), new Set());
    expect(known).toEqual([]);
    expect(unknown).toEqual([]);
  });
});

describe('classVocabulary.resolveVocabulary', () => {
  it('uses project layout.css when it has classes', () => {
    const out = resolveVocabulary('.mgf-card { } .mgf-grid-2 { }', '');
    expect(out.source).toBe('project');
    expect(out.defined.has('mgf-card')).toBe(true);
    expect(out.defined.has('mgf-grid-2')).toBe(true);
  });

  it('falls back to canonical MD when layout.css is empty', () => {
    const md = '| `mgf-fallback` | ... |';
    const out = resolveVocabulary('', md);
    expect(out.source).toBe('fallback');
    expect(out.defined.has('mgf-fallback')).toBe(true);
  });

  it('falls back when layout.css has no classes (only vars)', () => {
    const css = `:root { --mgf-color-bg: #000; }`;
    const md = '| `mgf-fallback` | ... |';
    const out = resolveVocabulary(css, md);
    expect(out.source).toBe('fallback');
    expect(out.defined.has('mgf-fallback')).toBe(true);
  });
});