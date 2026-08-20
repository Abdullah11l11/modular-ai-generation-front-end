import { FileText, Folder, Code2 } from 'lucide-react';
import { BUNDLE_ENTRIES, entrySize, type BundleEntry } from '@/features/skill/lib/bundle';

const GROUP_ORDER: BundleEntry['group'][] = ['Reference', 'Prompts', 'Vocabulary', 'Examples'];

const GROUP_DESCRIPTIONS: Record<BundleEntry['group'], string> = {
  Reference: 'How to use this bundle + the roundtrip contract.',
  Prompts: 'Every prompt the MGF backend sends to an AI — system, standards, and task prompts.',
  Vocabulary: 'The actual CSS and base CSS the renderer injects into every preview.',
  Examples: 'Sample `style.css` + `data.json` from real seed bundles.',
};

const GROUP_ICONS: Record<BundleEntry['group'], React.ReactNode> = {
  Reference: <FileText className="size-3.5" />,
  Prompts: <Code2 className="size-3.5" />,
  Vocabulary: <Code2 className="size-3.5" />,
  Examples: <Folder className="size-3.5" />,
};

/**
 * Static preview of every file inside the bundle.
 *
 * Drives from `BUNDLE_ENTRIES` (the single source of truth used by
 * `buildSkillBundle`), so what you see here is exactly what lands in
 * the zip. Size column is computed live from byte length.
 */
export function BundleContentsPreview() {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    entries: BUNDLE_ENTRIES.filter((e) => e.group === group),
  }));

  return (
    <div className="rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
          what&apos;s inside
        </span>
        <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
          {BUNDLE_ENTRIES.length} files
        </span>
      </div>

      <div className="space-y-6">
        {grouped.map(({ group, entries }) => (
          <div key={group}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-(--t2)" aria-hidden>
                {GROUP_ICONS[group]}
              </span>
              <h3 className="font-(--font-mono) text-[11px] tracking-wider text-(--t2) uppercase">
                {group}
              </h3>
              <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
                · {entries.length}
              </span>
            </div>
            <p className="mb-3 text-xs text-(--t3)">{GROUP_DESCRIPTIONS[group]}</p>
            <ul className="space-y-1.5">
              {entries.map((e) => (
                <BundleRow key={e.zipPath} entry={e} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function BundleRow({ entry }: { entry: BundleEntry }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-(--bor2)/30 bg-(--bg) px-3 py-2 text-xs ring-1 ring-(--bor2)/20">
      <div className="min-w-0">
        <div className="truncate font-(--font-mono) text-(--t1)">{entry.zipPath}</div>
        <div className="truncate text-[11px] text-(--t3)">{entry.description}</div>
      </div>
      <div className="shrink-0 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase tabular-nums">
        {entrySize(entry)}
      </div>
    </li>
  );
}