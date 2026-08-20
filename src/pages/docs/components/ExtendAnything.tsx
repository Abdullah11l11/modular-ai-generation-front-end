import { Reveal } from '@/components/reveal';

/**
 * Section 5 of `/docs` — "Anything speaks this language."
 *
 * Two side-by-side cards that show how the same layer + token approach
 * composes outputs that aren't traditional slides:
 *   - Video: a timeline strip with keyframes.
 *   - Music: a piano-roll strip of notes in bars.
 *
 * A small footer line below hints that this list is open-ended.
 */
export function ExtendAnything() {
  return (
    <section
      aria-labelledby="docs-extend-heading"
      className="relative border-t border-(--bor2)/40 bg-gradient-to-b from-transparent via-(--sur2)/30 to-transparent py-[30px]"
    >
      <div className="mx-auto max-w-(--container-main) px-(--space-page-x)">
        <Reveal>
          <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
            04 / Anything speaks this language
          </p>
          <h2
            id="docs-extend-heading"
            className="mt-3 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] leading-tight font-bold tracking-tight text-(--t1)"
          >
            Video. Music. Whatever comes next.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--t2)">
            Add an axis to the token contract and the same vocabulary
            composes a different medium. Time for video, beats for
            music, scenes for film. The framework doesn't care what the
            axis is — it just orchestrates layers along it.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal delayMs={80}>
            <VideoCard />
          </Reveal>
          <Reveal delayMs={160}>
            <MusicCard />
          </Reveal>
        </div>

        <Reveal delayMs={240}>
          <p className="mt-10 text-center font-(--font-mono) text-[11px] tracking-wider text-(--t3) uppercase">
            docs · dashboards · sites · video · music ·{' '}
            <span className="text-(--cy)">?</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function VideoCard() {
  return (
    <article className="flex h-full flex-col rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
          time · scale · frames
        </span>
        <span className="size-1.5 rounded-full bg-(--layer-structure)" />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-(--t1)">Video, beat by beat.</h3>

      {/* Timeline strip: 8 frame blocks spaced with --mgf-space-2. */}
      <Timeline />

      <p className="mt-5 text-sm leading-relaxed text-(--t2)">
        Add a <span className="font-(--font-mono) text-(--t1)">time</span>{' '}
        axis to the token contract and the same layer + token approach
        composes a 30 fps storyboard into a final cut.
      </p>
      <div className="mt-auto pt-4 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
        time-scale · keyframes · cuts · export
      </div>
    </article>
  );
}

function Timeline() {
  // 8 frame blocks; the 3rd is the "active" keyframe in --cy.
  return (
    <div className="mt-4 rounded-lg bg-(--bg) p-4 ring-1 ring-(--bor2)/40">
      <div className="flex items-end gap-[var(--mgf-space-2)]" style={{ gap: '8px' }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const heights = [28, 40, 56, 38, 22, 46, 34, 30];
          const active = i === 3;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm transition-colors"
              style={{
                height: `${heights[i]}px`,
                background: active ? 'var(--cy)' : 'var(--bor2)',
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
        <span>00:00</span>
        <span className="text-(--cy)">↑ keyframe</span>
        <span>00:08</span>
      </div>
    </div>
  );
}

function MusicCard() {
  return (
    <article className="flex h-full flex-col rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
          midi · arrangement · bars
        </span>
        <span className="size-1.5 rounded-full bg-(--layer-style)" />
      </div>
      <h3 className="text-lg font-bold tracking-tight text-(--t1)">Music, by bars and notes.</h3>

      <PianoRoll />

      <p className="mt-5 text-sm leading-relaxed text-(--t2)">
        Convert MIDI to events; the framework arranges notes into bars
        the same way it arranges slides into a deck. Tempo, stems, and
        arrangement are just more layers.
      </p>
      <div className="mt-auto pt-4 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
        midi-in · bars · tempo · stems
      </div>
    </article>
  );
}

function PianoRoll() {
  // 6 rows (note pitches), each with a few notes at varying x positions.
  const ROWS = [
    [12, 36, 70],
    [18, 48, 88],
    [8, 28, 58, 82],
    [22, 54],
    [16, 40, 76],
    [4, 32, 60, 92],
  ] as const;

  return (
    <div className="mt-4 rounded-lg bg-(--bg) p-4 ring-1 ring-(--bor2)/40">
      <div className="space-y-[6px]">
        {ROWS.map((row, i) => (
          <div key={i} className="relative h-3 rounded-sm bg-(--sur2)">
            {row.map((pos, j) => (
              <span
                key={j}
                className="absolute top-0 bottom-0 rounded-sm"
                style={{
                  left: `${pos}%`,
                  width: '10%',
                  background:
                    i % 2 === 0 ? 'var(--cy)' : 'var(--mgf-color-accent-2, #fbbf24)',
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
        <span>bar 1</span>
        <span className="text-(--cy)">cyan · beats</span>
        <span className="text-(--mgf-color-accent-2,#fbbf24)">gold · off-beats</span>
      </div>
    </div>
  );
}