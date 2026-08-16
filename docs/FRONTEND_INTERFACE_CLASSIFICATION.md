# MGF Frontend — Interface Classification by Implementation Difficulty

This document catalogues every frontend interface in the MGF platform and rates each one as **Easy**, **Average**, or **Difficult**. Ratings are derived from four dimensions:

- **Backend integration complexity** — number of endpoints, polling, async jobs, pagination, error states
- **Design/UI complexity** — number of components, layout transitions, real-time feedback, responsive constraints
- **State and logic complexity** — auth guards, optimistic updates, derived state, multi-step flows
- **Domain-specific risk** — unclear specs (open questions in PRD), dependency on other features, or novel UI paradigms with no shadcn primitive

A single interface can span one route or span a shared component used across many routes. Where an interface is tightly coupled to another, that coupling is noted.

---

## Difficulty Legend

| Label | Meaning |
|---|---|
| 🟢 Easy | Straightforward CRUD or display. Thin backend contract, clear schema, few edge cases. Can be built in isolation. |
| 🟡 Average | Multi-step logic, pagination, optimistic UI, or moderate design work. Relies on at least one other feature or involves a non-trivial state machine. |
| 🔴 Difficult | Async jobs, live preview, complex layout, unresolved open questions in the PRD, or tight coordination with backend and multiple features simultaneously. |

---

## 1. Authentication

### 1.1 Register Page — `/register` 🟢 Easy

**Route:** `/register`
**Feature folder:** `features/auth`
**API endpoints used:** `POST /auth/register`

The registration form takes `name`, `email`, `password`, and `password_confirmation`. The response returns a `token` and a `User` object. The token must be stored (likely in memory or a context/store) and the user should be redirected to the dashboard.

**Why Easy:**
- One endpoint, one request shape (`RegisterRequest`), one success response (`AuthResponse`)
- shadcn `form`, `input`, `button`, `label` cover the entire UI
- Validation is server-driven via 422 responses with `errors` field — no custom client-side validator needed beyond basic required checks
- No polling, no async jobs, no derived state

**Complexity notes:**
- Token storage strategy should be decided before implementation (memory, httpOnly cookie via backend, or localStorage with XSS awareness). This is an architectural decision, not a UI complexity.
- Password confirmation match can be a simple client-side check before submission.

---

### 1.2 Login Page — `/login` 🟢 Easy

**Route:** `/login`
**Feature folder:** `features/auth`
**API endpoints used:** `POST /auth/login`

Email and password form. On success, store token and redirect.

**Why Easy:**
- Identical complexity profile to Register but simpler (two fields, no confirmation)
- Error handling is a single 422 or a general 401 message

---

### 1.3 Auth Token Lifecycle & Route Guards 🟡 Average

**Not a visible page**, but a cross-cutting concern that affects every protected route.

**Why Average:**
- Token must be injected into every outgoing Axios request via the existing `client.ts` interceptor — this is scaffolded but needs to be wired to wherever the token is stored
- Protected routes need an auth guard (redirect to `/login` if no token); admin routes need a role check (`role === 'admin'`)
- `GET /auth/me` should be called on app mount to rehydrate the current user without requiring re-login
- Logout calls `POST /auth/logout` then clears local token state — this must flush TanStack Query cache cleanly

---

## 2. User Profile & Settings

### 2.1 Settings Page — `/settings` 🟡 Average

**Route:** `/settings`
**Feature folder:** `features/me`
**API endpoints used:** `PUT /me/profile`, `GET /me/ai-providers`, `POST /me/ai-providers`, `PUT /me/ai-providers/{id}`, `DELETE /me/ai-providers/{id}`, `POST /me/ai-providers/{id}/test`

Two distinct sections in one page:

**Profile section:** Editable `name`, `bio`, `avatar_url`, `website`, `location`. Single PUT, simple form.

**AI Providers section:** A list of configured AI providers (`AiProvider` schema). Each provider has `provider` (enum: openai, anthropic, gemini, local, custom), `base_url`, `display_name`, `default_model`, `is_active`, and a `has_key` boolean (the key itself is never returned). Users can add, edit, delete, and test providers.

**Why Average:**
- Two conceptually separate sections with different data sources need to co-exist cleanly on one page
- The `api_key` field is write-only — the UI must communicate "key is stored" vs "no key yet" using only the `has_key` boolean, without ever displaying the key
- The `test` endpoint (`POST /me/ai-providers/{id}/test`) returns `{ ok, message, latency_ms }` — this requires a small async feedback interaction (loading spinner on the test button, inline success/error display)
- Provider form needs to conditionally show/hide `base_url` hint text depending on the selected `provider` enum
- Multi-item list with per-item edit and delete dialogs increases component count

---

### 2.2 Public User Profile Page — `/users/:userId` 🟡 Average

**Route:** `/users/:userId`
**Feature folder:** `features/users`
**API endpoints used:** `GET /users/{id}`, `GET /users/{id}/templates`, `GET /users/{id}/resources`

A read-only public page showing another user's avatar, bio, and their published templates and resources in paginated grids.

**Why Average:**
- Three separate API calls that should be parallelised (the user profile itself plus two paginated lists)
- Each paginated list requires its own pagination controls and independent loading/error states
- The page doubles as your own profile if `userId === currentUser.id`, so the UI may want to show an "Edit Profile" link contextually — requires a comparison against the authenticated user
- Social signals (`upvote_count`, `fork_count`) are displayed on template cards, so the `Template` schema's derived counts must be surfaced correctly

---

## 3. Templates

### 3.1 Template Gallery — `/templates` 🟡 Average

**Route:** `/templates`
**Feature folder:** `features/templates`
**API endpoints used:** `GET /templates` (with query params: `type_id`, `tags`, `q`, `sort`, `page`, `per_page`)

A browseable, searchable, filterable grid of public community templates with pagination.

**Why Average:**
- Filter state (type, tags, keyword, sort) must be synchronised with URL query params so that the page is shareable and navigable via the browser back button
- Four independent filter dimensions need to be composed into a single query string and fed to TanStack Query as a reactive key
- Pagination (`PaginationMeta`) drives a page control component and must integrate cleanly with filters (reset to page 1 on any filter change)
- Template cards must display `thumbnail_url` (with a placeholder fallback), `name`, `author`, `type`, `upvote_count`, `fork_count`, and `is_bookmarked` — this is a moderately rich card component
- `is_upvoted` and `is_bookmarked` booleans are only meaningful for authenticated users; the card must handle the unauthenticated state gracefully (no upvote/bookmark buttons, or redirect to login)

---

### 3.2 Template Detail Page — `/templates/:templateId` 🟡 Average

**Route:** `/templates/:templateId`
**Feature folder:** `features/templates`, `features/social`
**API endpoints used:** `GET /templates/{id}`, `GET /templates/{id}/files`, `POST /templates/{id}/upvote`, `POST /templates/{id}/bookmark`, `GET /templates/{id}/comments`, `POST /templates/{id}/comments`, `PUT /comments/{id}`, `DELETE /comments/{id}`, `POST /templates/{id}/fork`

A public detail view for a community template. Shows metadata, a file structure preview, social interactions, and a fork button.

**Why Average:**
- The fork action (`POST /templates/{id}/fork → Project`) is the key CTA and requires a modal that takes a project name, then redirects the user to the new project in the editor on success
- Upvote and bookmark are optimistic toggles — the local `is_upvoted`/`is_bookmarked` state and counts must update before the server confirms, then reconcile on failure
- Comments form a nested thread (`parent_id` enables reply chains) — while full thread rendering is not explicitly required at MVP, the schema supports it, meaning a flat list with indented replies is the minimum viable approach
- The `files` list (from `GET /templates/{id}/files`) can be shown as a read-only layer viewer, giving the user confidence in the template structure before forking

---

### 3.3 Create / Edit Template Form 🟡 Average

**Not a standalone route** — invoked from the Dashboard (create new template) and from the Editor settings panel (update existing template metadata).
**Feature folder:** `features/templates`
**API endpoints used:** `POST /templates`, `PUT /templates/{id}`, `GET /types`

A form covering `name`, `description`, `type_id` (populated from `GET /types`), `visibility`, `tags`, `locale`, and `direction`.

**Why Average:**
- `type_id` requires loading the types catalogue first (`GET /types`) — the form is blocked until this resolves
- The `tags` field needs a tag-input component (add/remove individual tags) — no shadcn primitive covers this directly; it requires a custom composition
- `direction` (ltr/rtl) affects the preview rendering and must propagate to the editor, meaning this form is not isolated from the rest of the editor context

---

## 4. Projects (Dashboard)

### 4.1 Dashboard — `/dashboard` 🟡 Average

**Route:** `/dashboard`
**Feature folder:** `features/projects`
**API endpoints used:** `GET /projects`, `POST /projects`, `DELETE /projects/{id}`

The user's personal project list. Shows all owned projects with their name, type, status, and last-updated timestamp. Allows creating a new project (scratch or from template) and deleting existing ones.

**Why Average:**
- The "Create Project" flow branches: start from scratch (opens a create form) or browse templates to fork (navigates to `/templates` or opens a modal gallery) — this branching UX adds design decisions
- Delete must be confirmed via a dialog and should optimistically remove the item from the list
- Projects carry `status` (draft / published / archived) — the UI should communicate this with a badge and may want to filter by status
- An empty state (no projects yet) needs a distinct, encouraging design that points toward the templates gallery

---

### 4.2 Project Settings Panel (within Editor) 🟡 Average

**Not a standalone route** — a side panel or modal within the Editor.
**Feature folder:** `features/projects`
**API endpoints used:** `GET /projects/{id}`, `PUT /projects/{id}`

Editable metadata: `name`, `description`, `status`, `visibility`, `tags`.

**Why Average:**
- Tightly coupled to the Editor; changes here must invalidate and refetch the project query used by the Editor
- `status` transitions (draft → published → archived) carry product-level meaning — the UI should communicate what "published" implies (template becomes shareable)
- Shares the tag-input complexity noted in the template form above

---

## 5. The Editor

### 5.1 Editor Shell & Layout — `/editor/projects/:projectId` 🔴 Difficult

**Route:** `/editor/projects/:projectId`
**Feature folder:** `features/editor` (orchestration), `features/projects`, `features/files`, `features/generation`, `features/export`

The primary workspace of the entire application. A multi-panel layout housing the slide library, file editor or CSS panel, and live preview.

**Why Difficult:**
- This single route is a composition of every other editor sub-interface below (5.2–5.7); it must load and coordinate data from at least four separate feature domains simultaneously
- The layout must be responsive: a three-column panel approach (slide library | editor | preview) that likely collapses or reorders on smaller screens
- All child panels share the same `projectId` context and must react to each other's changes (e.g., selecting a slide in the library should load that slide's file in the editor and update the preview)
- Route-level auth guard and project ownership check are needed before rendering
- The PRD explicitly identifies this as the most complex area with several open questions still unresolved (e.g., file format, the exact structure of `sequance.json`)

---

### 5.2 Slide Library Panel 🟡 Average

**Part of:** Editor Shell
**Feature folder:** `features/files`
**API endpoints used:** `GET /projects/{id}/files` (filtered to `layer: slide`), `POST /projects/{id}/files`, `DELETE /projects/{id}/files/{id}`, `PUT /projects/{id}/files/{id}` (for `sort_order`)

A vertical panel listing the project's slide files (`layer: slide`) as visual thumbnails or labelled cards. Supports drag-to-reorder, add new slide, and delete slide.

**Why Average:**
- Drag-and-drop reordering requires a DnD library (e.g., dnd-kit) not currently in the stack — this must be added
- After reordering, `sort_order` values must be sent back to the backend via `PUT` (or a batch reorder endpoint if one is added) — the current API contract only supports per-file updates, so a sequential batch of PATCHes or a future reorder endpoint must be accounted for
- Clicking a slide must update the shared editor context so the CSS panel and preview respond — this is cross-panel state coordination
- Thumbnail generation is not specified in the API contract; slides are raw HTML strings, meaning thumbnails must either be rendered-in-place (small iframes or scaled previews) or omitted in MVP

---

### 5.3 CSS Attribute Customization Panel 🔴 Difficult

**Part of:** Editor Shell
**Feature folder:** `features/editor`, `features/files`
**API endpoints used:** `GET /projects/{id}/files` (layer: style, layout), `PUT /projects/{id}/files/{id}`

The PRD describes this as "css attribute customization form side panel" — a form-based interface for editing visual properties (colors, fonts, spacing, padding, margins, alignment) without writing CSS directly. Changes are written back to `style.css` and `layout.css` file content.

**Why Difficult:**
- There is no agreed schema for how CSS attributes are represented as form fields. The `style.css` and `layout.css` files are raw strings — parsing them into structured form fields (color pickers, spacing sliders, font dropdowns) requires either a bespoke CSS-to-form parser, a predefined property map, or a convention in how templates are authored
- Changes must debounce and trigger a live preview update in under 500ms (PRD performance SLA)
- The panel must handle both `style.css` (visual: colors, fonts) and `layout.css` (structural: padding, margins, alignment) in a logically separated but visually unified UI
- The PRD notes a "Simple Mode" vs full CSS panel — this implies the component needs two rendering modes
- This is one of the most novel UI paradigms in the project; no shadcn primitive covers it and no standard pattern exists in the React ecosystem for CSS-as-form

---

### 5.4 Live Preview Pane 🔴 Difficult

**Part of:** Editor Shell
**Feature folder:** `features/editor`, `features/files`
**Data source:** All project files (`slide`, `style`, `layout`, `content`) assembled into a renderable HTML document client-side

The preview pane renders the full assembled output of the current project as the user edits it, targeting a < 500ms re-render SLA.

**Why Difficult:**
- No backend endpoint exists for rendering — the preview must be assembled client-side by combining the active slide's HTML with `style.css`, `layout.css`, and any relevant `content` data
- The assembly logic must be encapsulated in a pure function that can be debounced and fed into an `<iframe>` (or a sandboxed render container) without exposing the outer app's styles
- Security: if slide content is arbitrary HTML (user-authored or AI-generated), it must be sandboxed (`sandbox` attribute on `<iframe>`) to prevent XSS
- Correct rendering of `direction: rtl` vs `ltr` projects requires setting `dir` on the preview document root
- The preview must update reactively when the CSS panel changes, when a different slide is selected, and when AI generation completes — three independent triggers

---

### 5.5 Raw File Editor (Code Editor) 🟡 Average

**Part of:** Editor Shell (later-priority per PRD)
**Feature folder:** `features/files`
**API endpoints used:** `GET /projects/{id}/files/{id}`, `PUT /projects/{id}/files/{id}`

A code editor (Monaco or CodeMirror) for directly editing the raw content of any project file.

**Why Average:**
- Requires adding a code editor library (Monaco or CodeMirror) to the stack — neither is currently in `package.json`
- Autosave must debounce writes to avoid hammering the API on every keystroke; unsaved state must be tracked
- The editor should switch syntax highlighting mode based on `extension` (html, css, json, md)
- This is explicitly marked "later to Have" in the PRD — lower urgency, but not technically simpler than the CSS panel

---

## 6. AI Generation

### 6.1 Full Project Generation Flow 🔴 Difficult

**Part of:** Editor Shell
**Feature folder:** `features/generation`
**API endpoints used:** `POST /projects/{id}/generate`, `GET /generation-jobs/{id}`, `GET /projects/{id}/generation-jobs`

Triggers AI generation of all project files at once from a top-level prompt. The response is an `AiJob` with `status: pending | running | success | failed`. The UI must poll `GET /generation-jobs/{id}` until `status` reaches a terminal state, then reload all project files.

**Why Difficult:**
- Async job polling is the core challenge: the UI must enter a "generating…" state, prevent conflicting edits, poll at a reasonable interval (e.g., every 2–3 seconds), handle `failed` gracefully (show `error_message`), and on `success` invalidate and refetch all file queries
- The `provider_id` must be selected before generation — the UI must present a provider picker that falls back to a prompt to configure one if none are active
- An optional `prompt` field overrides `context.md` — this means the generation modal must surface both a free-text prompt and the existing `context.md` content so the user can make an informed decision
- Generation for a project with no AI provider configured should surface a clear, actionable empty state pointing to Settings → AI Providers

---

### 6.2 Per-Layer (Single File) Generation 🔴 Difficult

**Part of:** Editor Shell, per file in the Slide Library or File Editor
**Feature folder:** `features/generation`
**API endpoints used:** `POST /projects/{id}/files/{id}/generate`, `GET /generation-jobs/{id}`

Same async job pattern as Full Generation, but scoped to a single file layer.

**Why Difficult (same root causes as 6.1, plus):**
- The "regenerate this layer" button must be contextually attached to individual files or slide items without cluttering the UI
- After the job completes, only that specific file's query needs to be invalidated — not the whole project — requiring precise cache invalidation targeting
- The UX for "which file is currently generating" must be communicated clearly, especially when multiple per-layer jobs could theoretically be in flight

---

### 6.3 Generation History Panel 🟡 Average

**Part of:** Editor Shell or a dedicated section
**Feature folder:** `features/generation`
**API endpoints used:** `GET /projects/{id}/generation-jobs`

A list of past AI generation jobs for the current project, showing `provider`, `model`, `status`, `tokens_used`, `duration_ms`, `created_at`, and `error_message` for failures.

**Why Average:**
- Read-only paginated list — relatively straightforward
- The main complexity is surfacing this information in a useful way without cluttering the Editor shell (likely a collapsible panel or a drawer)

---

## 7. Export

### 7.1 Export Dialog 🟡 Average

**Part of:** Editor Shell
**Feature folder:** `features/export`
**API endpoints used:** `POST /projects/{id}/export`, `GET /export-jobs/{id}`

A modal or drawer where the user selects a format (`html`, `pdf`, `png`, `jpg`, `pptx`, `zip`, `md`) and optional export options (`page_size`, `width_px`, `height_px`, `quality`, `slides` subset).

**Why Average:**
- Same async polling pattern as AI generation — the export job moves through `pending → processing → ready → failed`; on `ready`, `download_url` becomes a signed URL the frontend must trigger as a file download
- The options UI is conditionally rendered: `quality` only appears for `jpg`; `width_px`/`height_px` only appear for custom `page_size` or image exports; the `slides` multi-select only appears when per-slide export makes sense
- The signed URL expires (`expires_at`) — the UI should display a download button only while valid, with a "re-generate" action if the link has expired

---

## 8. Resources (Community Database)

### 8.1 Resources Gallery — `/resources` 🟡 Average

**Route:** `/resources`
**Feature folder:** `features/resources`
**API endpoints used:** `GET /resources` (with `kind`, `tags`, `q`, `sort`, `page`, `per_page`)

A browseable, searchable gallery of community-shared resources: prompts, skills, agents, rules, MCPs, design docs, hooks.

**Why Average:**
- Structurally identical to the Template Gallery (Section 3.1) — same filter-URL-sync pattern, same pagination approach, same card design concerns
- The `kind` enum (7 values) acts as a primary filter tab and significantly drives the browsing UX — the UI must communicate what each kind is for non-technical users
- Resources with `placeholders` (structured `key/label/default/type` objects) will later need a "fill and use" interaction — even if not in MVP, the card design should leave room for this

---

### 8.2 Resource Detail Page — `/resources/:resourceId` 🟡 Average

**Route:** `/resources/:resourceId`
**Feature folder:** `features/resources`, `features/social`
**API endpoints used:** `GET /resources/{id}`, `POST /resources/{id}/upvote`, `POST /resources/{id}/bookmark`, `GET /resources/{id}/comments`, `POST /resources/{id}/comments`, `POST /resources/{id}/fork`

A detail view for a single resource showing its content, metadata, social signals, and a fork button.

**Why Average:**
- The `content` field is a freeform string (could be markdown, JSON, a prompt, an MCP config, etc.) — the UI must render it appropriately based on `kind`, which requires at minimum a code block with syntax highlighting
- Resources with `placeholders` must render an interactive fill-in form where each placeholder is replaced by a user-supplied value before the resource is used or copied
- Otherwise similar in social complexity to the Template Detail page (Section 3.2)

---

### 8.3 Create / Edit Resource — `/resources/new` and edit form 🟡 Average

**Route:** `/resources/new` and inline edit
**Feature folder:** `features/resources`
**API endpoints used:** `POST /resources`, `PUT /resources/{id}`, `DELETE /resources/{id}`

A form to create or edit a community resource.

**Why Average:**
- The `content` field is a large freeform text area (or code editor for structured kinds like `mcp`, `agent`, `rule`) — this overlaps with the raw file editor complexity
- The `placeholders` array is a structured list of `{ key, label, default, type }` objects that the user builds dynamically — this requires a dynamic list builder UI (add/remove/edit rows) with no shadcn primitive covering the list-management pattern
- The `kind` selector changes the intended format and contextual hints for the `content` field — the UI must adapt its guidance text accordingly

---

## 9. Social Features (Cross-cutting)

### 9.1 Upvote / Bookmark Toggles 🟢 Easy

**Used on:** Template cards, Template detail, Resource cards, Resource detail
**Feature folder:** `features/social`
**API endpoints used:** `POST /{target}/{id}/upvote`, `POST /{target}/{id}/bookmark`

Toggling a heart/upvote icon and a bookmark icon.

**Why Easy:**
- Single POST per action, the response immediately provides the new state (`upvoted: bool`, `upvote_count: int` / `bookmarked: bool`)
- Optimistic update is well-supported by TanStack Query's `useMutation` pattern — update local cache, revert on error
- The same `useToggleUpvote` and `useToggleBookmark` hooks are already scaffolded and work polymorphically across both templates and resources

---

### 9.2 Comments Thread 🟡 Average

**Used on:** Template detail page, Resource detail page
**Feature folder:** `features/social`
**API endpoints used:** `GET /{target}/{id}/comments`, `POST /{target}/{id}/comments`, `PUT /comments/{id}`, `DELETE /comments/{id}`

A paginated comment list with the ability to post, reply, edit own comments, and delete own comments.

**Why Average:**
- Threaded replies (`parent_id`) mean each comment can have a `replies` array — the render tree is recursive, which requires careful component design to avoid infinite depth rendering
- Edit and delete actions must be conditionally shown based on `comment.user_id === currentUser.id`
- Soft-deleted comments (`DELETE /comments/{id}` returns 204) — the backend likely returns a placeholder or removes the comment from subsequent fetches; the frontend must handle the disappearing comment gracefully
- Pagination of top-level comments while preserving reply context adds minor complexity

---

## 10. Admin

### 10.1 Admin Panel — `/admin/*` 🟡 Average

**Route:** `/admin/*`
**Feature folder:** `features/admin`
**API endpoints used:** `GET /admin/users`, `PUT /admin/users/{id}` (body `{ role }`), `GET /admin/templates`, `GET /admin/resources`

A protected admin-only section listing all users, all templates, and all resources with moderation capabilities. Currently, the only write action defined in the contract is updating a user's role.

**Why Average:**
- Role guard required: the route must redirect non-admins; this depends on the auth system correctly surfacing `role` in the current user context
- Three paginated admin lists (`users`, `templates`, `resources`) each need their own independent data fetching and table components
- The PRD notes that admin endpoints are "provisional" and may not fully align with the final backend contract — this introduces a risk of rework
- The `updateUserRole` mutation (`PUT /admin/users/{id}` with body `{ role }`) is the most write-sensitive admin action; it needs a confirmation step to prevent accidental role changes
- Future moderation features (content reports, template verification) are implied by the PRD's community safety section but are not yet in the API contract, so the admin UI shell must be designed to accommodate additions

---

## 11. Navigation & Layout Shell

### 11.1 App Shell (Header, Sidebar, Navigation) 🟡 Average

**Not a route**, but a shared layout wrapping every page.
**Feature folder:** `features/auth`, `features/me`
**API endpoints used:** `GET /auth/me` (on mount)

The persistent shell includes a top navigation bar or sidebar with links, the current user's avatar/name, and a logout action.

**Why Average:**
- The shell must handle three authentication states: unauthenticated (show Login / Register links), authenticated user, and authenticated admin (show Admin link)
- The current user's avatar and name must be loaded and cached globally — any profile update from the Settings page must invalidate this
- On logout, the shell must clear the token, flush the user query, and redirect to `/login`
- The navigation links vary depending on role — maintaining these conditional states without spaghetti code requires a clean auth context design

---

## Summary Table

| Interface | Route / Location | Difficulty |
|---|---|---|
| Register Page | `/register` | 🟢 Easy |
| Login Page | `/login` | 🟢 Easy |
| Auth Token Lifecycle & Guards | Cross-cutting | 🟡 Average |
| Settings Page (Profile + AI Providers) | `/settings` | 🟡 Average |
| Public User Profile | `/users/:userId` | 🟡 Average |
| Template Gallery | `/templates` | 🟡 Average |
| Template Detail | `/templates/:templateId` | 🟡 Average |
| Create / Edit Template Form | Modal / Panel | 🟡 Average |
| Dashboard (Project List) | `/dashboard` | 🟡 Average |
| Project Settings Panel | Editor Panel | 🟡 Average |
| Editor Shell & Layout | `/editor/projects/:projectId` | 🔴 Difficult |
| Slide Library Panel | Editor Panel | 🟡 Average |
| CSS Attribute Customization Panel | Editor Panel | 🔴 Difficult |
| Live Preview Pane | Editor Panel | 🔴 Difficult |
| Raw File / Code Editor | Editor Panel | 🟡 Average |
| Full Project AI Generation | Editor Modal | 🔴 Difficult |
| Per-Layer (Single File) Generation | Editor Contextual | 🔴 Difficult |
| Generation History Panel | Editor Panel | 🟡 Average |
| Export Dialog | Editor Modal | 🟡 Average |
| Resources Gallery | `/resources` | 🟡 Average |
| Resource Detail | `/resources/:resourceId` | 🟡 Average |
| Create / Edit Resource | `/resources/new` | 🟡 Average |
| Upvote / Bookmark Toggles | Cross-cutting | 🟢 Easy |
| Comments Thread | Template + Resource Detail | 🟡 Average |
| Admin Panel | `/admin/*` | 🟡 Average |
| App Shell (Nav + Header) | Cross-cutting | 🟡 Average |

---

## Count by Difficulty

| Difficulty | Count |
|---|---|
| 🟢 Easy | 3 |
| 🟡 Average | 18 |
| 🔴 Difficult | 5 |

---

## Key Risk Areas and Recommendations

**Editor Shell (5.1)** is the single highest-risk interface because it composes all five Difficult sub-interfaces simultaneously. It should be the first thing scaffolded — even with placeholder panels — so routing, context, and data flow are settled before any sub-panel is built in earnest.

**CSS Attribute Panel (5.3)** has the most unresolved product ambiguity. Before any code is written, the team needs to define the convention for how `style.css` and `layout.css` files are structured inside templates — either as raw CSS with predefined custom property names (`--primary-color`, `--body-font`) that the form maps to, or as a separate JSON config that is compiled into CSS. This decision gates the entire panel.

**Live Preview (5.4)** is the hardest performance problem in the codebase. The 500ms SLA demands that the assembly and render pipeline be profiled from day one. A sandboxed `<iframe>` with `srcdoc` and debounced injection is the recommended starting point.

**AI Generation Polling (6.1 / 6.2)** should use a single reusable polling hook (e.g., `useJobPoller`) backed by TanStack Query's `refetchInterval` rather than manual `setInterval`, to keep cancellation and cleanup safe across navigation events.

**Auth Token Strategy** must be decided before any protected route is built. A React context holding `{ token, user, setToken }` backed by `sessionStorage` (cleared on tab close) is a reasonable MVP approach that avoids `localStorage` XSS concerns while deferring a cookie-based solution.

**Tag Input** is needed on three separate forms (Template, Project, Resource). A shared `<TagInput>` component built once and placed in `src/components/ui` will pay dividends across the whole app.

**Admin Endpoints** are flagged as provisional in the `FRONTEND_STRUCTURE_GUIDE.md`. Do not build the Admin UI until the backend contract for admin routes is confirmed — the current hooks are placeholders only.
