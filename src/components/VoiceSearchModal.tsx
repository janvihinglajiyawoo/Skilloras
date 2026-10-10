import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Search, X, Volume2, Globe, Sparkles, ArrowRight } from 'lucide-react';
import { speechService } from '../services/speech';
import { Language } from '../types';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  initialLanguage?: Language;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialLanguage = 'English',
}) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setErrorMessage(null);
      startVoiceListening();
    } else {
      speechService.stopListening();
      setIsListening(false);
    }
    return () => {
      speechService.stopListening();
    };
  }, [isOpen, language]);

  const startVoiceListening = async () => {
    setErrorMessage(null);
    const ok = await speechService.startListening(language, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript, isFinal) => {
        setQuery(transcript);
        if (isFinal) {
          setIsListening(false);
        }
      },
      onError: (msg) => {
        setIsListening(false);
        setErrorMessage(msg);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!ok && !errorMessage) {
      setErrorMessage('Speech recognition is not active. You can type your search below.');
    }
  };

  const stopVoiceListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleApplySearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE5DC] relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#292524]">Voice Search</h3>
              <p className="text-xs text-[#78716C]">Speak or edit your search query</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E5E0D6] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2 mt-4 mb-3">
          <Globe className="w-4 h-4 text-[#78716C]" />
          <span className="text-xs font-medium text-[#78716C]">Spoken Language:</span>
          {(['English', 'Hindi', 'Gujarati'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                if (isListening) stopVoiceListening();
              }}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                language === lang
                  ? 'bg-[#3D342F] text-white shadow-xs'
                  : 'bg-white border border-[#E5E0D6] text-[#78716C] hover:text-[#292524]'
              }`}
            >
              {lang === 'English' ? 'English' : lang === 'Hindi' ? 'हिन्दी (Hindi)' : 'ગુજરાતી (Gujarati)'}
            </button>
          ))}
        </div>

        {/* Mic Animation Card */}
        <div className="bg-white rounded-2xl p-6 border border-[#EAE5DC] text-center my-4 flex flex-col items-center">
          <div className="relative mb-3">
            <button
              onClick={isListening ? stopVoiceListening : startVoiceListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all shadow-lg cursor-pointer ${
                isListening
                  ? 'bg-[#E87A5D] ring-8 ring-[#E87A5D]/20 animate-pulse'
                  : 'bg-[#3D342F] hover:bg-[#2A2320]'
              }`}
            >
              {isListening ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9 text-stone-300" />}
            </button>
          </div>

          <p className="text-sm font-semibold text-[#292524]">
            {isListening ? 'Listening... Speak your topic or query' : 'Tap microphone to speak'}
          </p>
          <p className="text-xs text-[#78716C] mt-1">
            e.g., "DBMS Normalization", "Python Lists", "Round Robin Scheduling"
          </p>

          {errorMessage && (
            <div className="mt-3 text-xs text-[#C84B31] bg-[#FDF0ED] px-3 py-1.5 rounded-xl border border-[#FADCD5]">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Editable Transcript Area */}
        <div className="mt-2">
          <label className="text-xs font-semibold text-[#78716C] block mb-1.5">
            Review or Edit Recognized Query:
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Normalization in DBMS..."
              className="w-full bg-white border border-[#E5E0D6] rounded-2xl px-4 py-3 text-sm text-[#292524] placeholder-[#A8A29E] focus:outline-hidden focus:ring-2 focus:ring-[#3D342F]/30"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleApplySearch();
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-3 text-[#A8A29E] hover:text-[#292524] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mt-3 mb-5">
          {['DBMS Normalization', 'ACID Properties', 'Python Iterators', 'CPU Scheduling'].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="text-xs bg-[#EAE5DC]/60 hover:bg-[#EAE5DC] text-[#44403C] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end pt-2 border-t border-[#EAE5DC]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-[#78716C] hover:text-[#292524] rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApplySearch}
            disabled={!query.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D342F] text-white text-xs font-semibold hover:bg-[#2A2320] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <span>Search Learning Materials</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
