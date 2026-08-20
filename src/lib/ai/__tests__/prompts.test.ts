import { describe, expect, it } from 'vitest';
import { SYSTEM_BASE_PROMPT, buildSystemPrompt } from '../prompts';

/**
 * Locks the presence of the preview-before-apply contract in the
 * system base prompt. The chat lane (no task prompt attached) uses
 * these strings to:
 *
 *   1. Detect a slide proposal (`<mgf-slide>...`).
 *   2. Extract a human-readable label for the banner.
 *
 * If a future prompt edit drops or renames these, the chat lane
 * silently degrades — buttons stop appearing. This test fails
 * loudly so a contributor notices in CI instead of in production.
 */
describe('system base prompt', () => {
  it('mentions the preview-before-apply contract', () => {
    expect(SYSTEM_BASE_PROMPT).toMatch(/[Cc]hat [Ll]ane/);
    expect(SYSTEM_BASE_PROMPT).toMatch(/preview-before-apply/);
  });

  it('prescribes the <mgf-slide>...</mgf-slide> outline for chat replies', () => {
    expect(SYSTEM_BASE_PROMPT).toContain('<mgf-slide>');
    expect(SYSTEM_BASE_PROMPT).toContain('</mgf-slide>');
  });

  it('requires a YAML frontmatter with a label', () => {
    expect(SYSTEM_BASE_PROMPT).toMatch(/---\s*\nlabel:/);
  });

  it('keeps the JSON full-project contract for non-chat lanes', () => {
    // The JSON contract must still be present so the full-project
    // task prompt (which is concatenated in front of chat requests
    // when the user picks a task) keeps working.
    expect(SYSTEM_BASE_PROMPT).toMatch(/JSON object/);
  });

  it('buildSystemPrompt concatenates base + vocabulary + tasks', () => {
    const out = buildSystemPrompt('hello task');
    expect(out).toContain('hello task');
    // base + vocabulary markers
    expect(out).toContain('mgf-slide');
    expect(out).toContain('Eight Layers');
  });
});
