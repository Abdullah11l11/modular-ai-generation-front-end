import { describe, expect, it } from 'vitest';
import { parseHtmlBlocks, parseJsonBlock } from '../responseParsers';

/**
 * Locks the structure-task reply parsing so the modals keep accepting
 * the three output shapes the prompt elicits:
 *
 *   1. ` ```html ` blocks separated by `<!-- slide-NN -->` markers.
 *   2. ` ```html ` blocks without markers.
 *   3. Plain `<mgf-slide>...</mgf-slide>` HTML without fences.
 *
 * If parseHtmlBlocks regresses, the Structure modal will throw
 * "The model didn't return any ```html code blocks" on a perfectly
 * valid AI reply. This test fails loudly so a contributor notices
 * in CI instead of in the editor.
 */
describe('responseParsers.parseHtmlBlocks', () => {
  it('extracts multiple fenced html blocks separated by <!-- slide-NN --> markers', () => {
    const raw = [
      '```html',
      '<mgf-slide class="mgf-cover"><h1>One</h1></mgf-slide>',
      '```',
      '',
      '<!-- slide-NN -->',
      '',
      '```html',
      '<mgf-slide class="mgf-stats"><h2>Two</h2></mgf-slide>',
      '```',
      '',
      '<!-- slide-NN -->',
      '',
      '```html',
      '<mgf-slide class="mgf-closing"><h3>Three</h3></mgf-slide>',
      '```',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks).toHaveLength(3);
    expect(blocks[0]).toContain('mgf-cover');
    expect(blocks[1]).toContain('mgf-stats');
    expect(blocks[2]).toContain('mgf-closing');
  });

  it('extracts a single fenced html block (no markers)', () => {
    const raw = [
      '```html',
      '<mgf-slide class="mgf-stats"><h2>Solo</h2></mgf-slide>',
      '```',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain('mgf-stats');
  });

  it('falls back to bare <mgf-slide> tags when the model omits fences', () => {
    const raw = [
      'Here are the slides:',
      '<mgf-slide class="mgf-cover"><h1>One</h1></mgf-slide>',
      '',
      '<!-- slide-NN -->',
      '',
      '<mgf-slide class="mgf-stats"><h2>Two</h2></mgf-slide>',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    expect(blocks.some((b) => b.includes('mgf-cover'))).toBe(true);
    expect(blocks.some((b) => b.includes('mgf-stats'))).toBe(true);
  });

  it('recognises legacy <section class="…mgf-slide…"> form too', () => {
    const raw = [
      '```html',
      '<section class="mgf-cover"><h1>Legacy</h1></section>',
      '```',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toContain('<section');
  });

  it('splits a single fence that contains two slides', () => {
    const raw = [
      '```html',
      '<mgf-slide class="mgf-cover"><h1>One</h1></mgf-slide>',
      '<mgf-slide class="mgf-stats"><h2>Two</h2></mgf-slide>',
      '```',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain('mgf-cover');
    expect(blocks[1]).toContain('mgf-stats');
  });

  it('tolerates a space after the language tag (```html )', () => {
    const raw = ['```html ', '<mgf-slide class="x"><h1>S</h1></mgf-slide>', '```'].join('\n');
    const blocks = parseHtmlBlocks(raw);
    expect(blocks.length).toBeGreaterThanOrEqual(1);
  });

  it('deduplicates identical blocks (model sometimes echoes)', () => {
    const raw = [
      '```html',
      '<mgf-slide class="x"><h1>Dup</h1></mgf-slide>',
      '```',
      '',
      '<!-- slide-NN -->',
      '',
      '```html',
      '<mgf-slide class="x"><h1>Dup</h1></mgf-slide>',
      '```',
    ].join('\n');

    const blocks = parseHtmlBlocks(raw);
    expect(blocks).toHaveLength(1);
  });
});

describe('responseParsers.parseJsonBlock', () => {
  it('parses a fenced ```json block', () => {
    const raw = ['```json', '{ "a": 1 }', '```'].join('\n');
    const result = parseJsonBlock(raw);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual({ a: 1 });
  });

  it('reports invalid JSON clearly', () => {
    const raw = ['```json', '{ a: 1 }', '```'].join('\n');
    const result = parseJsonBlock(raw);
    expect(result.ok).toBe(false);
  });

  it('reports missing fence clearly', () => {
    const raw = 'no fence here';
    const result = parseJsonBlock(raw);
    expect(result.ok).toBe(false);
  });
});