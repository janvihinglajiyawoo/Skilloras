import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Ollama Configuration
let ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
let ollamaActiveModel = process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2';

// Initialize Google GenAI with required telemetry headers
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Call Ollama local inference API
async function callOllama(params: {
  prompt: string;
  system?: string;
  model?: string;
  jsonMode?: boolean;
}): Promise<string> {
  const modelToUse = params.model || ollamaActiveModel;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35s timeout

  try {
    const res = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        prompt: params.prompt,
        system: params.system,
        stream: false,
        format: params.jsonMode ? 'json' : undefined,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Ollama returned status ${res.status}: ${errText}`);
    }

    const data: any = await res.json();
    return data.response || '';
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Ollama request timed out (35s) for model ${modelToUse}.`);
    }
    throw err;
  }
}

// Helper for fallback AI tutor responses if API key is not configured or network issues occur
function getFallbackTutorReply(prompt: string, subject?: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('normalization') || p.includes('1nf') || p.includes('2nf') || p.includes('3nf')) {
    return `### Database Normalization in DBMS\n\nNormalization is the systematic process of organizing data to reduce data redundancy and avoid anomalies (Insert, Update, Delete).\n\n* **1NF (First Normal Form):** Every cell must contain single, atomic values. No repeating groups.\n* **2NF (Second Normal Form):** Must be in 1NF + All non-key attributes must be fully functionally dependent on the primary key (no partial dependency).\n* **3NF (Third Normal Form):** Must be in 2NF + No transitive dependencies (non-prime attributes shouldn't depend on other non-prime attributes).\n* **BCNF (Boyce-Codd):** A stricter version where for every functional dependency $X \\rightarrow Y$, $X$ must be a super key.\n\n💡 *Pro-tip:* Normalization improves data integrity, while indexing and denormalization can be used in data warehousing for high-read speeds.`;
  }
  if (p.includes('acid') || p.includes('transaction')) {
    return `### ACID Properties in DBMS\n\nACID ensures reliable database transactions:\n\n1. **Atomicity (All or Nothing):** The entire transaction succeeds or rolls back completely.\n2. **Consistency:** Database transitions only from one valid state to another, respecting all constraints.\n3. **Isolation:** Concurrent transactions execute without interfering with each other.\n4. **Durability:** Once committed, changes survive even in system crashes (written to WAL/redo logs).`;
  }
  if (p.includes('join') || p.includes('sql')) {
    return `### SQL Joins Explained\n\n* **INNER JOIN:** Returns records with matching values in both tables.\n* **LEFT JOIN:** Returns all records from left table and matched ones from right table (NULL if no match).\n* **RIGHT JOIN:** Returns all records from right table and matched ones from left table.\n* **FULL OUTER JOIN:** Returns all records when there is a match in either left or right table.\n* **CROSS JOIN:** Cartesian product of both tables.`;
  }
  if (p.includes('list') || p.includes('array') || p.includes('python')) {
    return `### Python Memory & Lists\n\n* In Python, lists are dynamic arrays of references to objects.\n* **Time Complexity:** Appending is amortized $O(1)$, indexing is $O(1)$, searching is $O(n)$, and inserting at beginning is $O(n)$.\n* **Memory Management:** Handled by reference counting and cyclic generational garbage collection.`;
  }
  if (p.includes('cpu') || p.includes('scheduling') || p.includes('round robin') || p.includes('sjf')) {
    return `### CPU Scheduling Algorithms in Operating Systems\n\nCPU scheduling determines which process in the ready queue is allocated CPU time:\n\n* **FCFS (First-Come, First-Served):** Non-preemptive, simple, but suffers from the convoy effect.\n* **SJF (Shortest Job First):** Optimal average waiting time; requires predicting next burst time.\n* **Round Robin (RR):** Preemptive with time quantum $q$. Ideal for time-sharing systems.\n* **Priority Scheduling:** Processes are allocated CPU based on priority levels; can cause starvation without aging.`;
  }
  return `### Comprehensive Concept Summary\n\nGreat question regarding **${subject || 'Computer Science'}**!\n\nKey takeaways to remember:\n* **Core Concept:** Focus on the fundamental principles first before optimization.\n* **Real-world Application:** Always relate theoretical logic to real implementations (e.g., in databases, web servers, or operating systems).\n* **Next Step:** Try testing your understanding by taking the practice quiz for this topic in the **Practice** tab!`;
}

// ==========================================
// OLLAMA STATUS & CONFIGURATION ENDPOINTS
// ==========================================

app.get('/api/ollama/status', async (_req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const tagsRes = await fetch(`${ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (tagsRes.ok) {
      const data: any = await tagsRes.json();
      const models = Array.isArray(data.models)
        ? data.models.map((m: any) => ({
            name: m.name,
            size: m.size,
            digest: m.digest,
            modified_at: m.modified_at,
          }))
        : [];

      return res.json({
        installed: true,
        running: true,
        baseUrl: ollamaBaseUrl,
        activeModel: ollamaActiveModel,
        models,
      });
    } else {
      return res.json({
        installed: false,
        running: false,
        baseUrl: ollamaBaseUrl,
        activeModel: ollamaActiveModel,
        models: [],
        error: `Ollama replied with HTTP status ${tagsRes.status}`,
      });
    }
  } catch (err: any) {
    return res.json({
      installed: false,
      running: false,
      baseUrl: ollamaBaseUrl,
      activeModel: ollamaActiveModel,
      models: [],
      error: `Could not connect to Ollama on ${ollamaBaseUrl}. Ensure Ollama is installed and run "ollama serve".`,
    });
  }
});

app.post('/api/ollama/config', (req, res) => {
  const { baseUrl, model } = req.body;
  if (baseUrl) {
    ollamaBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  }
  if (model) {
    ollamaActiveModel = model.trim();
  }
  return res.json({
    success: true,
    baseUrl: ollamaBaseUrl,
    activeModel: ollamaActiveModel,
  });
});

// ==========================================
// 1. AI TUTOR CHAT ENDPOINT
// ==========================================

app.post('/api/chat', async (req, res) => {
  const {
    message,
    history = [],
    subject,
    studentProfile,
    offlineMode = false,
    aiProvider = 'gemini',
    ollamaModel,
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const studentName = studentProfile?.name || 'Student';
  const knowledgeLevel = studentProfile?.difficulty || 'Intermediate';
  const currentLanguage = studentProfile?.language || 'English';

  const systemInstruction = `You are "Genie Tutor", an empathetic, inspiring, world-class AI tutor in LearnGenie.
You are helping ${studentName}, who is currently studying BCA Semester 6 at knowledge level ${knowledgeLevel}.
Current primary language preference: ${currentLanguage}.
If the user greets or asks in Hindi or Gujarati, respond in that language warmly while retaining technical English terms for clarity.
Keep explanations structured with bold titles, bullet points, clean markdown, and practical examples.
Always offer an encouraging summary and suggest a quick follow-up question or quiz topic.`;

  // OFFLINE MODE: Use Ollama local inference without contacting external APIs
  if (offlineMode || aiProvider === 'ollama') {
    try {
      // Build conversation prompt for Ollama
      let promptBuilder = '';
      const recentHistory = history.slice(-4);
      for (const turn of recentHistory) {
        promptBuilder += `${turn.role === 'user' ? 'Student' : 'Tutor'}: ${turn.content}\n`;
      }
      promptBuilder += `Student: ${message}\nTutor:`;

      const localResponse = await callOllama({
        prompt: promptBuilder,
        system: systemInstruction,
        model: ollamaModel || ollamaActiveModel,
      });

      if (localResponse && localResponse.trim()) {
        return res.json({
          reply: localResponse.trim(),
          source: 'ollama',
          model: ollamaModel || ollamaActiveModel,
        });
      }
    } catch (ollamaErr: any) {
      console.warn('Ollama offline chat warning:', ollamaErr.message);
      const diagnosticNotice = `> **Local AI Note:** Local Ollama model (\`${ollamaModel || ollamaActiveModel}\`) on \`${ollamaBaseUrl}\` was unreachable (${ollamaErr.message}).\n> *Serving response from LearnGenie built-in on-device knowledge base.*\n\n`;
      return res.json({
        reply: diagnosticNotice + getFallbackTutorReply(message, subject),
        source: 'on-device-fallback',
        error: ollamaErr.message,
      });
    }
  }

  // ONLINE MODE: Call Gemini API
  try {
    if (aiClient) {
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        formattedContents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text || getFallbackTutorReply(message, subject);
      return res.json({ reply: text, source: 'gemini' });
    } else {
      return res.json({ reply: getFallbackTutorReply(message, subject), source: 'fallback' });
    }
  } catch (err: any) {
    console.error('Gemini chat error:', err?.message || err);
    return res.json({ reply: getFallbackTutorReply(message, subject), source: 'fallback' });
  }
});

// ==========================================
// 2. VOICE AGENT COMMAND ENDPOINT
// ==========================================

app.post('/api/voice-command', async (req, res) => {
  const {
    command,
    language = 'en',
    studentProfile,
    offlineMode = false,
    aiProvider = 'gemini',
    ollamaModel,
  } = req.body;

  if (!command) {
    return res.status(400).json({ error: 'Command is required' });
  }

  const promptLower = command.toLowerCase().trim();

  // Deterministic fast navigation matching (works instant online or offline)
  if (promptLower.includes('quiz') || promptLower.includes('practice') || promptLower.includes('test')) {
    return res.json({
      reply: 'Taking you to the Practice Quiz center. Choose your subject and difficulty level to begin!',
      spokenText: 'Opening the Practice Quiz center for you.',
      action: { type: 'navigate', target: 'practice' },
    });
  }

  if (promptLower.includes('roadmap') || promptLower.includes('schedule') || promptLower.includes('task') || promptLower.includes('deadline')) {
    return res.json({
      reply: 'Here is your personalized study roadmap with upcoming deadlines and prioritized milestones.',
      spokenText: 'Here is your personalized study roadmap.',
      action: { type: 'navigate', target: 'roadmap' },
    });
  }

  // 1. TOPIC & NOTE SPECIFIC DETECTION
  const isPython =
    promptLower.includes('python') ||
    promptLower.includes('py ') ||
    promptLower.startsWith('py') ||
    promptLower.includes('pyobject') ||
    promptLower.includes('garbage collection') ||
    promptLower.includes('gil') ||
    promptLower.includes('पायथन') ||
    promptLower.includes('પાયથોન');

  const isOS =
    promptLower.includes('operating system') ||
    promptLower.includes('cpu scheduling') ||
    promptLower.includes('process state') ||
    promptLower.includes('scheduling') ||
    promptLower.includes('round robin') ||
    promptLower.includes('fcfs') ||
    promptLower.includes('ऑपरेटिंग') ||
    promptLower.includes('ઓપરેટિંગ') ||
    (promptLower.includes('os') && !promptLower.includes('close'));

  const isAcid =
    promptLower.includes('acid') ||
    promptLower.includes('transaction') ||
    promptLower.includes('atomicity') ||
    promptLower.includes('durability') ||
    promptLower.includes('rollback');

  const isNormalization =
    promptLower.includes('normalization') ||
    promptLower.includes('1nf') ||
    promptLower.includes('2nf') ||
    promptLower.includes('3nf') ||
    promptLower.includes('bcnf');

  const isSqlJoins =
    promptLower.includes('join') ||
    promptLower.includes('sql') ||
    promptLower.includes('relational algebra') ||
    promptLower.includes('inner join');

  const isNotesRequested =
    promptLower.includes('note') ||
    promptLower.includes('diagram') ||
    promptLower.includes('flowchart') ||
    promptLower.includes('cheat sheet') ||
    promptLower.includes('show') ||
    promptLower.includes('open') ||
    promptLower.includes('explain') ||
    promptLower.includes('learn');

  // If user explicitly asks for Python or Python notes
  if (isPython) {
    return res.json({
      reply:
        'Opening your Python Programming notes! Here is the complete breakdown of Python Memory Allocation, PyObject headers, reference counting, and generational garbage collection with interactive flowcharts.',
      spokenText: 'Opening your Python Programming notes and memory architecture flowchart.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'Python Programming',
        noteId: 'note-python-memory',
      },
    });
  }

  // If user asks for OS
  if (isOS) {
    return res.json({
      reply: 'Opening your Operating Systems notes on Process Lifecycle & CPU Scheduling algorithms with interactive 5-state transitions!',
      spokenText: 'Opening your Operating Systems notes and process lifecycle diagrams.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'Operating Systems',
        noteId: 'note-process-states',
      },
    });
  }

  // If user asks for Normalization
  if (isNormalization) {
    return res.json({
      reply: 'Opening your Database Normalization notes from 1NF to BCNF with stage progression flowchart!',
      spokenText: 'Opening your Database Normalization notes.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'DBMS',
        noteId: 'note-normalization',
      },
    });
  }

  // If user asks for SQL Joins
  if (isSqlJoins) {
    return res.json({
      reply: 'Opening your SQL Joins and Relational Algebra visual notes with interactive Venn diagrams!',
      spokenText: 'Opening your SQL Joins notes.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'DBMS',
        noteId: 'note-sql-joins',
      },
    });
  }

  // If user asks for ACID
  if (isAcid) {
    return res.json({
      reply: 'Opening your Database Transactions and ACID Properties notes with recovery lifecycle flowchart!',
      spokenText: 'Opening your ACID Transaction notes.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'DBMS',
        noteId: 'note-acid-transactions',
      },
    });
  }

  // General notes request with no specific subject
  if (isNotesRequested) {
    return res.json({
      reply: 'Opening your colorful educational notes and visual flowcharts across DBMS, Python, and Operating Systems.',
      spokenText: 'Opening your concept notes and flowcharts.',
      action: {
        type: 'navigate',
        target: 'notes',
        subject: 'DBMS',
        noteId: 'note-acid-transactions',
      },
    });
  }

  if (promptLower.includes('video') || promptLower.includes('youtube') || promptLower.includes('lecture')) {
    if (offlineMode) {
      return res.json({
        reply: 'Opening video library. Note: Video streaming requires an internet connection, but cached notes and titles remain available offline.',
        spokenText: 'Opening video library. Note that streaming requires an internet connection.',
        action: { type: 'navigate', target: 'videos' },
      });
    }
    return res.json({
      reply: 'Here are hand-picked educational video lectures tailored to your topics and weak areas.',
      spokenText: 'Opening recommended educational videos.',
      action: { type: 'navigate', target: 'videos' },
    });
  }

  if (promptLower.includes('profile') || promptLower.includes('setting') || promptLower.includes('account')) {
    return res.json({
      reply: 'Opening your Student Profile and Preferences settings.',
      spokenText: 'Opening your profile.',
      action: { type: 'navigate', target: 'profile' },
    });
  }

  // OFFLINE: Use Ollama for voice query response
  if (offlineMode || aiProvider === 'ollama') {
    try {
      const prompt = `Student voice inquiry: "${command}". Language: ${language}.
Provide a concise spoken-friendly answer (max 3 sentences) answering their inquiry or explaining the concept.`;

      const localResponse = await callOllama({
        prompt,
        system: 'You are the AI Voice Agent for student learning platform LearnGenie.',
        model: ollamaModel || ollamaActiveModel,
      });

      if (localResponse && localResponse.trim()) {
        const spoken = localResponse.trim();
        return res.json({
          reply: spoken,
          spokenText: spoken,
          source: 'ollama',
        });
      }
    } catch (ollamaErr: any) {
      console.warn('Ollama voice command warning:', ollamaErr.message);
    }

    const fallback = `I hear you! Regarding "${command}", this is a vital concept in your syllabus. I've highlighted revision notes for you.`;
    return res.json({
      reply: fallback,
      spokenText: fallback,
      source: 'on-device-fallback',
    });
  }

  // ONLINE: Use Gemini
  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are the AI Voice Agent for student learning platform LearnGenie.
The student said: "${command}".
Preferred language: ${language}. (Could be English, Hindi, or Gujarati).
Provide a concise, spoken-friendly answer (max 3 sentences) answering their inquiry or explaining the requested concept concisely.`,
        config: {
          temperature: 0.5,
        },
      });

      const spoken = response.text || `I understood your query about "${command}". Let me help you review that concept right now!`;
      return res.json({
        reply: spoken,
        spokenText: spoken,
        source: 'gemini',
      });
    } else {
      const fallback = `I hear you! Regarding "${command}", this is a vital concept in your syllabus. I've highlighted revision notes for you.`;
      return res.json({
        reply: fallback,
        spokenText: fallback,
        source: 'fallback',
      });
    }
  } catch (err: any) {
    return res.json({
      reply: `Got it! Let's explore "${command}". Check out the Notes or Practice sections for deep dive lessons.`,
      spokenText: `Got it! Let's explore that topic together.`,
      source: 'fallback',
    });
  }
});

// ==========================================
// 3. QUIZ GENERATION ENDPOINT
// ==========================================

app.post('/api/generate-quiz', async (req, res) => {
  const {
    subject = 'DBMS',
    topic = 'Normalization',
    difficulty = 'Intermediate',
    numQuestions = 5,
    weakConcepts = [],
    offlineMode = false,
    aiProvider = 'gemini',
    ollamaModel,
  } = req.body;

  const prompt = `Generate a ${difficulty} level quiz on "${subject}" (specific topic: ${topic}).
Target student has weak concepts in: ${weakConcepts.join(', ') || 'none specified'}.
Return a strict JSON array of ${numQuestions} multiple-choice or true/false questions.
Format schema:
[
  {
    "id": "q1",
    "question": "Question text...",
    "type": "mcq",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "concept": "Name of concept",
    "explanation": "Detailed explanation of why this option is correct and why other options are incorrect."
  }
]`;

  // OFFLINE: Use Ollama in JSON mode
  if (offlineMode || aiProvider === 'ollama') {
    try {
      const ollamaRaw = await callOllama({
        prompt: prompt + '\nRespond with JSON array only. No markdown fences.',
        model: ollamaModel || ollamaActiveModel,
        jsonMode: true,
      });

      if (ollamaRaw) {
        // Parse json
        const cleanJson = ollamaRaw.replace(/^```json/m, '').replace(/```$/m, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json({ questions: parsed, source: 'ollama' });
        }
      }
    } catch (ollamaErr: any) {
      console.warn('Ollama quiz generation fallback:', ollamaErr.message);
    }
  } else if (aiClient) {
    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return res.json({ questions: parsed, source: 'gemini' });
      }
    } catch (err: any) {
      console.error('Quiz generation error:', err?.message || err);
    }
  }

  // Curated Fallback Question Bank (completely offline ready)
  return res.json({
    source: 'offline-question-bank',
    questions: [
      {
        id: 'fb-1',
        question: 'Which normal form eliminates partial functional dependency on a composite primary key?',
        type: 'mcq',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctIndex: 1,
        concept: 'Database Normalization',
        explanation: '2NF requires the table to be in 1NF and that all non-key attributes are fully dependent on the primary key, thereby eliminating partial dependency.',
      },
      {
        id: 'fb-2',
        question: 'In ACID properties, what does the "A" stand for?',
        type: 'mcq',
        options: ['Availability', 'Atomicity', 'Authentication', 'Authorization'],
        correctIndex: 1,
        concept: 'Transaction Management',
        explanation: 'Atomicity means "all or nothing"—either all operations of a transaction execute completely, or none of them do.',
      },
      {
        id: 'fb-3',
        question: 'True or False: BCNF is strictly stronger than 3NF.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        concept: 'Boyce-Codd Normal Form',
        explanation: 'True. Every relation in BCNF is also in 3NF, but not every relation in 3NF is in BCNF.',
      },
      {
        id: 'fb-4',
        question: 'Which SQL clause is used to filter groups created by the GROUP BY statement?',
        type: 'mcq',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
        correctIndex: 1,
        concept: 'SQL Query Optimization',
        explanation: 'The HAVING clause was added to SQL because the WHERE keyword cannot be used with aggregate functions.',
      },
      {
        id: 'fb-5',
        question: 'In CPU scheduling, what is the convoy effect typically associated with?',
        type: 'mcq',
        options: ['First-Come First-Served (FCFS)', 'Round Robin', 'Shortest Job First', 'Multi-Level Feedback Queue'],
        correctIndex: 0,
        concept: 'CPU Scheduling',
        explanation: 'In FCFS, when a long CPU-bound process occupies the CPU, short I/O-bound processes wait behind it, causing the convoy effect.',
      },
    ],
  });
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LearnGenie server listening on port ${PORT}`);
    console.log(`Ollama endpoint: ${ollamaBaseUrl} (model: ${ollamaActiveModel})`);
  });
}

startServer();
