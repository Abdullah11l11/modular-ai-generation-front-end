# Projects (Dashboard) — Implementation Roadmap

**Route:** `/dashboard`
**Feature folder:** `features/projects`
**Dependencies:** `features/types`, `features/auth`

This roadmap covers the Dashboard (`/dashboard`) — the user's personal project list — plus the Project Settings panel used inside the Editor. The Dashboard is the central hub for managing, creating, and deleting projects.

---

## Phase 0 — Prerequisites

Before Dashboard work begins, ensure these are in place:

- [ ] `useDeleteProject` hook created at `features/projects/hooks/useDeleteProject.ts` (does not exist yet — wraps `deleteProject` API with `useMutation` + query key invalidation for `['projects']`)
- [ ] Auth token lifecycle working: `useAuth` returns `{ user, isAuthenticated }` correctly
- [ ] `ProtectedRoute` guards `/dashboard` and redirects to `/login` if no token

---

## Phase 1 — Dashboard Shell & Project List

The main `/dashboard` page showing all user-owned projects in a grid or table with name, type, status badges, and last-updated timestamps.

**Checklist:**

- [ ] Create `src/pages/dashboard/DashboardPage.tsx` — thin page using `useProjects()` and composing child components
- [ ] Wire `DashboardPage` into `router.tsx` at `/dashboard`
- [ ] Create `features/projects/components/ProjectCard.tsx`:
  - Shows project name, type (from `OutputType`), status badge, last-updated timestamp
  - Status badges using shadcn `badge` with color variants (draft=ghost, published=cyan, archived=muted)
  - Click card → navigates to `/editor/projects/:projectId`
  - Card actions menu (three-dot) with Edit and Delete options
  - Handles `thumbnail_url` placeholder fallback
- [ ] Create `features/projects/components/ProjectGrid.tsx`:
  - Grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` via Tailwind
  - Maps over project list rendering `ProjectCard`
  - Inline loading state using shadcn `skeleton` cards
- [ ] Handle loading state: `FullPageLoader` or skeleton grid while `useProjects` resolves
- [ ] Handle error state: show `ErrorFallback` with retry action
- [ ] Handle empty state: "No projects yet" illustration with CTA to "Browse templates" and "Create blank project"
- [ ] Add `PageHeader` with title "My Projects" and a "New Project" button

**Deliverable:** Working dashboard page showing project cards with loading, empty, and error states.

---

## Phase 2 — Create Project Flow

Multi-branch flow: create from scratch (opens a form) or browse templates to fork (navigates to `/templates` or opens a modal gallery).

**Checklist:**

- [ ] Create `features/projects/components/CreateProjectModal.tsx` — a dialog with two options:
  - "Start from scratch" → shows create form
  - "From a template" → navigates to `/templates`
- [ ] Create `features/projects/components/CreateProjectForm.tsx`:
  - Fields: name (required), type (dropdown from `useTypes()`), description (textarea), visibility (select: public/private/unlisted), tags (`TagInput`), locale, direction (select: ltr/rtl)
  - Uses `react-hook-form` + `zod` for validation (name required, min length)
  - On submit → calls `useCreateProject().mutateAsync` → on success, navigate to `/editor/projects/:newProjectId` and show success toast
- [ ] Wire "New Project" button in `PageHeader` → opens `CreateProjectModal`
- [ ] Handle loading state: submit button shows spinner while creating
- [ ] Handle validation errors: inline field errors from zod schema + API 422 responses
- [ ] Handle error state: toast error on creation failure

**Deliverable:** Create project flow with scratch form, template redirect, validation, and post-creation redirect to editor.

---

## Phase 3 — Project Card Actions (Edit, Delete, Filter)

Card-level interactions and list filtering.

**Checklist:**

- [ ] Create `features/projects/components/ProjectCardActions.tsx`:
  - Dropdown menu (shadcn `dropdown-menu`) with: Edit, Duplicate (future), Delete
  - Edit → opens project settings modal (or navigates to editor)
  - Delete → opens confirmation dialog
- [ ] Create `features/projects/components/DeleteProjectDialog.tsx`:
  - Confirmation dialog with project name in the prompt
  - "Delete" button (destructive style) → calls `useDeleteProject`
  - On success → invalidate `['projects']` query, show "Project deleted" toast
  - Optimistic removal from local cache
- [ ] Add status filter tabs at top of dashboard (All / Draft / Published / Archived):
  - Updates `useProjects` query params → resets to page 1 on change
  - Active tab shows count from `PaginationMeta.total`
- [ ] Add search input (optional in header) that sets `q` param in `useProjects`
- [ ] Handle delete error: toast error with "Try again" action

**Deliverable:** Card actions (edit/delete with confirmations), status filtering, and search.

---

## Phase 4 — Project Settings Panel (within Editor)

A modal/panel inside the Editor for editing project metadata. Tightly coupled to the Editor feature.

**Note:** This phase depends on the Editor Shell (Phase 1 of `EDITOR_ROADMAP.md`) being built first.

**Checklist:**

- [ ] Create `features/projects/components/ProjectSettingsPanel.tsx`:
  - Fields: name, description, status (draft/published/archived), visibility, tags
  - Type is read-only (set at creation)
  - Direction toggle (ltr/rtl)
  - Uses `TagInput` component
- [ ] Trigger: gear icon in `EditorToolbar` opens this panel as a modal or right-side drawer
- [ ] On save → calls `useUpdateProject` → invalidates project + files queries → editor reflects changes
- [ ] Handle validation errors from API (422)
- [ ] Handle loading state on save button
- [ ] Status transitions: changing from draft → published should show a descriptive note ("Published projects are visible to others")

**Deliverable:** Project settings accessible from the editor toolbar with full metadata editing.

---

## Phase 5 — Polish & Edge Cases

Cross-cutting improvements.

**Checklist:**

- [ ] **Keyboard navigation:** Tab through project cards, Enter to open, Delete key triggers delete dialog (when card focused)
- [ ] **Pagination:** If user has many projects, add "Load more" button or page controls at bottom of grid
- [ ] **Duplicate project:** Future phase — "Duplicate" action creates a copy via `POST /projects` with prefilled data
- [ ] **Toast integration:** Create/delete/update lifecycle events use `toastSuccess` / `toastError`
- [ ] **Responsive grid:** Test card layout on mobile (single column), tablet (2 cols), desktop (3-4 cols)
- [ ] **Skeleton loading:** While projects load, show `skeleton` card placeholders matching card dimensions
- [ ] **Empty states refined:** Separate empty messages for "no projects yet" vs "no results matching filter"

---

## Dependency Graph

```
Phase 0 (Prerequisites: useDeleteProject hook)
   └── Phase 1 (Dashboard Shell & Project List)
          └── Phase 2 (Create Project Flow)
                 └── Phase 3 (Card Actions & Filtering)
                        └── Phase 5 (Polish)
   └── Phase 4 (Project Settings Panel — depends on Editor Shell)
```

Phase 4 runs independently and depends on the Editor feature being available.

---

## API Endpoints Used

| Method | Endpoint | Phase | Purpose |
|--------|----------|-------|---------|
| GET | `/projects` | 1 | List user's projects (paginated, filterable) |
| POST | `/projects` | 2 | Create new project |
| GET | `/projects/{id}` | 4 | Load single project for settings |
| PUT | `/projects/{id}` | 4 | Update project metadata |
| DELETE | `/projects/{id}` | 3 | Soft-delete a project |
| GET | `/types` | 2 | List output types for project type selector |

---

## Required shadcn Components & Libraries

### Install before starting

| Component | Command | Used In |
|-----------|---------|---------|
| `dialog` | `npx shadcn add dialog` | Create project modal, delete confirmation dialog |
| `select` | `npx shadcn add select` | Type, visibility, direction dropdowns |
| `dropdown-menu` | `npx shadcn add dropdown-menu` | Project card actions menu |
| `form` | `npx shadcn add form` | Create/edit project form with validation |
| `textarea` | `npx shadcn add textarea` | Description field in create form |
| `tooltip` | `npx shadcn add tooltip` | Action button hints on project cards |

### Already installed (no action needed)

`button`, `card`, `input`, `label`, `badge`, `skeleton`, `separator`, `tabs`, `avatar`, `field`

### Shared component to build

`TagInput` — custom component at `src/components/ui/tag-input.tsx`. Used by Project, Template, and Resource forms. No shadcn primitive covers this — build once, reuse everywhere.
