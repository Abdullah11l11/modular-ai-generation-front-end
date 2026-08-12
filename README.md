# MGF Editor — Front-End

React + TypeScript + Vite front-end for the Modular Generation
Framework editor. Produces and edits MGF projects — single-source
slides, decks, and scrollable websites — backed by the Laravel
service in `01_MGF_BACKEND`.

## Project types

The editor supports these archetypes (seeded as Laravel projects /
templates in `01_MGF_BACKEND/database/seeders/Concerns/MgfFileBuilders.php`):

| Archetype | Project type | Layout file | Slide model |
| --------- | ------------ | ----------- | ----------- |
| `pitch`   | `presentation` | `layout.css` | One viewport per slide, keyboard nav, slide counter. |
| `summary` | `presentation` | `layout.css` | Same as pitch; shorter decks. |
| `minimal` | `presentation` | `layout.css` | 2-slide scaffold. |
| `website` | `website`      | `layout.html` | Slides concatenate into one scrollable page inside `{{slides}}`. |

The renderer auto-detects scrollable types
(`website`, `poster`, `infographic`, `document`, `landing-page`)
via `isScrollableType(projectType)` and skips the per-viewport deck
chrome — sections just stack.

## Math (KaTeX)

Slides may include scientific formulas. Use the convention in
[`src/lib/ai/prompts/standards/math.md`](src/lib/ai/prompts/standards/math.md):

```html
<p>
  The Pythagorean identity:
  <span class="math-inline" data-tex="a^2 + b^2 = c^2"></span>
</p>
<div class="math-block" data-tex="\\int_a^b f(x)\\,dx = F(b) - F(a)"></div>
```

Backslashes must be doubled inside `data-tex`. The renderer
(`src/features/editor/utils/mathRender.ts`) only injects KaTeX
(~270KB CSS, ~120KB JS) when at least one `math-inline` /
`math-block` element is present — math-free slides stay lean.

## Style tab

The `Style` properties panel mutates real `--mgf-*` typography,
spacing, shape, and slide-padding tokens (see
`src/features/editor/types/cssProperties.ts`). It does **not**
expose generic CSS variables like `--font-size`; the keys match the
token names in `src/lib/ai/prompts/standards/tokens.md`, so the
panel writes real MGF variables that components reference.

| Group | Keys |
| ----- | ---- |
| Typography | `mgf-text-{xs,sm,base,lg,xl,2xl,3xl,4xl}`, `mgf-leading-{tight,normal,loose}`, `mgf-tracking-{tight,normal,wide}`, `mgf-weight-{normal,medium,bold}` |
| Spacing    | `mgf-space-{1,2,3,4,6,8,12,16,24}` |
| Canvas     | `mgf-slide-pad-x`, `mgf-slide-pad-y` |
| Shape      | `mgf-radius-{sm,md,lg,xl}` |

The Theme tab covers colors + fonts; the Style tab covers sizes,
weights, line-height, letter-spacing, spacing scale, slide padding,
and radius — together they touch every variable in `tokens.md`.

## AI prompt suite

The AI generation layer reads these standards when authoring
components and full projects:

- [`standards/classes.md`](src/lib/ai/prompts/standards/classes.md) — the `mgf-*` class vocabulary + the website + math extensions.
- [`standards/tokens.md`](src/lib/ai/prompts/standards/tokens.md) — `--mgf-*` design tokens.
- [`standards/math.md`](src/lib/ai/prompts/standards/math.md) — KaTeX / LaTeX conventions.
- [`standards/website.md`](src/lib/ai/prompts/standards/website.md) — website archetype recipes + section classes.
- [`standards/layout-rules.md`](src/lib/ai/prompts/standards/layout-rules.md) — anti-patterns.
- [`standards/output-schema.md`](src/lib/ai/prompts/standards/output-schema.md) — full-project JSON shape.

Tasks (what the AI generates per call):

- [`tasks/component.md`](src/lib/ai/prompts/tasks/component.md) — one slide HTML file.
- [`tasks/full-project.md`](src/lib/ai/prompts/tasks/full-project.md) — entire deck / website JSON.
- [`tasks/theme.md`](src/lib/ai/prompts/tasks/theme.md) — `:root` token block.
- [`tasks/layout.md`](src/lib/ai/prompts/tasks/layout.md) — class rule set.
- [`tasks/content.md`](src/lib/ai/prompts/tasks/content.md) — `data.json` payload.
- [`tasks/regen-layer.md`](src/lib/ai/prompts/tasks/regen-layer.md) — single-layer regeneration.

## Backend seeder archetypes

`01_MGF_BACKEND/database/seeders/Concerns/MgfFileBuilders.php`
provides four archetype builders (`pitchFiles`, `summaryFiles`,
`minimalFiles`, `websiteFiles`) that share shape across
`ProjectSeeder` and `TemplateSeeder`. Forks carry the exact same
file set the template had.

## Tech stack

React 19, Vite 8, TypeScript 6, Tailwind 4, TanStack Query 5,
KaTeX 0.16 (math), PptxGenJS 4 (export).

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
