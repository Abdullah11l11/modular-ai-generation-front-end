# Editor Feature — Implementation Roadmap

**Route:** `/editor/projects/:projectId`
**Feature folder:** `features/editor`
**Dependencies:** `features/projects`, `features/files`, `features/generation`, `features/export`

This roadmap breaks the Editor (the most complex feature in MGF) into 8 phases + a final polish phase. Each phase has a checklist of concrete deliverables. Phases should be completed in order — later phases depend on earlier ones.

---

## Phase 0 — Foundation & Prerequisites

**Status:** ✅ Complete

Before editor-specific work begins, these cross-cutting concerns must be in place:

**Checklist:**

- [x] Auth token lifecycle works end-to-end:
  - Token stored in `localStorage` under `mgf.authToken`
  - Axios interceptor in `client.ts` attaches `Authorization: Bearer <token>`
  - `GET /auth/me` called on app mount to rehydrate user (via `useMe` query, with `enabled: !!getToken()` to skip when unauthenticated)
  - `useAuth` hook returns `{ user, isAuthenticated, isLoading, token }`
- [x] `ProtectedRoute` guards `/editor/projects/:projectId` and redirects to `/login` if no token
- [x] Project API hooks working: `useProject(projectId)`, `useUpdateProject()`
- [x] Files API hooks working: `useProjectFiles(projectId)`, `useUpdateProjectFile()`, `useCreateProjectFile()`, `useDeleteProjectFile()`
- [x] Types API hook working: `useTypes()` (needed for output type catalogue)
- [x] All shadcn primitives needed for forms (dialog, dropdown-menu, select, tooltip, textarea, tabs, field) are generated in `src/components/ui/`
- [x] `TagInput` shared component built at `src/components/ui/tag-input.tsx`
- [x] `EditorLayout.tsx` shell exists at `src/components/layout/EditorLayout.tsx`
- [x] **File model updated** — Per-slide files grouped by naming convention `<stem>.<ext>`: `slide-01.html` (layer=slide), `slide-01.css` (layer=style), `slide-01.json` (layer=content). Files with the same stem form one slide. Documented in `docs/openapi_api_contract.yaml`, `docs/FRONTEND_STRUCTURE_GUIDE.md`, and `src/types/api.ts`.

---

## Phase 1 — Editor Shell, Context & State Management

**Status:** ✅ Complete

The 3-column layout shell exists in `EditorLayout.tsx` (left: Slides, center: main, right: Properties). This phase wires it to real data and shared editor state. All previous editor code was intentionally deleted to align with the new multi-file slide model.

**Checklist:**

- [x] Create editor context + reducer in `useEditorStore.ts` — holds:
  - `projectId` (from route params)
  - `selectedSlideId` (currently active slide HTML file ID)
  - `selectedElement` (CSS selector or element ID within the preview)
  - `layerVisibility` (all `ProjectFileKind` values: slide, style, layout, content, context, rules, meta, sequence)
  - `activeTab` in right panel (`'theme' | 'content' | 'style' | 'ai'`)
  - `isGenerating` (boolean for AI generation in progress)
- [x] Create `EditorProvider` component that wraps children with `EditorContext.Provider`
- [x] Create the Editor page at `src/pages/editor/EditorPage.tsx` (thin page that reads route params, fetches project + files, renders toolbar + placeholder center + status bar)
- [x] Wire `EditorPage` into `router.tsx` at `/editor/projects/:projectId`
- [x] On mount, fetch project metadata via `useProject(projectId)` — shows error fallback on failure
- [x] On mount, fetch all project files via `useProjectFiles(projectId)`
- [x] Create `EditorToolbar.tsx` with: Back button, project name (reads from API), Preview/Export/Save action buttons using shadcn `Button`
- [x] Create `EditorStatusBar.tsx` with: slide index (from file list), selected element name, active layer labels
- [x] Build verified: `npm run build` passes

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/hooks/useEditorStore.ts` | Context, reducer, types (`EditorState`, `EditorAction`, `ActiveTab`, `LayerVisibility`) |
| `src/features/editor/components/EditorProvider.tsx` | `EditorProvider` wrapper component |
| `src/features/editor/components/EditorToolbar.tsx` | Top toolbar with back nav, project name, action buttons |
| `src/features/editor/components/EditorStatusBar.tsx` | Bottom bar with slide count, element, layers |
| `src/pages/editor/EditorPage.tsx` | Route page — loads data, renders shell |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/routes/router.tsx` | Replace `element: <></>` with `<EditorPage />` at `/editor/projects/:projectId` |

**Deliverable:** A working 3-column editor shell with project data loaded, slide/properties panels rendered as placeholders, and shared state wired.

---

## Phase 2 — Slide Library Panel (Left Sidebar)

**Status:** ✅ Complete

A vertical panel listing slides as labelled thumbnails. Each slide is represented by **3 files** sharing the same name stem, differentiated by `layer`:

| `layer`    | Content | Example file |
|------------|---------|-------------|
| `slide`    | Slide structure/markup | `slide-01.html` |
| `style`    | Per-slide styling | `slide-01.css` |
| `content`  | Content data (title, subtitle, body) | `slide-01.json` |

The frontend groups files by name stem (name without extension) client-side. One thumbnail per stem is shown, with the slide's title read from its JSON file.

**Checklist:**

- [x] Add `@dnd-kit/core` and `@dnd-kit/sortable` to the project (drag-and-drop library)
- [x] Create `features/editor/components/SlideLibrary/SlideThumbnail.tsx` — thumbnail card per slide (reads title from json file, mini preview placeholder, active state highlight)
- [x] Create `features/editor/components/SlideLibrary/SlideList.tsx` — sortable list using dnd-kit, groups project files by name stem, shows one thumbnail per group
- [x] Create "Add Slide" button at the top of the panel → calls `useCreateProjectFile` three times (once per `layer` — slide, style, content) with the same name stem (e.g. `slide-N`)
- [x] Delete slide action (with confirmation dialog) → calls `deleteProjectFile` for all 3 files sharing the same name stem
- [x] On click/select a slide → update `selectedSlideId` in editor store (stores the html file ID)
- [x] Drag-to-reorder → on drop, batch-update `sort_order` via sequential `useUpdateProjectFile` calls across all 3 files
- [x] Add layer visibility toggles at bottom of panel (STR / STY / CON buttons per `design.md` `.lv-btn`)
- [x] Handle empty state: no slides yet → show "Add your first slide" placeholder

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/components/SlideLibrary/SlideThumbnail.tsx` | Sortable thumbnail card with drag handle, label, active state |
| `src/features/editor/components/SlideLibrary/SlideList.tsx` | `DndContext` + `SortableContext` wrapper with drag-end handler |
| `src/features/editor/components/SlideLibrary/SlideLibraryPanel.tsx` | Composes slide list, add/delete actions, empty state, layer toggles |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/pages/editor/EditorPage.tsx` | Integrate SlideLibraryPanel into left column |

**Deliverable:** Functional slide library with add, delete, drag-reorder, and selection driving the editor context.

---

## Phase 3 — Live Preview Pane (Center Panel)

**Status:** ✅ Complete

Renders the current slide's HTML combined with project style/layout CSS in a sandboxed iframe.

**Checklist:**

- [x] Create `features/editor/hooks/useAssemblePreview.ts` — pure function that:
  - Takes the active slide HTML, `style.css`, `layout.css`, and project direction
  - Assembles a complete HTML document string with inline CSS
  - Sets `dir` attribute based on project `direction` (ltr/rtl)
  - Returns the assembled document string
- [x] Create `features/editor/components/Preview/PreviewFrame.tsx`:
  - Sandboxed `<iframe>` with `sandbox="allow-same-origin"` attribute
  - Uses `srcdoc` to inject the assembled HTML
  - Renders at 16:10 aspect ratio per `docs/design.md`
  - Click handler that extracts element selector and calls `onElementClick`
- [x] Create `features/editor/components/Preview/PreviewCanvas.tsx`:
  - Wraps `PreviewFrame` inside a toolbar-less container
  - Clickable element detection: clicking an element in the iframe sets `selectedElement` in editor store
  - Selected element name displayed as cyan badge overlay at top-left of canvas
  - Empty state when no slide is selected: "Select a slide to preview"
  - Uses `useMemo` for assembled HTML derived from `selectedSlide`, `styleFile`, `layoutFile`, and `project.direction`
- [x] Handle loading state: full-page loader while project files are loading
- [x] Handle error state: `ErrorFallback` on project load failure

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/hooks/useAssemblePreview.ts` | Pure function that assembles HTML doc from slide + CSS + direction |
| `src/features/editor/components/Preview/PreviewFrame.tsx` | Sandboxed iframe with click-to-select element detection |
| `src/features/editor/components/Preview/PreviewCanvas.tsx` | Composes PreviewFrame, derives selected slide + style + layout files |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/pages/editor/EditorPage.tsx` | Replace center placeholder with `PreviewCanvas`; find `selectedSlide`, `styleFile`, `layoutFile` from project files grouped by stem |

**Deliverable:** Live preview that renders the active slide with project styles and updates reactively.

---

## Phase 4 — CSS Attribute Customization Panel (Right Sidebar)

**Status:** ✅ Complete

A form-based panel for editing visual CSS properties without writing raw CSS.

**Prerequisite convention:** Style and layout files use predefined CSS custom properties (`--primary-color`, `--body-font`, `--heading-size`, `--spacing-padding`, etc.) in `:root {}` blocks, mapped to form fields. No CSS parser was needed.

**Checklist:**

- [x] Create `features/editor/types/cssProperties.ts` — defines `CssPropertyDef`, `CssPropertyGroup`, and 3 registries: `THEME_PROPERTIES` (6 color + 2 font), `CONTENT_PROPERTIES` (10 properties for content elements), `STYLE_PROPERTIES` (12 properties for layout styling)
- [x] Create `features/editor/hooks/useCssProperties.ts` — `parseCssValues` extracts known vars from file content via regex; `mergeWithDefaults` merges current values with registry defaults; `useCssProperties` returns `{ groups, hasVariables }`
- [x] Create `features/editor/hooks/useCssPropertyUpdates.ts` — `replaceCssVariable` updates or appends a CSS var in the content string; `useCssPropertyUpdates` wraps mutation with 500ms debounce via `setTimeout`/`clearTimeout`
- [x] Create `features/editor/components/PropertiesPanel/PropertiesPanel.tsx` — tabbed container with shadcn `Tabs` bound to `state.activeTab`; renders Theme, Content, Style, or AI tab; shows skeleton loading state; shows "Select an element to edit" on Content/Style tabs when no element selected
- [x] Create `features/editor/components/PropertiesPanel/ThemeTab.tsx`:
  - Color inputs (native `<input type="color">` + hex text field) for each color property
  - Font selectors via shadcn `Select` with common font options
- [x] Create `features/editor/components/PropertiesPanel/ContentTab.tsx`:
  - Text input (string type) fields for title/subtitle/body content
  - Size/weight selectors and color pickers for each content element
  - Reads/writes CSS vars from the selected slide HTML content
- [x] Create `features/editor/components/PropertiesPanel/StyleTab.tsx`:
  - Typography: size, line-height, letter-spacing inputs; Font Weight select; Alignment select
  - Spacing: opacity slider (`<input type="range">`), padding grid (4 inputs), border radius, z-index
  - Reads/writes CSS vars from `layout.css`
- [x] Create `features/editor/components/PropertiesPanel/AiTab.tsx`:
  - Prompt textarea with placeholder
  - Model selector dropdown (3 model options)
  - Generate button (placeholder for Phase 6)
  - JSON output readonly display
  - Generation history empty state placeholder
- [x] Wire tab changes to `activeTab` in editor store
- [x] Handle empty state: no element selected → "Select an element to edit" message
- [x] Handle loading state: `Skeleton` placeholder while CSS files load

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/types/cssProperties.ts` | Property type definitions and 3 static registries (Theme, Content, Style) |
| `src/features/editor/hooks/useCssProperties.ts` | CSS variable parser and group builder hook |
| `src/features/editor/hooks/useCssPropertyUpdates.ts` | Debounced CSS variable updater with `replaceCssVariable` helper |
| `src/features/editor/components/PropertiesPanel/PropertiesPanel.tsx` | Tabbed right sidebar container |
| `src/features/editor/components/PropertiesPanel/ThemeTab.tsx` | Theme tab with color inputs, font selects, "View full theme.css" |
| `src/features/editor/components/PropertiesPanel/ContentTab.tsx` | Content tab with string/size/color fields for selected element |
| `src/features/editor/components/PropertiesPanel/StyleTab.tsx` | Style tab with typography controls, opacity slider, padding grid |
| `src/features/editor/components/PropertiesPanel/AiTab.tsx` | AI tab with prompt, model selector, generate, JSON output, history |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/pages/editor/EditorPage.tsx` | Replace placeholder right column with `<PropertiesPanel>` passing `projectId`, `selectedSlide`, `styleFile`, `layoutFile`, `filesLoading` |

**Deliverable:** Functional CSS customization panel with four tabs, debounced writes to backend, and loading/empty states.

---

## Phase 5 — Project Settings Panel

**Status:** 🟡 Component exists, editor integration not started

A modal/drawer within the editor for editing project metadata. The `ProjectSettingsPanel` component at `src/features/projects/components/ProjectSettingsPanel.tsx` already exists with type selector, 422 handling, and TagInput. It needs to be wired into the editor shell.

**Checklist:**

- [x] Existing `ProjectSettingsPanel` at `features/projects/components/ProjectSettingsPanel.tsx` enhanced:
  - Fields: name, description, status (draft/published/archived), visibility (public/private/unlisted), tags
  - **Type selector** — interactive `Select` populated from `useTypes()` hook
  - Direction toggle (ltr/rtl)
  - Uses `TagInput` shared component
  - 422 validation error handling with field-level `setError`
  - Loading state while data loads
- [ ] **Trigger**: gear icon (`SettingsIcon`) in `EditorToolbar` calls `onOpenSettings` prop → opens the modal
- [ ] **On save** → calls `useUpdateProject.mutateAsync` → `onSuccess` invalidates `['projects']` and `['projects', projectId]` queries

**Deliverable:** Project settings modal with type selector, 422 error handling, auto-close on save, and proper loading states.

---

## Phase 6 — AI Generation (Full + Per-Layer)

**Status:** ❌ Not started

Integrate AI generation into the editor. Both full-project and per-layer generation follow the same async job pattern.

**Checklist:**

- [ ] Create `features/editor/hooks/useJobPoller.ts` — reusable polling hook:
  - Takes `jobId` and query key
  - Uses TanStack Query's `refetchInterval` (function returns `false` on terminal status)
  - Returns `{ data, isFetching, error }`
- [ ] Create `features/editor/components/Generation/GenerationModal.tsx`:
  - Prompt textarea with placeholder
  - Provider selector dropdown (populated from `useAiProviders()`)
  - If no providers configured → empty state with link to `/settings`
  - Model override text field (optional)
  - "All Layers" vs "Selected Layers" toggle (for full project)
  - Layer checkboxes for per-layer mode
  - Generate button → calls `useGenerateProject` or `useGenerateFile`
  - Progress indicator during generation (spinner + status badge)
- [ ] Create per-layer generate button: SparklesIcon on each slide thumbnail in Slide Library → opens generation modal with `initialFileId` set
- [ ] Create `features/editor/components/Generation/GenerationHistory.tsx`:
  - Paginated list of past `AiJob` records in `AiTab`
  - Status badges with color coding (running=blue, succeeded=green, failed=red)
  - Loading skeleton state
  - Empty state when no jobs exist
- [ ] Handle edge cases:
  - User navigates away during generation → poll cancels via TanStack Query unmount
  - Generation fails → show error message toast with "Try again" prompt
  - Per-layer generation via `initialFileId` prop
- [ ] Toast notifications: "Generation complete", "Generation failed" with error message

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/hooks/useJobPoller.ts` | Reusable polling hook using TanStack Query `refetchInterval` |
| `src/features/editor/components/Generation/GenerationModal.tsx` | Full generation dialog with prompt, provider, layers, progress |
| `src/features/editor/components/Generation/GenerationHistory.tsx` | Paginated job history list with status badges |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/features/editor/components/SlideLibrary/SlideThumbnail.tsx` | Add SparklesIcon per-layer AI button |
| `src/features/editor/components/SlideLibrary/SlideList.tsx` | Add `onGenerate` prop to SlideThumbnail |
| `src/features/editor/components/SlideLibrary/SlideLibraryPanel.tsx` | Add `onGenerateLayer` prop and wire through SlideList |
| `src/features/editor/components/PropertiesPanel/AiTab.tsx` | Replace placeholder with "Open Generation Dialog" button + `GenerationHistory` |
| `src/pages/editor/EditorPage.tsx` | Add `genModalOpen`/`genLayerFileId` state, `GenerationModal`, layer generation handler |

**Deliverable:** AI generation modal + per-layer triggers + generation history panel with async job polling.

---

## Phase 7 — Export Dialog

**Status:** ❌ Not started

A modal for exporting the project to various formats.

**Checklist:**

- [x] `ExportJob` type aligned with OpenAPI spec (`src/types/api.ts`)
- [x] `ExportRequest` type aligned with OpenAPI spec (`src/features/export/types/exportRequest.ts`)
- [ ] Create `useExportJobPoller` hook (parallel to `useJobPoller` but for export — checks `ready`/`failed` as terminal)
- [ ] Create `features/editor/components/Export/ExportDialog.tsx`:
  - Format selector: HTML, PDF, PNG, JPG, ZIP, Markdown
  - Conditional options:
    - Page size (A4, Letter, Custom) for PDF
    - Width/height inputs for custom size or image exports
    - Quality input for JPG (1-100)
  - Export button → calls `useRequestExport`
  - Progress indicator via poller (spinner + status badge)
  - On `ready`: show download button with `download_url` (opens in new tab)
  - On `failed`: show error toast with "Try again" prompt
  - Cancel button to dismiss without exporting
- [ ] Wire export button in editor toolbar → opens ExportDialog
- [ ] Handle error state: export failed → toast error message
- [ ] Handle loading state: spinner + status badge while processing
- [ ] Toast notifications: "Export ready for download", "Export failed"

**Files to create:**

| File | Purpose |
|------|---------|
| `src/features/editor/hooks/useExportJobPoller.ts` | Export-specific polling hook (stops on ready/failed) |
| `src/features/editor/components/Export/ExportDialog.tsx` | Full export dialog with format selector, options, progress, download |

**Files to modify:**

| File | Changes |
|------|---------|
| `src/features/editor/components/EditorToolbar.tsx` | Add `onOpenExport` prop, wire Export button |
| `src/pages/editor/EditorPage.tsx` | Add `exportOpen` state, `ExportDialog` wiring |

**Deliverable:** Export modal supporting all MVP formats with async job polling.

---

## Phase 8 — Raw File / Code Editor (Later Priority)

A code editor for directly editing project files. Marked as "later to Have" in PRD — build only after all above phases are stable.

**Checklist:**

- [ ] Add CodeMirror (lighter than Monaco) to the project
- [ ] Create `features/editor/components/CodeEditor.tsx`:
  - Syntax highlighting mode switches based on file `extension` (html, css, json, md)
  - Read-only mode for template files (when user is not owner)
  - Autosave: debounce 1s after last keystroke → calls `useUpdateProjectFile`
  - Unsaved indicator (dot in tab / "Unsaved changes" text)
  - File selector dropdown or tab bar
- [ ] Create `features/editor/components/FileTree.tsx`:
  - Tree view of all project files grouped by layer
  - Click to open file in code editor
  - Layer badges with color dots per design.md (Structure=cyan, Style=purple, Content=orange)
- [ ] Wire code editor into the center panel as an alternative to the preview (tab toggle: Preview / Code)
- [ ] Handle empty state: no file selected → "Select a file to edit"

**Deliverable:** Raw file editor with syntax highlighting, autosave, and file tree navigation.

---

## Phase 9 — Polish, Performance & Edge Cases

Cross-cutting improvements and hardening.

**Checklist:**

- [ ] **Performance:** Profile preview assembly (<500ms SLA). Memoize with `useMemo` where possible. Audit re-renders in editor panels.
- [ ] **Keyboard shortcuts:** Ctrl+S to save, Ctrl+Z undo, arrow keys for slide navigation
- [ ] **Unsaved changes guard:** Warn before navigating away if there are unsaved edits ( `beforeunload` + React Router blocker)
- [ ] **Error boundary per panel:** Each editor panel wrapped in its own `ErrorBoundary` so one panel crash doesn't break the whole editor
- [ ] **RTL support:** Preview sets `dir="rtl"` when project direction is rtl
- [ ] **Responsive editor shell:** Collapse side panels on narrow screens (toggle buttons to show/hide)
- [ ] **Cyan accent consistency:** Selected elements, active tabs, hover states follow `--cy` color per design.md
- [ ] **Skeleton loading states** for each panel while data loads (use shadcn `skeleton`)
- [ ] **Empty states** for slide library (no slides), preview (no file selected), properties (no element selected)
- [ ] **Toast integration:** Save confirmation, error feedback, generation/export lifecycle events via `src/lib/toast.ts`

---

## Dependency Graph

```
Phase 0 (Foundation)
   └── Phase 1 (Shell & Context)
          ├── Phase 2 (Slide Library)
          ├── Phase 3 (Live Preview)
          └── Phase 4 (CSS Panel)
                 └── Phase 5 (Project Settings)
                        ├── Phase 6 (AI Generation)
                        ├── Phase 7 (Export)
                        └── Phase 8 (Code Editor)
                               └── Phase 9 (Polish)
```

Phases 2, 3, and 4 can be built in parallel after Phase 1 is complete. Phase 5 depends on Phase 4 (shares the Properties panel area). Phases 6 and 7 depend on Phase 3 (preview must work to show generation/export results). Phase 8 is lowest priority.

---

## API Endpoints Used

| Method | Endpoint | Phase | Purpose |
|--------|----------|-------|---------|
| GET | `/projects/{id}` | 1 | Load project metadata |
| PUT | `/projects/{id}` | 5 | Save project settings |
| GET | `/projects/{id}/files` | 1,2,3,4 | List all project files |
| POST | `/projects/{id}/files` | 2 | Add new slide/file |
| PATCH | `/projects/{id}/files/reorder` | 2 | Reorder slides via ID array |
| PUT | `/projects/{id}/files/{id}` | 2,4,8 | Update file content/metadata |
| DELETE | `/projects/{id}/files/{id}` | 2 | Delete slide/file |
| POST | `/projects/{id}/generate` | 6 | Full project AI generation |
| POST | `/projects/{id}/files/{id}/generate` | 6 | Per-file AI generation |
| GET | `/projects/{id}/jobs` | 6 | List generation history |
| GET | `/jobs/{id}` | 6 | Poll generation job |
| POST | `/projects/{id}/export` | 7 | Request export |
| GET | `/export-jobs/{id}` | 7 | Poll export job |
| GET | `/me/ai-providers` | 6 | List AI providers for generation |
| GET | `/types` | 5 | List output types |
