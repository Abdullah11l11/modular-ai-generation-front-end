# Editor Feature — Implementation Roadmap

**Route:** `/editor/projects/:projectId`
**Feature folder:** `features/editor`
**Dependencies:** `features/projects`, `features/files`, `features/generation`, `features/export`

This roadmap breaks the Editor (the most complex feature in MGF) into 8 phases + a final polish phase. Each phase has a checklist of concrete deliverables. Phases should be completed in order — later phases depend on earlier ones.

---

## Phase 0 — Foundation & Prerequisites

Before editor-specific work begins, these cross-cutting concerns must be in place:

**Checklist:**

- [ ] Auth token lifecycle works end-to-end:
  - Token stored in `sessionStorage` (or React context)
  - Axios interceptor in `client.ts` attaches `Authorization: Bearer <token>` 
  - `GET /auth/me` called on app mount to rehydrate user
  - `useAuth` hook returns `{ user, isAuthenticated, isLoading, token }`
- [ ] `ProtectedRoute` guards `/editor/projects/:projectId` and redirects to `/login` if no token
- [ ] Project API hooks working: `useProject(projectId)`, `useUpdateProject()`
- [ ] Files API hooks working: `useProjectFiles(projectId)`, `useUpdateProjectFile()`, `useCreateProjectFile()`, `useDeleteProjectFile()`
- [ ] Types API hook working: `useTypes()` (needed for output type catalogue)
- [ ] All shadcn primitives needed for forms (dialog, dropdown-menu, select, tooltip, form, tabs, textarea) are generated in `src/components/ui/`
- [ ] `TagInput` shared component built at `src/components/ui/tag-input.tsx`

---

## Phase 1 — Editor Shell, Context & State Management

**Status:** ✅ Completed

The 3-column layout already exists in `EditorLayout.tsx` (left: Slides, center: main, right: Properties). This phase wires it to real data and shared editor state.

**Checklist:**

- [x] Create editor context + reducer in `useEditorStore.ts` — holds:
  - `projectId` (from route params)
  - `selectedSlideId` (currently active slide file ID)
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

**Files created:**

| File | Purpose |
|------|---------|
| `src/features/editor/hooks/useEditorStore.ts` | Context, reducer, types (`EditorState`, `EditorAction`, `ActiveTab`, `LayerVisibility`) |
| `src/features/editor/components/EditorProvider.tsx` | `EditorProvider` wrapper component |
| `src/features/editor/components/EditorToolbar.tsx` | Top toolbar with back nav, project name, action buttons |
| `src/features/editor/components/EditorStatusBar.tsx` | Bottom bar with slide count, element, layers |
| `src/pages/editor/EditorPage.tsx` | Route page — loads data, renders shell |

**Deliverable:** A working 3-column editor shell with project data loaded, slide/properties panels rendered as placeholders, and shared state wired.

---

## Phase 2 — Slide Library Panel (Left Sidebar)

A vertical panel listing slide files (`kind: 'slide'`) as labelled thumbnails. Supports add, delete, and reorder.

**Checklist:**

- [ ] Add `@dnd-kit/core` and `@dnd-kit/sortable` to the project (drag-and-drop library)
- [ ] Create `features/editor/components/SlideLibrary/SlideThumbnail.tsx` — thumbnail card per slide (file name, mini preview placeholder, active state highlight)
- [ ] Create `features/editor/components/SlideLibrary/SlideList.tsx` — sortable list using dnd-kit, filtered from `useProjectFiles` where `kind === 'slide'`
- [ ] Create "Add Slide" button at the top of the panel → calls `useCreateProjectFile` with `{ kind: 'slide', path: 'slide-N.html', content: '' }`
- [ ] Delete slide action (with confirmation dialog) → calls `deleteProjectFile` (use `useMutation` wrapping `src/features/files/api/deleteProjectFile.ts`)
- [ ] On click/select a slide → update `selectedSlideId` in editor store
- [ ] Drag-to-reorder → on drop, batch-update `sort_order` via sequential `useUpdateProjectFile` calls
- [ ] Add layer visibility toggles at top of panel (STR / STY / CON buttons per `design.md` `.lv-btn`)
- [ ] Handle empty state: no slides yet → show "Add your first slide" placeholder

**Deliverable:** Functional slide library with add, delete, drag-reorder, and selection driving the editor context.

---

## Phase 3 — Live Preview Pane (Center Panel)

Renders the current slide's HTML combined with project style/layout CSS in a sandboxed iframe.

**Checklist:**

- [ ] Create `features/editor/hooks/useAssemblePreview.ts` — a pure function that:
  - Takes the active slide HTML, `style.css`, `layout.css`, and optional content data
  - Assembles a complete HTML document string with inline CSS
  - Sets `dir` attribute based on project `direction` (ltr/rtl)
  - Returns the document string
- [ ] Create `features/editor/components/Preview/PreviewFrame.tsx`:
  - Sandboxed `<iframe>` with `sandbox="allow-same-origin"` attribute
  - Uses `srcdoc` to inject the assembled HTML (no separate URL needed)
  - Renders at 16:10 aspect ratio per `docs/design.md`
- [ ] Create `features/editor/components/Preview/PreviewCanvas.tsx`:
  - Wraps `PreviewFrame` inside a toolbar-less container
  - Clickable element detection: clicking an element in the iframe sets `selectedElement` in editor store (use postMessage or iframe click listener)
  - Selected element gets a cyan outline overlay
- [ ] Debounce preview re-renders (300ms) — triggers on:
  - `selectedSlideId` change
  - CSS panel saves (from Phase 4)
  - Content changes
  - AI generation completion
- [ ] Handle loading state: full-page loader while project files are loading
- [ ] Handle error state: if assembly fails, show `ErrorFallback` with retry
- [ ] Profile preview assembly time — target <500ms SLA per PRD

**Deliverable:** Live preview that renders the active slide with project styles and updates reactively.

---

## Phase 4 — CSS Attribute Customization Panel (Right Sidebar)

A form-based panel for editing visual CSS properties without writing raw CSS. This is the most novel UI in the app.

**Pre-requisite decision:** Define the convention for `style.css` and `layout.css` structure. Recommended approach for MVP: use predefined CSS custom properties (`--primary-color`, `--body-font`, `--heading-size`, `--spacing-padding`, etc.) in template files, and map these to form fields. This avoids building a CSS parser.

**Checklist:**

- [ ] Create `features/editor/types/cssProperties.ts` — define the schema of editable CSS properties:
  ```ts
  type CssPropertyGroup = {
    id: string;
    label: string;
    properties: CssProperty[];
  };
  type CssProperty = {
    varName: string;        // e.g. '--primary-color'
    label: string;          // e.g. 'Primary Color'
    type: 'color' | 'font' | 'size' | 'spacing' | 'select' | 'slider';
    options?: string[];     // for 'select' type
    defaultValue: string;
  };
  ```
- [ ] Create `features/editor/hooks/useCssProperties.ts` — parses `style.css` and `layout.css` content strings into structured `CssPropertyGroup[]` by reading `var()` declarations
- [ ] Create `features/editor/hooks/useCssPropertyUpdates.ts` — debounced mutation that writes changes back to the file via `useUpdateProjectFile`
- [ ] Create `features/editor/components/PropertiesPanel/PropertiesPanel.tsx` — tabbed container with tabs: Theme | Content | Style | AI (per `design.md`)
- [ ] Create `features/editor/components/PropertiesPanel/ThemeTab.tsx`:
  - Color swatches with native color picker input
  - Editable text fields for CSS variable values
  - "View full theme.css" link that opens a read-only view
  - Global theme section
- [ ] Create `features/editor/components/PropertiesPanel/ContentTab.tsx`:
  - Editable fields based on selected element (title text, subtitle, bullet list)
  - Size/weight/color controls
- [ ] Create `features/editor/components/PropertiesPanel/StyleTab.tsx`:
  - Typography controls: size, line-height, letter-spacing, weight, alignment buttons
  - Spacing controls: opacity slider, padding grid (top/right/bottom/left), radius, z-index
- [ ] Create `features/editor/components/PropertiesPanel/AiTab.tsx`:
  - Prompt textarea
  - Model selector dropdown
  - Generate button
  - JSON editor (read-only for now)
  - Generation history list (placeholder for Phase 6)
- [ ] Wire tab changes to `activeTab` in editor store
- [ ] Handle empty state: no element selected → show "Select an element to edit" message
- [ ] Handle loading state: skeleton placeholders while CSS files load

**Deliverable:** Functional CSS customization panel with four tabs, debounced writes to backend, triggering preview refresh.

---

## Phase 5 — Project Settings Panel

A modal/drawer within the editor for editing project metadata.

**Checklist:**

- [ ] Create `features/editor/components/ProjectSettingsModal.tsx`:
  - Fields: name, description, status (draft/published/archived), visibility (public/private/unlisted), tags
  - Type selector populated from `useTypes()`
  - Direction toggle (ltr/rtl)
  - Uses `TagInput` shared component
- [ ] Trigger: gear icon in the editor toolbar opens the modal
- [ ] On save → calls `useUpdateProject` → invalidates project query → editor reflects new name/description
- [ ] Handle validation errors from API (422 responses)
- [ ] Handle loading state on save button

**Deliverable:** Project settings accessible from the editor toolbar with full metadata editing.

---

## Phase 6 — AI Generation (Full + Per-Layer)

Integrate AI generation into the editor. Both full-project and per-layer generation follow the same async job pattern.

**Checklist:**

- [ ] Create `features/editor/hooks/useJobPoller.ts` — reusable polling hook:
  - Takes `jobId` and query key
  - Uses TanStack Query's `refetchInterval` (2-3 seconds)
  - Returns `{ status, data, error }`
  - On `success`: calls optional `onComplete` callback and invalidates target queries
  - On `failed`: surfaces `error_message`
  - Cleans up polling on unmount
- [ ] Create `features/editor/components/GenerationModal.tsx`:
  - Prompt textarea (pre-filled with `context.md` content if available)
  - Provider selector dropdown (populated from `useAiProviders()`)
  - If no providers configured → show empty state with link to `/settings`
  - Model override text field (optional)
  - "Generate All" vs "Generate Selected Layers" toggle
  - Layer checkboxes for per-layer mode (all checked by default)
  - Generate button → calls `useGenerateProject` or `useGenerateFile`
  - Progress indicator during generation (spinner + status text)
  - On completion → close modal, invalidate file queries, preview updates
- [ ] Create per-layer generate button: small "AI" icon button on each slide in the Slide Library panel → opens generation modal pre-configured for that specific file
- [ ] Create `features/editor/components/GenerationHistory.tsx`:
  - Collapsible panel or drawer within the editor
  - Paginated list of past `AiJob` records for the project
  - Columns: provider, model, status badge, tokens used, duration, date, error message (if failed)
  - Uses `useGenerationJobs(projectId)`
- [ ] Handle edge cases:
  - User navigates away during generation → poll should cancel
  - Generation fails → show error message with "Try again" action
  - Multiple concurrent per-layer jobs → show per-file status indicators
- [ ] Toast notifications: "Generation started", "Generation complete", "Generation failed"

**Deliverable:** AI generation modal + per-layer triggers + generation history panel with async job polling.

---

## Phase 7 — Export Dialog

A modal for exporting the project to various formats.

**Checklist:**

- [ ] Create `features/editor/components/ExportDialog.tsx`:
  - Format selector: HTML, PDF, PNG, JPG, ZIP, MD (PPTX is v1.1 per PRD)
  - Conditional options:
    - Page size (A4, Letter, Custom) for PDF
    - Width/height inputs for custom size or image exports
    - Quality slider for JPG (1-100)
    - Slide multi-select for per-slide export
  - Export button → calls `useRequestExport`
  - Progress indicator during processing
  - On `ready`: show download button with `download_url`
  - If `download_url` expired (`expires_at`): show "Re-generate" button
- [ ] Wire export button in editor toolbar → opens ExportDialog
- [ ] Handle error state: export failed → show error message
- [ ] Handle loading state: spinner while export is processing
- [ ] Toast notifications: "Export started", "Export ready for download"

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
