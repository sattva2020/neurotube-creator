import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import type { ChannelBranding } from '@neurotube/shared';

/** All available AI tool keys */
export type ToolKey =
  | 'thumbnail'
  | 'titles'
  | 'description'
  | 'branding'
  | 'notebooklm'
  | 'shorts'
  | 'nicheAnalysis'
  | 'monetization'
  | 'roadmap'
  | 'suno';

/** Union of all possible tool result types */
export type ToolResult = string | string[] | ChannelBranding | null;

export const useToolResultsStore = defineStore('toolResults', () => {
  const results = reactive<Record<ToolKey, ToolResult>>({
    thumbnail: null,
    titles: null,
    description: null,
    branding: null,
    notebooklm: null,
    shorts: null,
    nicheAnalysis: null,
    monetization: null,
    roadmap: null,
    suno: null,
  });

  const loading = reactive<Record<ToolKey, boolean>>({
    thumbnail: false,
    titles: false,
    description: false,
    branding: false,
    notebooklm: false,
    shorts: false,
    nicheAnalysis: false,
    monetization: false,
    roadmap: false,
    suno: false,
  });

  const errors = reactive<Record<ToolKey, string | null>>({
    thumbnail: null,
    titles: null,
    description: null,
    branding: null,
    notebooklm: null,
    shorts: null,
    nicheAnalysis: null,
    monetization: null,
    roadmap: null,
    suno: null,
  });

  function setResult(key: ToolKey, data: ToolResult) {
    results[key] = data;
    console.debug(`[ToolResultsStore] Set result for '${key}'`, data !== null ? 'ok' : 'null');
  }

  function setLoading(key: ToolKey, value: boolean) {
    loading[key] = value;
    console.debug(`[ToolResultsStore] Set loading '${key}':`, value);
  }

  function setError(key: ToolKey, error: string | null) {
    errors[key] = error;
    if (error) {
      console.debug(`[ToolResultsStore] Set error '${key}':`, error);
    }
  }

  function clear(key: ToolKey) {
    results[key] = null;
    loading[key] = false;
    errors[key] = null;
    console.debug(`[ToolResultsStore] Cleared '${key}'`);
  }

  function clearAll() {
    const keys = Object.keys(results) as ToolKey[];
    for (const key of keys) {
      results[key] = null;
      loading[key] = false;
      errors[key] = null;
    }
    console.debug('[ToolResultsStore] Cleared all tool results');
  }

  return { results, loading, errors, setResult, setLoading, setError, clear, clearAll };
});
