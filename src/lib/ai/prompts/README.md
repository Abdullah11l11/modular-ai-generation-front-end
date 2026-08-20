# MGF Prompts

This folder is the **single source of truth** for the MGF (Modular
Generation Framework) AI prompt suite. It contains plain Markdown
files that the frontend concatenates into AI requests, and that other
agents (Laravel seeders, code reviewers, future tooling) can read
directly.

## Layout

```
prompts/
├── README.md                       ← this file
├── standards/                      ← the WHAT — contracts the AI must respect
│   ├── classes.md                  ← every `mgf-*` class, its purpose, default sizes
│   ├── layout-rules.md             ← invariants for overflow / underflow prevention
│   ├── tokens.md                   ← every `--mgf-*` variable, its name, its purpose
│   └── output-schema.md            ← the JSON shape the AI must emit
├── system/                         ← the WHO — appended to every request
│   ├── base.md                     ← framework, role, output contract, WCAG rules
│   └── vocabulary.md               ← the class contract (mirror of standards/classes.md)
├── tasks/                          ← the WHY — task-specific instructions
│   ├── full-project.md             ← generate a full project from a brief
│   ├── layout.md                   ← generate `layout.css` for a target format
│   ├── content.md                  ← generate `data.json` (slides array)
│   ├── theme.md                    ← generate `style.css` (token block)
│   ├── component.md                ← generate one `<component>.html` file
│   └── regen-layer.md              ← regenerate one layer of an existing project
└── index.ts                        ← Vite raw imports + exported `buildSystemPrompt`
```

## How the AI uses these

Every generation request concatenates three blocks:

1. **`system/base.md`** — the framework, the role, the output contract (always present).
2. **`system/vocabulary.md`** — the class contract (always present so the AI knows what it may emit).
3. **One or more task prompts** from `tasks/` — the specific deliverable.

The `index.ts` file exposes a `buildSystemPrompt(...taskPrompts)` helper
that joins these together with a `---` separator. Code that builds an
AI request can pick the right task prompt for the situation.

## How the AI is supposed to respond

The output contract is defined in `standards/output-schema.md`. In
short: a single JSON object mapping filename → file content. No
markdown fences, no preamble, no postamble. The frontend parses the
JSON and writes each file to the project; the backend seeders can do
the same.

## Adding a new task

1. Write `tasks/<task-name>.md` describing the deliverable.
2. Reference any relevant standards docs (`standards/classes.md`,
   `standards/tokens.md`, `standards/layout-rules.md`).
3. Export the prompt from `index.ts` (Vite raw import).
4. Add the prompt to `buildSystemPrompt` calls in the relevant feature
   code (editor chat, autogeneration, etc.).

## Adding a new class

1. Add it to `standards/classes.md` with its purpose, default size,
   and a short description.
2. Mirror the change in `system/vocabulary.md`.
3. Add the matching rule to `src/styles/mgf.css` so the renderer
   shows it correctly.

## Sharing with other agents

Every `.md` file here is a contract. Other agents (Laravel seeders,
code-review bots, third-party API consumers) should read these files
directly — they are plain Markdown with no build or runtime
requirements. The frontend loads them via Vite's `?raw` import; the
backend can read them with `realpath()` or with a small build step
that copies them into the Laravel repo.

## Why `mgf-*` and only `mgf-*`

The framework is converging on a single class prefix. The previous
`uvcp-*` prefix is being retired; new projects use `mgf-*` only. The
demo renderer's base CSS does too — see `src/styles/mgf.css` and the
`BASE_CSS` constant in `src/features/editor/hooks/useAssemblePreview.ts`.
