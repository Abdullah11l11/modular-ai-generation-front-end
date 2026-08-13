import { describe, expect, it } from 'vitest';
import { updateDataField } from '@/features/editor/utils/dataFields';

/**
 * Locks the contract that the Content modal relies on when it walks
 * the slide HTMLs and patches `data-field` element text content.
 *
 * If these regress, the modal's "Apply to N slides" will silently
 * miss updates (key looked up, no slide claims it) and the user sees
 * the old copy on the canvas — the exact "content modification is not
 * working" bug we're fixing.
 */
describe('updateDataField (slide-text propagation)', () => {
  it('replaces the text of the matching data-field element', () => {
    const html = `<h2 data-field="title">Old title</h2>`;
    const next = updateDataField(html, 'title', 'New title');
    expect(next).toContain('data-field="title">New title<');
    expect(next).not.toContain('Old title');
  });

  it('leaves sibling elements with different data-field keys alone', () => {
    const html = `<span data-field="eyebrow">Old eyebrow</span><h2 data-field="title">Old title</h2>`;
    const next = updateDataField(html, 'title', 'New title');
    expect(next).toContain('data-field="eyebrow">Old eyebrow<');
    expect(next).toContain('data-field="title">New title<');
  });

  it('updates every occurrence when a key repeats (e.g. card grids)', () => {
    const html = `
      <div class="mgf-card"><p data-field="card_label">A</p><p data-field="card_value">1</p></div>
      <div class="mgf-card"><p data-field="card_label">B</p><p data-field="card_value">2</p></div>`;
    const next = updateDataField(html, 'card_label', 'Same label');
    const matches = next.match(/data-field="card_label">Same label</g) ?? [];
    expect(matches.length).toBe(2);
    // card_value untouched
    expect(next).toContain('data-field="card_value">1<');
    expect(next).toContain('data-field="card_value">2<');
  });

  it('preserves the element\'s class and other attributes', () => {
    const html = `<h2 class="mgf-title" data-field="title">Hello</h2>`;
    const next = updateDataField(html, 'title', 'World');
    expect(next).toContain('class="mgf-title"');
    expect(next).toContain('data-field="title">World<');
  });

  it('returns input unchanged when the key is not present', () => {
    const html = `<h2 data-field="title">Hello</h2>`;
    const next = updateDataField(html, 'subtitle', 'New');
    expect(next).toBe(html);
  });
});

/**
 * Mirrors the modal's `applyChangesToSlides` ownership logic in pure
 * form so we can test the "which slide owns this key" decision in
 * isolation from React.
 */
function applyChanges(
  slideHtmls: Array<{ id: string; html: string }>,
  changes: Record<string, string>,
): { affectedIds: string[]; unmatchedKeys: string[] } {
  const ownersByKey = new Map<string, string[]>();
  for (const s of slideHtmls) {
    const re = /\bdata-field="([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s.html)) !== null) {
      const key = m[1];
      const list = ownersByKey.get(key) ?? [];
      if (!list.includes(s.id)) list.push(s.id);
      ownersByKey.set(key, list);
    }
  }
  const affected = new Set<string>();
  const unmatched: string[] = [];
  for (const key of Object.keys(changes)) {
    const owners = ownersByKey.get(key);
    if (!owners || owners.length === 0) {
      unmatched.push(key);
      continue;
    }
    for (const id of owners) affected.add(id);
  }
  return { affectedIds: [...affected].sort(), unmatchedKeys: unmatched };
}

describe('applyChangesToSlides ownership logic', () => {
  it('marks only slides that own the changed key', () => {
    const slides = [
      { id: 'a', html: `<h2 data-field="title">A</h2>` },
      { id: 'b', html: `<h2 data-field="title">B</h2><p data-field="body">Body</p>` },
    ];
    const out = applyChanges(slides, { title: 'New' });
    expect(out.affectedIds).toEqual(['a', 'b']);
    expect(out.unmatchedKeys).toEqual([]);
  });

  it('reports keys that no slide owns as unmatched', () => {
    const slides = [{ id: 'a', html: `<h2 data-field="title">A</h2>` }];
    const out = applyChanges(slides, { title: 'New', invented_key: 'X' });
    expect(out.affectedIds).toEqual(['a']);
    expect(out.unmatchedKeys).toEqual(['invented_key']);
  });

  it('handles empty change set', () => {
    const slides = [{ id: 'a', html: `<h2 data-field="title">A</h2>` }];
    const out = applyChanges(slides, {});
    expect(out.affectedIds).toEqual([]);
    expect(out.unmatchedKeys).toEqual([]);
  });
});