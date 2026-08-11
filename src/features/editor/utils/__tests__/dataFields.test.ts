import { describe, expect, it } from 'vitest';
import {
  extractDataFields,
  updateDataField,
  labelForField,
  isLongTextField,
} from '../dataFields';

const SAMPLE = `
<section class="uvcp-slide">
  <span class="uvcp-label" data-field="label">Problem</span>
  <h2 class="uvcp-title" data-field="title">The problem</h2>
  <p class="uvcp-body" data-field="body">A long paragraph...</p>
  <div class="uvcp-card">
    <p class="uvcp-card-label" data-field="card_0_label">Cost</p>
    <p class="uvcp-card-value" data-field="card_0_value">$3.2M</p>
  </div>
  <div class="uvcp-card">
    <p class="uvcp-card-label" data-field="card_1_label">Risk</p>
    <p class="uvcp-card-value" data-field="card_1_value">High</p>
  </div>
</section>
`;

describe('extractDataFields', () => {
  it('returns one entry per unique data-field key', () => {
    const fields = extractDataFields(SAMPLE);
    expect(fields.map((f) => f.key)).toEqual([
      'label',
      'title',
      'body',
      'card_0_label',
      'card_0_value',
      'card_1_label',
      'card_1_value',
    ]);
  });

  it('captures the current text content as value', () => {
    const fields = extractDataFields(SAMPLE);
    expect(fields.find((f) => f.key === 'title')?.value).toBe('The problem');
    expect(fields.find((f) => f.key === 'card_1_value')?.value).toBe('High');
  });

  it('records the tag name of the first matching element', () => {
    const fields = extractDataFields(SAMPLE);
    expect(fields.find((f) => f.key === 'title')?.tagName).toBe('h2');
    expect(fields.find((f) => f.key === 'body')?.tagName).toBe('p');
  });

  it('returns empty array for empty HTML', () => {
    expect(extractDataFields('')).toEqual([]);
  });
});

describe('updateDataField', () => {
  it('updates the text content of the matching element', () => {
    const next = updateDataField(SAMPLE, 'title', 'New title');
    expect(next).toContain('data-field="title">New title<');
    expect(next).not.toContain('data-field="title">The problem<');
  });

  it('preserves other attributes and structure', () => {
    const next = updateDataField(SAMPLE, 'title', 'Updated');
    expect(next).toContain('class="uvcp-title"');
    expect(next).toContain('section class="uvcp-slide"');
  });

  it('updates all elements with the same key (e.g. cards)', () => {
    const html = `
      <ul>
        <li data-field="point">One</li>
        <li data-field="point">Two</li>
        <li data-field="point">Three</li>
      </ul>
    `;
    // extractDataFields de-dupes; updateDataField still touches every match.
    const next = updateDataField(html, 'point', 'shared');
    expect((next.match(/data-field="point"/g) ?? []).length).toBe(3);
    expect(next).toContain('>shared<');
  });

  it('leaves the HTML unchanged when the key is missing', () => {
    const next = updateDataField(SAMPLE, 'nonexistent', 'whatever');
    expect(next).toContain('data-field="title">The problem<');
  });
});

describe('labelForField', () => {
  it('humanizes snake_case keys', () => {
    expect(labelForField('card_0_label')).toBe('Card 0 Label');
  });

  it('splits camelCase boundaries', () => {
    expect(labelForField('cardTitle')).toBe('Card Title');
  });

  it('handles dash separators', () => {
    expect(labelForField('cta-url')).toBe('Cta Url');
  });
});

describe('isLongTextField', () => {
  it('flags paragraph-style tags as multi-line', () => {
    expect(isLongTextField('p')).toBe(true);
    expect(isLongTextField('div')).toBe(true);
  });

  it('treats headings and inline tags as single-line', () => {
    expect(isLongTextField('h2')).toBe(false);
    expect(isLongTextField('span')).toBe(false);
    expect(isLongTextField('a')).toBe(false);
  });
});
