import { SYSTEM_BASE_PROMPT } from './SYSTEM_BASE';

export { SYSTEM_BASE_PROMPT } from './SYSTEM_BASE';
export { TASK_GENERATE_CONTENT_PROMPT } from './TASK_GENERATE_CONTENT';
export { TASK_GENERATE_THEME_PROMPT } from './TASK_GENERATE_THEME';
export { TASK_GENERATE_LAYOUT_PROMPT } from './TASK_GENERATE_LAYOUT';
export { TASK_GENERATE_COMPONENT_PROMPT } from './TASK_GENERATE_COMPONENT';
export { TASK_FULL_PROJECT_PROMPT } from './TASK_FULL_PROJECT';
export { TASK_REGENERATE_LAYER_PROMPT } from './TASK_REGENERATE_LAYER';

/** Concatenate the system-base prompt with one or more task prompts. */
export const buildSystemPrompt = (...taskPrompts: string[]): string =>
  [SYSTEM_BASE_PROMPT, ...taskPrompts].join('\n\n---\n\n');
