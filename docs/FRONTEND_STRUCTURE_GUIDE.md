# MGF Frontend Structure Guide

This document describes the current frontend structure for the Modular Generation Framework application.

Stack:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Axios
- Laravel API using `docs/openapi_api_contract.yaml`

The frontend is feature/domain based. Route pages stay thin and compose feature components. API calls, hooks, feature components, and feature-local types live inside `src/features`.

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

Responsibilities:

- `app/`: app-level providers and setup.
- `assets/`: static assets.
- `components/`: shared UI and layout components with no feature-specific business logic.
- `config/`: environment and app configuration.
- `features/`: domain modules.
- `hooks/`: shared cross-feature hooks.
- `lib/`: shared infrastructure such as the API client.
- `pages/`: route-level pages only.
- `routes/`: React Router configuration.
- `styles/`: shared theme and Tailwind-adjacent styles.
- `types/`: shared application/API types used by multiple features.

## Current File Tree

```txt
src/
  app/
    providers/
      AppProviders.tsx

  assets/

  components/
    layout/
      AppLayout.tsx
    ui/
      PageHeader.tsx
      PlaceholderPanel.tsx

  config/
    env.ts

  features/
    admin/
      api/
        listAdminResources.ts
        listAdminTemplates.ts
        listAdminUsers.ts
        updateUserRole.ts
      components/
        AdminOverview.tsx
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
      components/
        AuthForm.tsx
      hooks/
        useLogin.ts
        useLogout.ts
        useRegister.ts
      types/
        authResponse.ts
        loginRequest.ts
        registerRequest.ts

    editor/
      components/
        EditorWorkspace.tsx

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
      components/
        SettingsPanel.tsx
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
      components/
        DashboardSummary.tsx
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
      components/
        ResourceDetail.tsx
        ResourceForm.tsx
        ResourceGallery.tsx
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
      components/
        TemplateDetail.tsx
        TemplateGallery.tsx
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
      components/
        UserProfileView.tsx
      hooks/
        useUser.ts
        useUserResources.ts
        useUserTemplates.ts

  lib/
    api/
      client.ts

  pages/
    AdminPage.tsx
    DashboardPage.tsx
    EditorPage.tsx
    HomePage.tsx
    LoginPage.tsx
    NewResourcePage.tsx
    NotFoundPage.tsx
    RegisterPage.tsx
    ResourceDetailPage.tsx
    ResourcesPage.tsx
    SettingsPage.tsx
    TemplateDetailPage.tsx
    TemplatesPage.tsx
    UserProfilePage.tsx

  routes/
    router.tsx

  styles/
    theme.css

  types/
    api.ts
```

## Domain Mapping

| API Tag | Frontend Feature Folder | Responsibility |
| --- | --- | --- |
| Auth | `features/auth` | Register, login, logout, auth token updates |
| Me | `features/me` | Current user profile and AI provider settings |
| Types | `features/types` | Output type catalogue |
| Templates | `features/templates` | Template listing, detail, CRUD, fork |
| Projects | `features/projects` | Dashboard projects and project metadata |
| Files | `features/files` | Project/template files and file mutations |
| Generation | `features/generation` | Full project and file/layer generation jobs |
| Export | `features/export` | Export queueing and export job lookup |
| Resources | `features/resources` | Resource library, detail, CRUD, fork |
| Social | `features/social` | Upvotes, bookmarks, comments |
| Users | `features/users` | Public profile, user templates, user resources |
| Admin | `features/admin` | Admin-only resource, template, and user management |
| Editor | `features/editor` | Editor orchestration and workspace UI only |

## Route Structure

Routes are configured in `src/routes/router.tsx`.

```txt
/                         HomePage
/login                    LoginPage
/register                 RegisterPage
/templates                TemplatesPage
/templates/:templateId    TemplateDetailPage
/dashboard                DashboardPage
/editor/projects/:projectId
/settings                 SettingsPage
/resources                ResourcesPage
/resources/new            NewResourcePage
/resources/:resourceId    ResourceDetailPage
/users/:userId            UserProfilePage
/admin/*                  AdminPage
/*                        NotFoundPage
```

Current routing is minimal. Route guards can be added later around protected, guest, and admin-only routes.

## API Layer Rules

The app uses a single reusable Axios client:

```txt
src/lib/api/client.ts
```

The client is responsible for:

- Reading the base URL from `VITE_API_BASE_URL`.
- Falling back to `http://localhost:8000/api/v1`.
- Attaching `Authorization: Bearer <token>` when a token exists.
- Returning typed response data.
- Normalizing Axios errors into `ApiError`.

Components and pages should never call Axios or `fetch` directly. They should call feature hooks, and feature hooks should call feature API operation functions.

API files are split by operation:

```txt
features/templates/api/listTemplates.ts
features/templates/api/getTemplate.ts
features/templates/api/createTemplate.ts
features/templates/api/updateTemplate.ts
features/templates/api/deleteTemplate.ts
features/templates/api/forkTemplate.ts
```

Example:

```ts
import { apiClient } from '@/lib/api/client'
import type { PaginatedResponse, Template } from '@/types/api'
import type { TemplateListParams } from '../types/templateListParams'

export const listTemplates = (params?: TemplateListParams) =>
  apiClient.get<PaginatedResponse<Template>>('templates', { params })
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

Example:

```ts
import { useQuery } from '@tanstack/react-query'
import { listTemplates } from '../api/listTemplates'
import type { TemplateListParams } from '../types/templateListParams'

export const templatesQueryKey = ['templates']

export const useTemplates = (params?: TemplateListParams) =>
  useQuery({
    queryKey: [...templatesQueryKey, params],
    queryFn: () => listTemplates(params),
  })
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

## Page Rules

Pages must stay thin. A page should:

- Read route params when needed.
- Compose feature components.
- Pass IDs or simple props into feature components.
- Avoid direct API calls.
- Avoid mutation orchestration.
- Avoid fake business logic.

Example:

```tsx
import { TemplateGallery } from '@/features/templates/components/TemplateGallery'

export function TemplatesPage() {
  return <TemplateGallery />
}
```

## Editor Rules

`features/editor` owns editor orchestration and editor UI. It should not own project, file, generation, or export API operations.

Editor dependencies:

- Project metadata comes from `features/projects`.
- Project files come from `features/files`.
- AI generation comes from `features/generation`.
- Export jobs come from `features/export`.

This keeps the editor from becoming a second API layer.

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
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

## Styling

Tailwind CSS is enabled through `@tailwindcss/vite`.

Global style entry:

```txt
src/index.css
```

Theme styles:

```txt
src/styles/theme.css
```

Feature components should use Tailwind utility classes. Shared design primitives belong in `src/components/ui`.

## Current Dependencies

Runtime dependencies currently include:

```txt
@tailwindcss/vite
@tanstack/react-query
axios
react
react-dom
react-router-dom
tailwindcss
```

Future additions can include form and editor-focused libraries when needed:

```txt
react-hook-form
zod
@hookform/resolvers
zustand
lucide-react
clsx
tailwind-merge
@monaco-editor/react
@dnd-kit/core
```

## Remaining TODOs

- Add auth, protected, and admin route guards when auth flow behavior is finalized.
- Replace placeholder feature components with full UI.
- Align any provisional admin endpoints with the final backend contract if needed.
- Add form validation once real form behavior is implemented.
- Add editor state hooks, autosave, preview rendering, and file selection flow when the editor UI is expanded.
