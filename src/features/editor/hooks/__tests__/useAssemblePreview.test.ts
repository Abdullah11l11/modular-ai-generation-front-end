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
