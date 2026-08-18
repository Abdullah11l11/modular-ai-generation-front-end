import JSZip from 'jszip';

import bundleReadme from './bundleContent/README.md?raw';
import bundleValidation from './bundleContent/validation.md?raw';

import promptsReadme from '@/lib/ai/prompts/README.md?raw';
import systemBase from '@/lib/ai/prompts/system/base.md?raw';
import vocabulary from '@/lib/ai/prompts/system/vocabulary.md?raw';

import outputSchema from '@/lib/ai/prompts/standards/output-schema.md?raw';
import classesMd from '@/lib/ai/prompts/standards/classes.md?raw';
import tokensMd from '@/lib/ai/prompts/standards/tokens.md?raw';
import layoutRules from '@/lib/ai/prompts/standards/layout-rules.md?raw';
import mathMd from '@/lib/ai/prompts/standards/math.md?raw';
import websiteMd from '@/lib/ai/prompts/standards/website.md?raw';

import fullProject from '@/lib/ai/prompts/tasks/full-project.md?raw';
import componentMd from '@/lib/ai/prompts/tasks/component.md?raw';
import contentMd from '@/lib/ai/prompts/tasks/content.md?raw';
import themeMd from '@/lib/ai/prompts/tasks/theme.md?raw';
import layoutMd from '@/lib/ai/prompts/tasks/layout.md?raw';
import regenLayer from '@/lib/ai/prompts/tasks/regen-layer.md?raw';
import regenStyle from '@/lib/ai/prompts/tasks/regen-style.md?raw';
import regenStructure from '@/lib/ai/prompts/tasks/regen-structure.md?raw';
import regenContent from '@/lib/ai/prompts/tasks/regen-content.md?raw';

import designSystem from '/docs/design-system.md?raw';

import mgfCss from '@/styles/mgf.css?raw';
import baseCss from '@/features/editor/lib/baseCss.ts?raw';

/**
 * Seed-bundle files (only the curated examples we ship with the bundle).
 *
 * Vite's `import.meta.glob` with `eager: true, query: '?raw'` returns
 * `{ '/absolute/path': '...content...' }` synchronously at build time,
 * so this map is fully resolved before the first render — no fetch,
 * no async I/O at click time.
 */
const SEED_FILES = import.meta.glob(
  '/docs/superpowers/seed-data/**/*.{css,json}',
  { query: '?raw', import: 'default', eager: true },
) as Record<string, string>;

/** Whitelist of seed bundles shipped in the skill pack. */
const ALLOWED_SEED_BUNDLES = new Set([
  'fintech-pitch',
  'saas-marketing',
]);

/**
 * Translate `/docs/superpowers/seed-data/<bundle>/<file>` →
 *   `examples/<bundle>/<file>`
 * for whitelisted bundles only.
 */
function seedPathToBundlePath(absPath: string): string | null {
  const match = absPath.match(
    /^\/docs\/superpowers\/seed-data\/([^/]+)\/(.+)$/,
  );
  if (!match) return null;
  const [, bundleName, rest] = match;
  if (!ALLOWED_SEED_BUNDLES.has(bundleName)) return null;
  return `examples/${bundleName}/${rest}`;
}

/**
 * Single source of truth for the bundle's contents — drives both the
 * zip assembly and the "what's inside" preview rendered on the page.
 *
 * Each entry is `{ zipPath, contents, description, group }`. Sizes
 * are computed at runtime from `contents.length` so the preview stays
 * accurate if the source files change.
 */
export type BundleEntry = {
  zipPath: string;
  contents: string;
  description: string;
  group: 'Reference' | 'Prompts' | 'Vocabulary' | 'Examples';
};

function entry(zipPath: string, contents: string, description: string, group: BundleEntry['group']): BundleEntry {
  return { zipPath, contents, description, group };
}

export const BUNDLE_ENTRIES: BundleEntry[] = [
  // Reference (top-level)
  entry('README.md', bundleReadme, 'How to use this bundle', 'Reference'),
  entry('validation.md', bundleValidation, 'Roundtrip contract for re-upload', 'Reference'),
  entry('docs/design-system.md', designSystem, 'Canonical token + class + contract reference', 'Reference'),

  // Prompts — system
  entry('prompts/README.md', promptsReadme, 'Prompt suite overview', 'Prompts'),
  entry('prompts/system/base.md', systemBase, 'Framework + role + output contract (always emitted)', 'Prompts'),
  entry('prompts/system/vocabulary.md', vocabulary, 'The class contract (always emitted)', 'Prompts'),

  // Prompts — standards
  entry('prompts/standards/output-schema.md', outputSchema, 'JSON shape the AI must return', 'Prompts'),
  entry('prompts/standards/classes.md', classesMd, 'Every `mgf-*` class, purpose, default sizes', 'Prompts'),
  entry('prompts/standards/tokens.md', tokensMd, 'Every `--mgf-*` variable, name, purpose', 'Prompts'),
  entry('prompts/standards/layout-rules.md', layoutRules, 'Overflow / underflow invariants', 'Prompts'),
  entry('prompts/standards/math.md', mathMd, 'Math rendering rules (KaTeX)', 'Prompts'),
  entry('prompts/standards/website.md', websiteMd, 'Website archetype conventions', 'Prompts'),

  // Prompts — tasks
  entry('prompts/tasks/full-project.md', fullProject, 'Generate a complete project from a brief', 'Prompts'),
  entry('prompts/tasks/component.md', componentMd, 'Generate a single component HTML file', 'Prompts'),
  entry('prompts/tasks/content.md', contentMd, 'Generate `data.json`', 'Prompts'),
  entry('prompts/tasks/theme.md', themeMd, 'Generate `style.css` token block', 'Prompts'),
  entry('prompts/tasks/layout.md', layoutMd, 'Generate `layout.css`', 'Prompts'),
  entry('prompts/tasks/regen-layer.md', regenLayer, 'Regenerate one layer of an existing project', 'Prompts'),
  entry('prompts/tasks/regen-style.md', regenStyle, 'Regenerate the style layer', 'Prompts'),
  entry('prompts/tasks/regen-structure.md', regenStructure, 'Regenerate the structure layer', 'Prompts'),
  entry('prompts/tasks/regen-content.md', regenContent, 'Regenerate the content layer', 'Prompts'),

  // Vocabulary — live source files
  entry('vocabulary/mgf.css', mgfCss, 'Live runtime CSS — the actual `mgf-*` rules', 'Vocabulary'),
  entry('vocabulary/baseCss.ts', baseCss, 'BASE_CSS injected into every preview', 'Vocabulary'),

  // Examples — seed bundles
  entry('examples/fintech-pitch/style.css', '', 'Sample style.css for a fintech pitch', 'Examples'),
  entry('examples/fintech-pitch/data.json', '', 'Sample data.json for a fintech pitch', 'Examples'),
  entry('examples/saas-marketing/style.css', '', 'Sample style.css for a SaaS site', 'Examples'),
  entry('examples/saas-marketing/data.json', '', 'Sample data.json for a SaaS site', 'Examples'),
];

/**
 * Build the zip as a Blob. Pure — does not trigger a browser download.
 * Useful for tests and for callers that want to handle the download
 * themselves.
 */
export async function buildSkillBundle(): Promise<Blob> {
  const zip = new JSZip();
  const written = new Set<string>();

  for (const e of BUNDLE_ENTRIES) {
    if (!e.contents) continue; // examples get filled in below
    if (written.has(e.zipPath)) continue;
    zip.file(e.zipPath, e.contents);
    written.add(e.zipPath);
  }

  // Seed files (examples/*).
  for (const [absPath, contents] of Object.entries(SEED_FILES)) {
    const target = seedPathToBundlePath(absPath);
    if (!target) continue;
    if (written.has(target)) continue;
    zip.file(target, contents);
    written.add(target);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

const FILENAME = 'mgf-skill.zip';

/**
 * Build the bundle and trigger a browser save. Safe to call from a
 * user click handler; nothing leaks outside the function.
 */
export async function downloadSkillBundle(): Promise<void> {
  const blob = await buildSkillBundle();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = FILENAME;
  a.rel = 'noopener';
  // Some browsers require the anchor to be in the DOM for .click() to dispatch.
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so Safari has a chance to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Approximate display size for a bundle entry — uses byte length of the content. */
export function entrySize(entry: BundleEntry): string {
  const seedBytes = !entry.contents
    ? Object.entries(SEED_FILES)
        .filter(([p]) => seedPathToBundlePath(p) === entry.zipPath)
        .reduce((sum, [, c]) => sum + c.length, 0)
    : entry.contents.length;
  if (seedBytes < 1024) return `${seedBytes} B`;
  return `${(seedBytes / 1024).toFixed(1)} KB`;
}