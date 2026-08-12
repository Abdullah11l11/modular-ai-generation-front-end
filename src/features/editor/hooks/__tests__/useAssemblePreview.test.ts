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
