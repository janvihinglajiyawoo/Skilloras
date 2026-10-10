import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  Loader2,
  Globe,
  Radio,
  BookOpen,
  HelpCircle,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Cpu,
} from 'lucide-react';
import { speechService, SpeechVisualState } from '../services/speech';
import { sendVoiceCommand } from '../services/api';
import { useStudent, AppView } from '../context/StudentContext';
import { Language } from '../types';

interface VoiceAgentWidgetProps {
  compact?: boolean;
}

export const VoiceAgentWidget: React.FC<VoiceAgentWidgetProps> = ({ compact = false }) => {
  const {
    student,
    setActiveView,
    isOfflineMode,
    ollamaStatus,
    setIsOllamaModalOpen,
    setActiveNoteFilter,
  } = useStudent();

  const [language, setLanguage] = useState<Language>(student?.language || 'English');
  const [visualState, setVisualState] = useState<SpeechVisualState>('ready');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  const [agentResponse, setAgentResponse] = useState<string>(
    student?.language === 'Hindi'
      ? 'नमस्ते पूजा! आप क्या सीखना चाहते हैं? माइक पर बोलें।'
      : student?.language === 'Gujarati'
      ? 'નમસ્તે પૂજા! આજે કયો વિષય શીખવો છે? માઇક પર બોલો.'
      : 'Hello Pooja! Ask me anything, request a quiz, or ask for notes on DBMS and Python.'
  );

  const [textFallback, setTextFallback] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, []);

  const handleStartListening = async () => {
    setErrorMessage(null);
    setIsPermissionError(false);
    setTranscript('');
    setEditableTranscript('');
    setIsEditingTranscript(false);
    speechService.stopSpeaking();
    setIsSpeaking(false);

    const started = await speechService.startListening(language, {
      onStart: () => {
        setVisualState('listening');
      },
      onAudioStart: () => {
        setIsAudioActive(true);
      },
      onResult: (text, isFinal) => {
        setTranscript(text);
        setEditableTranscript(text);
        if (isFinal) {
          speechService.stopListening();
          setIsAudioActive(false);
          setVisualState('success');
        }
      },
      onError: (msg, isPerm) => {
        speechService.stopListening();
        setIsAudioActive(false);
        setVisualState('error');
        setErrorMessage(msg);
        setIsPermissionError(Boolean(isPerm));
      },
      onEnd: () => {
        setIsAudioActive(false);
        setVisualState((prev) => {
          if (prev === 'listening') return 'ready';
          return prev;
        });
      },
    });

    if (!started) {
      setIsAudioActive(false);
    }
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsAudioActive(false);
    if (transcript.trim()) {
      setVisualState('success');
    } else {
      setVisualState('ready');
    }
  };

  const handleSubmitCommand = async (commandText: string) => {
    if (!commandText.trim()) return;

    speechService.stopListening();
    setIsAudioActive(false);
    setVisualState('processing');

    try {
      const res = await sendVoiceCommand(
        commandText.trim(),
        language,
        student || undefined,
        isOfflineMode,
        ollamaStatus.activeModel
      );

      setAgentResponse(res.reply);
      setVisualState('ready');
      setIsEditingTranscript(false);

      const lower = commandText.toLowerCase();
      const isPythonCmd =
        lower.includes('python') ||
        lower.includes('py ') ||
        lower.startsWith('py') ||
        lower.includes('पायथन') ||
        lower.includes('પાયથોન');

      const isOsCmd =
        lower.includes('operating') ||
        lower.includes('cpu scheduling') ||
        lower.includes('process state') ||
        lower.includes('ऑपरेटिंग') ||
        lower.includes('ઓપરેટિંગ');

      if (isPythonCmd) {
        setActiveNoteFilter({ subject: 'Python Programming', noteId: 'note-python-memory' });
        setTimeout(() => {
          setActiveView('notes');
        }, 1200);
      } else if (isOsCmd) {
        setActiveNoteFilter({ subject: 'Operating Systems', noteId: 'note-process-states' });
        setTimeout(() => {
          setActiveView('notes');
        }, 1200);
      } else if (res.action?.type === 'navigate' && res.action.target) {
        if (res.action.target === 'notes') {
          if (res.action.subject || res.action.noteId) {
            setActiveNoteFilter({
              subject: res.action.subject,
              noteId: res.action.noteId,
            });
          } else {
            if (lower.includes('normalization')) {
              setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-normalization' });
            } else if (lower.includes('join') || lower.includes('sql')) {
              setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-sql-joins' });
            } else {
              setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-acid-transactions' });
            }
          }
        }

        setTimeout(() => {
          setActiveView(res.action!.target as AppView);
        }, 1200);
      } else if (res.action?.type === 'start_quiz') {
        setTimeout(() => {
          setActiveView('practice');
        }, 1200);
      } else {
        // Direct fallback navigation if user commanded notes
        if (lower.includes('note') || lower.includes('cheat sheet') || lower.includes('flowchart')) {
          if (lower.includes('normalization')) {
            setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-normalization' });
          } else if (lower.includes('join') || lower.includes('sql')) {
            setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-sql-joins' });
          } else {
            setActiveNoteFilter({ subject: 'DBMS', noteId: 'note-acid-transactions' });
          }
          setTimeout(() => {
            setActiveView('notes');
          }, 1200);
        }
      }

      // Read audio aloud if not muted
      if (!isAudioMuted && res.spokenText) {
        setIsSpeaking(true);
        speechService.speak(res.spokenText, language, () => {
          setIsSpeaking(false);
        });
      }
    } catch (err: any) {
      setVisualState('error');
      setErrorMessage(
        isOfflineMode
          ? 'Failed to process with local Ollama engine. Check that "ollama serve" is running.'
          : 'Failed to connect to AI Voice Agent. Please try again or use text fallback.'
      );
    }
  };

  const handleTextFallbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textFallback.trim()) return;
    const cmd = textFallback.trim();
    setTextFallback('');
    setTranscript(cmd);
    setEditableTranscript(cmd);
    handleSubmitCommand(cmd);
  };

  const stopSpeakingManually = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-3xl border border-[#EAE5DC] shadow-xs overflow-hidden transition-all duration-300 ${
        compact ? 'p-4' : 'p-6'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center shadow-xs">
            <Radio className="w-5 h-5 text-[#E87A5D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#292524]">AI Voice Agent</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE5DC] text-[#44403C]">
                Multilingual
              </span>
              {isOfflineMode && (
                <button
                  onClick={() => setIsOllamaModalOpen(true)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1 cursor-pointer"
                  title="Running locally with Ollama"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Local AI ({ollamaStatus.activeModel})</span>
                </button>
              )}
            </div>
            <p className="text-xs text-[#78716C]">
              Real-time voice assistance for BCA Semester 6
            </p>
          </div>
        </div>

        {/* Language switch & Mute button */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE5DC]">
            {(['English', 'Hindi', 'Gujarati'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  language === l
                    ? 'bg-[#3D342F] text-white shadow-2xs'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                {l === 'English' ? 'EN' : l === 'Hindi' ? 'हिन्दी' : 'ગુજરાતી'}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeakingManually();
              }
              setIsAudioMuted(!isAudioMuted);
            }}
            className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer"
            title={isAudioMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Voice Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Interactive Microphone Orb */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#FAF7F2] rounded-2xl border border-[#EAE5DC]">
          <div className="relative my-2">
            {/* Visual audio soundwave rings */}
            {visualState === 'listening' && (
              <>
                <div className="absolute inset-0 -m-3 rounded-full border-2 border-[#E87A5D]/60 animate-ping pointer-events-none" />
                <div className="absolute inset-0 -m-6 rounded-full border border-[#E87A5D]/30 animate-pulse pointer-events-none" />
              </>
            )}
            {isSpeaking && (
              <div className="absolute inset-0 -m-2.5 rounded-full border-2 border-emerald-500/60 animate-pulse pointer-events-none" />
            )}

            <button
              type="button"
              onClick={() => {
                if (visualState === 'listening') {
                  handleStopListening();
                } else if (isSpeaking) {
                  stopSpeakingManually();
                } else {
                  handleStartListening();
                }
              }}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer ${
                visualState === 'listening'
                  ? 'bg-[#E87A5D] ring-8 ring-[#E87A5D]/25'
                  : visualState === 'processing'
                  ? 'bg-amber-600 ring-8 ring-amber-500/20 animate-pulse'
                  : isSpeaking
                  ? 'bg-emerald-700 ring-8 ring-emerald-600/20 animate-pulse'
                  : visualState === 'error'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-[#3D342F] hover:bg-[#2C2522]'
              }`}
              title={visualState === 'listening' ? 'Click to stop listening' : 'Click to start voice'}
            >
              {visualState === 'processing' ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isSpeaking ? (
                <Volume2 className="w-8 h-8 text-white" />
              ) : visualState === 'listening' ? (
                <Mic className="w-8 h-8 text-white animate-pulse" />
              ) : visualState === 'error' ? (
                <RotateCcw className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-[#FAF7F2]" />
              )}
            </button>
          </div>

          {/* Visual State Badges: Ready, Listening, Processing, Success, Error */}
          <div className="mt-2 text-center">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                visualState === 'listening'
                  ? 'bg-[#FDECE7] text-[#C84B31]'
                  : visualState === 'processing'
                  ? 'bg-amber-100 text-amber-900'
                  : visualState === 'success'
                  ? 'bg-emerald-100 text-emerald-900'
                  : visualState === 'error'
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-[#EAE5DC] text-[#44403C]'
              }`}
            >
              {visualState === 'listening' && (
                <span className="w-2 h-2 rounded-full bg-[#E87A5D] animate-ping" />
              )}
              {visualState === 'listening'
                ? 'Listening to your voice...'
                : visualState === 'processing'
                ? 'Processing command...'
                : visualState === 'success'
                ? 'Recognized! Review or submit'
                : visualState === 'error'
                ? 'Microphone issue - click to retry'
                : 'Ready • Click mic to speak'}
            </span>
          </div>

          <p className="text-[11px] text-[#78716C] mt-2 text-center">
            {visualState === 'listening'
              ? 'Speak your question or learning topic'
              : 'Ask questions, start quizzes, or request roadmaps'}
          </p>
        </div>

        {/* Right: Transcript Review, Response, and Fallback Field */}
        <div className="md:col-span-8 flex flex-col justify-between h-full space-y-3">
          {/* Recognized Speech Review & Edit Stage */}
          {transcript && (
            <div className="bg-white p-3.5 rounded-2xl border border-[#EAE5DC] shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#78716C] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Recognized Speech:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isEditingTranscript ? 'Done Editing' : 'Edit Text'}</span>
                </button>
              </div>

              {isEditingTranscript ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="flex-1 bg-[#FAF7F2] border border-[#EAE5DC] rounded-xl px-3 py-1.5 text-xs text-[#292524] focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleSubmitCommand(editableTranscript)}
                    className="px-3 py-1.5 bg-[#3D342F] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-[#292524] italic">
                    "{editableTranscript || transcript}"
                  </div>
                  {visualState === 'success' && (
                    <button
                      onClick={() => handleSubmitCommand(editableTranscript || transcript)}
                      className="px-3.5 py-1.5 bg-[#3D342F] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#2A2320] shrink-0 shadow-2xs"
                    >
                      Submit Command →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Response Card */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EAE5DC] min-h-[100px] flex flex-col justify-between">
            <div className="text-sm font-medium text-[#292524] leading-relaxed">
              {agentResponse}
            </div>

            {isSpeaking && (
              <div className="mt-2 pt-2 border-t border-[#EAE5DC] flex items-center justify-between text-xs text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  Playing audio response
                </span>
                <button
                  onClick={stopSpeakingManually}
                  className="font-semibold text-[#78716C] hover:text-[#292524] cursor-pointer"
                >
                  Stop Audio
                </button>
              </div>
            )}
          </div>

          {/* Clear Error Message Banner */}
          {errorMessage && (
            <div className="text-xs text-[#C84B31] bg-[#FDF0ED] p-3 rounded-2xl border border-[#FADCD5] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold">{errorMessage}</div>
                {isPermissionError && (
                  <p className="text-[11px] mt-0.5 text-[#78716C]">
                    Tip: Click the padlock or camera/mic icon in your browser address bar to toggle microphone permission to "Allow".
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#78716C]">Try saying:</span>
            {[
              { label: 'Start DBMS Quiz', cmd: 'Start DBMS quiz' },
              { label: 'Show Study Roadmap', cmd: 'Show my study roadmap' },
              { label: 'Explain ACID Properties', cmd: 'Explain ACID properties in DBMS' },
              { label: 'Open Videos', cmd: 'Show recommended videos' },
            ].map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                onClick={() => {
                  setTranscript(shortcut.cmd);
                  setEditableTranscript(shortcut.cmd);
                  handleSubmitCommand(shortcut.cmd);
                }}
                className="text-xs bg-white border border-[#EAE5DC] hover:border-[#3D342F] text-[#44403C] px-2.5 py-1 rounded-xl transition-all hover:bg-[#FAF7F2] cursor-pointer shadow-2xs"
              >
                {shortcut.label}
              </button>
            ))}
          </div>

          {/* Text-Input Fallback */}
          <form onSubmit={handleTextFallbackSubmit} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={textFallback}
              onChange={(e) => setTextFallback(e.target.value)}
              placeholder="Or type a question or voice command (working fallback)..."
              className="flex-1 bg-[#FAF7F2] border border-[#EAE5DC] rounded-xl px-3.5 py-2 text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-hidden focus:ring-2 focus:ring-[#3D342F]/30"
            />
            <button
              type="submit"
              disabled={!textFallback.trim() || visualState === 'processing'}
              className="px-3.5 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-semibold hover:bg-[#2C2522] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
