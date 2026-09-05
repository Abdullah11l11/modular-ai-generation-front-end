/**
 * /projects/new/ai — the third project creation path.
 *
 * Sits between the dashboard's "New Project" modal and the editor. The
 * user describes what they want, watches the AI stream the full
 * project, inspects a live preview of slide 1, and clicks "Open in
 * editor" to commit everything to the backend. Nothing is written to
 * the database until that final click — Discard is safe to bail on at
 * any point without orphans.
 *
 * Three mental steps the UI surfaces explicitly so the user always
 * knows where they are:
 *
 *   1. Generate — fill the brief, click Generate, watch the stream.
 *   2. Preview  — live iframe of slide 1 + every file the AI emitted.
 *   3. Save     — POST /projects, then POST /projects/{id}/files for
 *                 every emitted file in parallel, then navigate.
 *
 * Both the "Generate" and "Save" steps can be retried without losing
 * the inputs.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  FileCodeIcon,
  FileJsonIcon,
  FileTextIcon,
  Loader2Icon,
  PaletteIcon,
  RefreshCwIcon,
  SparklesIcon,
  SquareIcon,
  StarIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScaledIframe } from '@/features/editor/components/Preview/ScaledIframe';
import { assemblePreviewHtml } from '@/features/editor/hooks/useAssemblePreview';
import { useTypes } from '@/features/types/hooks/useTypes';
import { getOutputTypeInfo } from '@/features/types/types/outputTypeMap';
import { minimaxService } from '@/lib/ai/providers/minimax';
import {
  buildPromptFor,
  STANDARDS_CLASSES,
  STANDARDS_LAYOUT_RULES,
  STANDARDS_OUTPUT_SCHEMA,
  STANDARDS_TOKENS,
} from '@/lib/ai/prompts';
import { parseFullProjectJson } from '@/lib/ai/responseParsers';
import {
  extractProjectMeta,
  useApplyGeneratedProject,
} from '@/features/projects/hooks/useApplyGeneratedProject';

const PREFERRED_PROVIDER_KEY = 'mgf.ai.preferredProviderId';
const readPreferredProviderId = (): string | null =>
  typeof window === 'undefined'
    ? null
    : window.localStorage.getItem(PREFERRED_PROVIDER_KEY);

/** State machine — drives both the step indicator and the body. */
type Step = 'input' | 'streaming' | 'preview' | 'saving';

const STEPS: { key: Step; label: string; hint: string }[] = [
  { key: 'input', label: 'Brief', hint: 'Describe what you want' },
  { key: 'streaming', label: 'Generate', hint: 'AI drafts the project' },
  { key: 'preview', label: 'Preview', hint: 'Review the result' },
  { key: 'saving', label: 'Save', hint: 'Open in editor' },
];

const STEP_ORDER: Step[] = ['input', 'streaming', 'preview', 'saving'];
const indexOfStep = (s: Step): number => STEP_ORDER.indexOf(s);

type ThemeKey = 'dark' | 'light' | 'warm' | 'custom';

type ThemePreset = {
  key: ThemeKey;
  label: string;
  /** CSS color shown as a swatch dot in the picker. */
  swatch: string;
  /** Prompt snippet appended to the system prompt — gives the AI
   *  explicit `:root` overrides for the chosen look. */
  prompt: string;
};

/**
 * Three pre-baked color presets. Each emits a `:root` block that the
 * AI is asked to splice into its generated `style.css` verbatim —
 * every other `--mgf-*` token stays at its default per `tokens.md`.
 */
const THEME_PRESETS: Record<ThemeKey, ThemePreset> = {
  dark: {
    key: 'dark',
    label: 'Dark',
    swatch: '#0a0a0a',
    prompt: [
      '<theme-preset name="dark">',
      'Use these exact `:root` token overrides in the emitted `style.css`. Keep all other `--mgf-*` variables from `tokens.md` at their defaults.',
      ':root {',
      '  --mgf-color-bg: #0a0a0a;',
      '  --mgf-color-surface: #18181b;',
      '  --mgf-color-text-primary: #ffffff;',
      '  --mgf-color-text-secondary: #a1a1aa;',
      '  --mgf-color-text-inverse: #0a0a0a;',
      '  --mgf-color-accent: #22d3ee;',
      '  --mgf-color-accent-text: #0a0a0a;',
      '  --mgf-color-border: #27272a;',
      '}',
      '</theme-preset>',
    ].join('\n'),
  },
  light: {
    key: 'light',
    label: 'Light',
    swatch: '#ffffff',
    prompt: [
      '<theme-preset name="light">',
      'Use these exact `:root` token overrides in the emitted `style.css`. Keep all other `--mgf-*` variables from `tokens.md` at their defaults.',
      ':root {',
      '  --mgf-color-bg: #ffffff;',
      '  --mgf-color-surface: #f4f4f5;',
      '  --mgf-color-text-primary: #18181b;',
      '  --mgf-color-text-secondary: #52525b;',
      '  --mgf-color-text-inverse: #ffffff;',
      '  --mgf-color-accent: #6366f1;',
      '  --mgf-color-accent-text: #ffffff;',
      '  --mgf-color-border: #e4e4e7;',
      '}',
      '</theme-preset>',
    ].join('\n'),
  },
  warm: {
    key: 'warm',
    label: 'Warm',
    swatch: '#fb923c',
    prompt: [
      '<theme-preset name="warm">',
      'Use these exact `:root` token overrides in the emitted `style.css`. Keep all other `--mgf-*` variables from `tokens.md` at their defaults.',
      ':root {',
      '  --mgf-color-bg: #1c1917;',
      '  --mgf-color-surface: #292524;',
      '  --mgf-color-text-primary: #fafaf9;',
      '  --mgf-color-text-secondary: #a8a29e;',
      '  --mgf-color-text-inverse: #1c1917;',
      '  --mgf-color-accent: #fb923c;',
      '  --mgf-color-accent-text: #1c1917;',
      '  --mgf-color-border: #44403c;',
      '}',
      '</theme-preset>',
    ].join('\n'),
  },
  // The `custom` preset has no fixed swatch or prompt — the prompt is
  // built at submit time from the user's prose description in
  // `customThemePrompt`. The empty strings here let the preset row
  // reuse the same button shape without conditional rendering
  // everywhere it's referenced.
  custom: {
    key: 'custom',
    label: 'Custom',
    swatch: '',
    prompt: '',
  },
};

/**
 * Placeholder shown inside the custom-theme textarea. Example-only —
 * picking "Custom" leaves the box empty so the user types their own
 * theme description. The model receives this same shape (see
 * `buildCustomThemePrompt`).
 */
const CUSTOM_THEME_PLACEHOLDER =
  'A calm, misty morning palette: deep slate background, warm cream text, sage accent that reads as natural and unforced. Generous whitespace, soft borders, never neon.';

/**
 * Wrap the user's natural-language theme description in the same
 * `<theme-preset>` envelope the `THEME_PRESETS` use. The directive
 * tells the AI to translate the prose into a `:root { --mgf-color-* }`
 * block using only the variables defined in `tokens.md`, instead of
 * expecting the user to hand-write the CSS themselves.
 */
function buildCustomThemePrompt(description: string): string {
  return [
    '<theme-preset name="custom">',
    'The user described the theme in plain English. Translate their description into a `:root { --mgf-color-* }` block using ONLY the variables defined in `tokens.md` (do not invent new variable names). Pick concrete hex values that capture the intent — dark/bright/warm/cool should be unambiguous. Emit that `:root` block as part of the emitted `style.css`. Keep every other `--mgf-*` variable at its `tokens.md` default.',
    '<user-theme-description>',
    description.trim(),
    '</user-theme-description>',
    '</theme-preset>',
  ].join('\n');
}

const THEME_KEYS: ThemeKey[] = ['dark', 'light', 'warm', 'custom'];

const parseTheme = (raw: string | null): ThemeKey => {
  if (raw === 'light' || raw === 'warm' || raw === 'custom') return raw;
  return 'dark';
};

const parseCount = (raw: string | null): number => {
  const n = Number(raw ?? '5');
  if (!Number.isFinite(n)) return 5;
  return Math.max(3, Math.min(20, Math.round(n)));
};

/** Human label + small icon hint for a file extension. */
function fileBadge(name: string): { icon: typeof FileTextIcon; tone: string } {
  if (name === '_meta') return { icon: StarIcon, tone: 'text-amber-500' };
  if (name.endsWith('.css')) return { icon: FileCodeIcon, tone: 'text-cyan-500' };
  if (name.endsWith('.json')) return { icon: FileJsonIcon, tone: 'text-amber-600' };
  if (name.endsWith('.html')) return { icon: FileTextIcon, tone: 'text-orange-500' };
  return { icon: FileTextIcon, tone: 'text-zinc-500' };
}

/** Pretty-print a byte count. */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AIGenerateProjectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ----- Inputs (initialized from URL search params when present so
  //       future flows can deep-link straight into a pre-filled brief). -----
  const [prompt, setPrompt] = useState(searchParams.get('prompt') ?? '');
  const initialTypeId = searchParams.get('type') ?? '';
  const [typeId, setTypeId] = useState<string>(initialTypeId);
  const [theme, setTheme] = useState<ThemeKey>(parseTheme(searchParams.get('theme')));
  const [customThemePrompt, setCustomThemePrompt] = useState<string>(searchParams.get('customThemePrompt') ?? '');
  const [slideCount, setSlideCount] = useState<number>(parseCount(searchParams.get('count')));

  // ----- Generation / parse state -----
  const [step, setStep] = useState<Step>('input');
  const [streamText, setStreamText] = useState('');
  const [parsedFiles, setParsedFiles] = useState<Record<string, string> | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [parseHadFences, setParseHadFences] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStream, setShowStream] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const typesQuery = useTypes();
  const types = typesQuery.data ?? [];

  const applyMutation = useApplyGeneratedProject();

  // ----- Computed -----
  const slideFiles = useMemo(() => {
    if (!parsedFiles) return [];
    return Object.keys(parsedFiles)
      .filter((k) => /^slide-\d+\.html$/.test(k))
      .sort();
  }, [parsedFiles]);

  const fileList = useMemo(() => {
    if (!parsedFiles) return [];
    return Object.entries(parsedFiles).sort(([a], [b]) => {
      // Order: chrome files first (style, layout, content), then slides,
      // then everything else. _meta goes last.
      const rank = (k: string): number => {
        if (k === 'style.css') return 0;
        if (k === 'layout.css' || k === 'layout.html') return 1;
        if (k === 'data.json' || k === 'content.json') return 2;
        if (/^slide-\d+\.css$/.test(k)) return 3;
        if (/^slide-\d+\.html$/.test(k)) return 4;
        if (/^slide-\d+\.json$/.test(k)) return 5;
        if (k === 'context.md' || k === 'rules.md') return 6;
        if (k === '_meta') return 99;
        return 50;
      };
      return rank(a) - rank(b);
    });
  }, [parsedFiles]);

  const previewSrcDoc = useMemo(() => {
    if (!parsedFiles) return '';
    const slide01 = parsedFiles['slide-01.html'] ?? '';
    const slide01Css = parsedFiles['slide-01.css'] ?? '';
    return assemblePreviewHtml({
      slideHtml: slide01,
      slideCss: slide01Css,
      layoutCss: parsedFiles['layout.css'] ?? '',
      layoutHtml: parsedFiles['layout.html'] ?? '',
      styleCss: parsedFiles['style.css'] ?? '',
      contentJson:
        parsedFiles['data.json'] ??
        parsedFiles['content.json'] ??
        null,
      direction: 'ltr',
    });
  }, [parsedFiles]);

  const archetypeName = useMemo(
    () => (typesQuery.data ?? []).find((t) => t.id === typeId)?.name ?? 'presentation',
    [typesQuery.data, typeId],
  );

  // Single-page archetypes (e.g. poster) always produce exactly one
  // slide — fixed at 1 and the slide count input is hidden.
  const isSingleType = getOutputTypeInfo(archetypeName).archetype === 'single';
  const effectiveSlideCount = isSingleType ? 1 : slideCount;

  // ----- Handlers -----

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    // Custom theme needs the user's prose description before we even
    // hit the AI — without it the model has nothing to translate.
    if (theme === 'custom' && !customThemePrompt.trim()) {
      setError('Custom theme is empty — describe the look you want before generating.');
      return;
    }

    const providerId = readPreferredProviderId();
    if (!providerId) {
      setError(
        'No AI provider selected. Open Settings → AI Providers to add one before generating.',
      );
      return;
    }

    setError(null);
    setStreamText('');
    setParsedFiles(null);
    setParseWarnings([]);
    setParseHadFences(false);
    setShowStream(true);
    setStep('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    // Load the four standards files the AI needs to follow the
    // output contract correctly. They're bundled as Vite ?raw
    // imports; the helpers in `prompts/index.ts` return Promises.
    let extras: string[];
    try {
      const [schema, classes, tokens, layoutRules] = await Promise.all([
        (await STANDARDS_OUTPUT_SCHEMA()).default,
        (await STANDARDS_CLASSES()).default,
        (await STANDARDS_TOKENS()).default,
        (await STANDARDS_LAYOUT_RULES()).default,
      ]);
      const themeBlock =
        theme === 'custom'
          ? buildCustomThemePrompt(customThemePrompt)
          : THEME_PRESETS[theme].prompt;
      extras = [schema, classes, tokens, layoutRules, themeBlock];
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to load AI prompt resources: ${err.message}`
          : 'Failed to load AI prompt resources.',
      );
      setStep('input');
      return;
    }

    const system = buildPromptFor('full-project', extras);

    const themeTag =
      theme === 'custom'
        ? 'Custom (user-supplied `:root` block)'
        : THEME_PRESETS[theme].label;
    const userMessage = [
      `<project-brief>`,
      prompt.trim(),
      `</project-brief>`,
      ``,
      `<theme>${themeTag}</theme>`,
      `<archetype>${archetypeName}</archetype>`,
      `<output_target>${archetypeName}</output_target>`,
      `<target_slide_count>${effectiveSlideCount}</target_slide_count>`,
      ``,
      `Respond with a single JSON object matching standards/output-schema.md.`,
      `No markdown fences. No preamble. No postamble.`,
    ].join('\n');

    let assistant = '';
    await minimaxService.streamChat(
      {
        model: 'MiniMax-M3',
        system,
        messages: [{ role: 'user', content: userMessage }],
        providerId,
        signal: controller.signal,
        // Full project output is much larger than the editor's
        // single-file regeneration tasks (style.css + layout.css + every
        // slide-NN.html + data.json + _meta). The minimax provider
        // defaults to 4096 — that's enough for one file but cuts this
        // task off mid-JSON, so parseFullProjectJson fails with
        // "not parseable as a JSON object". The backend
        // (`AiChatController.php`) caps `max_tokens` at 16384 — we use
        // that ceiling to fit a 5–10 slide deck in one reply.
        maxTokens: 16384,
      },
      {
        onDelta: (text) => {
          assistant += text;
          setStreamText(assistant);
        },
        onDone: () => {
          abortRef.current = null;
          const result = parseFullProjectJson(assistant);
          if (!result.ok) {
            setError(result.error);
            setStep('input');
            return;
          }
          if (result.files['style.css'] == null && slideFiles.length === 0) {
            setError(
              'The AI response did not include any slide HTML. Try regenerating with a more specific prompt, or use a larger model.',
            );
            setStep('input');
            return;
          }
          setParsedFiles(result.files);
          setParseWarnings(result.warnings);
          setParseHadFences(result.hadFences);
          setStep('preview');
          // Collapse the raw stream once we have parsed output — the
          // user can still expand it from the toolbar if curious.
          setShowStream(false);
        },
        onError: (err) => {
          abortRef.current = null;
          setError(err instanceof Error ? err.message : String(err));
          setStep('input');
        },
      },
    );
  }, [prompt, theme, customThemePrompt, archetypeName, effectiveSlideCount, slideFiles.length]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStep('input');
    setError('Generation stopped.');
  }, []);

  const handleStartOver = useCallback(() => {
    setError(null);
    setStreamText('');
    setParsedFiles(null);
    setParseWarnings([]);
    setParseHadFences(false);
    setStep('input');
  }, []);

  const handleDiscard = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    navigate('/dashboard');
  }, [navigate]);

  const handleSave = useCallback(async () => {
    if (!parsedFiles) return;
    if (!typeId) {
      setError('Pick an archetype before saving the project.');
      return;
    }
    setError(null);
    setStep('saving');

    const { suggestedName } = extractProjectMeta(parsedFiles);
    // Fall back to the first ~6 words of the prompt when the AI didn't
    // include a `_meta.name`. Trim trailing punctuation.
    const fallbackName =
      prompt
        .trim()
        .split(/\s+/)
        .slice(0, 6)
        .join(' ')
        .replace(/[.,!?;:]+$/, '') || 'Untitled AI Project';
    const name = suggestedName ?? fallbackName;

    try {
      const result = await applyMutation.mutateAsync({
        type_id: typeId,
        name,
        files: parsedFiles,
      });
      if (result.filesFailed.length > 0) {
        toast.warning(
          `Project created — ${result.filesApplied} of ${result.filesApplied + result.filesFailed.length} files saved. Check the editor for missing files.`,
        );
      } else {
        toast.success(`Created "${name}". Opening in editor…`);
      }
      navigate(`/editor/projects/${result.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStep('preview');
    }
  }, [applyMutation, navigate, parsedFiles, prompt, typeId]);

  // ----- Render -----

  const currentStepIdx = indexOfStep(step);
  const isLocked = step === 'streaming' || step === 'saving';

  return (
    <div>
      <PageHeader
        title="Generate with AI"
        subtitle="Describe your project — the AI drafts the full deck, you review, then save to the database."
        actions={
          <Button
            asChild
            variant="ghost"
            size="sm"
          >
            <Link to="/dashboard">
              <ArrowLeftIcon className="size-3.5" />
              Back to dashboard
            </Link>
          </Button>
        }
      />

      {/* ----- Inputs ----- */}
      <div className="rounded-lg border border-(--bor2) bg-(--sur1) p-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ai-gen-prompt">Prompt</Label>
            <Textarea
              id="ai-gen-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Series A pitch for an AI analytics platform. Five slides, dark theme, neon cyan accent. Cover → problem → solution → proof → ask."
              className="min-h-24 font-mono text-xs"
              disabled={isLocked}
              data-testid="ai-gen-prompt"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-gen-archetype">Archetype</Label>
              <Select
                value={typeId}
                onValueChange={setTypeId}
                disabled={isLocked || typesQuery.isLoading}
              >
                <SelectTrigger id="ai-gen-archetype" className="h-8">
                  <SelectValue
                    placeholder={typesQuery.isLoading ? 'Loading…' : 'Pick a type'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {types.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isSingleType ? (
              <div className="flex flex-col gap-1">
                <Label htmlFor="ai-gen-count">Slide count</Label>
                <Input
                  id="ai-gen-count"
                  type="number"
                  min={3}
                  max={20}
                  value={slideCount}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (Number.isFinite(n)) {
                      setSlideCount(Math.max(3, Math.min(20, Math.round(n))));
                    }
                  }}
                  className="h-8 font-mono"
                  disabled={isLocked}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <Label>Slide count</Label>
                <div className="flex h-8 items-center rounded-md border border-(--bor2) bg-(--bg) px-2.5 text-xs text-(--t3)">
                  Single page — fixed at 1
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          <Label>Theme preset</Label>
          <div className="flex flex-wrap gap-2">
            {THEME_KEYS.map((key) => {
              const preset = THEME_PRESETS[key];
              const active = theme === key;
              const isCustom = key === 'custom';
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => !isLocked && setTheme(key)}
                  disabled={isLocked}
                  className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs transition ${
                    active
                      ? 'border-(--cy) bg-(--cy)/10 text-(--t1)'
                      : 'border-(--bor2) bg-(--sur) text-(--t2) hover:border-(--cy)/50 hover:text-(--t1)'
                  } ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                  data-testid={`ai-gen-theme-${key}`}
                >
                  {isCustom ? (
                    <PaletteIcon className="size-3.5 text-(--t3)" aria-hidden />
                  ) : (
                    <span
                      className="inline-block size-3.5 rounded-full border border-(--bor2)"
                      style={{ backgroundColor: preset.swatch }}
                      aria-hidden
                    />
                  )}
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {theme === 'custom' ? (
          <div className="mt-3 flex flex-col gap-1">
            <Label htmlFor="ai-gen-custom-theme">Custom theme prompt</Label>
            <Textarea
              id="ai-gen-custom-theme"
              value={customThemePrompt}
              onChange={(e) => setCustomThemePrompt(e.target.value)}
              placeholder={CUSTOM_THEME_PLACEHOLDER}
              className="min-h-24 text-xs"
              disabled={isLocked}
              data-testid="ai-gen-custom-theme"
            />
            <p className="text-[10px] text-(--t3)">
              Describe the look you want — mood, palette, contrast, spacing. The AI translates it into the project's <span className="font-mono">style.css</span>.
            </p>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          {step === 'streaming' ? (
            <Button type="button" variant="destructive" size="sm" onClick={handleStop}>
              <SquareIcon className="size-3.5" />
              Stop generating
            </Button>
          ) : step === 'preview' || step === 'saving' ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartOver}
                disabled={step === 'saving'}
                data-testid="ai-gen-start-over"
              >
                <RefreshCwIcon className="size-3.5" />
                Start over
              </Button>
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={handleSave}
                disabled={step === 'saving' || !typeId}
                data-testid="ai-gen-save"
              >
                {step === 'saving' ? (
                  <>
                    <Loader2Icon className="size-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <SparklesIcon className="size-3.5" />
                    Open in editor
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleGenerate}
              disabled={!prompt.trim() || !typeId}
              data-testid="ai-gen-generate"
            >
              <SparklesIcon className="size-3.5" />
              Generate
            </Button>
          )}
        </div>
      </div>

      {/* ----- Step indicator ----- */}
      <ol
        className="mt-6 flex items-center gap-2"
        data-testid="ai-gen-step-indicator"
        data-current-step={step}
      >
        {STEPS.map((s, i) => {
          const isCurrent = s.key === step;
          const isDone = indexOfStep(s.key) < currentStepIdx;
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2">
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  isCurrent
                    ? 'border-(--cy) bg-(--cy) text-white'
                    : isDone
                      ? 'border-(--cy)/40 bg-(--cy)/15 text-(--cy)'
                      : 'border-(--bor2) bg-(--sur) text-(--t3)'
                }`}
              >
                {isDone ? <CheckCircle2Icon className="size-3.5" /> : i + 1}
              </div>
              <div className="flex min-w-0 flex-col">
                <span
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-(--t1)' : isDone ? 'text-(--t2)' : 'text-(--t3)'
                  }`}
                >
                  {s.label}
                </span>
                <span className="truncate text-[10px] text-(--t3)">{s.hint}</span>
              </div>
              {i < STEPS.length - 1 ? (
                <div
                  className={`mx-1 h-px flex-1 ${
                    isDone ? 'bg-(--cy)/40' : 'bg-(--bor2)'
                  }`}
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* ----- Error banner ----- */}
      {error ? (
        <Alert
          variant="destructive"
          className="mt-4"
          data-testid="ai-gen-error"
        >
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* ----- Step body ----- */}
      <section className="mt-4 min-h-72 rounded-lg border border-(--bor2) bg-(--sur1) p-4">
        {step === 'input' ? (
          <EmptyHintCard />
        ) : null}

        {step === 'streaming' ? (
          <StreamingBody text={streamText} />
        ) : null}

        {step === 'preview' && parsedFiles ? (
          <PreviewBody
            srcDoc={previewSrcDoc}
            files={fileList}
            slideCount={slideFiles.length}
            warnings={parseWarnings}
            hadFences={parseHadFences}
            showStream={showStream}
            streamText={streamText}
            onToggleStream={() => setShowStream((v) => !v)}
          />
        ) : null}

        {step === 'saving' ? (
          <SavingBody />
        ) : null}
      </section>

      {/* ----- Action bar (always-visible discard + step-specific action) ----- */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleDiscard}
          disabled={step === 'saving'}
          data-testid="ai-gen-discard"
        >
          Discard
        </Button>
        {step === 'preview' && slideFiles.length > 1 ? (
          <p className="text-[11px] text-(--t3)">
            Slide 1 of {slideFiles.length} · previewing first only — open in editor to see all slides
          </p>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EmptyHintCard() {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <SparklesIcon className="size-6 text-(--cy)" />
      <p className="text-sm font-medium text-(--t1)">Ready when you are</p>
      <p className="max-w-md text-xs text-(--t3)">
        Fill the brief above and click <span className="font-semibold">Generate</span>.
        The AI will draft the full project — you can review the preview
        and save it to the database, or start over with a different brief.
      </p>
    </div>
  );
}

function StreamingBody({ text }: { text: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-(--t2)">
        <Loader2Icon className="size-3.5 animate-spin text-(--cy)" />
        Streaming the AI's draft — this typically takes 10–30 seconds.
      </div>
      <pre
        className="max-h-[60vh] min-h-48 overflow-auto rounded-md border border-(--bor2) bg-(--bg) p-3 font-mono text-[11px] leading-snug text-(--t2)"
        data-testid="ai-gen-stream"
      >
        {text || '…'}
      </pre>
    </div>
  );
}

function PreviewBody({
  srcDoc,
  files,
  slideCount,
  warnings,
  hadFences,
  showStream,
  streamText,
  onToggleStream,
}: {
  srcDoc: string;
  files: [string, string][];
  slideCount: number;
  warnings: string[];
  hadFences: boolean;
  showStream: boolean;
  streamText: string;
  onToggleStream: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {warnings.length > 0 ? (
        <Alert className="border-amber-500/40 bg-amber-500/5">
          <AlertCircleIcon className="size-4 text-amber-500" />
          <AlertTitle>Parser warnings</AlertTitle>
          <AlertDescription>
            <ul className="ml-4 list-disc">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {hadFences ? (
        <p className="text-[11px] text-(--t3)">
          The AI wrapped the JSON in markdown fences — the parser stripped
          them. Future runs follow the contract more strictly when they see
          clean JSON.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-2">
          {srcDoc ? (
            <ScaledIframe
              srcDoc={srcDoc}
              naturalWidth={1280}
              naturalHeight={720}
              title="Slide 1 preview"
              className="rounded-lg border border-(--bor2) bg-white"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-(--bor) bg-(--sur) text-xs text-(--t3)">
              No slide-01.html in the AI's output — nothing to preview.
            </div>
          )}
          {slideCount > 0 ? (
            <p className="text-[11px] text-(--t3)">
              {slideCount} slide{slideCount === 1 ? '' : 's'} in this project
            </p>
          ) : null}
        </div>

        <aside className="flex flex-col gap-2" data-testid="ai-gen-file-list">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-(--t1)">
              Files ({files.length})
            </h3>
            <button
              type="button"
              onClick={onToggleStream}
              className="text-[10px] text-(--t3) underline-offset-2 hover:text-(--t2) hover:underline"
            >
              {showStream ? 'Hide' : 'Show'} raw stream
            </button>
          </div>
          <ul className="flex max-h-[60vh] flex-col gap-1 overflow-auto rounded-md border border-(--bor2) bg-(--bg) p-1.5">
            {files.map(([name, content]) => {
              const { icon: Icon, tone } = fileBadge(name);
              return (
                <li
                  key={name}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-(--sur2)"
                  title={name}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <Icon className={`size-3.5 shrink-0 ${tone}`} />
                    <span className="truncate font-mono text-[11px] text-(--t2)">
                      {name}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-(--t3)">
                    {formatSize(content.length)}
                  </span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>

      {showStream ? (
        <details open className="mt-2">
          <summary className="cursor-pointer text-[11px] text-(--t3)">
            Raw stream ({streamText.length} chars)
          </summary>
          <pre className="mt-1 max-h-72 overflow-auto rounded-md border border-(--bor2) bg-(--bg) p-2 font-mono text-[10px] leading-snug text-(--t2)">
            {streamText}
          </pre>
        </details>
      ) : null}
    </div>
  );
}

function SavingBody() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-center">
      <Loader2Icon className="size-6 animate-spin text-(--cy)" />
      <p className="text-sm font-medium text-(--t1)">Creating project…</p>
      <p className="max-w-md text-xs text-(--t3)">
        Writing each file to the backend in parallel, then opening the
        editor. This usually takes a second or two.
      </p>
    </div>
  );
}