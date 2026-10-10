export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Language = 'English' | 'Hindi' | 'Gujarati';

export interface StudentProfile {
  id: string;
  name: string;
  initials: string;
  role: string; // e.g. "BCA • Semester 6"
  email: string;
  avatarBgColor?: string;
  subjects: string[];
  learningGoals: string[];
  difficulty: DifficultyLevel;
  dailyStudyMinutes: number;
  language: Language;
  highContrast: boolean;
  textSize: 'Small' | 'Medium' | 'Large';
  currentStreak: number;
  completedQuizzesCount: number;
  totalStudyHours: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true_false' | 'scenario';
  options: string[];
  correctIndex: number;
  concept: string;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  subject: string;
  difficulty: DifficultyLevel;
  totalQuestions: number;
  score: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  userAnswers: { [questionId: string]: number };
  incorrectQuestionIds: string[];
  conceptsCovered: string[];
  weakConcepts: string[];
}

export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface RoadmapTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  estimatedMinutes: number;
  concept: string;
}

export interface NoteItem {
  id: string;
  title: string;
  subject: string;
  level: DifficultyLevel;
  summary: string;
  keyPoints: string[];
  definitions: { term: string; definition: string }[];
  diagramType: 'acid-flow' | 'normalization-stages' | 'sql-joins' | 'python-memory' | 'process-states';
  diagramTitle: string;
  diagramDescription: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  relatedVideoId: string;
  relatedVideoTitle: string;
}

export interface VideoRecommendation {
  id: string;
  title: string;
  youtubeId: string;
  subject: string;
  channel: string;
  duration: string;
  difficulty: DifficultyLevel;
  language: string;
  thumbnailUrl: string;
  keyTopics: string[];
  watchUrl: string;
}

export interface NotificationItem {
  id: string;
  type: 'study_reminder' | 'achievement' | 'progress' | 'alert';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  subject?: string;
}

export interface ChatSession {
  id: string;
  studentId: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export interface OllamaModelInfo {
  name: string;
  size?: number;
  digest?: string;
  modified_at?: string;
}

export interface OllamaStatus {
  installed: boolean;
  running: boolean;
  version?: string;
  baseUrl: string;
  activeModel: string;
  models: OllamaModelInfo[];
  error?: string;
}

export interface DownloadedPdf {
  id: string;
  title: string;
  subject: string;
  filename: string;
  downloadedAt: number;
  fileSizeKb: number;
}
