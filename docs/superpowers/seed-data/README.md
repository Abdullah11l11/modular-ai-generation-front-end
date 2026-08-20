# MGF Seed Data Bundle

This folder is the **content side** of the MGF seeder expansion.
The Laravel wiring (which files to write to which DB columns) lives
in `01_MGF_BACKEND/database/seeders/Concerns/MgfFileBuilders.php`
and is **out of scope for this repo** — the user constraint is that
the backend stays 100% the same.

The bundles here exist so a backend engineer (or the next person to
pick this up) can paste files into the existing
`MgfFileBuilders.php` methods and register new templates in
`ProjectSeeder` / `TemplateSeeder` mechanically.

## Layout

```
seed-data/
├── arabic/        3 RTL archetypes      (Task 4.5)
│   ├── pitch/     نملة (fintech, Series A)
│   ├── website/   بيت (design studio)
│   └── summary/   executive summary (GCC fintech)
│
├── pitch/         4 English pitch variations (Task 5.1)
│   ├── fintech-pitch/   Cleartab (60s SMB credit)
│   ├── healthtech-pitch/ Pulsestat (at-home cardiac monitor)
│   ├── climate-pitch/   Loamgrid (DAC for hot climates)
│   └── consumer-pitch/  Marask (DTC hair care, MENA)
│
├── website/       3 English website variations (Task 5.2)
│   ├── saas-marketing/   Northwind (B2B SaaS)
│   ├── agency-portfolio/ Folio (design agency)
│   └── ecommerce/        Kettler (coffee gear)
│
└── infographic/   2 infographic variations (Task 5.3)
    ├── annual-report/    Atlas Foundation 2025
    └── product-explainer/ How a heat pump works
```

After drop-in, the seeded count is **17 projects** across 4
archetypes, 2 locales, and 4 distinct token palettes (per Task
5.4). The acceptance check from `docs/superpowers/plans/
2026-08-12-mgf-v1.0.md` Task 5.5 is purely frontend: login,
open each project, confirm the first slide renders without
console errors.

## Acceptance check (frontend, no Laravel required)

For any bundle in this folder:

1. Open the editor for any existing LTR project.
2. Replace the project's `style.css` with the bundle's
   `style.css` (paste verbatim).
3. Replace `data.json` with the bundle's `data.json`.
4. Add a slide whose `slide-NN.html` matches one of the
   bundle's slide files.
5. Reload. The preview iframe should render the bundle's
   intended design (palette, typography, layout) without
   any class-rule warnings or unstyled fallback.

If a bundle passes this check on the frontend, the Laravel
drop-in is purely mechanical.

## Theme & token variety (Task 5.4)

All 12 bundles declare the same token surface (`--mgf-color-bg`,
`--mgf-color-accent`, `--mgf-color-text-primary`,
`--mgf-font-display`, `--mgf-font-body`, plus radii, spacing,
text size scale, weight, leading, and tracking), so the editor's
Style tab has a rich set of palettes to switch between.

The catalog exposes 4 visible typography pairings, organized by
archetype family:

| Family                  | Display                          | Body                          |
|-------------------------|----------------------------------|-------------------------------|
| Pitch (fintech, climate)   | Inter (system fallback)         | Inter (system fallback)       |
| Pitch (healthtech, consumer) | Source Serif 4 (Georgia fallback) | Inter (system fallback)    |
| Website (all 3)         | system-ui stack                  | system-ui stack               |
| Arabic (all 3)          | Cairo (Noto Naskh Arabic fallback) | Cairo (Noto Naskh Arabic fallback) |
| Infographic (annual)    | Playfair Display (Georgia fallback) | Source Serif 4 (Georgia fallback) |
| Infographic (product)   | Inter (system fallback)         | Inter (system fallback)       |

Plus a curated mix of light and dark backgrounds and a spread of
accent hues (blue, teal, green, pink, orange, copper, indigo,
amber, gold, cyan) — enough variety that the theme switcher can
demo at least 4 visibly different presets.

## Drop-in recipe for the Laravel engineer

Each bundle is self-contained. The mechanical steps are:

1. Copy `style.css` into the appropriate `MgfFileBuilders.php`
   helper (one per archetype family — see the file naming in the
   helpers to find the right slot).
2. Copy `data.json` into the helper as a `json_encode`-d blob.
3. For bundles that ship `slide-NN.html` files (pitch, summary,
   infographic), copy each into a per-slide array in the helper.
4. For bundles that ship a single `layout.html` (website), copy
   it directly.
5. Register the bundle in `ProjectSeeder` with a stable UUID and
   the right `_meta.project` / `_meta.language` /
   `_meta.direction`.

Each bundle's `_meta` block already carries the language,
direction, brand voice, and output target — no extra metadata is
required.

## Verification

A `seedBundles.test.ts` test suite (under
`src/features/editor/utils/__tests__/`) guards the catalog shape
on every PR: 27 assertions covering common shape (style.css +
data.json + required tokens), per-archetype specifics
(`dir="rtl"` for Arabic, `output_target` for infographic), and
the cross-archetype variety invariants from Task 5.4
(4 distinct accent hues, 3+ light-bg bundles, 3+ dark-bg bundles,
font tokens everywhere, 4+ distinct font families, 4 flagship
palettes locked per archetype family).
