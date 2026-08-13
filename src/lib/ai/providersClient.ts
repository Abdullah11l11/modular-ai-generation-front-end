/**
 * Per-user AI provider store, served by the Laravel backend.
 *
 * The browser never sees an AI API key. Each user has one row per
 * provider family (`anthropic`, `openai`, `gemini`, `local`, `custom`)
 * in `user_ai_providers`; the encrypted `api_key` is decrypted
 * server-side per chat request.
 *
 * See `01_MGF_BACKEND/docs/FRONTEND_AI_CHAT_HANDOFF.md` for the
 * canonical contract.
 */
import { apiClient, ApiError } from '@/lib/api/client';

export type ProviderFamily = 'openai' | 'anthropic' | 'gemini' | 'local' | 'custom';

export type UserAiProvider = {
  id: string;
  provider: ProviderFamily;
  display_name: string;
  base_url: string;
  default_model: string | null;
  has_key: boolean;
  is_active: boolean;
  created_at: string;
};

export type CreateProviderInput = {
  provider: ProviderFamily;
  display_name?: string;
  /** Required for non-`local` providers; ignored (or required-empty) for `local`. */
  api_key?: string;
  base_url: string;
  default_model?: string | null;
  is_active?: boolean;
};

export type UpdateProviderInput = Partial<CreateProviderInput>;

export type ProviderTestResult = {
  ok: boolean;
  reachable: boolean;
  status: number | null;
  code: string | null;
  message: string | null;
  latency_ms: number | null;
};

type ProviderListResponse = { data: UserAiProvider[] };
type ProviderResponse = { data: UserAiProvider };
type TestResponse = ProviderTestResult;

const ENDPOINT = 'me/ai-providers';

export const fetchAiProviders = async (signal?: AbortSignal): Promise<UserAiProvider[]> => {
  const res = await apiClient.get<ProviderListResponse>(ENDPOINT, { signal });
  return res.data;
};

export const createAiProvider = async (input: CreateProviderInput): Promise<UserAiProvider> => {
  const res = await apiClient.post<ProviderResponse, CreateProviderInput>(
    ENDPOINT,
    input,
  );
  return res.data;
};

export const updateAiProvider = async (
  id: string,
  input: UpdateProviderInput,
): Promise<UserAiProvider> => {
  const res = await apiClient.put<ProviderResponse, UpdateProviderInput>(
    `${ENDPOINT}/${id}`,
    input,
  );
  return res.data;
};

export const deleteAiProvider = async (id: string): Promise<void> => {
  await apiClient.delete(`${ENDPOINT}/${id}`);
};

export const testAiProvider = async (id: string, signal?: AbortSignal): Promise<ProviderTestResult> => {
  const res = await apiClient.post<TestResponse, Record<string, never>>(
    `${ENDPOINT}/${id}/test`,
    {},
    { signal },
  );
  return res;
};

/** Pull a human-readable message out of any error shape we might encounter. */
export const describeProviderError = (err: unknown): string => {
  if (err instanceof ApiError) {
    const body = err.details as
      | { message?: string; code?: string; errors?: Record<string, string[]> }
      | undefined;
    const fieldErrs = body?.errors
      ? Object.entries(body.errors)
          .map(([k, v]) => `${k}: ${v.join(', ')}`)
          .join('; ')
      : '';
    const main = body?.message ?? err.message;
    return fieldErrs ? `${main} (${fieldErrs})` : main;
  }
  return err instanceof Error ? err.message : String(err);
};
