# MGF Skill Bundle

The complete **Modular Generation Framework** vocabulary, design system, and AI prompt suite — packaged as a self-contained skill you can drop into another LLM session (Claude, Cursor, GPT, etc.) to generate MGF-compatible projects.

## What you can do with it

- Hand the whole bundle to another Claude / Cursor / GPT session.
- Ask it to generate a deck, dashboard, or website.
- It will emit a single JSON object whose keys map to filenames (`style.css`, `layout.css`, `data.json`, `slide-NN.html`, `_meta`).
- Re-upload that JSON to the MGF site (`/projects/new/ai` or `/templates/new`) — the importer will write each file into a new project.

The generated project will render correctly the first time because every contract this bundle enforces is the same contract the MGF site enforces on upload.

## How to use it

1. **Open a fresh chat** with any LLM that can follow long system instructions (Claude Sonnet / Opus, GPT-4o / 4.1, Gemini 1.5 Pro, etc.).
2. **Paste, in order:**
   - `prompts/system/base.md` — the framework, role, and output contract.
   - `prompts/system/vocabulary.md` — the class contract.
   - `prompts/standards/output-schema.md` — what the response must look like.
   - `prompts/tasks/full-project.md` (or a more specific task from `prompts/tasks/`).
3. **Describe your project** as a brief: audience, tone, format, slide count, content highlights.
4. **Ask** "respond with only the JSON object — no markdown, no commentary."
5. **Re-upload** the response to `/projects/new/ai` on the MGF site. Each key becomes a file in the new project.

## What's inside

```
mgf-skill/
├── README.md                   ← you are here
├── validation.md               ← roundtrip contract for re-upload
├── prompts/
│   ├── README.md
│   ├── system/
│   │   ├── base.md
│   │   └── vocabulary.md
│   ├── standards/
│   │   ├── output-schema.md
│   │   ├── classes.md
│   │   ├── tokens.md
│   │   ├── layout-rules.md
│   │   ├── math.md
│   │   └── website.md
│   └── tasks/
│       ├── full-project.md
│       ├── component.md
│       ├── content.md
│       ├── theme.md
│       ├── layout.md
│       ├── regen-layer.md
│       ├── regen-style.md
│       ├── regen-structure.md
│       └── regen-content.md
├── docs/
│   └── design-system.md        ← canonical reference (tokens + classes + contract)
├── vocabulary/
│   ├── mgf.css                 ← live runtime CSS — the actual `mgf-*` rules
│   └── baseCss.ts              ← BASE_CSS — the rules injected into every preview
└── examples/
    ├── fintech-pitch/          ← sample output: style.css + data.json
    └── saas-marketing/         ← sample output: style.css + data.json
```

## Layer model (cheat sheet)

Every MGF project is built from three orthogonal layers:

| Layer     | What it owns                  | File            |
| --------- | ----------------------------- | --------------- |
| structure | Where things go               | `layout.css`    |
| style     | How things look               | `style.css`     |
| content   | What things say               | `data.json` + `slide-NN.html` |

Tokens (`--mgf-*`) are the contract between layers. Changing a token in `style.css` retunes every component without touching `layout.css` or `data.json`.

## Roundtrip contract

See `validation.md` for the exact rules that govern re-upload. In short:

- Output must be a single JSON object, no markdown fences, no preamble.
- Required keys: `style.css`, `layout.css`, `data.json`, one `slide-NN.html` per slide (zero-padded), `_meta`.
- `_meta.total_slides` must equal the number of `slide-NN.html` keys.
- Only `mgf-*` classes (no inline styles, no hardcoded colors, no foreign CSS).
- Every `--mgf-*` token from `prompts/standards/tokens.md` must be defined in `style.css`.

## Versioning

This bundle reflects the MGF prompt suite and design system as of the date it was downloaded from the site. The canonical source lives in the MGF repository at `src/lib/ai/prompts/` — if you fork MGF and change the prompts, regenerate the bundle.

## License & use

MGF is open to fork. Hand this bundle to anyone — agents, people, tools. There is no restriction on the output you generate with it.