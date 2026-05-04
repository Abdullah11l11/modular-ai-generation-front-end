# MGF Frontend Structure Guide

This document describes the current empty-start frontend baseline for the Modular Generation Framework application.

Stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- shadcn MCP with the `@shadcn` registry for UI primitives
- Laravel API using `docs/openapi_api_contract.yaml`

The project is intentionally ready for development: route paths, providers, config, API client, feature API modules, feature hooks, and feature types are scaffolded, but visual pages and placeholder UI components have been removed.

## Documentation Index

Primary project docs:

| File                               | Purpose                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| `docs/PRD.md`                      | Product goals, personas, MVP scope, and feature priorities |
| `docs/openapi_api_contract.yaml`   | Backend API endpoints, schemas, and tags                   |
| `docs/design.md`                   | Visual direction for real UI implementation                |
| `docs/FRONTEND_STRUCTURE_GUIDE.md` | Current frontend architecture and implementation rules     |
| `docs/GIT_WORKFLOW_GUIDE.ar-en.md` | Beginner guide for Git branches and Conventional Commits   |

Arabic docs:

| File                                  | Purpose                         |
| ------------------------------------- | ------------------------------- |
| `docs/PRD.ar.md`                      | Arabic PRD                      |
| `docs/FRONTEND_STRUCTURE_GUIDE.ar.md` | Arabic frontend structure guide |

## Installed Libraries

Versions are taken from `package.json`.

Runtime dependencies:

| Library                 | Version    | Purpose                                     |
| ----------------------- | ---------- | ------------------------------------------- |
| `react`                 | `^19.2.5`  | React UI runtime                            |
| `react-dom`             | `^19.2.5`  | React DOM renderer                          |
| `react-router-dom`      | `^7.14.2`  | Client-side routing                         |
| `@tanstack/react-query` | `^5.100.9` | Server state and API query/mutation caching |
| `axios`                 | `^1.16.0`  | HTTP client used by `src/lib/api/client.ts` |
| `tailwindcss`           | `^4.2.4`   | Utility CSS framework                       |
| `@tailwindcss/vite`     | `^4.2.4`   | Tailwind integration for Vite               |

Development and tooling dependencies:

| Library                       | Version    | Purpose                                |
| ----------------------------- | ---------- | -------------------------------------- |
| `vite`                        | `^8.0.10`  | Development server and bundler         |
| `typescript`                  | `~6.0.2`   | TypeScript compiler                    |
| `@vitejs/plugin-react`        | `^6.0.1`   | React plugin for Vite                  |
| `eslint`                      | `^10.2.1`  | Linting                                |
| `@eslint/js`                  | `^10.0.1`  | ESLint JavaScript rules                |
| `typescript-eslint`           | `^8.58.2`  | TypeScript linting integration         |
| `eslint-plugin-react-hooks`   | `^7.1.1`   | React Hooks lint rules                 |
| `eslint-plugin-react-refresh` | `^0.5.2`   | React Refresh lint rules               |
| `globals`                     | `^17.5.0`  | Global variable definitions for ESLint |
| `shadcn`                      | `^4.6.0`   | shadcn CLI/tooling for UI primitives   |
| `@types/node`                 | `^24.12.2` | Node.js type declarations              |
| `@types/react`                | `^19.2.14` | React type declarations                |
| `@types/react-dom`            | `^19.2.3`  | React DOM type declarations            |

## Current Top-Level Structure

```txt
src/
  app/
  assets/
  components/
  config/
  features/
  hooks/
  lib/
  pages/
  routes/
  styles/
  types/
  App.tsx
  index.css
  main.tsx
```

Notes:

- `pages/` is currently empty. Add route pages here when real screens are implemented.
- `components/` is currently empty. Add shared layout/UI components here when needed, preferably through shadcn.
- `features/*/components/` placeholder files were removed. Add real feature components when implementing each domain.
- `routes/router.tsx` keeps the required route paths, but every route currently renders an empty fragment.
- The shadcn MCP reports the `@shadcn` registry is available, but no UI components are currently generated.

## Current Implemented Files

```txt
src/
  app/
    providers/
      AppProviders.tsx

  config/
    env.ts

  features/
    admin/
      api/
        listAdminResources.ts
        listAdminTemplates.ts
        listAdminUsers.ts
        updateUserRole.ts
      hooks/
        useAdminResources.ts
        useAdminTemplates.ts
        useAdminUsers.ts
        useUpdateUserRole.ts

    auth/
      api/
        login.ts
        logout.ts
        register.ts
      hooks/
        useLogin.ts
        useLogout.ts
        useRegister.ts
      types/
        authResponse.ts
        loginRequest.ts
        registerRequest.ts

    export/
      api/
        getExportJob.ts
        requestExport.ts
      hooks/
        useExportJob.ts
        useRequestExport.ts
      types/
        exportRequest.ts

    files/
      api/
        createProjectFile.ts
        deleteProjectFile.ts
        listProjectFiles.ts
        listTemplateFiles.ts
        updateProjectFile.ts
      hooks/
        useCreateProjectFile.ts
        useProjectFiles.ts
        useTemplateFiles.ts
        useUpdateProjectFile.ts
      types/
        createFileRequest.ts
        updateFileRequest.ts

    generation/
      api/
        generateFile.ts
        generateProject.ts
        getGenerationJob.ts
        listGenerationJobs.ts
      hooks/
        useGenerateFile.ts
        useGenerateProject.ts
        useGenerationJob.ts
        useGenerationJobs.ts
      types/
        generateFullRequest.ts
        generateLayerRequest.ts

    me/
      api/
        createAiProvider.ts
        deleteAiProvider.ts
        getMe.ts
        listAiProviders.ts
        updateAiProvider.ts
        updateProfile.ts
      hooks/
        useAiProviders.ts
        useCreateAiProvider.ts
        useMe.ts
        useUpdateAiProvider.ts
        useUpdateProfile.ts
      types/
        aiProvider.ts
        updateProfileRequest.ts
        upsertAiProviderRequest.ts

    projects/
      api/
        createProject.ts
        deleteProject.ts
        getProject.ts
        listProjects.ts
        updateProject.ts
      hooks/
        useCreateProject.ts
        useProject.ts
        useProjects.ts
        useUpdateProject.ts
      types/
        createProjectRequest.ts
        projectListParams.ts
        updateProjectRequest.ts

    resources/
      api/
        createResource.ts
        deleteResource.ts
        forkResource.ts
        getResource.ts
        listResourceForks.ts
        listResources.ts
        updateResource.ts
      hooks/
        useCreateResource.ts
        useForkResource.ts
        useResource.ts
        useResources.ts
        useUpdateResource.ts
      types/
        createResourceRequest.ts
        forkResourceRequest.ts
        resourceListParams.ts
        updateResourceRequest.ts

    social/
      api/
        createComment.ts
        deleteComment.ts
        listComments.ts
        toggleBookmark.ts
        toggleUpvote.ts
        updateComment.ts
      hooks/
        useComments.ts
        useCreateComment.ts
        useToggleBookmark.ts
        useToggleUpvote.ts
      types/
        createCommentRequest.ts
        socialTarget.ts

    templates/
      api/
        createTemplate.ts
        deleteTemplate.ts
        forkTemplate.ts
        getTemplate.ts
        listTemplates.ts
        updateTemplate.ts
      hooks/
        useCreateTemplate.ts
        useForkTemplate.ts
        useTemplate.ts
        useTemplates.ts
        useUpdateTemplate.ts
      types/
        createTemplateRequest.ts
        forkTemplateRequest.ts
        templateListParams.ts
        updateTemplateRequest.ts

    types/
      api/
        listTypes.ts
      hooks/
        useTypes.ts

    users/
      api/
        getUser.ts
        getUserResources.ts
        getUserTemplates.ts
      hooks/
        useUser.ts
        useUserResources.ts
        useUserTemplates.ts

  lib/
    api/
      client.ts

  routes/
    router.tsx

  styles/
    theme.css

  types/
    api.ts
```

## Route Baseline

Routes are configured in `src/routes/router.tsx`.

```txt
/                         empty fragment
/login                    empty fragment
/register                 empty fragment
/templates                empty fragment
/templates/:templateId    empty fragment
/dashboard                empty fragment
/editor/projects/:projectId
/settings                 empty fragment
/resources                empty fragment
/resources/new            empty fragment
/resources/:resourceId    empty fragment
/users/:userId            empty fragment
/admin/*                  empty fragment
/*                        empty fragment
```

Current route elements use:

```tsx
<></>
```

This keeps navigation paths available without rendering placeholder UI.

## Domain Mapping

| API Tag    | Frontend Feature Folder | Responsibility                                |
| ---------- | ----------------------- | --------------------------------------------- |
| Auth       | `features/auth`         | Register, login, logout, auth token updates   |
| Me         | `features/me`           | Current user profile and AI provider settings |
| Types      | `features/types`        | Output type catalogue                         |
| Templates  | `features/templates`    | Template API and query hooks                  |
| Projects   | `features/projects`     | Project API and query hooks                   |
| Files      | `features/files`        | Project/template file API and query hooks     |
| Generation | `features/generation`   | Generation API and query hooks                |
| Export     | `features/export`       | Export API and query hooks                    |
| Resources  | `features/resources`    | Resource API and query hooks                  |
| Social     | `features/social`       | Upvote, bookmark, and comment API/hooks       |
| Users      | `features/users`        | Public user API and query hooks               |
| Admin      | `features/admin`        | Admin API and query hooks                     |
| Editor     | `features/editor`       | Reserved for future editor orchestration      |

## API Layer Rules

The app uses one reusable Axios client:

```txt
src/lib/api/client.ts
```

The client is responsible for:

- Reading the base URL from `VITE_API_BASE_URL`.
- Falling back to `http://localhost:8000/api/v1`.
- Attaching `Authorization: Bearer <token>` when a token exists.
- Returning typed response data.
- Normalizing Axios errors into `ApiError`.

Components and pages should not call Axios or `fetch` directly. When UI is added, feature components should use feature hooks, and hooks should call feature API operation functions.

API files are split by operation:

```txt
features/templates/api/listTemplates.ts
features/templates/api/getTemplate.ts
features/templates/api/createTemplate.ts
features/templates/api/updateTemplate.ts
features/templates/api/deleteTemplate.ts
features/templates/api/forkTemplate.ts
```

## Hook Rules

Feature hooks wrap feature API functions with TanStack Query.

Hook files are split by hook:

```txt
features/templates/hooks/useTemplates.ts
features/templates/hooks/useTemplate.ts
features/templates/hooks/useCreateTemplate.ts
features/templates/hooks/useUpdateTemplate.ts
features/templates/hooks/useForkTemplate.ts
```

## Type Rules

Shared API/domain types live in:

```txt
src/types/api.ts
```

Feature-specific request, response, and parameter types live inside the owning feature:

```txt
features/auth/types/loginRequest.ts
features/templates/types/templateListParams.ts
features/resources/types/createResourceRequest.ts
```

Types are split by type or closely related request shape. Avoid large grouped files such as `template.types.ts` unless a future generated OpenAPI workflow requires it.

## Page and Component Rules

The project is currently empty of UI. When adding screens:

- Put route-level files in `src/pages`.
- Keep pages thin.
- Put reusable UI/layout in `src/components`.
- Put shadcn UI primitives in `src/components/ui`.
- Put feature-specific UI in `src/features/<feature>/components`.
- Do not put API calls directly in page files.
- Do not add fake business logic in pages.

## shadcn Rules

Use shadcn as the default source for shared UI primitives when UI development starts.

Rules:

- Use the shadcn MCP to inspect examples and component details before adding a primitive.
- Add only the components needed for the feature being implemented.
- Keep generated shadcn primitives in `src/components/ui`.
- Keep layout wrappers and app shells in `src/components/layout` when they are needed.
- Keep domain-specific composition in `src/features/<feature>/components`.
- Do not recreate common primitives such as buttons, inputs, dialogs, tabs, dropdowns, tables, tooltips, badges, cards, skeletons, and forms by hand when shadcn provides a suitable component.
- Do not add placeholder UI just to fill routes. Routes currently render empty fragments by design.

Recommended first primitives when real screens begin:

```txt
button
input
label
textarea
select
dialog
dropdown-menu
tabs
badge
card
table
tooltip
skeleton
form
```

## Editor Rules

`features/editor` is reserved for editor orchestration and editor UI. It should not own project, file, generation, or export API operations.

Editor dependencies should remain separate:

- Project metadata from `features/projects`.
- Project files from `features/files`.
- AI generation from `features/generation`.
- Export jobs from `features/export`.

## Naming Conventions

- React component files: `PascalCase.tsx`
- Route page files: `PascalCase.tsx`
- Hook files: `useThing.ts`
- API operation files: `verbNoun.ts`
- Type files: `camelCaseTypeName.ts`
- React components: `PascalCase`
- Hooks: `useCamelCase`
- API functions: verb first, for example `listTemplates`, `createProject`, `updateProjectFile`
- Imports should use the `@/*` alias for cross-feature or shared imports.

## Git Workflow

Use `docs/GIT_WORKFLOW_GUIDE.ar-en.md` for the project Git workflow.

Branch names should make the work type clear:

```txt
feature/payment-integration
bugfix/currency-conversion
hotfix/login-outage
release/v1.2.0
docs/git-workflow-guide
chore/update-eslint-config
```

Commit messages should follow Conventional Commits:

```txt
<type>[optional scope]: <description>
```

Examples:

```txt
feat: add dashboard page
fix: handle missing user avatar
docs: add Git workflow guide
chore: update vite config
```

## Path Alias

`@/*` points to `src/*`.

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

`vite.config.ts`:

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

## Remaining TODOs

- Add real page files under `src/pages`.
- Add needed shadcn UI primitives under `src/components/ui`.
- Add shared layout components under `src/components/layout`.
- Add feature UI components under each feature as implementation begins.
- Add auth, protected, and admin route guards when auth behavior is finalized.
- Align provisional admin endpoints with the final backend contract if needed.
- Expand `features/editor` with editor state, autosave, preview rendering, and file selection when editor development starts.
