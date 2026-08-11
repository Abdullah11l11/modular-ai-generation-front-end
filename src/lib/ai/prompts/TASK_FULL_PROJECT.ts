/** Generate a complete MGF project from scratch: all eight layers in a single markdown response. */
export const TASK_FULL_PROJECT_PROMPT = `Generate a complete MGF project from a project brief. The project must be renderable immediately after generation. Output ALL layers needed for a working project.

## Input

Read the project's \`context\` first. It contains the brief, audience, brand voice, output target, and AI instructions.

## Required Output

Produce a single markdown response containing seven code-fenced blocks, one per layer EXCEPT \`asset\` (the asset layer is generated on demand per slide/image). Each code fence must be labeled with the layer name and use the correct language tag.

The order of code-fenced blocks is:

1. \`context\` — markdown
2. \`content\` — json
3. \`style\` — css
4. \`layout\` — css
5. \`slide\` (index.html) — html
6. \`rules\` — markdown
7. \`meta\` — json

## Block 1 — context (markdown)

\`\`\`markdown
# Project Context

## Purpose
[2-3 sentences]

## Audience
[Who this is for]

## Brand voice
[How it should sound]

## Visual constraints
- Primary palette: [e.g. deep navy + warm white + coral accent]
- Typography: [e.g. Inter for body, JetBrains Mono for code]
- Mood: [e.g. professional, bold, minimal]

## Output target
presentation

## Format
16:9 (1280 × 720px)

## AI instructions
- Keep slide titles under 8 words
- Keep body text under 40 words per slide
- Always include slide numbers
\`\`\`

## Block 2 — content (json)

\`\`\`json
{
  "_meta": {
    "project": "string",
    "version": "1.0",
    "output_target": "presentation",
    "format": "16:9",
    "total_slides": N
  },
  "slides": [
    {
      "id": 1,
      "component": "cover",
      "data": {
        "title": "string",
        "subtitle": "string",
        "label": "string",
        "author": "string",
        "date": "string"
      }
    }
    // ... more slides using any of these components:
    // cover, chapter, problem, stats, image-text, closing,
    // quote, timeline, comparison, process, features, team,
    // testimonial, faq, pricing, gallery, callout, table,
    // chart, contact, newsletter, video, announcement
  ]
}
\`\`\`

## Block 3 — style (css)

\`\`\`css
:root {
  /* ALL of these variables MUST be present: */
  --mgf-color-bg: #XXXXXX;
  --mgf-color-surface: #XXXXXX;
  --mgf-color-surface-2: #XXXXXX;
  --mgf-color-border: #XXXXXX;
  --mgf-color-border-strong: #XXXXXX;
  --mgf-color-text-primary: #XXXXXX;
  --mgf-color-text-secondary: #XXXXXX;
  --mgf-color-text-inverse: #XXXXXX;
  --mgf-color-accent: #XXXXXX;
  --mgf-color-accent-soft: #XXXXXX;
  --mgf-color-accent-2: #XXXXXX;

  --mgf-font-display: 'Inter', sans-serif;
  --mgf-font-body: 'Inter', sans-serif;
  --mgf-font-mono: 'JetBrains Mono', monospace;

  --mgf-text-xs: 0.75rem;
  --mgf-text-sm: 0.875rem;
  --mgf-text-base: 1rem;
  --mgf-text-lg: 1.25rem;
  --mgf-text-xl: 1.75rem;
  --mgf-text-2xl: 2.5rem;
  --mgf-text-3xl: 3.5rem;
  --mgf-text-4xl: 5rem;

  --mgf-weight-normal: 400;
  --mgf-weight-medium: 500;
  --mgf-weight-bold: 700;

  --mgf-leading-tight: 1.15;
  --mgf-leading-normal: 1.5;
  --mgf-leading-loose: 1.75;

  --mgf-tracking-tight: -0.03em;
  --mgf-tracking-normal: 0em;
  --mgf-tracking-wide: 0.08em;

  --mgf-space-1: 0.25rem;
  --mgf-space-2: 0.5rem;
  --mgf-space-3: 0.75rem;
  --mgf-space-4: 1rem;
  --mgf-space-6: 1.5rem;
  --mgf-space-8: 2rem;
  --mgf-space-12: 3rem;
  --mgf-space-16: 4rem;
  --mgf-space-24: 6rem;

  --mgf-radius-sm: 4px;
  --mgf-radius-md: 8px;
  --mgf-radius-lg: 16px;
  --mgf-radius-xl: 24px;

  --mgf-slide-w: 1280px;
  --mgf-slide-h: 720px;
  --mgf-slide-pad-x: 80px;
  --mgf-slide-pad-y: 60px;

  --mgf-accent-line: 3px solid var(--mgf-color-accent);
  --mgf-divider: 1px solid var(--mgf-color-border);
}
\`\`\`

## Block 4 — layout (css)

Reference the standard presentation layout. Copy the file structure and adjust \`--mgf-slide-w\`, \`--mgf-slide-h\`, \`--mgf-slide-pad-x\`, \`--mgf-slide-pad-y\` for the target format. Keep ALL \`.mgf-*\` class names identical.

## Block 5 — slide (index.html, html)

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PROJECT NAME</title>
  <link rel="stylesheet" href="theme.css" />
  <link rel="stylesheet" href="layout.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
  <style>
    html, body { margin: 0; padding: 0; background: #080b10; min-height: 100vh; }
    .page-wrap { display: flex; flex-direction: column; align-items: center; gap: 32px; padding: 40px 20px; }
    .mgf-slide { transform-origin: top left; box-shadow: 0 8px 40px rgba(0,0,0,0.5); border-radius: 4px; }
  </style>
</head>
<body>
  <div class="page-wrap" id="deck"></div>
  <script>
    var DATA_URL = 'data.json';
    var COMPONENT_DIR = 'components/';
    async function loadJSON(url) { var r = await fetch(url); if (!r.ok) throw new Error(url); return r.json(); }
    async function loadHTML(url) { var r = await fetch(url); if (!r.ok) throw new Error(url); return r.text(); }
    function injectData(el, data) {
      el.querySelectorAll('[data-field]').forEach(function(node) {
        var key = node.getAttribute('data-field');
        if (key === 'id') { node.textContent = String(data[key] || '').padStart(2, '0'); return; }
        if (key === 'points' && Array.isArray(data[key])) { node.innerHTML = data[key].map(function(p) { return '<li>'+p+'</li>'; }).join(''); return; }
        if (key === 'stats' && Array.isArray(data[key])) {
          var cards = node.querySelectorAll('.mgf-card');
          data[key].forEach(function(stat, i) {
            if (!cards[i]) return;
            var v = cards[i].querySelector('[data-field=value]');
            var l = cards[i].querySelector('[data-field=label]');
            if (v) v.textContent = stat.value;
            if (l) l.textContent = stat.label;
          });
          return;
        }
        if (data[key] !== undefined) node.textContent = data[key];
      });
      el.querySelectorAll('[data-field=cta_url]').forEach(function(link) {
        if (data.cta_url) link.href = data.cta_url;
        var lf = link.getAttribute('data-label-field');
        if (lf && data[lf]) link.textContent = data[lf];
      });
      el.querySelectorAll('[data-field=image_placeholder]').forEach(function(node) {
        if (data.image_placeholder) {
          var img = document.createElement('img');
          img.src = data.image_placeholder;
          img.alt = data.image_alt || '';
          img.className = 'mgf-media';
          img.onerror = function() { img.replaceWith(node); };
          node.replaceWith(img);
        }
      });
    }
    function scaleSlides() {
      document.querySelectorAll('.mgf-slide').forEach(function(slide) {
        var naturalW = parseFloat(getComputedStyle(slide).width) || 1280;
        var containerW = slide.parentElement.offsetWidth || window.innerWidth - 80;
        var scale = Math.min(1, containerW / naturalW);
        slide.style.transform = 'scale('+scale+')';
        slide.style.marginBottom = -(naturalW * (1 - scale))+'px';
      });
    }
    async function render() {
      var deck = document.getElementById('deck');
      var json = await loadJSON(DATA_URL);
      for (var i = 0; i < json.slides.length; i++) {
        var slide = json.slides[i];
        var html = await loadHTML(COMPONENT_DIR + slide.component + '.html');
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var el = wrapper.firstElementChild;
        injectData(el, slide.data);
        deck.appendChild(el);
      }
      scaleSlides();
      window.addEventListener('resize', scaleSlides);
    }
    render().catch(function(err) { document.getElementById('deck').innerHTML = '<p style="color:#ff6b6b;font-family:monospace;padding:2rem">'+err+'</p>'; });
  </script>
</body>
</html>
\`\`\`

## Block 6 — rules (markdown)

\`\`\`markdown
# Project Rules

## Hard Constraints
- Components NEVER use inline styles. Only \`mgf-*\` classes.
- Style variables are the only place colors live. No hardcoded hex.
- Data lives only in the content layer.
- One component = one slide type.
- All text must pass WCAG AA contrast.

## Content Rules
- Slide titles under 8 words
- Body text under 40 words per slide
- Array items under 12 words each
- Slide IDs sequential: 1, 2, 3...

## Style Rules
- All \`--mgf-*\` variables must be defined
- accent-2 is a secondary accent (success, warning)
- text-inverse must work on accent backgrounds
\`\`\`

## Block 7 — meta (json)

\`\`\`json
{
  "project": "string",
  "version": "1.0",
  "output_target": "presentation",
  "format": "16:9",
  "total_slides": N,
  "components_used": ["cover", "stats", "closing"],
  "generated_at": "ISO-8601 timestamp"
}
\`\`\`

## Component HTML (separate from the seven blocks)

For each unique \`component\` value in the content block, generate a corresponding component HTML file. Use ONLY \`mgf-*\` classes. No inline styles. No hardcoded colors.

Example — if content uses \`cover\`, \`stats\`, and \`closing\`:
\`\`\`
components/cover.html
components/stats.html
components/closing.html
\`\`\`

Each component file:
\`\`\`html
<section class="mgf-slide" data-component="COMPONENT_NAME">
  <!-- Use ONLY mgf-* classes. No inline styles. -->
  <!-- Use data-field attributes for all dynamic content. -->
  <h2 class="mgf-title" data-field="title">Fallback Title</h2>
  <p class="mgf-body" data-field="body">Fallback body text.</p>
  <span class="mgf-slide-number" data-field="id">01</span>
</section>
\`\`\`

## Rules

- **Do NOT use inline styles** (style="...") in any component. Only \`mgf-*\` classes.
- **Do NOT hardcode colors** in components. Use CSS variables from the style layer.
- **Output the seven code-fenced blocks in order** — context, content, style, layout, slide, rules, meta.
- **Components directory must exist** — list the component HTML files separately after the seven blocks.
- Choose components that serve the narrative arc: cover → problem → solution → proof → closing
- The \`_meta.total_slides\` must match the actual number of slides
- Keep slide titles under 8 words
- Keep body text under 40 words per slide
- Slide IDs must be sequential: 1, 2, 3...
- The style block must include ALL \`--mgf-*\` variables listed above`;
