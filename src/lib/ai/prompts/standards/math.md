# Math (KaTeX / LaTeX)

Slides may contain scientific formulas. The renderer is **KaTeX**; the
input is raw LaTeX wrapped in two HTML tags. This file is the contract
between AI-generated HTML and the render layer in
`src/features/editor/utils/mathRender.ts`.

## Tags

Use **exactly** these tags. Anything else is ignored by the renderer.

| Tag | Purpose | Default fallback |
| --- | --- | --- |
| `<span class="math-inline" data-tex="E=mc^2"></span>` | Formula inside running text. | If `data-tex` is empty, the element's own text content is used as the LaTeX source. |
| `<div class="math-block" data-tex="\\frac{a}{b}"></div>` | Standalone, centered formula. | Same fallback rule. |

Both tags must carry `class="math-inline"` / `class="math-block"`
verbatim. `class="katex"` or any other spelling is rejected.

## Conventions

1. **Always escape backslashes.** When writing LaTeX inside an HTML
   attribute (`data-tex="..."`), double-escape every backslash so the
   browser sees a single `\` when KaTeX parses it.

   ```html
   <!-- wrong: single backslash → JSON.parse / DOMParser may strip it -->
   <span class="math-inline" data-tex="\frac{a}{b}"></span>

   <!-- right: double backslash survives the HTML round-trip -->
   <span class="math-inline" data-tex="\\frac{a}{b}"></span>
   ```

2. **HTML-safe content only.** `data-tex` lives inside an attribute —
   never use `"`, `>`, `<`, or unescaped `&`. For multi-character
   LaTeX delimiters like `\\,` (thin space) this is already fine. If
   you need a literal `<` or `>`, write `&lt;` / `&gt;`.

3. **No naked `$...$` or `$$...$$`.** The renderer does not parse
   delimiters; it only acts on the explicit tags. If you need math
   inside a paragraph, use `<span class="math-inline">`.

4. **Self-close the tags.** KaTeX replaces the element body, so the
   inner text is replaced anyway, but a self-closing tag is the
   cleanest contract:

   ```html
   <p>
     The quadratic formula is
     <span class="math-inline" data-tex="x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"></span>.
   </p>
   ```

5. **Wrap blocks in a figure when context matters.** A `math-block`
   element on its own is enough, but if the slide benefits from a
   caption or number, you may put it inside `<figure class="mgf-callout">`:

   ```html
   <figure class="mgf-callout">
     <div class="math-block" data-tex="E = mc^2"></div>
     <figcaption class="mgf-caption">Mass–energy equivalence.</figcaption>
   </figure>
   ```

## Common syntax (cheat sheet)

| LaTeX | Output |
| ----- | ------ |
| `a^2 + b^2 = c^2` | a² + b² = c² |
| `\\frac{a}{b}` | a/b (fraction) |
| `\\sqrt{x}` | √x |
| `\\sqrt[n]{x}` | ⁿ√x |
| `\\sum_{i=1}^{n} i` | Σ i=1..n i |
| `\\int_a^b f(x)\\,dx` | ∫ₐᵇ f(x) dx |
| `\\alpha, \\beta, \\gamma, \\theta` | α, β, γ, θ |
| `\\vec{v}` | →v |
| `\\hat{\\theta}` | θ̂ |
| `\\mathbb{R}` | ℝ |
| `\\mathbf{x}` | **x** |
| `\\text{if } x > 0` | upright "if x > 0" inside math |
| `\\begin{matrix} a & b \\\\ c & d \\end{matrix}` | 2×2 matrix |

For anything beyond these, defer to the upstream KaTeX supported
functions list: <https://katex.org/docs/supported_functions>.

## Asset loading

KaTeX is heavy (~270KB CSS, ~120KB JS). The assembler in
`useAssemblePreview.ts` only injects these assets when
`hasMathContent(bodyHtml)` returns `true` (i.e. the regex
`class="math-(inline|block)"` matches). Slides without math stay
lean.

If a slide needs math but no tag was emitted, **the formula does not
render** — the user sees raw LaTeX text. Always wrap, even for the
simplest `$x^2$`.

## Failure mode

The render hook runs KaTeX with `throwOnError: false` and
`strict: 'ignore'`. A broken formula renders the source text in red
inside the element and adds `data-math-error="..."`. The rest of the
slide keeps working. If you see red text in a preview, the LaTeX
syntax is the problem — usually a missing `\\` or a misspelled command.

## Theme integration

KaTeX's own CSS sets hard-coded colors. The assembler injects
`MATH_THEMED_CSS` overrides that recolor `.katex` using
`var(--mgf-color-text-primary)` and `.katex .color` /
`.katex .textcolor` using `var(--mgf-color-accent)`. As long as the
project's `style.css` defines those tokens, math picks up the theme
automatically — no per-slide work required.

## Worked example

```html
<section class="mgf-slide">
  <p class="mgf-label">Theoretical Physics</p>
  <h2 class="mgf-title">Schrödinger equation</h2>
  <p class="mgf-body">
    The time-dependent form is
    <span class="math-inline" data-tex="i\\hbar \\frac{\\partial}{\\partial t} \\Psi = \\hat{H} \\Psi"></span>,
    where
    <span class="math-inline" data-tex="\\Psi"></span>
    is the wave function.
  </p>
  <div class="math-block" data-tex="\\hat{H} = -\\frac{\\hbar^2}{2m}\\nabla^2 + V(\\mathbf{r})"></div>
  <p class="mgf-caption">H is the Hamiltonian operator acting on the state Ψ.</p>
</section>
```