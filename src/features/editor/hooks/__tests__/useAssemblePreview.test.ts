import { describe, expect, it } from 'vitest';
import { assemblePreviewHtml } from '../useAssemblePreview';

const BASE_INPUT = {
  slideHtml: '<mgf-slide class="mgf-title">hi</mgf-slide>',
  slideCss: '',
  layoutCss: '',
  layoutHtml: '',
  styleCss: '',
  contentJson: null,
};

describe('assemblePreviewHtml — direction + lang', () => {
  it('sets <html dir="ltr" lang="en"> for LTR projects', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'ltr' });
    expect(html).toMatch(/<html dir="ltr" lang="en">/);
  });

  it('sets <html dir="rtl" lang="ar"> for RTL projects', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toMatch(/<html dir="rtl" lang="ar">/);
  });

  it('always emits a <meta charset> for utf-8', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'ltr' });
    expect(html).toMatch(/<meta charset="utf-8">/);
  });
});

describe('assemblePreviewHtml — Arabic font fallback', () => {
  it('does NOT inject Google Fonts for LTR projects', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'ltr' });
    expect(html).not.toContain('fonts.googleapis.com');
    expect(html).not.toContain('Cairo');
  });

  it('injects preconnect + the Cairo + Noto Naskh Arabic <link> for RTL projects', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
    expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com"');
    expect(html).toContain('family=Cairo');
    expect(html).toContain('family=Noto+Naskh+Arabic');
  });

  it('overrides --mgf-font-body and --mgf-font-display on :root for RTL projects', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toMatch(/:root\s*\{[^}]*--mgf-font-body:[^}]*Cairo/);
    expect(html).toMatch(/:root\s*\{[^}]*--mgf-font-display:[^}]*Cairo/);
  });

  it('includes system Arabic fallbacks (Tahoma, Geeza Pro, Segoe UI) in the stack', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toContain('Tahoma');
    expect(html).toContain('Geeza Pro');
    expect(html).toContain('Segoe UI');
  });
});

describe('assemblePreviewHtml — RTL directional flips', () => {
  it('includes [dir="rtl"] .mgf-list li override rules', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toMatch(/\[dir=["']rtl["']\]\s*\.mgf-list\s*li\s*\{[^}]*padding-left:\s*0/);
    expect(html).toMatch(/\[dir=["']rtl["']\]\s*\.mgf-list\s*li\s*\{[^}]*padding-right:/);
  });

  it('flips the .mgf-list li::before bullet to the right edge under RTL', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toMatch(/\[dir=["']rtl["']\]\s*\.mgf-list\s*li::before\s*\{[^}]*right:\s*0/);
  });

  it('reverses the website nav row under RTL', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'rtl' });
    expect(html).toMatch(/\[dir=["']rtl["']\]\s*\.mgf-website-nav\s*\{[^}]*flex-direction:\s*row-reverse/);
  });

  it('RTL rules are present in BASE_CSS regardless of project direction', () => {
    // The flips live in BASE_CSS so they survive into the iframe even
    // if the project doesn't define its own style.css. Both LTR and
    // RTL projects need the rules to be ready when the user toggles
    // direction from the project settings.
    const ltr = assemblePreviewHtml({ ...BASE_INPUT, direction: 'ltr' });
    expect(ltr).toMatch(/\[dir=["']rtl["']\]\s*\.mgf-list\s*li\s*\{/);
  });
});

describe('assemblePreviewHtml — export mode (interactive: false)', () => {
  it('omits the click-forwarding handler so hyperlinks survive', () => {
    const html = assemblePreviewHtml({
      ...BASE_INPUT,
      direction: 'ltr',
      interactive: false,
    });
    // The marker for CLICK_HANDLER injection is the `'element-click'`
    // postMessage literal. If we still see it in export mode, every
    // anchor in the exported file is being preventDefault'd.
    expect(html).not.toContain("'element-click'");
  });

  it('keeps the click handler in the editor (interactive: true by default)', () => {
    const html = assemblePreviewHtml({ ...BASE_INPUT, direction: 'ltr' });
    expect(html).toContain('window.parent.postMessage');
  });

  it('loads KaTeX from the CDN in export mode when math is present', () => {
    const html = assemblePreviewHtml({
      ...BASE_INPUT,
      direction: 'ltr',
      interactive: false,
      slideHtml: '<span class="math-inline" data-tex="x^2"></span>',
    });
    expect(html).toContain('cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.css');
    expect(html).toContain('cdn.jsdelivr.net/npm/katex@0.18.4/dist/katex.min.js');
  });

  it('loads KaTeX from the local bundle in interactive mode when math is present', () => {
    const html = assemblePreviewHtml({
      ...BASE_INPUT,
      direction: 'ltr',
      slideHtml: '<span class="math-inline" data-tex="x^2"></span>',
    });
    expect(html).toContain('.katex');
    expect(html).not.toContain('cdn.jsdelivr.net/npm/katex');
  });

  it('interactive:false still respects RTL Arabic font injection', () => {
    const html = assemblePreviewHtml({
      ...BASE_INPUT,
      direction: 'rtl',
      interactive: false,
    });
    expect(html).toContain('family=Cairo');
    expect(html).toMatch(/<html dir="rtl" lang="ar">/);
  });
});
