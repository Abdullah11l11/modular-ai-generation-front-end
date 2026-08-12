import { describe, it, expect } from 'vitest';
import { extractSlideTitle, titleToStemFragment, groupSlides } from '../groupSlides';
import type { ProjectFile } from '@/types/api';

function file(over: Partial<ProjectFile>): ProjectFile {
  return {
    id: over.id ?? 'f-' + Math.random().toString(36).slice(2),
    template_id: null,
    project_id: null,
    layer: 'slide',
    name: 'slide-01.html',
    extension: 'html',
    sort_order: 0,
    content: '',
    storage_url: null,
    size_bytes: null,
    created_at: '',
    updated_at: '',
    ...over,
  };
}

describe('extractSlideTitle', () => {
  it('reads the first h2 data-field="title" text', () => {
    const html = `<section class="mgf-slide"><h2 data-field="title">Title Case From Title Field</h2></section>`;
    expect(extractSlideTitle(html, 'slide-01')).toBe('Title Case From Title Field');
  });

  it('handles attributes in any order', () => {
    const html = `<h3 class="x" data-field="title">Hello</h3>`;
    expect(extractSlideTitle(html, 'slide-02')).toBe('Hello');
  });

  it('strips inline tags inside the heading', () => {
    const html = `<h2 data-field="title">Big <em>Italic</em> Title</h2>`;
    expect(extractSlideTitle(html, 'slide-03')).toBe('Big Italic Title');
  });

  it('falls back to the stem when no title field is present', () => {
    const html = `<section class="mgf-slide"><h2>no data-field</h2></section>`;
    expect(extractSlideTitle(html, 'slide-cover')).toBe('slide-cover');
  });

  it('falls back to the stem when slide HTML is null', () => {
    expect(extractSlideTitle(null, 'slide-04')).toBe('slide-04');
  });
});

describe('titleToStemFragment', () => {
  it('lowercases and dash-joins a title', () => {
    expect(titleToStemFragment('My Title')).toBe('my-title');
  });

  it('strips punctuation', () => {
    expect(titleToStemFragment("What's next?")).toBe('what-s-next');
  });

  it('collapses whitespace runs to a single dash', () => {
    expect(titleToStemFragment('Big   Spaces  Here')).toBe('big-spaces-here');
  });

  it('strips leading and trailing dashes', () => {
    expect(titleToStemFragment('---hi---')).toBe('hi');
  });
});

describe('groupSlides', () => {
  it('uses the data-field title when present', () => {
    const files: ProjectFile[] = [
      file({
        id: 'a',
        name: 'slide-01.html',
        sort_order: 0,
        content: '<h2 data-field="title">Title Case From Title Field</h2>',
      }),
    ];
    const [g] = groupSlides(files);
    expect(g.title).toBe('Title Case From Title Field');
  });

  it('falls back to stem for slides without a title field', () => {
    const files: ProjectFile[] = [
      file({ id: 'a', name: 'slide-cover.html', sort_order: 0, content: '<h2>not it</h2>' }),
    ];
    const [g] = groupSlides(files);
    expect(g.title).toBe('slide-cover');
  });
});
