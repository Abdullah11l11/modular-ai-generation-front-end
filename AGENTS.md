# Codex Rules for MGF Frontend

These rules apply to this repository.

## Read First

Before implementing frontend work, read the relevant docs:

- `docs/PRD.md` for product goals, MVP scope, personas, and feature priorities.
- `docs/openapi_api_contract.yaml` for backend endpoints, request/response shapes, and API tags.
- `docs/FRONTEND_STRUCTURE_GUIDE.md` for the current frontend structure.
- `docs/design.md` for visual direction when building real UI.
- `docs/GIT_WORKFLOW_GUIDE.ar-en.md` for beginner-friendly Git branch and commit conventions.

Arabic docs are maintained at:

- `docs/FRONTEND_STRUCTURE_GUIDE.ar.md`
- `docs/PRD.ar.md`

## Current Project State

This is a React + Vite + TypeScript + Tailwind CSS frontend with app infrastructure in place.

The route paths, providers, config, Axios client, feature API files, feature hooks, and feature types are scaffolded. App-wide shared components (error boundary, loading/empty/error states, 404 page) are built. Visual feature pages and placeholder UI components have intentionally been removed.

Built real features:

- **Auth forms** — LoginForm and RegisterForm with design tokens moved to base components (Input, Button, Card, Field, FieldLabel, FieldDescription, FieldGroup) per `docs/design.md`.
- **Route guards** — `ProtectedRoute` (redirects to `/login` if no token), `AdminRoute` (redirects non-admin users to `/`), and a `useAuth` hook.
- **Toast/notification system** — `sonner` library wired at app root via `AppProviders`. Thin wrapper at `src/lib/toast.ts` (`toastSuccess`, `toastError`, `toastInfo`). Toasts fire on login, register, logout, and settings save.

Do not re-add placeholder screens just to fill routes. Add UI only when implementing a real feature.

## Architecture Rules

Keep the app feature/domain based.

Top-level `src/` areas:

- `app/`: app providers and app-level setup.
- `assets/`: static assets.
- `components/`: shared UI/layout only.
- `config/`: environment and app config.
- `features/`: business domains.
- `hooks/`: shared cross-feature hooks.
- `lib/`: shared infrastructure.
- `pages/`: route-level screens.
- `routes/`: React Router setup.
- `styles/`: global and theme styles.
- `types/`: shared cross-feature types.

Feature folders map to OpenAPI tags and product domains:

- `features/auth`
- `features/me`
- `features/types`
- `features/templates`
- `features/projects`
- `features/files`
- `features/generation`
- `features/export`
- `features/resources`
- `features/social`
- `features/users`
- `features/admin`
- `features/editor`

`features/editor` is for editor orchestration and editor UI only. Keep project, file, generation, and export API calls in their own feature folders.

## Route Rules

Routes are configured in `src/routes/router.tsx`.

The required route paths are:

- `/`
- `/login`
- `/register`
- `/templates`
- `/templates/:templateId`
- `/dashboard`
- `/editor/projects/:projectId`
- `/settings`
- `/resources`
- `/resources/new`
- `/resources/:resourceId`
- `/users/:userId`
- `/admin/*`

Auth routes use `AuthLayout` (public), editor uses `EditorLayout` (protected), most others use `RootLayout`. Routes are guarded:

- `/login`, `/register` — public, no guard.
- `/`, `/templates`, `/templates/:templateId`, `/users/:userId` — `RootLayout`, public.
- `/dashboard`, `/settings`, `/resources/*` — `ProtectedRoute` + `RootLayout`.
- `/editor/projects/:projectId` — `ProtectedRoute` + `EditorLayout`.
- `/admin/*` — `AdminRoute` + `RootLayout` (requires `role === 'admin'`).

Most route elements still render empty fragments (`<></>`). The `*` catch-all route renders `NotFoundPage`. Auth, and `/users/:userId` routes have real pages.

When implementing real UI, create thin route pages in `src/pages` and wire those pages into `src/routes/router.tsx`.

## Page Rules

Pages must stay thin.

Pages may:

- Read route params.
- Compose feature components.
- Pass simple props or IDs.

Pages must not:

- Call Axios or `fetch` directly.
- Own mutation orchestration.
- Contain fake business logic.
- Contain large domain workflows.

## API Rules

Use the single reusable Axios client:

```txt
src/lib/api/client.ts
```

Do not use raw `fetch` for backend API calls.

API functions live inside the owning feature under `api/`.

Split API files by operation, not by grouped service object:

```txt
features/templates/api/listTemplates.ts
features/templates/api/getTemplate.ts
features/templates/api/createTemplate.ts
features/templates/api/updateTemplate.ts
features/templates/api/deleteTemplate.ts
features/templates/api/forkTemplate.ts
```

API function names should start with a verb, for example:

- `listTemplates`
- `getProject`
- `createResource`
- `updateProjectFile`
- `deleteComment`

Use `@/*` for shared or cross-feature imports.

## Hook Rules

Use TanStack Query for server state.

Hooks live inside the owning feature under `hooks/`.

Split hooks by file:

```txt
features/templates/hooks/useTemplates.ts
features/templates/hooks/useTemplate.ts
features/templates/hooks/useCreateTemplate.ts
features/templates/hooks/useUpdateTemplate.ts
features/templates/hooks/useForkTemplate.ts
```

Hooks should call feature API functions. Components should call hooks. Pages should compose components.

## Type Rules

Shared cross-feature API/domain types live in:

```txt
src/types/api.ts
```

Feature-specific request, response, and parameter types live in the owning feature:

```txt
features/auth/types/loginRequest.ts
features/templates/types/templateListParams.ts
features/resources/types/createResourceRequest.ts
```

Keep one type or one closely related request shape per file. Avoid grouped files such as `template.types.ts` unless a generated OpenAPI workflow is introduced.

## shadcn Rules

The shadcn MCP is linked and the `@shadcn` registry is available.

When building UI:

- Use the shadcn MCP to inspect components and examples before adding a shared primitive.
- Add only the shadcn components needed for the current feature.
- Put generated shadcn primitives in `src/components/ui`.
- Put shared layout wrappers and app shells in `src/components/layout`.
- Put feature-specific composition in `src/features/<feature>/components`.
- Do not hand-roll common primitives when shadcn provides a suitable component.
- Do not add placeholder UI just to fill empty routes.

Good first primitives when implementing real screens:

- `button`
- `input`
- `label`
- `textarea`
- `select`
- `dialog`
- `dropdown-menu`
- `tabs`
- `badge`
- `card`
- `table`
- `tooltip`
- `skeleton`
- `form`

## Styling Rules

Use Tailwind CSS for styling.

Global styles:

- `src/index.css`
- `src/styles/theme.css`

Follow `docs/design.md` when building visual UI. The design direction is a professional creator/developer tool, not a marketing-only landing page.

## TypeScript Rules

Keep code strict-friendly.

The project uses:

- `noUnusedLocals`
- `noUnusedParameters`
- `erasableSyntaxOnly`
- `verbatimModuleSyntax`

Use type-only imports where appropriate.

## Verification

After code changes, run:

```bash
npm run build
```

Run lint when changes affect enough code to justify it:

```bash
npm run lint
```

Docs-only changes do not require a build.

## Git Workflow Rules

Follow `docs/GIT_WORKFLOW_GUIDE.ar-en.md` when proposing or creating branches and commits.

Branch names should use a clear prefix:

- `feature/` for new features.
- `bugfix/` for normal development bug fixes.
- `hotfix/` for urgent production fixes.
- `release/` for release preparation.
- `chore/` for tooling or maintenance.
- `docs/` for documentation-only work.

Commit messages should follow Conventional Commits:

```txt
<type>[optional scope]: <description>
```

Common commit types:

- `feat` for new user-facing or product features.
- `fix` for bug fixes.
- `docs` for documentation-only changes.
- `style` for formatting-only changes.
- `refactor` for code restructuring without behavior changes.
- `chore` for tooling, dependency, or maintenance work.
- `test` for test additions or updates.

When proposing a commit, prefer a concise Conventional Commit subject and include a short body only when it clarifies the scope.

## Git Safety

Do not revert unrelated user changes.

Before summarizing work, check:

```bash
git status --short
```

Mention any files left untracked or intentionally unstaged.
