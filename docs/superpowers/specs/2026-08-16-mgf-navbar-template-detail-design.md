# Sub-project #1 + #2: Navbar Profile Menu + Template Detail Page

**Date:** 2026-08-16
**Author:** design brainstorm with Crist
**Status:** approved (pending spec review)
**Parent plan:** `docs/superpowers/plans/2026-08-11-mgf-ai-integration.md`
**Decomposition:** first two sub-projects of the teammate-gap scope

---

## 1. Goal

Two things teammates left half-done that block the rest of the app feeling like a "standard website":

1. The Navbar's hardcoded "U" avatar does nothing — no profile link, no logout, no settings, no admin entry.
2. `/templates/:templateId` is an empty stub. There's no way to see what a template contains before forking. The PRD and OpenAPI contract clearly expose the template detail endpoint, the per-template files endpoint, the upvote/bookmark toggle endpoints, and the comments endpoint; the frontend just doesn't render any of it.

This spec covers exactly those two surfaces. Nothing else. Home page, project page, profile enhancements, admin, AI template creation, and resource kinds are deferred to sub-projects #3–#8 (see §8).

## 2. Scope

### In scope

- Wire the Navbar avatar to a `DropdownMenu` with: header (avatar + name + email), My Profile (links to `/users/:me`), Dashboard, Settings, Admin (admins only), Logout. Theme toggle stays as its own button.
- Add a `/me` route that redirects to `/users/:me` (so the navbar link works no matter how a user types the URL).
- Add a `/templates/:templateId` page that renders, in this order: header (back link, title, visibility, counts, action buttons), author strip (clickable avatar → `/users/:authorId`, tag chips, direction), preview panel (assembled like the editor's left panel), description, read-only files list (collapsible per layer), comments list (read-only), related-templates strip.
- A fork modal opened from the page header, calling the existing `useForkTemplate` mutation, navigating to `/editor/projects/:newId` on success.
- Upvote and bookmark toggles with optimistic updates.
- Related-templates strip driven by shared tags (max 4, excludes self).
- Fix: wrap the `TemplateCard` author avatar in `<Link to="/users/:id">` so cards link correctly.

### Out of scope

- Comments composer (write side). Read-only display only.
- `/templates/:id/edit` for owners.
- Admin actions on template (delete, change visibility). Belongs to sub-project #8.
- Home page, profile enhancements (`/me` activity tab, `/users/:id` resources/activity tabs), template creation, resource pages, project detail page.
- Removing the `mockResources` fallback in `UserResourcesGrid.tsx`. That's #4.

## 3. Architecture

### 3.1 Files added

| Path | Purpose |
|---|---|
| `src/pages/templates/TemplateDetailPage.tsx` | The new `/templates/:templateId` page. Hosts header, author strip, preview, files, comments, related, fork modal trigger. |
| `src/features/templates/components/ForkTemplateModal.tsx` | Radix `Dialog` with a single name field. Calls `useForkTemplate`. Navigates to `/editor/projects/:newId` on success. |
| `src/features/templates/components/TemplatePreviewPanel.tsx` | Reads `files: ProjectFile[]` + `direction`, calls `assemblePreviewHtml` from the editor, renders the result via `ScaledIframe` (sandboxed, 16:9). |
| `src/features/templates/components/TemplateFileViewer.tsx` | Dialog that shows one template file's `content` in a `<pre>` (read-only). Used by the "View" button in the files list. |
| `src/features/templates/components/RelatedTemplatesStrip.tsx` | Small wrapper around `TemplateGrid` that filters out the current template. |
| `src/features/templates/components/TemplateComments.tsx` | Renders the comment list using `useTemplateComments`. Read-only. |
| `src/features/users/components/AuthorChip.tsx` | Reusable avatar + name + "X days ago" combo, links to `/users/:id`. Used in template detail author strip. |
| `src/routes/ProfileRedirect.tsx` | Route component for `/me`. Reads `useMe()`, then `<Navigate to={`/users/${user.id}`} replace />`. Renders `<FullPageLoader />` while loading. |

### 3.2 Files modified

| Path | Change |
|---|---|
| `src/components/layout/Navbar.tsx` | Replace hardcoded "U" with `<DropdownMenu>` (Radix). Auth-aware: Login/Register buttons when no token, avatar menu when token. Theme toggle stays as its own button. |
| `src/routes/router.tsx` | Add `/me` → `<ProfileRedirect />` (under `RootLayout + ProtectedRoute`). Replace stub at `/templates/:templateId` with `<TemplateDetailPage />`. |
| `src/features/templates/components/TemplateCard.tsx` | Wrap the author avatar in `<Link to={`/users/${template.author.id}`}>`. (1-line fix so cards link correctly.) |

### 3.3 New hooks (all under `src/features/templates/hooks/`)

| Hook | Calls | Optimistic | Notes |
|---|---|---|---|
| `useToggleTemplateUpvote()` | `POST /templates/:id/upvote` → `ToggleResponse`. The upvote path is `POST /templates/{id}/upvote` per `docs/openapi_api_contract_working.yaml` (verified at planning time). | Yes — flip `is_upvoted` in `['templates', templateId]` cache; adjust `upvote_count` ±1. | Roll back on error. |
| `useToggleTemplateBookmark()` | Bookmark endpoint shape to be confirmed against `docs/openapi_api_contract_working.yaml` during planning — likely `POST /bookmark` with body `{ template_id }` (mirroring the resource bookmark pattern), or `POST /templates/:id/bookmark`. Whichever the spec says, the hook wraps it and returns `ToggleResponse`. | Yes — flip `is_bookmarked` in same cache. | Roll back on error. |
| `useTemplateComments(templateId)` | `GET /templates/:templateId/comments` (paginated). Endpoint shape to be verified at planning time — likely returns `{ data: Comment[], meta: PaginationMeta }`. | n/a | If endpoint returns 404 or is missing, return empty list (hide section). |
| `useRelatedTemplates(template)` | Wraps `useTemplates({ tags: template.tags?.[0], per_page: 4 })`; filters out `template.id` from results. | n/a | If template has no tags or result is empty, return null (strip hides itself). |

### 3.4 Reused primitives (no new files)

- `src/components/ui/dropdown-menu.tsx`, `src/components/ui/avatar.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/tabs.tsx`, `src/components/ui/skeleton.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx` — all already present.
- `src/features/editor/hooks/useAssemblePreview.ts` — `assemblePreviewHtml({ slideHtml, slideCss, layoutCss, layoutHtml, styleCss, contentJson, direction })`. Pure function we import directly.
- `src/features/editor/components/Preview/ScaledIframe.tsx` — wraps the assembled `srcDoc` for the template detail page. Sandbox only (`sandbox=""` or `allow-same-origin`); no `allow-scripts` (the click-handler postMessage from the editor isn't needed here).
- `src/features/auth/hooks/useAuth.ts`, `src/features/auth/hooks/useLogout.ts`, `src/features/me/hooks/useMe.ts` — already there.
- `src/hooks/useDebounce.ts` — used by `useRelatedTemplates` if we debounce tag changes later (not needed for v1).

## 4. Component design

### 4.1 Navbar (modified)

```
<Navbar>
  ├─ <BrandLink to="/">…MGF</BrandLink>
  ├─ <NavLinks> Browse · Resources  ← unchanged
  ├─ <ThemeToggle>                  ← unchanged, separate button
  └─ <AuthControl>
      ├─ if !hasToken() → <Button to="/login">Login</Button>, <Button to="/register" variant="ghost">Register</Button>
      └─ else
          └─ <DropdownMenu>
              ├─ <DropdownMenuTrigger> → <Avatar src=user.profile?.avatar_url fallback=name[0] size="sm"/>
              └─ <DropdownMenuContent align="end" className="w-56">
                  ├─ <DropdownMenuLabel>
                  │   <div className="flex items-center gap-2">
                  │     <Avatar …/>
                  │     <div><div>{user.name}</div><div className="text-xs text-muted">{user.email}</div></div>
                  │   </div>
                  ├─ <DropdownMenuSeparator/>
                  ├─ <DropdownMenuItem asChild><Link to={`/users/${user.id}`}>My Profile</Link></DropdownMenuItem>
                  ├─ <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                  ├─ <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                  ├─ {user.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin">Admin</Link></DropdownMenuItem>}
                  ├─ <DropdownMenuSeparator/>
                  └─ <DropdownMenuItem onSelect={() => logout()}>Logout</DropdownMenuItem>
```

Loading state: while `useMe().isLoading`, render a `<Skeleton className="size-7 rounded-full" />` (not the avatar — avoids flash). On `useMe().error`, fall back to Login + Register.

### 4.2 TemplateDetailPage layout

Single column, `max-w-5xl`, `space-y-8`.

1. **Header row** — back link ("← Templates"), template name (`<h1>`), visibility badge (Public/Unlisted/Private — `Badge variant="outline"`), `fork_count` chip, action buttons on the right:
   - **Upvote** (heart icon + count, optimistic). Hidden when current user is the author.
   - **Bookmark** (bookmark icon, optimistic). Hidden when current user is the author.
   - **Use this template** (`<Button variant="accent">`, primary, always visible). Opens `ForkTemplateModal`.
   Loading = header skeleton + three button skeletons.

2. **Author strip** — `<AuthorChip user={template.author} createdAt={template.created_at} />`. Tag badges next to author name, each `<Link to={`/templates?tags=${tag}`}>`. Direction badge (LTR/RTL).

3. **Preview panel** — `<TemplatePreviewPanel files={files} direction={template.direction} />`. 16:9 aspect, max ~720×405 px desktop, scales down. Loading = skeleton 16:9. Error / no slide file = "No preview available" card. If multiple slide files exist, render only the first (by `sort_order`) with a small "Slide 1 of N · showing first only" label.

4. **Description** — full description text. If empty, hide the section.

5. **Files section** (read-only) — one collapsible row per file, grouped by layer. Default expanded: `slide`, `style`, `layout`, `content`. Default collapsed: `context`, `rules`, `meta`, `asset`. Each row shows: layer icon, layer label, file name, formatted size (`formatBytes(size_bytes)`), "View" button → opens `<TemplateFileViewer>` Dialog with the file's `content` in a `<pre>` (CSS background color matches the layer kind). Asset files (`storage_url` only, no `content`) show "External asset" with a link.

6. **Comments section** — `<TemplateComments templateId={template.id} />`. Read-only list: avatar + author name + body + relative timestamp. If empty, muted "No comments yet". Composer is **out of scope** (sub-project deferred).

7. **Related templates** — `<RelatedTemplatesStrip template={template} />`. `<TemplateGrid>` of up to 4 cards. Loading = 4 skeletons. If no related (no shared tags, or filtered to empty), hide the section entirely.

8. **Fork modal** — opened from the header action button. (See §4.4.)

### 4.3 TemplatePreviewPanel

```
<TemplatePreviewPanel files direction>
  ├─ slideFile  = files.find(f => f.layer === 'slide')   // sorted by sort_order, take first
  ├─ styleFile  = files.find(f => f.layer === 'style')
  ├─ layoutFile = files.find(f => f.layer === 'layout')
  ├─ contentFile= files.find(f => f.layer === 'content')
  ├─ if !slideFile → render fallback card
  └─ srcDoc = assemblePreviewHtml({
  │      slideHtml:  slideFile?.content ?? '',
  │      slideCss:   '',                                // template files don't include per-slide CSS — empty is fine
  │      layoutCss:  layoutFile?.content ?? '',
  │      layoutHtml: '',                                // no separate layout HTML in the file model
  │      styleCss:   styleFile?.content ?? '',
  │      contentJson: contentFile?.content ?? '{}',
  │      direction:  direction,
     })
  └─ <ScaledIframe srcDoc sandbox="allow-same-origin" naturalWidth={1280} naturalHeight={720} />
```

The mapping logic mirrors what `SlideList` does for the editor's left panel, with the simplification that templates have a single slide group (no per-slide CSS layers). If `SlideList`'s logic ever changes for projects, this can drift; we accept that risk for v1 and refactor to a shared util later.

### 4.4 ForkTemplateModal

```
<ForkTemplateModal open onOpenChange template>
  ├─ <Dialog>
  │   ├─ <DialogTitle>Use this template</DialogTitle>
  │   ├─ <DialogDescription>{template.name} will be copied to a new project you can edit.</DialogDescription>
  │   ├─ <Input
  │   │     label="Project name"
  │   │     defaultValue={`${template.name} (copy)`}
  │   │     maxLength={80}
  │   │     autoFocus
  │   │   />
  │   ├─ <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
  │   └─ <Button variant="accent" onClick={handleSubmit} disabled={!isValid || isPending}>
  │         {isPending && <Spinner />} Create & open editor
  │   </DialogContent>
  ├─ useForkTemplate() mutation
  └─ handleSubmit:
      ├─ validate: name.trim().length > 0 && ≤ 80
      ├─ mutation.mutate({ templateId: template.id, payload: { name: name.trim() } })
      │   onSuccess(result):
      │     ├─ toast.success(`Created "${name}"`)
      │     ├─ queryClient.invalidateQueries({ queryKey: ['projects'] })
      │     ├─ queryClient.invalidateQueries({ queryKey: ['templates'] })        // fork_count update
      │     ├─ queryClient.invalidateQueries({ queryKey: ['templates', template.id, 'files'] })
      │     ├─ navigate(`/editor/projects/${result.project.id}`)
      │     └─ onOpenChange(false)
      │   onError(err):
      │     ├─ if 401: toast("Sign in to fork templates") + navigate(`/login?next=/templates/${template.id}`)
      │     └─ else: toast.error("Could not create project — try again")
```

## 5. Data flow

```
URL → /templates/:templateId
   ↓
TemplateDetailPage
   ├─ useTemplate(id)        ─→ GET /templates/:id              (cached key: ['templates', id])
   ├─ useTemplateFiles(id)   ─→ GET /templates/:id/files        (cached key: ['templates', id, 'files'])
   ├─ useTemplateComments(id)─→ GET /templates/:id/comments     (cached key: ['templates', id, 'comments'])
   └─ useRelatedTemplates(t) ─→ useTemplates({ tags, per_page: 4 })
   ↓
Render sections
   ↓
User clicks "Use this template"
   ↓
ForkTemplateModal opens (local state in page, OR via useState in TemplateDetailPage)
   ↓
Submit → useForkTemplate.mutate()
   ↓
POST /templates/:id/fork  →  { project: Project }
   ↓
navigate('/editor/projects/:newId')
```

Cache invalidation on fork success: `['projects']`, `['templates']`, `['templates', id, 'files']`. This propagates the new fork count everywhere and refreshes the dashboard.

## 6. Edge cases & error states

| Scenario | Behavior |
|---|---|
| Template 404 | `<ErrorFallback>` with "Template not found — it may have been deleted or unlisted." + "Back to templates" button. |
| Template is `unlisted` / `private`, viewer not author or admin | Same as 404 (don't leak existence). |
| Files endpoint fails but template loads | Preview skeleton + "Could not load preview" muted. Files section hidden. Other sections render. |
| No slide file in template | Preview: "No preview available" card with hint. Files section: still rendered. Fork still works. |
| Template has only `slide` file (no style/layout/content) | `assemblePreviewHtml` accepts empty strings for missing layers. Preview renders just the slide. |
| RTL direction | Pass `direction: 'rtl'` to `assemblePreviewHtml` — injects Arabic Google Fonts + `dir="rtl"`. Preview iframe flips. |
| Comments endpoint 404 | Hide comments section entirely, log debug. Don't break page. |
| Related templates = 0 matches | Hide related strip. Don't show empty grid. |
| User clicks Fork while unauthenticated | Modal opens; submit triggers 401 → toast "Sign in to fork templates" + `navigate('/login?next=/templates/:id')`. |
| User owns the template | Hide upvote + bookmark. Keep "Use this template" visible. No edit affordance (out of scope). |
| Optimistic upvote/bookmark race | On error, roll back cache + toast "Could not save vote". |
| Avatar URL 404 | `<AvatarFallback>` (Radix handles). Fallback text = `user.name[0]`. |
| Token expired mid-session | `useMe()` errors → `AuthControl` shows Login + Register. |
| Theme toggle while dropdown open | Dropdown auto-closes (Radix default). |
| Multiple slide files | Render only first (by `sort_order`); show "Slide 1 of N · showing first only". |

## 7. Auth gating

- `/templates/:templateId` — public. Backend enforces visibility (`public` / `unlisted` / `private`). Already under `RootLayout` (no `ProtectedRoute`).
- `/me` — protected. New `<ProfileRedirect>` route under `ProtectedRoute`. Renders `<FullPageLoader />` while `useMe()` loads; then `<Navigate to={`/users/${user.id}`} replace />`.
- Navbar dropdown — only renders when `hasToken()`. Unauth users see Login + Register buttons.
- Fork mutation — backend 401s unauth users; we surface a helpful toast.

## 8. Out of scope (deferred)

- **#3 Home page** (`/`) — recent templates strip, recent resources strip, hero / "who we are".
- **#4 Public profile pages** (`/users/:userId` + `/me` Resources/Activity tabs) — remove `mockResources` fallback, add activity feed (upvotes + comments).
- **#5 Forking flow** as a standalone sub-project — this spec covers the *modal* part of forking from the template detail page only. Standalone flow (for e.g. admin-initiated forks) deferred.
- **#6 Template creation** — `/templates/new` with two modes (scratch + AI-driven) and strict validation. Validation rules from this spec's decomposition call: strict (non-empty, JSON/CSS/markdown shape, size caps, reject unsafe URLs in meta).
- **#7 Resource pages** — `/resources/new` for all 7 kinds, kind-specific display.
- **#8 Project detail page + Admin tabs** — `/projects/:projectId` read-only view, `/admin/users`, `/admin/templates`, `/admin/resources` tabs.
- Comments composer (write side).
- Removing `mockResources` fallback in `UserResourcesGrid.tsx`.
- `/templates/:id/edit` for owners.
- Admin's delete-template flow on the detail page.

## 9. Testing strategy

Three layers, matching the project's existing test layout (`src/**/*.test.ts(x)` via Vitest, currently 145/145 passing):

**1. Hook unit tests**
- `useToggleTemplateUpvote.test.ts` — mock `apiClient.templates.upvote`; assert cache flip + count ±1; assert rollback on error.
- `useToggleTemplateBookmark.test.ts` — same pattern.
- `useTemplateComments.test.ts` — assert empty list on 404.
- `useRelatedTemplates.test.ts` — assert self is excluded; assert null when template has no tags.

**2. Component tests**
- `ForkTemplateModal.test.tsx` — fill name → submit → assert `useForkTemplate` called with `{ templateId, payload: { name } }`; assert navigation called. Empty name → submit disabled. >80 chars → submit disabled. 401 error → toast + redirect to login.
- `TemplatePreviewPanel.test.tsx` — pass files with all 4 layers → assert `ScaledIframe` receives non-empty `srcDoc` containing the slide HTML. No slide file → fallback "No preview available". RTL direction → assert `dir="rtl"` in srcDoc.
- `TemplateFileViewer.test.tsx` — assert `<pre>` contains the file's content.

**3. Page test**
- `TemplateDetailPage.test.tsx` — render with mocked `useTemplate` + `useTemplateFiles` returning sample data. Assert: title, author chip linking to `/users/:authorId`, fork button, upvote/bookmark, files list count, comments, related. Author avatar click → `navigate('/users/:authorId')`. Use-template click → modal opens with prefilled name.
- `ProfileRedirect.test.tsx` — while loading → `<FullPageLoader />`; once user loaded → `<Navigate to={`/users/${user.id}`} replace />`.

Skip Playwright E2E for this sub-project (manual smoke test will follow).

## 10. Known limitations / risks

1. **Comments are read-only** — composer deferred.
2. **`TemplatePreviewPanel` re-implements `SlideList`'s mapping** for the 7 preview inputs. If `SlideList` logic changes for projects, this can drift. Acceptable for v1.
3. **`/templates/:id/edit` for owners** — no edit affordance for owners; they can't edit their own template from the UI in this sub-project.
4. **`mockResources` fallback** in `UserResourcesGrid.tsx` is still there — fix in #4.
5. **Related-templates algorithm is naive** — first tag, 4 results. Good enough for v1; smarter recommendation belongs to a later sub-project.
6. **No bulk actions** on files (download all, view-all in tabs). Not in scope.

## 11. Follow-ups

After this sub-project ships, the natural next steps in the parent decomposition are:

- Sub-project #3 — Home page (`/`) using `<RelatedTemplatesStrip>` and the new `<AuthorChip>`.
- Sub-project #4 — Public profile pages, where `<AuthorChip>` becomes a primary component.
- Sub-project #5 — Standalone forking flow (if needed; this spec already handles the modal).
- Sub-project #6 — Template creation with strict validation, using the same `assemblePreviewHtml` for preview-before-submit.

## 12. Appendix: backend contract reference

From `docs/openapi_api_contract_working.yaml`:

- `GET /templates/:templateId` → `Template` (id, user_id, author, type, name, description, thumbnail_url, visibility, tags, locale, direction, fork_count, upvote_count, is_upvoted, is_bookmarked, created_at, updated_at).
- `GET /templates/:templateId/files` → `{ data: ProjectFile[] }` (per-layer files: slide, style, layout, content, context, rules, meta, asset).
- `POST /templates/:templateId/upvote` → `ToggleResponse { active: boolean, count: number }`.
- `POST /templates/:templateId/bookmark` → `ToggleResponse`.
- `POST /templates/:templateId/fork` body `{ name }` → `{ project: Project }`.
- `GET /templates/:templateId/comments` → paginated comment list.
- `GET /auth/me` → `User` (id, name, email, role, profile { avatar_url, bio, website, location }).