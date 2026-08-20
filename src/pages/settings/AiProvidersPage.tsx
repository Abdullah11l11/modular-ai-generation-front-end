/**
 * /settings/ai-providers — manage the current user's AI providers.
 *
 * The browser never sees an API key — the backend encrypts the key
 * per row in `user_ai_providers` and decrypts it only when the chat
 * endpoint runs. This page only renders metadata (`display_name`,
 * `base_url`, `default_model`) plus a key input the user types when
 * adding or replacing a provider. The key is POSTed to the backend
 * and never echoed back; we use `has_key` to know whether a key is
 * already on file.
 */
import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/empty-state';
import { ErrorFallback } from '@/components/error-fallback';
import { FullPageLoader } from '@/components/full-page-loader';
import { PlusIcon, TrashIcon, RefreshCwIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  createAiProvider,
  deleteAiProvider,
  describeProviderError,
  fetchAiProviders,
  testAiProvider,
  updateAiProvider,
  type CreateProviderInput,
  type ProviderFamily,
  type ProviderTestResult,
  type UserAiProvider,
} from '@/lib/ai/providersClient';

type FormState = {
  provider: ProviderFamily;
  display_name: string;
  base_url: string;
  default_model: string;
  api_key: string;
};

const FAMILY_DEFAULTS: Record<ProviderFamily, { base_url: string; label: string }> = {
  anthropic: {
    base_url: 'https://api.anthropic.com',
    label: 'Anthropic (Claude)',
  },
  openai: {
    base_url: 'https://api.openai.com/v1',
    label: 'OpenAI',
  },
  gemini: {
    base_url: 'https://generativelanguage.googleapis.com/v1beta',
    label: 'Gemini',
  },
  local: {
    base_url: 'http://localhost:1234/v1',
    label: 'Local (LM Studio / Ollama)',
  },
  custom: {
    base_url: '',
    label: 'Custom OpenAI-compatible',
  },
};

const emptyForm = (family: ProviderFamily = 'anthropic'): FormState => ({
  provider: family,
  display_name: FAMILY_DEFAULTS[family].label,
  base_url: FAMILY_DEFAULTS[family].base_url,
  default_model: '',
  api_key: '',
});

export default function AiProvidersPage() {
  const [providers, setProviders] = useState<UserAiProvider[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<FormState>(() => emptyForm());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [revealKey, setRevealKey] = useState(false);

  const [testResults, setTestResults] = useState<Record<string, ProviderTestResult | undefined>>(
    {},
  );
  const [testingId, setTestingId] = useState<string | null>(null);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    const ac = new AbortController();
    setLoaded(false);
    fetchAiProviders(ac.signal)
      .then((list) => {
        setProviders(list);
        setLoadError(null);
      })
      .catch((err) => {
        if (!ac.signal.aborted) setLoadError(err);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoaded(true);
      });
    return () => ac.abort();
  }, [reloadKey]);

  const startAdd = () => {
    setEditingId(null);
    setAdding(true);
    setForm(emptyForm());
    setSubmitError(null);
    setRevealKey(false);
  };

  const startEdit = (row: UserAiProvider) => {
    setAdding(false);
    setEditingId(row.id);
    setForm({
      provider: row.provider,
      display_name: row.display_name,
      base_url: row.base_url,
      default_model: row.default_model ?? '',
      api_key: '',
    });
    setSubmitError(null);
    setRevealKey(false);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditingId(null);
    setForm(emptyForm());
    setSubmitError(null);
  };

  const onFamilyChange = (next: ProviderFamily) => {
    setForm((prev) => ({
      ...prev,
      provider: next,
      base_url:
        prev.base_url && prev.base_url !== FAMILY_DEFAULTS[prev.provider].base_url
          ? prev.base_url
          : FAMILY_DEFAULTS[next].base_url,
      display_name: prev.display_name || FAMILY_DEFAULTS[next].label,
    }));
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingId) {
        const body: CreateProviderInput = {
          provider: form.provider,
          display_name: form.display_name,
          base_url: form.base_url,
          default_model: form.default_model || null,
        };
        if (form.api_key) body.api_key = form.api_key;
        await updateAiProvider(editingId, body);
        toast.success('Provider updated');
      } else {
        if (form.provider !== 'local' && !form.api_key) {
          setSubmitError('API key is required for non-local providers.');
          setSubmitting(false);
          return;
        }
        const body: CreateProviderInput = {
          provider: form.provider,
          display_name: form.display_name,
          base_url: form.base_url,
          default_model: form.default_model || null,
          is_active: true,
        };
        if (form.api_key) body.api_key = form.api_key;
        await createAiProvider(body);
        toast.success('Provider added');
      }
      cancelForm();
      reload();
    } catch (err) {
      setSubmitError(describeProviderError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (row: UserAiProvider) => {
    if (!window.confirm(`Delete provider "${row.display_name}"? This can't be undone.`)) return;
    try {
      await deleteAiProvider(row.id);
      toast.success('Provider deleted');
      reload();
    } catch (err) {
      toast.error(`Delete failed: ${describeProviderError(err)}`);
    }
  };

  const onTest = async (row: UserAiProvider) => {
    setTestingId(row.id);
    try {
      const res = await testAiProvider(row.id);
      setTestResults((prev) => ({ ...prev, [row.id]: res }));
      if (res.ok) {
        toast.success(
          res.latency_ms != null ? `Reachable (${res.latency_ms} ms)` : 'Reachable',
        );
      } else {
        toast.error(`Not reachable: ${res.message ?? 'check base URL'}`);
      }
    } catch (err) {
      toast.error(`Test failed: ${describeProviderError(err)}`);
    } finally {
      setTestingId(null);
    }
  };

  if (!loaded && !loadError) return <FullPageLoader />;
  if (loadError) return <ErrorFallback error={loadError} reset={reload} />;

  const formOpen = adding || editingId !== null;

  return (
    <div>
      <PageHeader
        title="AI Providers"
        subtitle="Connect a MiniMax / Anthropic / OpenAI / Gemini / local endpoint. API keys are encrypted server-side and never sent to your browser."
        actions={
          !formOpen && (
            <Button variant="accent" size="sm" onClick={startAdd}>
              <PlusIcon className="size-3.5" />
              Add provider
            </Button>
          )
        }
      />

      {formOpen && (
        <div className="mb-6 rounded-lg border border-(--bor2) bg-(--sur1) p-4">
          <h2 className="mb-3 text-sm font-semibold text-(--t1)">
            {editingId ? 'Edit provider' : 'Add provider'}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-provider-family">Provider family</Label>
              <Select
                value={form.provider}
                onValueChange={(v) => onFamilyChange(v as ProviderFamily)}
                disabled={!!editingId}
              >
                <SelectTrigger id="ai-provider-family" className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FAMILY_DEFAULTS).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editingId && (
                <p className="text-[11px] text-(--t3)">
                  Family can't be changed. Delete and re-add to switch.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-provider-name">Display name</Label>
              <Input
                id="ai-provider-name"
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                placeholder="e.g. My MiniMax account"
                className="h-8"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-provider-url">Base URL</Label>
              <Input
                id="ai-provider-url"
                value={form.base_url}
                onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
                placeholder="https://api.example.com/v1"
                className="h-8 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="ai-provider-model">Default model</Label>
              <Input
                id="ai-provider-model"
                value={form.default_model}
                onChange={(e) => setForm((f) => ({ ...f, default_model: e.target.value }))}
                placeholder="e.g. MiniMax-M3"
                className="h-8 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="ai-provider-key">
                API key {editingId ? '(leave blank to keep existing)' : ''}
              </Label>
              <div className="flex gap-1">
                <Input
                  id="ai-provider-key"
                  type={revealKey ? 'text' : 'password'}
                  value={form.api_key}
                  onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
                  placeholder={editingId ? '•••• key on file ••••' : 'sk-…'}
                  className="h-8 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevealKey((r) => !r)}
                >
                  {revealKey ? 'Hide' : 'Reveal'}
                </Button>
              </div>
              {form.provider === 'local' && (
                <p className="text-[11px] text-(--t3)">
                  Local providers don't need an API key — leave blank.
                </p>
              )}
            </div>
          </div>

          {submitError && (
            <p className="mt-3 text-[12px] text-destructive">{submitError}</p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={cancelForm}>
              Cancel
            </Button>
            <Button type="button" variant="accent" size="sm" onClick={submit} disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add provider'}
            </Button>
          </div>
        </div>
      )}

      {providers.length === 0 && !formOpen && (
        <EmptyState
          title="No providers yet"
          description="Add your first AI provider to start chatting in the editor."
          action={
            <Button variant="accent" size="sm" onClick={startAdd}>
              <PlusIcon className="size-3.5" />
              Add provider
            </Button>
          }
        />
      )}

      {providers.length > 0 && (
        <div className="flex flex-col gap-2">
          {providers.map((row) => {
            const test = testResults[row.id];
            return (
              <div
                key={row.id}
                className="rounded-lg border border-(--bor2) bg-(--sur1) p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-(--t1)">
                        {row.display_name || row.provider}
                      </h3>
                      <span className="rounded-full bg-(--sur2) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--t3)">
                        {row.provider}
                      </span>
                      {!row.has_key && row.provider !== 'local' && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-destructive">
                          No key
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate font-mono text-[11px] text-(--t3)">
                      {row.base_url}
                      {row.default_model ? ` · ${row.default_model}` : ''}
                    </p>
                    {test && (
                      <p
                        className={`mt-1 text-[11px] ${
                          test.ok ? 'text-accent' : 'text-destructive'
                        }`}
                      >
                        {test.ok ? 'Reachable ✓' : `Not reachable — ${test.message ?? 'unknown error'}`}
                        {test.latency_ms != null ? ` (${test.latency_ms} ms)` : ''}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onTest(row)}
                      disabled={testingId === row.id}
                    >
                      <RefreshCwIcon
                        className={`size-3.5 ${testingId === row.id ? 'animate-spin' : ''}`}
                      />
                      Test
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(row)}>
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(row)}
                      aria-label={`Delete ${row.display_name}`}
                    >
                      <TrashIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {editingId === row.id && (
                  <p className="mt-2 text-[11px] text-(--t3)">
                    <CheckIcon className="mr-1 inline size-3" />
                    Editing above ↑ — leave the API key blank to keep your existing key.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
