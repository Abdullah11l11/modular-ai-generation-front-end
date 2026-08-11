import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { StorageRadio } from './StorageRadio';
import {
  setKey,
  setProvider,
  setStorageMode,
  getStorageMode,
  getKey,
  setUseProxy,
  getUseProxy,
} from '@/lib/ai/apiKeys';
import {
  DEFAULT_LMSTUDIO_BASE_URL,
  DEFAULT_MINIMAX_BASE_URL,
  getEffectiveBaseUrl,
  setBaseUrlOverride,
  clearBaseUrlOverride,
} from '@/lib/ai/baseUrl';
import { minimaxService } from '@/lib/ai/providers/minimax';
import { lmstudioService } from '@/lib/ai/providers/lmstudio';
import type { AIProvider } from '@/lib/ai/AIService';

type Props = {
  provider: AIProvider;
  onProviderChange: (p: AIProvider) => void;
  onSaved: () => void;
};

export function KeySetupView({ provider, onProviderChange, onSaved }: Props) {
  const existingKey = getKey(provider) ?? '';
  const [key, setKeyState] = useState(existingKey);
  const [reveal, setReveal] = useState(false);
  const [mode, setMode] = useState<'session' | 'local'>(getStorageMode());
  const [baseUrlOverride, setBaseUrlOverrideState] = useState(getEffectiveBaseUrl(provider));
  const [useProxy, setUseProxyState] = useState(getUseProxy());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [advanced, setAdvanced] = useState(false);

  const showKeyField = provider === 'minimax';

  const onSave = () => {
    setProvider(provider);
    setStorageMode(mode);
    setUseProxy(useProxy);
    if (showKeyField && key) setKey(provider, key, mode);
    if (
      baseUrlOverride &&
      baseUrlOverride !==
        (provider === 'minimax' ? DEFAULT_MINIMAX_BASE_URL : DEFAULT_LMSTUDIO_BASE_URL)
    ) {
      setBaseUrlOverride(provider, baseUrlOverride);
    } else {
      clearBaseUrlOverride(provider);
    }
    onSaved();
  };

  const onTest = async () => {
    setTestStatus('testing');
    const service = provider === 'minimax' ? minimaxService : lmstudioService;
    const ok = await service.testConnection(baseUrlOverride);
    setTestStatus(ok ? 'ok' : 'fail');
  };

  return (
    <div className="flex flex-col gap-3 text-xs">
      <div className="flex flex-col gap-1">
        <Label>Provider</Label>
        <Select
          value={provider}
          onValueChange={(v) => {
            const next = v as AIProvider;
            onProviderChange(next);
            setBaseUrlOverrideState(getEffectiveBaseUrl(next));
          }}
        >
          <SelectTrigger className="h-7">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minimax">MiniMax / Anthropic-compatible</SelectItem>
            <SelectItem value="lmstudio">LM Studio (local)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showKeyField && (
        <div className="flex flex-col gap-1">
          <Label htmlFor="ai-key">API key</Label>
          <div className="flex gap-1">
            <Input
              id="ai-key"
              type={reveal ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKeyState(e.target.value)}
              placeholder="sk-…"
              className="h-7 text-xs"
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => setReveal((r) => !r)}>
              {reveal ? 'Hide' : 'Reveal'}
            </Button>
          </div>
        </div>
      )}

      <StorageRadio value={mode} onChange={setMode} />

      <button
        type="button"
        onClick={() => setAdvanced((a) => !a)}
        className="self-start text-(--t3) text-[11px] underline underline-offset-2"
      >
        {advanced ? 'Hide advanced' : 'Show advanced'}
      </button>

      {advanced && (
        <div className="flex flex-col gap-2 rounded-md border border-(--bor2) p-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ai-baseurl">Base URL</Label>
            <Input
              id="ai-baseurl"
              value={baseUrlOverride}
              onChange={(e) => setBaseUrlOverrideState(e.target.value)}
              className="h-7 font-mono text-xs"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useProxy}
              onChange={(e) => setUseProxyState(e.target.checked)}
            />
            <span>Route through serverless proxy (recommended for MiniMax)</span>
          </label>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onTest}
          disabled={testStatus === 'testing'}
        >
          {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
        </Button>
        {testStatus === 'ok' && <span className="text-(--accent) text-[11px]">Reachable ✓</span>}
        {testStatus === 'fail' && (
          <span className="text-destructive text-[11px]">CORS or unreachable</span>
        )}
      </div>

      <Button type="button" variant="accent" size="sm" onClick={onSave} className="w-full">
        Save and continue
      </Button>
    </div>
  );
}
