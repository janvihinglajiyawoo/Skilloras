import { QuizQuestion, StudentProfile } from '../types';

export interface ChatApiParams {
  message: string;
  history: Array<{ role: 'user' | 'model'; content: string }>;
  subject?: string;
  studentProfile?: Partial<StudentProfile>;
  offlineMode?: boolean;
  aiProvider?: 'gemini' | 'ollama' | 'on-device';
  ollamaModel?: string;
}

export interface VoiceCommandResponse {
  reply: string;
  spokenText: string;
  source?: string;
  action?: {
    type: 'navigate' | 'start_quiz' | 'show_roadmap' | 'search';
    target?: string;
    subject?: string;
    noteId?: string;
  };
}

export async function sendChatMessage(params: ChatApiParams): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply || 'I am here to help you learn! What topic shall we study today?';
  } catch (err: any) {
    console.warn('Chat API fetch error, using local fallback:', err);
    return `### 💡 On-Device Concept Summary\n\nI understand your query about **${params.subject || 'this concept'}**!\n\n* **Fundamental principle:** Focus on the core definition and examine real scenarios.\n* **Self-assessment:** Take a practice quiz in the **Practice** tab to test your retention.\n* **Note:** When using offline mode, ensure your local Ollama model (\`${params.ollamaModel || 'llama3.2'}\`) is running or consult cached notes.`;
  }
}

export async function sendVoiceCommand(
  command: string,
  language: string,
  studentProfile?: Partial<StudentProfile>,
  offlineMode = false,
  ollamaModel = 'llama3.2'
): Promise<VoiceCommandResponse> {
  try {
    const res = await fetch('/api/voice-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command,
        language,
        studentProfile,
        offlineMode,
        aiProvider: offlineMode ? 'ollama' : 'gemini',
        ollamaModel,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Voice command API fetch error, fallback:', err);
    const cmd = command.toLowerCase();
    if (cmd.includes('quiz') || cmd.includes('practice')) {
      return {
        reply: 'Opening Practice Quizzes for you.',
        spokenText: 'Opening Practice Quizzes.',
        action: { type: 'navigate', target: 'practice' },
      };
    }
    if (cmd.includes('roadmap')) {
      return {
        reply: 'Showing your personalized study roadmap.',
        spokenText: 'Showing your study roadmap.',
        action: { type: 'navigate', target: 'roadmap' },
      };
    }
    return {
      reply: `I heard: "${command}". Let me help you master this concept!`,
      spokenText: `I heard your query. Let's explore it together!`,
    };
  }
}

export async function generateDynamicQuiz(
  subject: string,
  topic: string,
  difficulty: string,
  weakConcepts: string[] = [],
  offlineMode = false,
  ollamaModel = 'llama3.2'
): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject,
        topic,
        difficulty,
        numQuestions: 5,
        weakConcepts,
        offlineMode,
        aiProvider: offlineMode ? 'ollama' : 'gemini',
        ollamaModel,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      return data.questions;
    }
  } catch (err) {
    console.warn('Quiz generation fetch error:', err);
  }
  return [];
}
