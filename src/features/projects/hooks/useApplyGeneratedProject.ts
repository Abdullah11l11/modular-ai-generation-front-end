/**
 * Commit a parsed AI-generated project to the backend.
 *
 * The "Generate with AI" page holds the AI's output in client-side
 * state and renders the preview live, so the user can see what they
 * got before any data is persisted. When they click "Open in editor"
 * we run this mutation:
 *
 *   1. POST /projects — creates the empty project record.
 *   2. POST /projects/{id}/files — for every file in the AI's JSON
 *      output, write it (parallel via Promise.all). The backend's
 *      `FileLayer` enum decides which files belong to the project
 *      chrome vs. individual slides (see `src/types/api.ts`).
 *   3. Invalidate the dashboard / projects / users queries so the new
 *      project shows up everywhere immediately on return.
 *
 * The caller hands us the parsed `{filename: content}` map plus the
 * metadata it pulled from `_meta` (or sensible defaults if the model
 * didn't emit `_meta`). We never re-read the file map — the apply
 * path is fire-and-forget. If any individual file POST fails, we
 * surface that file's error so the user can retry just that one.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProject } from '@/features/projects/api/createProject';
import { createProjectFile } from '@/features/files/api/createProjectFile';
import type { CreateProjectFileRequest } from '@/features/files/types/createProjectFileRequest';
import type { FileLayer, Id, Project } from '@/types/api';

export type ApplyGeneratedProjectInput = {
  type_id: Id;
  name: string;
  direction?: 'ltr' | 'rtl';
  /** Map keyed by filename (e.g. `style.css`, `slide-01.html`,
   *  `data.json`). `_meta` is dropped — we pull the project name
   *  from it before calling this hook. */
  files: Record<string, string>;
};

export type ApplyGeneratedProjectResult = {
  project: Project;
  /** Number of files that landed successfully on the server. */
  filesApplied: number;
  /** Filenames that failed to apply (for partial-failure UI). */
  filesFailed: string[];
};

/**
 * Resolve a generated filename to a CreateProjectFileRequest payload.
 *
 * The AI emits filenames per `standards/output-schema.md`. We map
 * them onto the backend's `FileLayer` enum:
 *
 *   Project chrome:
 *     `style.css`     → layer=style    (single `:root` token block)
 *     `layout.css`    → layer=layout   (per-class rule set)
 *     `layout.html`   → layer=layout   (page wrapper template, optional)
 *     `data.json`     → layer=content  (project-level data, optional)
 *     `content.json`  → layer=content  (alternate name, optional)
 *     `context.md`    → layer=context  (project brief, optional)
 *     `rules.md`      → layer=rules    (project rules, optional)
 *
 *   Per-slide (sort_order = zero-padded NN):
 *     `slide-NN.html` → layer=slide
 *     `slide-NN.css`  → layer=style
 *     `slide-NN.json` → layer=content
 *
 * Anything else gets dropped to the `meta` layer — the backend still
 * stores it but no editor surface renders it today.
 */
function classifyFile(name: string): CreateProjectFileRequest | null {
  // `_meta` is a JSON object alongside the files in the AI's output
  // — it's metadata, not a project file. Drop it.
  if (name === '_meta') return null;

  const dot = name.lastIndexOf('.');
  if (dot < 1) return null; // no extension, or starts with '.'
  const stem = name.slice(0, dot);
  const extension = name.slice(dot + 1);

  let layer: FileLayer | null = null;
  let sort_order: number | undefined = undefined;

  // Slide stem like `slide-01` — capture the index.
  const slideMatch = stem.match(/^slide-(\d+)$/i);
  if (slideMatch) {
    sort_order = parseInt(slideMatch[1], 10);
    if (extension === 'html') layer = 'slide';
    else if (extension === 'css') layer = 'style';
    else if (extension === 'json') layer = 'content';
  } else {
    switch (name) {
      case 'style.css':
        layer = 'style';
        break;
      case 'layout.css':
      case 'layout.html':
        layer = 'layout';
        break;
      case 'data.json':
      case 'content.json':
        layer = 'content';
        break;
      case 'context.md':
        layer = 'context';
        break;
      case 'rules.md':
        layer = 'rules';
        break;
      default:
        layer = 'meta';
    }
  }

  if (!layer) return null;

  return {
    layer,
    name,
    extension,
    ...(sort_order != null ? { sort_order } : {}),
    content: '', // will be filled in by the caller
  };
}

/**
 * Pull useful metadata out of the AI's `_meta` object so we don't
 * have to keep the JSON in client memory after apply. Currently we
 * only use `name` and `total_slides` (the latter is informational).
 */
export function extractProjectMeta(
  files: Record<string, string>,
): { suggestedName: string | null; totalSlides: number | null } {
  const metaRaw = files['_meta'];
  if (!metaRaw) return { suggestedName: null, totalSlides: null };
  try {
    const meta = JSON.parse(metaRaw) as { project?: unknown; name?: unknown; total_slides?: unknown };
    const suggestedName =
      typeof meta.project === 'string'
        ? meta.project
        : typeof meta.name === 'string'
          ? meta.name
          : null;
    const totalSlides =
      typeof meta.total_slides === 'number' ? meta.total_slides : null;
    return { suggestedName, totalSlides };
  } catch {
    return { suggestedName: null, totalSlides: null };
  }
}

export const useApplyGeneratedProject = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApplyGeneratedProjectResult,
    Error,
    ApplyGeneratedProjectInput
  >({
    mutationFn: async ({ type_id, name, direction = 'ltr', files }) => {
      // 1) Create the project shell.
      const project = await createProject({ type_id, name, direction });

      // 2) Build the per-file payloads. Skip anything we couldn't classify.
      const payloads: Array<{ name: string; payload: CreateProjectFileRequest }> = [];
      for (const [filename, content] of Object.entries(files)) {
        const req = classifyFile(filename);
        if (!req) continue;
        payloads.push({ name: filename, payload: { ...req, content } });
      }

      // 3) Write each file in parallel. Surface individual failures
      //    rather than throwing the whole batch on one bad apple.
      const results = await Promise.allSettled(
        payloads.map(({ payload }) => createProjectFile(project.id, payload)),
      );

      const filesFailed: string[] = [];
      let filesApplied = 0;
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          filesApplied += 1;
        } else {
          filesFailed.push(payloads[i].name);
        }
      });

      return { project, filesApplied, filesFailed };
    },
    onSuccess: () => {
      // Refresh every place that lists projects so the new one shows
      // up immediately when the editor route renders next.
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
