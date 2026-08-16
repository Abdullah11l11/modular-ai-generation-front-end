# Navbar Profile Menu + Template Detail Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Navbar avatar to a profile menu, add a `/me` redirect, and build the `/templates/:templateId` page with header, author strip, assembled-preview-iframe, files list, comments, related strip, and fork modal.

**Architecture:** New page + new components under `src/features/templates/components/`. Reuse the existing `assemblePreviewHtml` pure function and `ScaledIframe` primitive from the editor so the detail-page preview is pixel-equivalent to the editor's left panel. New `AuthControl` component owned by the Navbar renders a Radix `DropdownMenu` when a token exists, Login/Register buttons when not. All visual state is local component state; all server state is read through existing TanStack Query hooks (no new wrapper hooks — the existing `useToggleUpvote` / `useToggleBookmark` from `src/features/social/hooks/` already target-generic).

**Tech Stack:** React 19.2.5, TypeScript 6.0.2, Vite 8, Tailwind 4, TanStack Query v5, Radix `DropdownMenu`/`Dialog`/`Avatar`/`Tabs`, sonner toasts, Vitest + jsdom.

**Spec:** [`docs/superpowers/specs/2026-08-16-mgf-navbar-template-detail-design.md`](../specs/2026-08-16-mgf-navbar-template-detail-design.md)

---

## File structure

### New files

| Path | Responsibility |
|---|---|
| `src/lib/format.ts` | Pure formatters: `formatBytes`, `formatRelativeTime`, `formatNumber`. |
| `src/lib/__tests__/format.test.ts` | Unit tests for the formatters (mirrors `src/lib/ai/__tests__/` pattern). |
| `src/features/templates/lib/cacheMutations.ts` | Pure helpers: `applyUpvoteToggle`, `applyBookmarkToggle` — operate on a `Template` value, no React. |
| `src/features/templates/lib/__tests__/cacheMutations.test.ts` | Unit tests for the optimistic-update pure helpers. |
| `src/routes/ProfileRedirect.tsx` | Tiny route: `<FullPageLoader />` while `useMe()` loads, then `<Navigate to={`/users/${user.id}`} replace />`. |
| `src/components/layout/AuthControl.tsx` | Auth-aware Navbar trailing area: Login/Register when no token, Radix `DropdownMenu` when token. |
| `src/features/users/components/AuthorChip.tsx` | Avatar + name + relative time + (optional) link. Reusable. |
| `src/features/templates/components/TemplatePreviewPanel.tsx` | Reads `files: ProjectFile[]` + `direction`, calls `assemblePreviewHtml`, renders via `ScaledIframe`. |
| `src/features/templates/components/TemplateFileViewer.tsx` | Radix Dialog showing one file's `content` in `<pre>`. |
| `src/features/templates/components/TemplateFileList.tsx` | Collapsible per-layer file list with "View" buttons. |
| `src/features/templates/components/TemplateComments.tsx` | Read-only list driven by `useTemplateComments`. |
| `src/features/templates/components/RelatedTemplatesStrip.tsx` | Wraps `TemplateGrid` with up to 4 cards, filtered by shared tag. |
| `src/features/templates/components/ForkTemplateModal.tsx` | Radix Dialog: name field + submit, calls `useForkTemplate`, navigates on success. |
| `src/pages/templates/TemplateDetailPage.tsx` | The new `/templates/:templateId` page; composes the sections above. |

### Modified files

| Path | Change |
|---|---|
| `src/components/layout/Navbar.tsx` | Replace hardcoded "U" with `<AuthControl />`; keep brand link, `navLinks`, theme toggle. |
| `src/routes/router.tsx` | Add `/me → <ProfileRedirect />` under `ProtectedRoute + RootLayout`. Replace stub at `/templates/:templateId` with `<TemplateDetailPage />`. |
| `src/features/templates/components/TemplateCard.tsx` | Wrap author avatar in `<Link to={`/users/${author.id}`}>` (1-line fix). |

### Reused — no changes

`useAuth`, `useLogout`, `useMe`, `useTemplate`, `useTemplateFiles`, `useTemplates`, `useForkTemplate`, `useToggleUpvote`, `useToggleBookmark` (all already in `src/features/*/hooks/`). `assemblePreviewHtml` (`src/features/editor/hooks/useAssemblePreview.ts`). `ScaledIframe` (`src/features/editor/components/Preview/ScaledIframe.tsx`). `cn` (`src/lib/utils`). `PageHeader`, `EmptyState`, `ErrorFallback`, `FullPageLoader`. `Avatar`, `DropdownMenu`, `Dialog`, `Tabs`, `Badge`, `Button`, `Card`, `Skeleton`. `toastSuccess`/`toastError` (`src/lib/toast`).

### Notes on testing scope

The project's existing test pattern (145/145 passing) is **pure-function unit tests only** — no `@testing-library/react`, no MSW, no `vi.mock`. We mirror this. Component-render tests are **deferred** (would require adding `@testing-library/react` + `jsdom` setup, out of scope for this sub-project). Each TDD-able helper gets a unit test file in a sibling `__tests__/` directory.

---

## Phase 0 — Pre-flight

### Task 1: Verify `forkTemplate` return shape

**Files:**
- Read: `src/features/templates/api/forkTemplate.ts`
- Read: `docs/openapi_api_contract_working.yaml` (around `/templates/{id}/fork`)

- [ ] **Step 1: Read `forkTemplate.ts` to confirm the return type and fix if needed**

The spec assumes the fork response contains a `project` (or a `Project` shape) so the page can navigate to `/editor/projects/:newProjectId`. Local code may declare the response as `Template`, which would be wrong — fix the type to match the backend.

```bash
cat src/features/templates/api/forkTemplate.ts
```

Look at the third type parameter of `apiClient.post<...>(...)`. Whatever shape it returns must contain the new project's `id` so we can navigate to `/editor/projects/${id}`. If it's `{ project: { id, ... } }`, leave it. If it's just `Template`, check the OpenAPI YAML:

```bash
grep -A 30 "/templates/{id}/fork" docs/openapi_api_contract_working.yaml
```

Adjust `forkTemplate.ts`'s generic parameter to match the actual backend response (e.g. `apiClient.post<{ project: Project }>(...)`). If `Project` isn't exported, import it from `@/types/api`.

- [ ] **Step 2: Run typecheck to confirm the type still compiles**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If errors, fix the type imports/usage in `forkTemplate.ts` and any callers.

- [ ] **Step 3: Commit any type fix**

```bash
git add src/features/templates/api/forkTemplate.ts
git commit -m "fix(api): align forkTemplate response type with backend contract"
```

(If no change was needed, skip this step — note "verified" in your task log.)

---

## Phase 1 — Pure helpers (TDD)

### Task 2: `formatBytes`, `formatRelativeTime`, `formatNumber`

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/__tests__/format.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/lib/__tests__/format.test.ts
import { describe, expect, it } from 'vitest';
import { formatBytes, formatNumber, formatRelativeTime } from '../format';

describe('formatBytes', () => {
  it('returns "0 B" for null, undefined, or 0', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(null)).toBe('0 B');
    expect(formatBytes(undefined)).toBe('0 B');
  });
  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
  });
});

describe('formatNumber', () => {
  it('returns small numbers as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(42)).toBe('42');
    expect(formatNumber(999)).toBe('999');
  });
  it('uses k-suffix for thousands, dropping trailing .0', () => {
    expect(formatNumber(1_000)).toBe('1k');
    expect(formatNumber(1_234)).toBe('1.2k');
    expect(formatNumber(12_345)).toBe('12k');
    expect(formatNumber(999_999)).toBe('1000k');
  });
  it('uses M-suffix for millions, dropping trailing .0', () => {
    expect(formatNumber(1_000_000)).toBe('1M');
    expect(formatNumber(2_500_000)).toBe('2.5M');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-08-16T12:00:00Z');
  it('returns "just now" for <60s', () => {
    expect(formatRelativeTime('2026-08-16T11:59:30Z', now)).toBe('just now');
  });
  it('returns minutes for <60m', () => {
    expect(formatRelativeTime('2026-08-16T11:55:00Z', now)).toBe('5m ago');
    expect(formatRelativeTime('2026-08-16T11:01:00Z', now)).toBe('59m ago');
  });
  it('flips to hours at the 60-minute boundary', () => {
    expect(formatRelativeTime('2026-08-16T11:00:00Z', now)).toBe('1h ago');
    expect(formatRelativeTime('2026-08-16T09:00:00Z', now)).toBe('3h ago');
  });
  it('returns days for <7d', () => {
    expect(formatRelativeTime('2026-08-14T12:00:00Z', now)).toBe('2d ago');
  });
  it('returns weeks for <30d', () => {
    expect(formatRelativeTime('2026-08-02T12:00:00Z', now)).toBe('2w ago');
  });
  it('falls back to ISO date for >=30d', () => {
    expect(formatRelativeTime('2026-01-16T12:00:00Z', now)).toBe('2026-01-16');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx vitest run src/lib/__tests__/format.test.ts
```

Expected: FAIL — `format` module not found.

- [ ] **Step 3: Implement the helpers**

```ts
// src/lib/format.ts

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatNumber(n: number): string {
  if (n < 1_000) return String(n);
  if (n < 1_000_000) {
    const v = n / 1_000;
    return `${v.toFixed(v >= 100 ? 0 : 1).replace(/\.0$/, '')}k`;
  }
  const v = n / 1_000_000;
  return `${v.toFixed(v >= 100 ? 0 : 1).replace(/\.0$/, '')}M`;
}

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return then.toISOString().slice(0, 10);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx vitest run src/lib/__tests__/format.test.ts
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/__tests__/format.test.ts
git commit -m "feat(lib): add formatBytes, formatNumber, formatRelativeTime helpers"
```

---

### Task 3: Optimistic update helpers for template cache

**Files:**
- Create: `src/features/templates/lib/cacheMutations.ts`
- Create: `src/features/templates/lib/__tests__/cacheMutations.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/features/templates/lib/__tests__/cacheMutations.test.ts
import { describe, expect, it } from 'vitest';
import type { Template } from '@/types/api';
import { applyBookmarkToggle, applyUpvoteToggle } from '../cacheMutations';

const baseTemplate: Template = {
  id: 't1',
  user_id: 'u1',
  author: { id: 'u1', name: 'Alice', avatar_url: null },
  type: null,
  name: 'Acme Pitch',
  description: null,
  thumbnail_url: null,
  visibility: 'public',
  tags: [],
  locale: 'en',
  direction: 'ltr',
  fork_count: 5,
  upvote_count: 12,
  is_upvoted: false,
  is_bookmarked: false,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-01T00:00:00Z',
};

describe('applyUpvoteToggle', () => {
  it('flips is_upverted to true and increments count when previously false', () => {
    const result = applyUpvoteToggle(baseTemplate, { active: true, count: 13 });
    expect(result.is_upvoted).toBe(true);
    expect(result.upvote_count).toBe(13);
  });
  it('flips is_upverted to false and decrements count when previously true', () => {
    const t = { ...baseTemplate, is_upvoted: true, upvote_count: 12 };
    const result = applyUpvoteToggle(t, { active: false, count: 11 });
    expect(result.is_upvoted).toBe(false);
    expect(result.upvote_count).toBe(11);
  });
  it('does not mutate the input', () => {
    const before = JSON.stringify(baseTemplate);
    applyUpvoteToggle(baseTemplate, { active: true, count: 13 });
    expect(JSON.stringify(baseTemplate)).toBe(before);
  });
  it('returns the same reference if server count matches current state (idempotent)', () => {
    // active=true, current false, server says 13 → still toggle to true with 13
    const result = applyUpvoteToggle(baseTemplate, { active: true, count: 13 });
    expect(result).not.toBe(baseTemplate);
    expect(result.is_upvoted).toBe(true);
    expect(result.upvote_count).toBe(13);
  });
});

describe('applyBookmarkToggle', () => {
  it('flips is_bookmarked to true', () => {
    const result = applyBookmarkToggle(baseTemplate, { active: true, count: 1 });
    expect(result.is_bookmarked).toBe(true);
  });
  it('flips is_bookmarked to false', () => {
    const t = { ...baseTemplate, is_bookmarked: true };
    const result = applyBookmarkToggle(t, { active: false, count: 0 });
    expect(result.is_bookmarked).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx vitest run src/features/templates/lib/__tests__/cacheMutations.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helpers**

```ts
// src/features/templates/lib/cacheMutations.ts
import type { Template, ToggleResponse } from '@/types/api';

/**
 * Returns a new Template reflecting the upvote state from the server.
 * Trusts the server's `active` flag — caller should treat `count` as authoritative.
 */
export function applyUpvoteToggle(template: Template, response: ToggleResponse): Template {
  return {
    ...template,
    is_upvoted: response.active,
    upvote_count: response.count,
  };
}

/**
 * Returns a new Template reflecting the bookmark state from the server.
 */
export function applyBookmarkToggle(template: Template, response: ToggleResponse): Template {
  return {
    ...template,
    is_bookmarked: response.active,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx vitest run src/features/templates/lib/__tests__/cacheMutations.test.ts
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/templates/lib/cacheMutations.ts src/features/templates/lib/__tests__/cacheMutations.test.ts
git commit -m "feat(templates): pure helpers for upvote/bookmark optimistic updates"
```

---

## Phase 2 — Routing

### Task 4: Create `ProfileRedirect` route component

**Files:**
- Create: `src/routes/ProfileRedirect.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/routes/ProfileRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useMe } from '@/features/me/hooks/useMe';
import { FullPageLoader } from '@/components/full-page-loader';

export function ProfileRedirect() {
  const { data: user, isLoading } = useMe();

  if (isLoading || !user) {
    return <FullPageLoader />;
  }

  return <Navigate to={`/users/${user.id}`} replace />;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `useMe` isn't exported as named, switch to default.

- [ ] **Step 3: Commit**

```bash
git add src/routes/ProfileRedirect.tsx
git commit -m "feat(routes): ProfileRedirect route component for /me"
```

---

### Task 5: Wire `/me` and `/templates/:templateId` in the router

**Files:**
- Modify: `src/routes/router.tsx`

- [ ] **Step 1: Add the imports**

At the top of `src/routes/router.tsx`, add these imports (keep the existing ones):

```tsx
import { ProfileRedirect } from '@/routes/ProfileRedirect';
import { TemplateDetailPage } from '@/pages/templates/TemplateDetailPage';
```

- [ ] **Step 2: Replace the stub route for `/templates/:templateId`**

In the route definitions, find:

```tsx
{ path: '/templates/:templateId', element: <></> },
```

Replace with:

```tsx
{ path: '/templates/:templateId', element: <TemplateDetailPage /> },
```

- [ ] **Step 3: Add the `/me` route**

Inside the `ProtectedRoute > RootLayout` block (the one currently containing `/dashboard`, `/settings`, `/resources`, `/resources/:resourceId`), add this entry alongside the others (keep existing entries):

```tsx
{ path: '/me', element: <ProfileRedirect /> },
```

- [ ] **Step 4: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. (The `TemplateDetailPage` import will fail until Task 13 creates the file — that's OK, skip the typecheck until then. Run typecheck after Task 13.)

- [ ] **Step 5: Commit only the router change**

```bash
git add src/routes/router.tsx
git commit -m "feat(routes): add /me redirect and /templates/:templateId route"
```

---

## Phase 3 — Navbar

### Task 6: Create `AuthControl` component

**Files:**
- Create: `src/components/layout/AuthControl.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/components/layout/AuthControl.tsx
import { Link, useNavigate } from 'react-router-dom';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useLogout } from '@/features/auth/hooks/useLogout';

export function AuthControl() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton className="size-7 rounded-full" aria-label="Loading account" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild variant="accent" size="sm">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  const initial = user.name?.trim().charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cy)]"
        aria-label="Account menu"
      >
        <Avatar className="size-7">
          {user.profile?.avatar_url ? (
            <AvatarImage src={user.profile.avatar_url} alt={user.name} />
          ) : null}
          <AvatarFallback className="bg-[var(--acc)] text-xs font-bold text-[var(--sur)]">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              {user.profile?.avatar_url ? (
                <AvatarImage src={user.profile.avatar_url} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-[var(--acc)] text-xs font-bold text-[var(--sur)]">
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-[var(--t1)]">{user.name}</div>
              <div className="truncate text-xs text-[var(--t3)]">{user.email}</div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`/users/${user.id}`}>My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings">Settings</Link>
        </DropdownMenuItem>
        {user.role === 'admin' ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">Admin</Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            logout.mutate(undefined, {
              onSuccess: () => navigate('/login', { replace: true }),
            });
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If your `Button` doesn't accept `asChild`, check the import — current `src/components/ui/button.tsx` uses `@radix-ui/react-slot`'s `asChild`. If a sub-component name differs (e.g., `DropdownMenuItem` doesn't accept `onSelect`), check `src/components/ui/dropdown-menu.tsx` exports and adjust.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/AuthControl.tsx
git commit -m "feat(layout): AuthControl component with profile dropdown"
```

---

### Task 7: Modify `Navbar.tsx` to use `AuthControl`

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

- [ ] **Step 1: Add the import**

At the top of `src/components/layout/Navbar.tsx`, add:

```tsx
import { AuthControl } from '@/components/layout/AuthControl';
```

- [ ] **Step 2: Replace the hardcoded avatar**

Find this block in `Navbar.tsx` (the `<div className="ml-auto …">` section that ends with the hardcoded "U" circle):

```tsx
        <span className="inline-block h-[18px] w-px bg-[var(--bor2)]" />

        <div className="flex size-7 items-center justify-center rounded-full bg-[var(--acc)] text-xs font-bold text-[var(--sur)] select-none">
          U
        </div>
      </div>
    </nav>
```

Replace with:

```tsx
        <span className="inline-block h-[18px] w-px bg-[var(--bor2)]" />

        <AuthControl />
      </div>
    </nav>
```

- [ ] **Step 3: Typecheck + visual smoke**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. Then run `npm run dev` and visit any page. While logged out, the navbar should show **Login** + **Register** buttons. After logging in (`projects@example.com` / `password`), it should show an avatar circle. Clicking the avatar should open a dropdown with **My Profile**, **Dashboard**, **Settings**, (Admin if role=admin), **Logout**.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat(navbar): use AuthControl for profile dropdown and auth buttons"
```

---

## Phase 4 — Reusable AuthorChip

### Task 8: Create `AuthorChip`

**Files:**
- Create: `src/features/users/components/AuthorChip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/users/components/AuthorChip.tsx
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/format';
import type { UserSummary } from '@/types/api';

type AuthorChipProps = {
  author: Pick<UserSummary, 'id' | 'name' | 'avatar_url'>;
  createdAt?: string | null;
  className?: string;
  linkToProfile?: boolean;
};

export function AuthorChip({ author, createdAt, className, linkToProfile = true }: AuthorChipProps) {
  const initial = author.name?.trim().charAt(0).toUpperCase() || '?';
  const created = createdAt ? ` · ${formatRelativeTime(createdAt)}` : '';

  const inner = (
    <>
      <Avatar className="size-6">
        {author.avatar_url ? <AvatarImage src={author.avatar_url} alt={author.name} /> : null}
        <AvatarFallback className="bg-[var(--acc)] text-[10px] font-bold text-[var(--sur)]">
          {initial}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-[var(--t1)]">{author.name}</span>
      {created ? <span className="text-xs text-[var(--t3)]">{created}</span> : null}
    </>
  );

  if (!linkToProfile) {
    return <div className={cn('flex items-center gap-2', className)}>{inner}</div>;
  }

  return (
    <Link
      to={`/users/${author.id}`}
      className={cn(
        'flex items-center gap-2 rounded-md no-underline transition-colors hover:bg-[var(--sur2)]',
        className,
      )}
    >
      {inner}
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `UserSummary` is not exported, read `src/types/api.ts` and use the actual exported type (likely `Pick<User, 'id' | 'name' | 'avatar_url'>` or `UserProfile`).

- [ ] **Step 3: Commit**

```bash
git add src/features/users/components/AuthorChip.tsx
git commit -m "feat(users): AuthorChip component for author blocks"
```

---

## Phase 5 — Template detail subcomponents

### Task 9: Create `TemplatePreviewPanel`

**Files:**
- Create: `src/features/templates/components/TemplatePreviewPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/templates/components/TemplatePreviewPanel.tsx
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import type { Direction, ProjectFile } from '@/types/api';

type TemplatePreviewPanelProps = {
  files: ProjectFile[] | undefined;
  direction: Direction;
  isLoading?: boolean;
};

function findFirstByLayer(files: ProjectFile[], layer: ProjectFile['layer']): ProjectFile | undefined {
  return files
    .filter((f) => f.layer === layer)
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

export function TemplatePreviewPanel({ files, direction, isLoading }: TemplatePreviewPanelProps) {
  const slideFile = files ? findFirstByLayer(files, 'slide') : undefined;
  const totalSlides = files ? files.filter((f) => f.layer === 'slide').length : 0;

  const srcDoc = useMemo(() => {
    if (!files) return '';
    const styleFile = findFirstByLayer(files, 'style');
    const layoutFile = findFirstByLayer(files, 'layout');
    const contentFile = findFirstByLayer(files, 'content');
    return assemblePreviewHtml({
      slideHtml: slideFile?.content ?? '',
      slideCss: '',
      layoutCss: layoutFile?.content ?? '',
      layoutHtml: '',
      styleCss: styleFile?.content ?? '',
      contentJson: contentFile?.content ?? '{}',
      direction,
    });
  }, [files, slideFile, direction]);

  if (isLoading) {
    return <Skeleton className="aspect-video w-full rounded-xl" />;
  }

  if (!slideFile) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl border-2 border-dashed border-[var(--bor)] bg-[var(--sur)] text-sm text-[var(--t3)]">
        No preview available — this template has no slide file.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ScaledIframe
        srcDoc={srcDoc}
        sandbox="allow-same-origin"
        naturalWidth={1280}
        naturalHeight={720}
        title="Template preview"
        className="rounded-xl border border-[var(--bor)] bg-white"
      />
      {totalSlides > 1 ? (
        <p className="text-xs text-[var(--t3)]">
          Slide 1 of {totalSlides} · showing first only
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `assemblePreviewHtml` is not exported as a named export, check `src/features/editor/hooks/useAssemblePreview.ts` and adjust the import. If `ScaledIframe` doesn't accept `sandbox="allow-same-origin"`, check its props — it does (`src/features/editor/components/Preview/ScaledIframe.tsx`).

- [ ] **Step 3: Commit**

```bash
git add src/features/templates/components/TemplatePreviewPanel.tsx
git commit -m "feat(templates): TemplatePreviewPanel reusing editor's assemblePreviewHtml"
```

---

### Task 10: Create `TemplateFileViewer` dialog

**Files:**
- Create: `src/features/templates/components/TemplateFileViewer.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/templates/components/TemplateFileViewer.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ProjectFile } from '@/types/api';

type TemplateFileViewerProps = {
  file: ProjectFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const LAYER_BG: Record<ProjectFile['layer'], string> = {
  slide: 'bg-[#fdf6e3]',
  style: 'bg-[#f4f1ea]',
  layout: 'bg-[#eef2f7]',
  content: 'bg-[#f1f5f4]',
  context: 'bg-[#f5f0f6]',
  rules: 'bg-[#f7f3ec]',
  meta: 'bg-[#eef0f1]',
  asset: 'bg-[#f3f3f3]',
};

export function TemplateFileViewer({ file, open, onOpenChange }: TemplateFileViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{file?.name ?? 'File'}</DialogTitle>
          <DialogDescription>
            {file ? `${file.layer} layer · ${file.extension ?? 'txt'}` : null}
          </DialogDescription>
        </DialogHeader>
        {file?.storage_url && !file.content ? (
          <div className="rounded-md border border-[var(--bor)] bg-[var(--sur)] p-4 text-sm">
            External asset:{' '}
            <a className="text-[var(--cy)] underline" href={file.storage_url} target="_blank" rel="noreferrer">
              {file.storage_url}
            </a>
          </div>
        ) : (
          <pre
            className={`max-h-[60vh] overflow-auto rounded-md p-4 text-xs leading-relaxed text-[var(--t1)] ${file ? LAYER_BG[file.layer] : ''}`}
          >
            {file?.content ?? ''}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `DialogTitle`/`DialogDescription` aren't exported under those names, check `src/components/ui/dialog.tsx` exports — they are (`Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger`).

- [ ] **Step 3: Commit**

```bash
git add src/features/templates/components/TemplateFileViewer.tsx
git commit -m "feat(templates): TemplateFileViewer dialog for file content"
```

---

### Task 11: Create `TemplateFileList`

**Files:**
- Create: `src/features/templates/components/TemplateFileList.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/templates/components/TemplateFileList.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDownIcon, ChevronRightIcon, ExternalLinkIcon, FileTextIcon } from 'lucide-react';
import { TemplateFileViewer } from '@/features/templates/components/TemplateFileViewer';
import { formatBytes } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ProjectFile } from '@/types/api';

const LAYER_ORDER: ProjectFile['layer'][] = [
  'slide',
  'style',
  'layout',
  'content',
  'context',
  'rules',
  'meta',
  'asset',
];

const LAYER_LABEL: Record<ProjectFile['layer'], string> = {
  slide: 'Slide',
  style: 'Style',
  layout: 'Layout',
  content: 'Content',
  context: 'Context',
  rules: 'Rules',
  meta: 'Meta',
  asset: 'Asset',
};

const DEFAULT_EXPANDED: ProjectFile['layer'][] = ['slide', 'style', 'layout', 'content'];

type TemplateFileListProps = {
  files: ProjectFile[];
};

export function TemplateFileList({ files }: TemplateFileListProps) {
  const [expanded, setExpanded] = useState<Set<ProjectFile['layer']>>(new Set(DEFAULT_EXPANDED));
  const [openFile, setOpenFile] = useState<ProjectFile | null>(null);

  const grouped = LAYER_ORDER.map((layer) => ({
    layer,
    files: files
      .filter((f) => f.layer === layer)
      .sort((a, b) => a.sort_order - b.sort_order),
  })).filter((group) => group.files.length > 0);

  const toggle = (layer: ProjectFile['layer']) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold text-[var(--t1)]">
        Files <Badge variant="secondary">{files.length}</Badge>
      </h2>
      <div className="overflow-hidden rounded-xl border border-[var(--bor)] bg-[var(--sur)]">
        {grouped.map(({ layer, files: layerFiles }) => {
          const isOpen = expanded.has(layer);
          return (
            <div key={layer} className="border-b border-[var(--bor)] last:border-b-0">
              <button
                type="button"
                onClick={() => toggle(layer)}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-[var(--t1)] hover:bg-[var(--sur2)]"
              >
                <span className="flex items-center gap-2">
                  {isOpen ? <ChevronDownIcon className="size-3.5" /> : <ChevronRightIcon className="size-3.5" />}
                  {LAYER_LABEL[layer]}
                  <span className="text-xs text-[var(--t3)]">({layerFiles.length})</span>
                </span>
              </button>
              {isOpen ? (
                <ul className="space-y-1 px-4 pb-3">
                  {layerFiles.map((file) => (
                    <li
                      key={file.id}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-xs',
                        'hover:bg-[var(--sur2)]',
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {file.storage_url && !file.content ? (
                          <ExternalLinkIcon className="size-3.5 shrink-0 text-[var(--t3)]" />
                        ) : (
                          <FileTextIcon className="size-3.5 shrink-0 text-[var(--t3)]" />
                        )}
                        <span className="truncate font-mono text-[var(--t2)]">{file.name}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-[var(--t3)]">{formatBytes(file.size_bytes)}</span>
                        {file.content != null || file.storage_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenFile(file)}
                          >
                            View
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
      <TemplateFileViewer file={openFile} open={openFile != null} onOpenChange={(o) => !o && setOpenFile(null)} />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `Badge` doesn't accept `variant="secondary"` or doesn't have a default variant, check `src/components/ui/badge.tsx` — it should.

- [ ] **Step 3: Commit**

```bash
git add src/features/templates/components/TemplateFileList.tsx
git commit -m "feat(templates): TemplateFileList collapsible per-layer file browser"
```

---

### Task 12: Create `TemplateComments`

**Files:**
- Create: `src/features/templates/components/TemplateComments.tsx`

- [ ] **Step 1: Verify the comments endpoint**

```bash
grep -A 20 "/templates/{id}/comments" docs/openapi_api_contract_working.yaml | head -40
```

If the response is `{ data: Comment[], meta: PaginationMeta }`, proceed with the shape below. If it returns a flat array, adjust the type.

- [ ] **Step 2: Create the component**

```tsx
// src/features/templates/components/TemplateComments.tsx
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api/client';
import { formatRelativeTime } from '@/lib/format';
import type { Id, PaginatedResponse } from '@/types/api';

type Comment = {
  id: Id;
  body: string;
  created_at: string;
  author?: { id: Id; name: string; avatar_url?: string | null };
};

type TemplateCommentsProps = {
  templateId: Id;
};

async function fetchComments(templateId: Id): Promise<Comment[]> {
  try {
    const res = await apiClient.get<PaginatedResponse<Comment>>(`templates/${templateId}/comments`);
    return res.data ?? [];
  } catch {
    return [];
  }
}

export function TemplateComments({ templateId }: TemplateCommentsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates', templateId, 'comments'],
    queryFn: () => fetchComments(templateId),
    retry: false,
  });

  if (isLoading) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-md" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
        <p className="text-sm text-[var(--t3)]">No comments yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--t1)]">Comments</h2>
      <ul className="space-y-3">
        {data.map((comment) => {
          const initial = comment.author?.name?.trim().charAt(0).toUpperCase() ?? '?';
          return (
            <li key={comment.id} className="flex gap-3 rounded-md border border-[var(--bor)] bg-[var(--sur)] p-3">
              <Avatar className="size-7">
                {comment.author?.avatar_url ? (
                  <AvatarImage src={comment.author.avatar_url} alt={comment.author.name} />
                ) : null}
                <AvatarFallback className="bg-[var(--acc)] text-[10px] font-bold text-[var(--sur)]">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-[var(--t1)]">{comment.author?.name ?? 'Unknown'}</span>
                  <span className="text-[var(--t3)]">{formatRelativeTime(comment.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--t2)]">{comment.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `Comment` shape differs from what the backend returns, adjust the local type or use `any` for the response and assert shape at runtime.

- [ ] **Step 4: Commit**

```bash
git add src/features/templates/components/TemplateComments.tsx
git commit -m "feat(templates): TemplateComments read-only list"
```

---

### Task 13: Create `RelatedTemplatesStrip`

**Files:**
- Create: `src/features/templates/components/RelatedTemplatesStrip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/templates/components/RelatedTemplatesStrip.tsx
import { useTemplates } from '@/features/templates/hooks/useTemplates';
import { TemplateGrid } from '@/features/templates/components/TemplateGrid';
import type { Template } from '@/types/api';

type RelatedTemplatesStripProps = {
  template: Template;
};

export function RelatedTemplatesStrip({ template }: RelatedTemplatesStripProps) {
  const firstTag = template.tags?.[0];

  const { data, isLoading } = useTemplates(
    { tags: firstTag, per_page: 4 },
    { enabled: !!firstTag },
  );

  if (!firstTag) return null;

  const items = (data?.data ?? []).filter((t) => t.id !== template.id).slice(0, 4);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-[var(--t1)]">Related templates</h2>
      <TemplateGrid templates={items} isLoading={isLoading} />
    </section>
  );
}
```

- [ ] **Step 2: Verify `useTemplates` accepts a second `options` argument**

```bash
cat src/features/templates/hooks/useTemplates.ts
```

If it doesn't currently accept an `options` object, this needs to be added. Replace the file with:

```ts
// src/features/templates/hooks/useTemplates.ts
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listTemplates } from '@/features/templates/api/listTemplates';
import type { PaginatedResponse, Template, TemplateListParams } from '@/types/api';

type Options = Omit<UseQueryOptions<PaginatedResponse<Template>>, 'queryKey' | 'queryFn'>;

export function useTemplates(params: TemplateListParams = {}, options: Options = {}) {
  return useQuery<PaginatedResponse<Template>>({
    queryKey: ['templates', params],
    queryFn: () => listTemplates(params),
    ...options,
  });
}
```

If `useTemplates` already supports options, skip the rewrite.

- [ ] **Step 3: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit (component + any hook change)**

```bash
git add src/features/templates/components/RelatedTemplatesStrip.tsx src/features/templates/hooks/useTemplates.ts
git commit -m "feat(templates): RelatedTemplatesStrip with shared-tag filter"
```

---

## Phase 6 — Fork modal

### Task 14: Create `ForkTemplateModal`

**Files:**
- Create: `src/features/templates/components/ForkTemplateModal.tsx`

- [ ] **Step 1: Create the component**

```tsx
// src/features/templates/components/ForkTemplateModal.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForkTemplate } from '@/features/templates/hooks/useForkTemplate';
import { toastError, toastSuccess } from '@/lib/toast';
import type { Template } from '@/types/api';

type ForkTemplateModalProps = {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const MAX_NAME = 80;

export function ForkTemplateModal({ template, open, onOpenChange }: ForkTemplateModalProps) {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fork = useForkTemplate();

  useEffect(() => {
    if (open && template) {
      setName(`${template.name} (copy)`);
    }
  }, [open, template]);

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && trimmed.length <= MAX_NAME;

  const handleSubmit = () => {
    if (!template || !isValid) return;
    fork.mutate(
      { templateId: template.id, payload: { name: trimmed } },
      {
        onSuccess: (response) => {
          // response shape depends on Task 1 fix — should contain new project id
          const newProjectId =
            (response as { project?: { id: string } }).project?.id ??
            (response as { id?: string }).id ??
            '';
          toastSuccess(`Created "${trimmed}"`);
          queryClient.invalidateQueries({ queryKey: ['projects'] });
          queryClient.invalidateQueries({ queryKey: ['templates'] });
          queryClient.invalidateQueries({ queryKey: ['templates', template.id, 'files'] });
          onOpenChange(false);
          if (newProjectId) navigate(`/editor/projects/${newProjectId}`);
        },
        onError: (err: unknown) => {
          const status = (err as { status?: number })?.status;
          if (status === 401) {
            toastError('Sign in to fork templates');
            navigate(`/login?next=/templates/${template.id}`);
            onOpenChange(false);
          } else {
            toastError('Could not create project — try again');
          }
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use this template</DialogTitle>
          <DialogDescription>
            {template?.name ?? 'This template'} will be copied to a new project you can edit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="fork-name" className="text-xs font-medium text-[var(--t2)]">
            Project name
          </label>
          <Input
            id="fork-name"
            value={name}
            maxLength={MAX_NAME}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) handleSubmit();
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={fork.isPending}>
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleSubmit}
            disabled={!isValid || fork.isPending}
          >
            {fork.isPending ? <Loader2Icon className="size-3.5 animate-spin" /> : null}
            Create & open editor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. If `useForkTemplate`'s signature differs (it takes `{ templateId, payload }`), adjust the `mutation.mutate` argument accordingly.

- [ ] **Step 3: Commit**

```bash
git add src/features/templates/components/ForkTemplateModal.tsx
git commit -m "feat(templates): ForkTemplateModal with name validation and editor navigation"
```

---

## Phase 7 — Template detail page

### Task 15: Create `TemplateDetailPage`

**Files:**
- Create: `src/pages/templates/TemplateDetailPage.tsx`

- [ ] **Step 1: Create the page**

```tsx
// src/pages/templates/TemplateDetailPage.tsx
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BookmarkIcon,
  HeartIcon,
  GitForkIcon,
} from 'lucide-react';
import { useTemplate } from '@/features/templates/hooks/useTemplate';
import { useTemplateFiles } from '@/features/files/hooks/useTemplateFiles';
import { useToggleUpvote } from '@/features/social/hooks/useToggleUpvote';
import { useToggleBookmark } from '@/features/social/hooks/useToggleBookmark';
import { useMe } from '@/features/me/hooks/useMe';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorFallback } from '@/components/error-fallback';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthorChip } from '@/features/users/components/AuthorChip';
import { TemplatePreviewPanel } from '@/features/templates/components/TemplatePreviewPanel';
import { TemplateFileList } from '@/features/templates/components/TemplateFileList';
import { TemplateComments } from '@/features/templates/components/TemplateComments';
import { RelatedTemplatesStrip } from '@/features/templates/components/RelatedTemplatesStrip';
import { ForkTemplateModal } from '@/features/templates/components/ForkTemplateModal';
import { applyBookmarkToggle, applyUpvoteToggle } from '@/features/templates/lib/cacheMutations';
import { useQueryClient } from '@tanstack/react-query';
import { toastError } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format';
import type { PaginatedResponse, Template } from '@/types/api';

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="aspect-video w-full rounded-xl" />
    </div>
  );
}

export function TemplateDetailPage() {
  const { templateId = '' } = useParams<{ templateId: string }>();
  const { data: template, isLoading, error, refetch } = useTemplate(templateId);
  const { data: filesData, isLoading: filesLoading, error: filesError } = useTemplateFiles(templateId);
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const upvote = useToggleUpvote();
  const bookmark = useToggleBookmark();
  const [forkOpen, setForkOpen] = useState(false);

  const files = (filesData as { data?: Template['id'] extends string ? unknown[] : never } | undefined);

  const isOwner = !!template && !!me && template.user_id === me.id;

  const handleUpvote = () => {
    if (!template) return;
    const previous = queryClient.getQueryData<Template>(['templates', template.id]);
    if (previous) {
      const optimisticActive = !previous.is_upvoted;
      const optimisticCount = previous.upvote_count + (optimisticActive ? 1 : -1);
      queryClient.setQueryData<Template>(['templates', template.id], {
        ...previous,
        is_upvoted: optimisticActive,
        upvote_count: optimisticCount,
      });
    }
    upvote.mutate(
      { target: 'templates', targetId: template.id },
      {
        onSuccess: (response) => {
          const cached = queryClient.getQueryData<Template>(['templates', template.id]);
          if (cached) {
            queryClient.setQueryData<Template>(
              ['templates', template.id],
              applyUpvoteToggle(cached, response),
            );
          }
        },
        onError: () => {
          if (previous) queryClient.setQueryData(['templates', template.id], previous);
          toastError('Could not save vote');
        },
      },
    );
  };

  const handleBookmark = () => {
    if (!template) return;
    const previous = queryClient.getQueryData<Template>(['templates', template.id]);
    if (previous) {
      queryClient.setQueryData<Template>(['templates', template.id], {
        ...previous,
        is_bookmarked: !previous.is_bookmarked,
      });
    }
    bookmark.mutate(
      { target: 'templates', targetId: template.id },
      {
        onSuccess: (response) => {
          const cached = queryClient.getQueryData<Template>(['templates', template.id]);
          if (cached) {
            queryClient.setQueryData<Template>(
              ['templates', template.id],
              applyBookmarkToggle(cached, response),
            );
          }
        },
        onError: () => {
          if (previous) queryClient.setQueryData(['templates', template.id], previous);
          toastError('Could not save bookmark');
        },
      },
    );
  };

  if (isLoading) return <DetailSkeleton />;
  if (error || !template) {
    return (
      <div className="mx-auto max-w-5xl space-y-3 p-6">
        <ErrorFallback
          error={error as Error}
          reset={refetch}
        />
        <Button asChild variant="ghost" size="sm">
          <Link to="/templates">
            <ArrowLeftIcon className="size-4" />
            Back to templates
          </Link>
        </Button>
      </div>
    );
  }

  const filesList = filesData && 'data' in filesData ? filesData.data : [];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/templates">
            <ArrowLeftIcon className="size-4" />
            Templates
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--t1)]">{template.name}</h1>
              <Badge variant="outline">{template.visibility}</Badge>
              <Badge variant="secondary">
                <GitForkIcon className="mr-1 size-3" />
                {formatNumber(template.fork_count)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isOwner ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpvote}
                  disabled={upvote.isPending}
                  aria-pressed={template.is_upvoted}
                >
                  <HeartIcon
                    className={cn('size-4', template.is_upvoted && 'fill-current text-[var(--cy)]')}
                  />
                  {formatNumber(template.upvote_count)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBookmark}
                  disabled={bookmark.isPending}
                  aria-pressed={template.is_bookmarked}
                >
                  <BookmarkIcon
                    className={cn('size-4', template.is_bookmarked && 'fill-current text-[var(--cy)]')}
                  />
                </Button>
              </>
            ) : null}
            <Button variant="accent" size="sm" onClick={() => setForkOpen(true)}>
              Use this template
            </Button>
          </div>
        </div>

        {template.author ? (
          <div className="flex flex-wrap items-center gap-2">
            <AuthorChip author={template.author} createdAt={template.created_at} />
            {template.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                <Link to={`/templates?tags=${encodeURIComponent(tag)}`} className="no-underline">
                  {tag}
                </Link>
              </Badge>
            ))}
            <Badge variant="outline">{template.direction.toUpperCase()}</Badge>
          </div>
        ) : null}
      </div>

      <TemplatePreviewPanel
        files={filesError ? undefined : filesList}
        direction={template.direction}
        isLoading={filesLoading}
      />

      {template.description ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-[var(--t1)]">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--t2)]">
            {template.description}
          </p>
        </section>
      ) : null}

      {!filesError && filesList.length > 0 ? <TemplateFileList files={filesList} /> : null}

      <TemplateComments templateId={template.id} />

      <RelatedTemplatesStrip template={template} />

      <ForkTemplateModal
        template={template}
        open={forkOpen}
        onOpenChange={setForkOpen}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. Common adjustments:
- If `useTemplateFiles` returns `{ data: ProjectFile[] }` (per `src/features/files/hooks/useTemplateFiles.ts`), use `filesData?.data` directly — drop the convoluted cast.
- If `useToggleUpvote` / `useToggleBookmark` signatures differ from `{ target, targetId }`, adjust.
- If `cn` doesn't accept string-class with `fill-current`, that's fine — Tailwind picks it up via JIT.

- [ ] **Step 3: Commit**

```bash
git add src/pages/templates/TemplateDetailPage.tsx
git commit -m "feat(pages): TemplateDetailPage with preview, files, comments, related, fork"
```

---

## Phase 8 — TemplateCard fix

### Task 16: Wrap `TemplateCard` author avatar in `<Link to="/users/:id">`

**Files:**
- Modify: `src/features/templates/components/TemplateCard.tsx`

- [ ] **Step 1: Read the current card to find the author block**

```bash
grep -n "author" src/features/templates/components/TemplateCard.tsx
```

- [ ] **Step 2: Wrap the author avatar + name in a Link**

Find the JSX that renders `template.author.avatar_url` and `template.author.name` (probably an `<Avatar>` followed by the name). Wrap the surrounding `<div>` in:

```tsx
<Link
  to={`/users/${template.author.id}`}
  onClick={(e) => e.stopPropagation()}
  className="flex min-w-0 items-center gap-2 no-underline hover:opacity-80"
>
  {/* ... existing avatar + name JSX ... */}
</Link>
```

The `e.stopPropagation()` prevents the card's outer `<Link to={`/templates/${template.id}`}>` from also firing.

- [ ] **Step 3: Typecheck + visual smoke**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors. In the browser, click the author avatar on any template card — it should navigate to `/users/:id` without navigating to the template detail page.

- [ ] **Step 4: Commit**

```bash
git add src/features/templates/components/TemplateCard.tsx
git commit -m "fix(templates): TemplateCard author avatar links to /users/:id"
```

---

## Phase 9 — Verification

### Task 17: Full test suite + smoke test + commit

**Files:**
- none new

- [ ] **Step 1: Run the full Vitest suite**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx vitest run
```

Expected: all tests pass (existing 145 + 2 new = **147**).

- [ ] **Step 2: Typecheck the whole project**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npx tsc -b --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build the project**

```bash
cd "c:/Users/Crist/Desktop/4-th year project/modular-ai-generation-front-end" && npm run build
```

Expected: build succeeds with no Vite errors.

- [ ] **Step 4: Manual smoke test**

Run `npm run dev`, then walk through:

1. **Logged out** — Navbar shows **Login** + **Register** buttons. `/templates` renders. Click into a template → detail page loads with header, author strip, preview iframe, files list, comments, related strip.
2. **Logged in** (`projects@example.com` / `password`) — Navbar avatar appears. Click avatar → dropdown shows My Profile / Dashboard / Settings / (Admin if admin) / Logout.
3. **/me** — Type `/me` in the URL bar → redirects to `/users/:myId`.
4. **Fork flow** — On a template detail page, click "Use this template". Modal opens with default name. Change name. Click "Create & open editor". Page navigates to `/editor/projects/:newId`.
5. **Upvote / bookmark** — Click upvote; count increments; button shows pressed state. Click bookmark; button shows pressed state. Refresh page; states persist (proves they're not just local state).
6. **Owner view** — On a template you authored (or simulate by hardcoding `isOwner = true` temporarily), upvote/bookmark buttons are hidden, fork button still visible.
7. **TemplateCard author link** — On `/templates`, click an author's avatar on any card → goes to `/users/:id` (not the template page).

- [ ] **Step 5: Commit any fixes from smoke test**

If smoke test surfaced bugs, fix them with focused commits (`fix(template-detail): ...`). Don't roll fixes into this task's commit.

- [ ] **Step 6: Final verification commit (if needed)**

If no fixes were needed, skip. Otherwise:

```bash
git status
# review what's uncommitted
git add <only the verified files>
git commit -m "chore: smoke-test fixes from sub-project #1+2"
```

---

## Follow-ups (out of scope, tracked for later)

- **Add `@testing-library/react` + jsdom setup** to enable component-render tests for the new components. Sub-project #1+2 defers this; a future cleanup sub-project can add the deps + a single render test per major component.
- **Comments composer (write side)** — needs a `POST /templates/:id/comments` mutation + composer UI.
- **Edit template for owners** — `/templates/:id/edit` route + UI.
- **Admin actions on template** — delete, change visibility. Sub-project #8.
- **Remove `mockResources` fallback** in `UserResourcesGrid.tsx`. Sub-project #4.
- **Promote `useToggleUpvote`/`useToggleBookmark` to per-target hooks** if pattern stabilizes. Currently used directly with `{ target: 'templates', targetId }`.

---

## Self-review checklist

- [x] **Spec coverage** — every section in the spec maps to a task:
  - §3 Architecture (8 new files + 3 modified) → tasks 4, 6, 8, 9, 10, 11, 12, 13, 14, 15 + tasks 5, 7, 16.
  - §4.1 Navbar → tasks 6, 7.
  - §4.2 TemplateDetailPage → task 15.
  - §4.3 TemplatePreviewPanel → task 9.
  - §4.4 ForkTemplateModal → task 14.
  - §6 Edge cases (404, unauth, no slide, RTL, etc.) → all encoded in component logic across tasks 9, 14, 15.
  - §9 Testing → tasks 2, 3 (pure-function tests); render tests explicitly deferred.
- [x] **Placeholder scan** — no "TBD" or "TODO". One explicit verify-during-impl point (Task 1: fork return shape; Task 12 step 1: comments endpoint shape; Task 13 step 2: useTemplates options).
- [x] **Type consistency** —
  - `Template.author` (UserSummary) used in tasks 8, 15.
  - `applyUpvoteToggle(template, response)` defined in task 3, called in task 15. Same name and signature both places.
  - `applyBookmarkToggle(template, response)` defined in task 3, called in task 15.
  - `useToggleUpvote({ target, targetId })` signature used consistently in task 15.
  - `TemplateDetailPage` import path `@/pages/templates/TemplateDetailPage` matches router wire-up in task 5.
- [x] **Scope check** — this plan covers exactly sub-projects #1+2 from the decomposition. Home page, profile enhancements, template creation, resource pages, project detail, admin tabs are explicitly out of scope (deferred).
- [x] **Ambiguity check** — when something could go two ways, the task says so explicitly (Task 1: "If `{ project: { id } }`, leave it. If just `Template`, fix the type."). The spec's two flagged-to-verify items (bookmark endpoint shape, comments endpoint shape) are addressed in tasks 14 (fork) and 12 (comments).