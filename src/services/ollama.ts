import { OllamaStatus } from '../types';

export async function fetchOllamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch('/api/ollama/status');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: OllamaStatus = await res.json();
    return data;
  } catch (err: any) {
    return {
      installed: false,
      running: false,
      baseUrl: 'http://127.0.0.1:11434',
      activeModel: 'llama3.2',
      models: [],
      error: err?.message || 'Failed to reach Ollama backend API',
    };
  }
}

export async function configureOllama(baseUrl?: string, model?: string): Promise<{ success: boolean; baseUrl: string; activeModel: string }> {
  try {
    const res = await fetch('/api/ollama/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseUrl, model }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.error('Failed to update Ollama config:', err);
    return {
      success: false,
      baseUrl: baseUrl || 'http://127.0.0.1:11434',
      activeModel: model || 'llama3.2',
    };
  }
}
