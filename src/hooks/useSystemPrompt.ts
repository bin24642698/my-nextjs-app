'use client';

// 中文说明：系统提示词的 Hook，负责从 IndexedDB 加载与保存
import { useCallback, useEffect, useState } from 'react';
import { SettingsService } from '@/utils/idb/settings';

const KEY = 'systemPrompt';
const DEFAULT_PROMPT = '';

export function useSystemPrompt() {
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // 中文说明：初始化读取系统提示词
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const val = await SettingsService.get<string>(KEY);
        if (mounted && typeof val === 'string') {
          setPrompt(val);
        }
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 中文说明：保存系统提示词
  const save = useCallback(async (value: string) => {
    setSaving(true);
    setError(null);
    try {
      await SettingsService.set(KEY, value);
      setPrompt(value);
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  return { prompt, setPrompt, save, loading, saving, error };
}

