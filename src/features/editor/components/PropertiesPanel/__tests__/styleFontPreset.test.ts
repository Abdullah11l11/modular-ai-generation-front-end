import { describe, it, expect } from 'vitest';
import { resolveFontPreset } from '../StyleTab';

/**
 * `resolveFontPreset` lives inside StyleTab.tsx and is not exported
 * from the module barrel. We re-export it from the source file at
 * the bottom (see StyleTab.tsx) specifically so this unit test can
 * exercise it without rendering the full panel. Keep the export
 * internal — the rest of the app shouldn't depend on it.
 */
describe('resolveFontPreset', () => {
  it('matches a fully-quoted font-family stack to the preset', () => {
    expect(resolveFontPreset("'Inter', system-ui, sans-serif")).toBe('Inter');
    expect(resolveFontPreset("'Cairo', 'Noto Sans Arabic', system-ui, sans-serif")).toBe('Cairo');
    expect(resolveFontPreset("'JetBrains Mono', ui-monospace, monospace")).toBe('JetBrains Mono');
  });

  it('matches a bare first-token value', () => {
    // If the stored value is just the name without the stack, we
    // still pick the right preset.
    expect(resolveFontPreset('Inter')).toBe('Inter');
    expect(resolveFontPreset('Cairo')).toBe('Cairo');
  });

  it('matches a bare name wrapped in double quotes', () => {
    // Some stylesheets quote family names with double quotes. The
    // bare-name fallback should still recognise them.
    expect(resolveFontPreset('"DM Sans"')).toBe('DM Sans');
  });

  it('falls back to the first preset when nothing matches', () => {
    // An unrecognised stack (e.g. seeded projects that ship with a
    // font not in our preset list) should still leave the <select>
    // pointing at a real option, otherwise the controlled component
    // renders blank.
    expect(resolveFontPreset("'Some Unknown Font', serif")).toBe('Inter');
    expect(resolveFontPreset('')).toBe('Inter');
  });
});
