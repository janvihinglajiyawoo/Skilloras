import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  Trash2,
  Bot,
  User,
  GraduationCap,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { sendChatMessage } from '../services/api';
import { speechService } from '../services/speech';

export const AITutorView: React.FC = () => {
  const {
    student,
    chatMessages,
    addChatMessage,
    clearChatHistory,
    isOfflineMode,
    ollamaStatus,
    setIsOllamaModalOpen,
  } = useStudent();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    setInputMessage('');
    speechService.stopListening();
    setIsMicActive(false);

    // Add user message
    addChatMessage({
      role: 'user',
      content: text.trim(),
    });

    setIsLoading(true);

    try {
      const historyFormatted = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendChatMessage({
        message: text.trim(),
        history: historyFormatted,
        subject: student?.subjects[0] || 'DBMS',
        studentProfile: student || undefined,
        offlineMode: isOfflineMode,
        aiProvider: isOfflineMode ? 'ollama' : 'gemini',
        ollamaModel: ollamaStatus.activeModel,
      });

      addChatMessage({
        role: 'model',
        content: reply,
      });
    } catch (err) {
      addChatMessage({
        role: 'model',
        content:
          "I encountered an issue processing your query. Don't worry, here is a quick study takeaway: review 1NF, 2NF, and 3NF decomposition properties in the Notes tab!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMic = async () => {
    setMicErrorMessage(null);
    if (isMicActive) {
      speechService.stopListening();
      setIsMicActive(false);
    } else {
      const started = await speechService.startListening(student?.language || 'English', {
        onStart: () => setIsMicActive(true),
        onResult: (transcript, isFinal) => {
          setInputMessage(transcript);
          if (isFinal) {
            setIsMicActive(false);
          }
        },
        onError: (err) => {
          setIsMicActive(false);
          setMicErrorMessage(err);
          setTimeout(() => setMicErrorMessage(null), 5000);
        },
        onEnd: () => setIsMicActive(false),
      });
      if (!started) {
        setIsMicActive(false);
      }
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterChips = [
    'Explain DBMS Normalization with 1NF, 2NF, 3NF',
    'How do Python Iterators and Generators work?',
    'Explain ACID properties with banking transaction example',
    'Compare Round Robin and Shortest Job First scheduling',
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl flex flex-col h-[calc(100vh-6rem)]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC] mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-[#E87A5D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#292524]">Genie Tutor</h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Secure Session
                </span>
              </div>
              <p className="text-xs text-[#78716C]">
                Private AI Tutor tailored for {student?.name || 'Student'} • {student?.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your conversation history permanently?')) {
                  clearChatHistory();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#EAE5DC] text-xs font-semibold text-[#78716C] hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              title="Delete conversation history permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete History</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {chatMessages.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-[#EAE5DC] my-8 max-w-md mx-auto">
              <GraduationCap className="w-10 h-10 text-[#3D342F] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#292524]">Start a New Learning Session</h3>
              <p className="text-xs text-[#78716C] mt-1 mb-4">
                Ask about complex algorithms, practical viva questions, or exam concepts.
              </p>
              <div className="flex flex-col gap-2">
                {starterChips.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] hover:border-[#3D342F] text-xs font-medium text-[#44403C] text-left transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 items-start ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-[#3D342F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4 text-[#E87A5D]" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4.5 border transition-all ${
                    msg.role === 'user'
                      ? 'bg-[#3D342F] text-white border-[#3D342F] shadow-xs'
                      : 'bg-white text-[#292524] border-[#EAE5DC] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold ${
                        msg.role === 'user' ? 'text-stone-300' : 'text-[#78716C]'
                      }`}
                    >
                      {msg.role === 'user' ? student?.name || 'You' : 'Genie Tutor'}
                    </span>

                    {msg.role === 'model' && (
                      <button
                        onClick={() => handleCopyText(msg.id, msg.content)}
                        className="text-[#A8A29E] hover:text-[#44403C] p-1 cursor-pointer"
                        title="Copy note"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#DDD6CA] text-[#44403C] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    {student?.initials || 'PK'}
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 items-start justify-start">
              <div className="w-8 h-8 rounded-xl bg-[#3D342F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-4 h-4 text-[#E87A5D]" />
              </div>
              <div className="bg-white rounded-3xl p-4 border border-[#EAE5DC] shadow-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#3D342F] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#3D342F] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#3D342F] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#78716C] ml-1">Genie Tutor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Starter Chips */}
        {chatMessages.length > 0 && chatMessages.length < 6 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['Explain 3NF with simple schema', 'Write a Python Generator', 'What is Deadlock?'].map(
              (prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-xs bg-white border border-[#EAE5DC] hover:border-[#3D342F] text-[#44403C] px-3 py-1.5 rounded-full shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  {prompt}
                </button>
              )
            )}
          </div>
        )}

        {/* Input Bar with Voice Dictation */}
        <div className="bg-white rounded-3xl p-2 sm:p-2.5 border border-[#EAE5DC] shadow-md flex items-center gap-2">
          <button
            onClick={handleToggleMic}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isMicActive
                ? 'bg-[#E87A5D] text-white ring-4 ring-[#E87A5D]/20 animate-pulse'
                : 'bg-[#FAF7F2] text-[#78716C] hover:text-[#292524] border border-[#EAE5DC]'
            }`}
            title={isMicActive ? 'Stop Voice Recording' : 'Voice Dictate Question'}
          >
            {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              isMicActive
                ? 'Listening to your voice... Speak now'
                : `Ask Genie Tutor anything about your syllabus (${student?.language || 'English'})...`
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#292524] placeholder-[#A8A29E] focus:outline-hidden"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center hover:bg-[#2A2320] transition-colors disabled:opacity-40 cursor-pointer shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
