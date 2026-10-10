import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  StudentProfile,
  NotificationItem,
  RoadmapTask,
  QuizAttempt,
  ChatMessage,
  DifficultyLevel,
  Language,
  OllamaStatus,
  DownloadedPdf,
} from '../types';
import {
  INITIAL_STUDENT_PROFILE,
  INITIAL_NOTIFICATIONS,
  INITIAL_ROADMAP_TASKS,
  INITIAL_QUIZ_ATTEMPTS,
} from '../data/initialData';
import { fetchOllamaStatus, configureOllama } from '../services/ollama';
import { getDownloadedPdfs } from '../services/pdfGenerator';

export type AppView =
  | 'dashboard'
  | 'roadmap'
  | 'practice'
  | 'tutor'
  | 'notes'
  | 'analytics'
  | 'videos'
  | 'profile'
  | 'settings'
  | 'notifications';

interface SubjectMastery {
  subject: string;
  level: DifficultyLevel;
  scorePercentage: number;
  quizzesTaken: number;
  weakPoints: string[];
  strongPoints: string[];
  revisionNeeded: boolean;
}

interface StudentContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  roadmapTasks: RoadmapTask[];
  updateTaskStatus: (taskId: string, status: RoadmapTask['status']) => void;
  addRoadmapTask: (task: Omit<RoadmapTask, 'id'>) => void;
  deleteRoadmapTask: (taskId: string) => void;
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => void;
  activeRequizFilter: { subject: string; incorrectIds: string[] } | null;
  setActiveRequizFilter: (filter: { subject: string; incorrectIds: string[] } | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;
  subjectMasteryList: SubjectMastery[];
  overallStrengths: string[];
  overallWeaknesses: string[];
  updateStudentProfile: (updates: Partial<StudentProfile>) => void;
  logout: () => void;
  loginAs: (studentId?: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Offline & Ollama AI states
  isOfflineMode: boolean;
  toggleOfflineMode: () => void;
  isBrowserOnline: boolean;
  ollamaStatus: OllamaStatus;
  refreshOllamaStatus: () => Promise<void>;
  updateOllamaModel: (model: string) => Promise<void>;
  updateOllamaBaseUrl: (baseUrl: string) => Promise<void>;
  isOllamaModalOpen: boolean;
  setIsOllamaModalOpen: (open: boolean) => void;
  downloadedPdfs: DownloadedPdf[];
  refreshDownloadedPdfs: () => void;
  // Note filter navigation (e.g. from Voice Agent when saying "python notes")
  activeNoteFilter: { subject?: string; noteId?: string } | null;
  setActiveNoteFilter: (filter: { subject?: string; noteId?: string } | null) => void;
  // Auth Modal trigger
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  // Device Viewport Scene switch
  deviceScene: 'responsive' | 'mobile' | 'tablet' | 'laptop';
  setDeviceScene: (scene: 'responsive' | 'mobile' | 'tablet' | 'laptop') => void;
  // Onboarding replay
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'learngenie_current_user_id',
  PROFILES: 'learngenie_profiles_v1',
  ROADMAPS: 'learngenie_roadmaps_v1',
  QUIZZES: 'learngenie_quizzes_v1',
  NOTIFS: 'learngenie_notifs_v1',
  CHATS: 'learngenie_chats_v1',
  OFFLINE_MODE: 'learngenie_offline_mode_v1',
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || INITIAL_STUDENT_PROFILE.id;
  });

  const [student, setStudent] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.PROFILES}_${INITIAL_STUDENT_PROFILE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_STUDENT_PROFILE;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.NOTIFS}_${INITIAL_STUDENT_PROFILE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [roadmapTasks, setRoadmapTasks] = useState<RoadmapTask[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.ROADMAPS}_${INITIAL_STUDENT_PROFILE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_ROADMAP_TASKS;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.QUIZZES}_${INITIAL_STUDENT_PROFILE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return INITIAL_QUIZ_ATTEMPTS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${INITIAL_STUDENT_PROFILE.id}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: 'welcome-tutor-msg',
        role: 'model',
        content: `👋 **Welcome, Pooja!** I am your Genie Tutor.\n\nI can help you review **DBMS Normalization**, explain **Python Memory Management**, solve practical problems, or test your readiness for semester exams.\n\nWhat would you like to explore today?`,
        timestamp: Date.now() - 3600000,
        subject: 'DBMS',
      },
    ];
  });

  const [activeRequizFilter, setActiveRequizFilter] = useState<{ subject: string; incorrectIds: string[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Offline mode and browser connectivity states
  const [isBrowserOnline, setIsBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    if (saved !== null) {
      return saved === 'true';
    }
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });

  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    installed: false,
    running: false,
    baseUrl: 'http://127.0.0.1:11434',
    activeModel: 'llama3.2',
    models: [],
  });

  const [isOllamaModalOpen, setIsOllamaModalOpen] = useState(false);
  const [downloadedPdfs, setDownloadedPdfs] = useState<DownloadedPdf[]>([]);
  const [activeNoteFilter, setActiveNoteFilter] = useState<{ subject?: string; noteId?: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deviceScene, setDeviceScene] = useState<'responsive' | 'mobile' | 'tablet' | 'laptop'>('responsive');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Browser online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => {
      setIsBrowserOnline(false);
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial Ollama status check and downloaded PDFs check
    refreshOllamaStatus();
    refreshDownloadedPdfs();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshDownloadedPdfs = () => {
    setDownloadedPdfs(getDownloadedPdfs());
  };

  const refreshOllamaStatus = async () => {
    const status = await fetchOllamaStatus();
    setOllamaStatus(status);
  };

  const updateOllamaModel = async (model: string) => {
    const res = await configureOllama(undefined, model);
    if (res.success) {
      setOllamaStatus((prev) => ({ ...prev, activeModel: model }));
    }
  };

  const updateOllamaBaseUrl = async (baseUrl: string) => {
    const res = await configureOllama(baseUrl, undefined);
    if (res.success) {
      await refreshOllamaStatus();
    }
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, String(next));
      return next;
    });
  };

  // Persist student profile whenever it changes
  useEffect(() => {
    if (student) {
      localStorage.setItem(`${STORAGE_KEYS.PROFILES}_${student.id}`, JSON.stringify(student));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, student.id);
    }
  }, [student]);

  // Persist notifications
  useEffect(() => {
    if (student) {
      localStorage.setItem(`${STORAGE_KEYS.NOTIFS}_${student.id}`, JSON.stringify(notifications));
    }
  }, [notifications, student]);

  // Persist roadmap
  useEffect(() => {
    if (student) {
      localStorage.setItem(`${STORAGE_KEYS.ROADMAPS}_${student.id}`, JSON.stringify(roadmapTasks));
    }
  }, [roadmapTasks, student]);

  // Persist quiz attempts
  useEffect(() => {
    if (student) {
      localStorage.setItem(`${STORAGE_KEYS.QUIZZES}_${student.id}`, JSON.stringify(quizAttempts));
    }
  }, [quizAttempts, student]);

  // Persist chat messages
  useEffect(() => {
    if (student) {
      localStorage.setItem(`${STORAGE_KEYS.CHATS}_${student.id}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, student]);

  // Apply high contrast and text size classes to document body
  useEffect(() => {
    if (student?.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (student?.textSize === 'Large') {
      document.documentElement.style.fontSize = '17px';
    } else if (student?.textSize === 'Small') {
      document.documentElement.style.fontSize = '14.5px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  }, [student?.highContrast, student?.textSize]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const updateTaskStatus = (taskId: string, status: RoadmapTask['status']) => {
    setRoadmapTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  const addRoadmapTask = (task: Omit<RoadmapTask, 'id'>) => {
    const newTask: RoadmapTask = {
      ...task,
      id: `task-${Date.now()}`,
    };
    setRoadmapTasks((prev) => [newTask, ...prev]);
  };

  const deleteRoadmapTask = (taskId: string) => {
    setRoadmapTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: `attempt-${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);

    // Update student stats
    setStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        completedQuizzesCount: prev.completedQuizzesCount + 1,
        totalStudyHours: Math.round((prev.totalStudyHours + attempt.timeSpentSeconds / 3600) * 10) / 10,
      };
    });

    if (attempt.percentage >= 80) {
      const celebrationNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'achievement',
        title: 'Quiz Mastery Achieved!',
        message: `Outstanding! You scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%) in ${attempt.quizTitle}.`,
        timeAgo: 'Just now',
        read: false,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [celebrationNotif, ...prev]);
    } else if (attempt.incorrectQuestionIds.length > 0) {
      const revisionNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'study_reminder',
        title: 'Practice Recommendation',
        message: `You missed ${attempt.incorrectQuestionIds.length} questions in ${attempt.subject}. Try the Requiz mode to solidify these concepts!`,
        timeAgo: 'Just now',
        read: false,
        timestamp: Date.now(),
      };
      setNotifications((prev) => [revisionNotif, ...prev]);
    }
  };

  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
    if (student) {
      localStorage.removeItem(`${STORAGE_KEYS.CHATS}_${student.id}`);
    }
  };

  const updateStudentProfile = (updates: Partial<StudentProfile>) => {
    setStudent((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const logout = () => {
    setCurrentUserId(null);
    setStudent(null);
    setChatMessages([]);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setActiveView('dashboard');
  };

  const loginAs = (studentId = INITIAL_STUDENT_PROFILE.id) => {
    setCurrentUserId(studentId);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, studentId);

    const savedProf = localStorage.getItem(`${STORAGE_KEYS.PROFILES}_${studentId}`);
    if (savedProf) {
      try {
        setStudent(JSON.parse(savedProf));
      } catch (e) {
        setStudent(INITIAL_STUDENT_PROFILE);
      }
    } else {
      setStudent(INITIAL_STUDENT_PROFILE);
    }

    const savedNotifs = localStorage.getItem(`${STORAGE_KEYS.NOTIFS}_${studentId}`);
    if (savedNotifs) {
      try {
        setNotifications(JSON.parse(savedNotifs));
      } catch (e) {
        setNotifications(INITIAL_NOTIFICATIONS);
      }
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }

    const savedRoadmap = localStorage.getItem(`${STORAGE_KEYS.ROADMAPS}_${studentId}`);
    if (savedRoadmap) {
      try {
        setRoadmapTasks(JSON.parse(savedRoadmap));
      } catch (e) {
        setRoadmapTasks(INITIAL_ROADMAP_TASKS);
      }
    } else {
      setRoadmapTasks(INITIAL_ROADMAP_TASKS);
    }

    const savedQuizzes = localStorage.getItem(`${STORAGE_KEYS.QUIZZES}_${studentId}`);
    if (savedQuizzes) {
      try {
        setQuizAttempts(JSON.parse(savedQuizzes));
      } catch (e) {
        setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
      }
    } else {
      setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    }

    const savedChats = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${studentId}`);
    if (savedChats) {
      try {
        setChatMessages(JSON.parse(savedChats));
      } catch (e) {
        setChatMessages([]);
      }
    } else {
      setChatMessages([
        {
          id: 'welcome-restored-msg',
          role: 'model',
          content: `👋 Welcome back! Your secure study sessions and learning history have been restored.`,
          timestamp: Date.now(),
        },
      ]);
    }
  };

  const subjectMasteryList: SubjectMastery[] = useMemo(() => {
    const subjects = student?.subjects || ['DBMS', 'Python Programming', 'Web Technologies', 'Operating Systems', 'Data Structures & Algorithms'];
    return subjects.map((sub) => {
      const attempts = quizAttempts.filter((a) => a.subject === sub);
      const tasks = roadmapTasks.filter((t) => t.subject === sub);
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

      let scoreTotal = 0;
      let totalQuestions = 0;
      const weakSet = new Set<string>();
      const strongSet = new Set<string>();

      attempts.forEach((att) => {
        scoreTotal += att.score;
        totalQuestions += att.totalQuestions;
        att.weakConcepts?.forEach((w) => weakSet.add(w));
        att.conceptsCovered?.forEach((c) => {
          if (!att.weakConcepts?.includes(c)) strongSet.add(c);
        });
      });

      const avgPercent = totalQuestions > 0 ? Math.round((scoreTotal / totalQuestions) * 100) : 75;
      let level: DifficultyLevel = 'Beginner';
      if (avgPercent >= 80 && completedTasks >= 1) {
        level = 'Advanced';
      } else if (avgPercent >= 60 || completedTasks >= 1) {
        level = 'Intermediate';
      }

      return {
        subject: sub,
        level,
        scorePercentage: avgPercent,
        quizzesTaken: attempts.length,
        weakPoints: Array.from(weakSet),
        strongPoints: Array.from(strongSet),
        revisionNeeded: avgPercent < 70 || weakSet.size > 0,
      };
    });
  }, [student?.subjects, quizAttempts, roadmapTasks]);

  const overallStrengths = useMemo(() => {
    const set = new Set<string>();
    subjectMasteryList.forEach((s) => s.strongPoints.forEach((p) => set.add(p)));
    if (set.size === 0) {
      set.add('Relational Schema Design');
      set.add('Python List Comprehensions');
      set.add('HTML & Responsive Layouts');
    }
    return Array.from(set).slice(0, 5);
  }, [subjectMasteryList]);

  const overallWeaknesses = useMemo(() => {
    const set = new Set<string>();
    subjectMasteryList.forEach((s) => s.weakPoints.forEach((p) => set.add(p)));
    if (set.size === 0) {
      set.add('Concurrency Lock Types');
      set.add('3NF vs BCNF Edge Cases');
    }
    return Array.from(set).slice(0, 5);
  }, [subjectMasteryList]);

  return (
    <StudentContext.Provider
      value={{
        student,
        isAuthenticated: Boolean(student),
        activeView,
        setActiveView,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        roadmapTasks,
        updateTaskStatus,
        addRoadmapTask,
        deleteRoadmapTask,
        quizAttempts,
        recordQuizAttempt,
        activeRequizFilter,
        setActiveRequizFilter,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        subjectMasteryList,
        overallStrengths,
        overallWeaknesses,
        updateStudentProfile,
        logout,
        loginAs,
        searchQuery,
        setSearchQuery,
        // Offline & Ollama states
        isOfflineMode,
        toggleOfflineMode,
        isBrowserOnline,
        ollamaStatus,
        refreshOllamaStatus,
        updateOllamaModel,
        updateOllamaBaseUrl,
        isOllamaModalOpen,
        setIsOllamaModalOpen,
        downloadedPdfs,
        refreshDownloadedPdfs,
        // Note filter navigation
        activeNoteFilter,
        setActiveNoteFilter,
        // Auth Modal
        isAuthModalOpen,
        setIsAuthModalOpen,
        // Device viewport switch
        deviceScene,
        setDeviceScene,
        // Onboarding
        showOnboarding,
        setShowOnboarding,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};
