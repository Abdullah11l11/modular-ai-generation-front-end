/**
 * MGF prompt suite — single source of truth.
 *
 * All prompts live as plain Markdown files under `system/`, `tasks/`,
 * and `standards/`. Vite's `?raw` import loader brings them into
 * JavaScript as strings. This file re-exports them and exposes a
 * `buildSystemPrompt()` helper that concatenates the system base +
 * vocabulary + the requested task prompts into one block for the AI
 * to read.
 *
 * See `README.md` for the layout and the rationale. Backend seeders
 * and other agents can read the same `.md` files directly — there is
 * no build step required to consume them.
 */

import SYSTEM_BASE_MD from './system/base.md?raw';
import VOCABULARY_MD from './system/vocabulary.md?raw';
import FULL_PROJECT_MD from './tasks/full-project.md?raw';
import LAYOUT_MD from './tasks/layout.md?raw';
import CONTENT_MD from './tasks/content.md?raw';
import THEME_MD from './tasks/theme.md?raw';
import COMPONENT_MD from './tasks/component.md?raw';
import REGEN_LAYER_MD from './tasks/regen-layer.md?raw';

/* ------------------------------------------------------------------ */
/* Standards                                                            */
/* ------------------------------------------------------------------ */

export const STANDARDS_OUTPUT_SCHEMA = () => import('./standards/output-schema.md?raw');
export const STANDARDS_CLASSES = () => import('./standards/classes.md?raw');
export const STANDARDS_LAYOUT_RULES = () => import('./standards/layout-rules.md?raw');
export const STANDARDS_TOKENS = () => import('./standards/tokens.md?raw');

/* ------------------------------------------------------------------ */
/* System blocks (always concatenated in front of task prompts)        */
/* ------------------------------------------------------------------ */

export const SYSTEM_BASE_PROMPT = SYSTEM_BASE_MD;
export const SYSTEM_VOCABULARY_PROMPT = VOCABULARY_MD;

/* ------------------------------------------------------------------ */
/* Task prompts                                                        */
/* ------------------------------------------------------------------ */

export const TASK_FULL_PROJECT_PROMPT = FULL_PROJECT_MD;
export const TASK_GENERATE_LAYOUT_PROMPT = LAYOUT_MD;
export const TASK_GENERATE_CONTENT_PROMPT = CONTENT_MD;
export const TASK_GENERATE_THEME_PROMPT = THEME_MD;
export const TASK_GENERATE_COMPONENT_PROMPT = COMPONENT_MD;
export const TASK_REGENERATE_LAYER_PROMPT = REGEN_LAYER_MD;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Concatenate the system base prompt + vocabulary + one or more task
 * prompts into one block the AI can read. Always includes the base
 * and vocabulary so the AI knows the framework and the class
 * contract, regardless of which task it was asked to perform.
 */
export const buildSystemPrompt = (...taskPrompts: string[]): string =>
  [SYSTEM_BASE_PROMPT, SYSTEM_VOCABULARY_PROMPT, ...taskPrompts]
    .filter(Boolean)
    .join('\n\n---\n\n');

/**
 * Build a prompt for a single task. Convenience wrapper around
 * `buildSystemPrompt` that takes a task key.
 */
export type TaskKey =
  | 'full-project'
  | 'layout'
  | 'content'
  | 'theme'
  | 'component'
  | 'regen-layer';

const TASK_BY_KEY: Record<TaskKey, string> = {
  'full-project': TASK_FULL_PROJECT_PROMPT,
  layout: TASK_GENERATE_LAYOUT_PROMPT,
  content: TASK_GENERATE_CONTENT_PROMPT,
  theme: TASK_GENERATE_THEME_PROMPT,
  component: TASK_GENERATE_COMPONENT_PROMPT,
  'regen-layer': TASK_REGENERATE_LAYER_PROMPT,
};

export const buildPromptFor = (task: TaskKey, extra: string[] = []): string =>
  buildSystemPrompt(TASK_BY_KEY[task], ...extra);
