import React, { useState } from 'react';
import {
  X,
  Server,
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export const OllamaStatusModal: React.FC = () => {
  const {
    isOllamaModalOpen,
    setIsOllamaModalOpen,
    ollamaStatus,
    refreshOllamaStatus,
    updateOllamaModel,
    updateOllamaBaseUrl,
    isOfflineMode,
    toggleOfflineMode,
    isBrowserOnline,
  } = useStudent();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [customModelInput, setCustomModelInput] = useState('');
  const [customUrlInput, setCustomUrlInput] = useState(ollamaStatus.baseUrl);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOllamaModalOpen) return null;

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await updateOllamaBaseUrl(customUrlInput);
    setIsTesting(false);
  };

  const handleApplyModel = async (model: string) => {
    await updateOllamaModel(model);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#EAE5DC] shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D342F] text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5 text-[#E87A5D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#292524]">
                  Ollama Local AI & Offline Engine
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ollamaStatus.running
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {ollamaStatus.running ? 'Ollama Online' : 'Ollama Offline'}
                </span>
              </div>
              <p className="text-xs text-[#78716C]">
                Configure locally running models for 100% on-device student learning
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOllamaModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-[#EAE5DC] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Offline Mode Toggle Card */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EAE5DC] shadow-xs mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isOfflineMode
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-[#292524]">
                Operating Mode: {isOfflineMode ? 'Offline (Local AI Only)' : 'Online (Cloud + Fallback)'}
              </div>
              <div className="text-[11px] text-[#78716C] mt-0.5">
                {isOfflineMode
                  ? 'Prompts & learning data stay strictly on this machine'
                  : `Connected to Gemini Cloud (${isBrowserOnline ? 'Network active' : 'No internet'})`}
              </div>
            </div>
          </div>

          <button
            onClick={toggleOfflineMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
              isOfflineMode
                ? 'bg-[#3D342F] text-white hover:bg-[#2A2320]'
                : 'bg-[#FAF7F2] border border-[#EAE5DC] text-[#44403C] hover:bg-[#EAE5DC]'
            }`}
          >
            {isOfflineMode ? 'Switch to Cloud AI' : 'Force Offline Mode'}
          </button>
        </div>

        {/* Ollama Connection & Endpoint Settings */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EAE5DC] shadow-xs mb-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-[#292524] flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#3D342F]" />
              <span>Ollama Service Endpoint</span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="text-xs font-semibold text-[#78716C] hover:text-[#292524] flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="http://127.0.0.1:11434"
              className="flex-1 bg-[#FAF7F2] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs font-mono text-[#292524] focus:outline-hidden"
            />
            <button
              onClick={handleTestConnection}
              className="px-4 py-2 bg-[#3D342F] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-[#2A2320]"
            >
              Save URL
            </button>
          </div>

          {/* Status Message */}
          <div
            className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              ollamaStatus.running
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {ollamaStatus.running ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">
                {ollamaStatus.running
                  ? `Connected successfully! (${ollamaStatus.models.length} local model${
                      ollamaStatus.models.length === 1 ? '' : 's'
                    } installed)`
                  : 'Ollama local server is not detected on this address'}
              </div>
              <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                {ollamaStatus.running
                  ? `Active model: ${ollamaStatus.activeModel}`
                  : ollamaStatus.error ||
                    'Please make sure Ollama is installed on your computer and the service is started.'}
              </div>
            </div>
          </div>
        </div>

        {/* Model Selection */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EAE5DC] shadow-xs mb-5">
          <label className="text-xs font-bold text-[#292524] block mb-2">
            Selected Ollama Model
          </label>

          {ollamaStatus.models.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
              {ollamaStatus.models.map((m) => {
                const isSelected = ollamaStatus.activeModel === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => handleApplyModel(m.name)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#3D342F] text-white border-[#3D342F] shadow-2xs'
                        : 'bg-[#FAF7F2] border-[#EAE5DC] text-[#44403C] hover:bg-white'
                    }`}
                  >
                    <div className="font-bold truncate">{m.name}</div>
                    {m.size && (
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {Math.round(m.size / 1024 / 1024 / 102) / 10} GB
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EAE5DC] text-xs text-[#78716C] mb-3">
              No downloaded models detected yet. Pull a recommended model using the terminal commands below.
            </div>
          )}

          {/* Custom model input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customModelInput}
              onChange={(e) => setCustomModelInput(e.target.value)}
              placeholder={`Or specify model (e.g. llama3.2, gemma2:2b, mistral)`}
              className="flex-1 bg-[#FAF7F2] border border-[#EAE5DC] rounded-xl px-3 py-2 text-xs text-[#292524] focus:outline-hidden"
            />
            <button
              onClick={() => {
                if (customModelInput.trim()) {
                  handleApplyModel(customModelInput.trim());
                  setCustomModelInput('');
                }
              }}
              className="px-4 py-2 bg-[#EAE5DC] hover:bg-[#DDD6CA] text-[#44403C] text-xs font-bold rounded-xl cursor-pointer"
            >
              Set Model
            </button>
          </div>
        </div>

        {/* Step-by-Step Setup Guide */}
        <div className="bg-white rounded-2xl p-4.5 border border-[#EAE5DC] shadow-xs mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#292524] mb-3">
            <Terminal className="w-4 h-4 text-[#E87A5D]" />
            <span>How to Install & Run Ollama on Your Machine</span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Install */}
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#44403C] mb-1">
                <span>1. Install Ollama (Linux / Mac / Windows)</span>
                <button
                  onClick={() => handleCopy('curl -fsSL https://ollama.com/install.sh | sh')}
                  className="text-[11px] text-[#78716C] hover:text-[#292524] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'curl -fsSL https://ollama.com/install.sh | sh' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-[11px] font-mono text-[#292524] block bg-white px-2.5 py-1.5 rounded-lg border border-[#EAE5DC]">
                curl -fsSL https://ollama.com/install.sh | sh
              </code>
            </div>

            {/* Step 2: Download Model */}
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#44403C] mb-1">
                <span>2. Download Recommended Student Model</span>
                <button
                  onClick={() => handleCopy('ollama pull llama3.2')}
                  className="text-[11px] text-[#78716C] hover:text-[#292524] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'ollama pull llama3.2' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-[11px] font-mono text-[#292524] block bg-white px-2.5 py-1.5 rounded-lg border border-[#EAE5DC]">
                ollama pull llama3.2
              </code>
              <p className="text-[10px] text-[#78716C] mt-1">
                *For lightweight devices with less RAM, use: <code className="font-mono">ollama pull gemma2:2b</code> (1.6 GB)
              </p>
            </div>

            {/* Step 3: Start Service */}
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#44403C] mb-1">
                <span>3. Start Ollama Service</span>
                <button
                  onClick={() => handleCopy('ollama serve')}
                  className="text-[11px] text-[#78716C] hover:text-[#292524] flex items-center gap-1 cursor-pointer"
                >
                  {copiedCmd === 'ollama serve' ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>Copy</span>
                </button>
              </div>
              <code className="text-[11px] font-mono text-[#292524] block bg-white px-2.5 py-1.5 rounded-lg border border-[#EAE5DC]">
                ollama serve
              </code>
            </div>
          </div>
        </div>

        {/* Offline Features Matrix */}
        <div className="bg-[#FAF7F2] p-4.5 rounded-2xl border border-[#EAE5DC] text-xs">
          <div className="font-bold text-[#292524] mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Features Available 100% Offline:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#44403C] text-[11px]">
            <div>✅ AI Tutor Conversations (via Ollama)</div>
            <div>✅ Downloaded PDFs & Note History</div>
            <div>✅ Practice Quizzes (Local Question Bank)</div>
            <div>✅ Flowcharts, Diagrams & Notes</div>
            <div>✅ Study Roadmap & Deadlines</div>
            <div className="text-[#A8A29E]">⚠️ YouTube Video Streams (Requires Internet)</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-5 pt-3 border-t border-[#EAE5DC]">
          <button
            onClick={() => setIsOllamaModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-[#3D342F] text-white text-xs font-bold cursor-pointer hover:bg-[#2A2320]"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};
