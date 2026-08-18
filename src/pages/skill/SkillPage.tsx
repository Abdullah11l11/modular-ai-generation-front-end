import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';
import { DownloadButton } from '@/features/skill/components/DownloadButton';
import { BundleContentsPreview } from '@/features/skill/components/BundleContentsPreview';

/**
 * `/skill` — authenticated page that lets the user download the
 * complete MGF vocabulary + design system + AI prompt suite as a
 * single zip they can hand to another AI agent.
 *
 * Page composition:
 *   1. PageHeader
 *   2. Hero callout + DownloadButton (the only action)
 *   3. "How to use it" — three numbered steps
 *   4. BundleContentsPreview — every file in the zip, before download
 *   5. Roundtrip note — link to validation.md (in-bundle)
 *
 * All copy and chrome mirrors `dashboard/DashboardPage` so the page
 * feels native to the app shell.
 */
export function SkillPage() {
  return (
    <div className="mx-auto max-w-(--container-main) space-y-10 p-6">
      <PageHeader
        title="MGF Skill Bundle"
        subtitle="Hand the full vocabulary + design system + AI prompts to another agent."
      />

      <Reveal>
        <section className="relative overflow-hidden rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-7 shadow-sm ring-1 ring-(--bor2)/50 md:p-10">
          {/* Soft cyan glow behind the hero callout — same recipe as the docs page. */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--cy) opacity-[0.07] blur-3xl"
          />
          <div className="space-y-5">
            <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
              One zip · every contract · any agent
            </p>
            <p className="max-w-2xl text-[clamp(1.25rem,2vw,1.75rem)] leading-tight font-bold tracking-tight text-(--t1)">
              Drop it into another Claude / Cursor / GPT session. Ask
              for a deck, dashboard, or site. Re-upload here and it
              just works.
            </p>
            <p className="max-w-2xl text-sm leading-relaxed text-(--t2) md:text-base">
              The bundle ships the full vocabulary, the design system
              reference, the prompt suite the MGF backend itself uses,
              and curated source files. Every contract in the zip is
              the same contract the site enforces on re-upload.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <DownloadButton />
              <Button asChild variant="ghost" size="lg">
                <Link to="/settings/ai-providers">
                  AI providers
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <p className="pt-1 font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
              built in your browser · nothing leaves this page · auth-gated
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delayMs={80}>
        <section className="space-y-4">
          <div>
            <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
              How to use it
            </p>
            <h2 className="mt-2 text-[clamp(1.5rem,2.5vw,2rem)] leading-tight font-bold tracking-tight text-(--t1)">
              Three steps to a roundtrip.
            </h2>
          </div>

          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="relative rounded-(--radius-card) border border-(--bor2)/40 bg-(--sur) p-5 shadow-sm ring-1 ring-(--bor2)/50 transition-all duration-150 hover:-translate-y-px hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
                    {String(i + 1).padStart(2, '0')} / step
                  </span>
                  <span className="size-1.5 rounded-full bg-(--cy)" />
                </div>
                <h3 className="text-base font-semibold text-(--t1)">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--t2)">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal delayMs={160}>
        <BundleContentsPreview />
      </Reveal>

      <Reveal delayMs={240}>
        <section className="rounded-(--radius-card) border border-(--cy)/40 bg-(--cy-d) p-6 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="size-4 text-(--cy)" />
              <p className="font-(--font-mono) text-[11px] tracking-wider text-(--cy) uppercase">
                Roundtrip contract
              </p>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-(--t1)">
              What the re-upload enforces
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-(--t2)">
              <li>· Bare JSON object — no markdown fences, no preamble.</li>
              <li>· Required keys: <span className="font-(--font-mono) text-(--t1)">style.css</span>, <span className="font-(--font-mono) text-(--t1)">layout.css</span>, <span className="font-(--font-mono) text-(--t1)">data.json</span>, one <span className="font-(--font-mono) text-(--t1)">slide-NN.html</span> per slide, <span className="font-(--font-mono) text-(--t1)">_meta</span>.</li>
              <li>· Only <span className="font-(--font-mono) text-(--t1)">mgf-*</span> classes — no inline styles, no hardcoded colors.</li>
              <li>· Every <span className="font-(--font-mono) text-(--t1)">--mgf-*</span> token present in <span className="font-(--font-mono) text-(--t1)">style.css</span>.</li>
              <li>· <span className="font-(--font-mono) text-(--t1)">_meta.total_slides</span> matches the number of slide keys.</li>
            </ul>
            <p className="font-(--font-mono) text-[10px] tracking-wider text-(--t3) uppercase">
              full contract ships inside the bundle as validation.md
            </p>
          </div>
        </section>
      </Reveal>
    </div>
  );
}

const STEPS = [
  {
    title: 'Hand the bundle to an agent',
    body:
      'Unzip the file, then paste prompts/system/base.md + system/vocabulary.md + the right tasks/*.md into a fresh Claude / Cursor / GPT session. Describe your project.',
  },
  {
    title: 'Ask for the JSON output',
    body:
      'Demand a bare JSON object whose keys are filenames (style.css, layout.css, data.json, slide-NN.html, _meta). No markdown fences, no preamble.',
  },
  {
    title: 'Re-upload to MGF',
    body:
      'Drop the JSON into /projects/new/ai (or split the keys into files and upload via /templates/new). The importer writes each file into a new project and renders it live.',
  },
];