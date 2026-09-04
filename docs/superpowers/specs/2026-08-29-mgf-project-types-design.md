# Types of Projects (sizes, archetypes & extra details) — Frontend

**Date:** 2026-08-29
**Status:** draft
**Related docs:** `docs/PRD.md`, `docs/design-system.md`, `docs/FRONTEND_STRUCTURE_GUIDE.md`
**Branch:** `feature/project-types`

---

## 1. Goal

Frontend-only work. We want to show and generate several kinds of project output, each with its own archetype, default size, allowed sizes, and export hints. **No backend or API contract changes** — everything below is implemented purely on the frontend.

The user story driving this work:

> **1- انواع مشاريع (احجام وتفاصيل تانية) مشان نقدر نعرض كذا نوع**

> "Project types (sizes and other details) so we can display multiple kinds."

An Arabic version of this spec is available at `2026-08-29-mgf-project-types-design.ar.md`.

## 2. Concepts

- **Type (catalogue)** — the fixed `GET /types` list the backend already returns (`presentation`, `carousel`, `poster`, `website`, `infographic`, `document`…). Each has `id`, `name`, `description`, `icon`.
- **Archetype** — the layout engine used to render the preview. `docs/design-system.md` §4 defines the archetypes. From this catalogue we use **`deck`**, **`single`**, and **`website`**.
- **Default size** — the preset aspect/page size a type starts with.
- **Allowed sizes** — the envelope of sizes the editor/export offer for that type.
- **Export hints** — which export formats make sense for the type.

## 3. Confirmed mapping (this is what we worked on)

This table is the source of truth. It is implemented as a **frontend-only, typed constant** — no API contract change.

| Output Type (catalogue) | Archetype | Default size | Allowed sizes | Export hints |
| --- | --- | --- | --- | --- |
| presentation | deck | 16:9 | 16:9, 3:4 | PDF, PPTX, PNG sequence, HTML, ZIP |
| carousel | deck | full | full, square | PNG sequence, HTML, ZIP |
| poster | single | 3:4 | 3:4, square | PNG, HTML, ZIP |
| website / landing page | website | full | full | HTML, ZIP |
| infographic | website | full | full | PNG, PDF, HTML |
| document | website | A4 | A4 | PDF, HTML |

## 4. Frontend scope

### In scope

- **Types picker UI** (new project) — render the `GET /types` catalogue as cards using `name`, `description`, `icon`. Selecting a type pre-fills archetype, default size, and export hints from the §3 table.
- **Size selector** — archetype-aware control bound to the selected type's `allowedSizes`. Shown when the type supports multiple sizes (e.g. `presentation` → 16:9 / 3:4); hidden when size is `full` only.
- **Details panel** — compact summary (type badge, archetype badge, current size, export hints) surfaced on the project header/cards.
- **Filtering** — dashboard / templates gallery can filter by type using the existing `type_id` param and locally by size/archetype.
- **Types infrastructure** — a `useTypes()` hook + `listTypes` API under `features/types`, plus a shared FE type representing the §3 table.

### Out of scope

- Any backend schema or API contract change.
- Editing slide contents inside each archetype (already the editor's job).
- New archetypes beyond `deck` / `single` / `website` used by this catalogue.

### Files (proposed)

| Path | Purpose |
|---|---|
| `src/features/types/api/listTypes.ts` | Calls `GET /types`. |
| `src/features/types/hooks/useTypes.ts` | TanStack Query hook wrapping `listTypes`. |
| `src/features/types/types/outputType.ts` | FE types + the §3 mapping as a typed constant. |
| `src/features/types/components/TypePicker.tsx` | Card grid for choosing a project type when creating. |
| `src/features/types/components/SizeSelector.tsx` | Archetype-aware size control. |
| `src/features/types/components/TypeBadge.tsx` | Badge (type + archetype) for header/cards. |

### Wiring

- **Create project flow** (`features/projects`) uses `TypePicker` → sends `type_id` (the size/archetype is derived client-side from the §3 constant, stored locally).
- **Template detail page** & **dashboard** render `TypeBadge` and filter by type/size client-side.
- Keep project/editor composition in their own feature folders per `docs/FRONTEND_STRUCTURE_GUIDE.md`.

## 5. Acceptance criteria

- [x] A single "New project" UI lets the user pick from the full `GET /types` catalogue and see each type's icon, name, and description.
- [x] Choosing `presentation` shows size options (16:9 / 3:4); choosing `website` / `infographic` / `document` shows no size selector (size is `full` or `A4`).
- [x] The chosen type + archetype + size + export hints render correctly from the §3 constant.
- [x] Dashboard and template gallery can filter by project type.
- [x] The chosen size is persisted to the project's `meta.json` (frontend-only, via the `meta` file layer).
- [x] The editor canvas preview scales to the persisted size (16:9 / 3:4 / square / A4 aspect) instead of always 16:9, falling back to the type default when no size is recorded.
- [x] The editor's PDF export page-size default follows the project size (A4 → A4; other sizes → match slide aspect).
- [x] `npm run build` and `npm run lint` pass.
