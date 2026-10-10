import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code2,
  CheckCircle,
  Play,
  Printer,
  Layers,
  ArrowRight,
  Check,
  Loader2,
  FileText,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { COLORFUL_NOTES } from '../data/initialData';
import { useStudent } from '../context/StudentContext';
import { NoteItem, DownloadedPdf } from '../types';
import { generateNotePdf } from '../services/pdfGenerator';
import { StudyMusicPlayer } from './StudyMusicPlayer';

export const NotesView: React.FC = () => {
  const {
    student,
    setActiveView,
    isOfflineMode,
    isBrowserOnline,
    downloadedPdfs,
    refreshDownloadedPdfs,
    activeNoteFilter,
  } = useStudent();

  const [selectedNote, setSelectedNote] = useState<NoteItem>(() => {
    if (activeNoteFilter?.noteId) {
      const found = COLORFUL_NOTES.find((n) => n.id === activeNoteFilter.noteId);
      if (found) return found;
    }
    if (activeNoteFilter?.subject) {
      const found = COLORFUL_NOTES.find((n) => n.subject === activeNoteFilter.subject);
      if (found) return found;
    }
    return COLORFUL_NOTES[0];
  });

  const [activeTab, setActiveTab] = useState<'all' | 'DBMS' | 'Python Programming' | 'Operating Systems'>(() => {
    if (activeNoteFilter?.subject) {
      return activeNoteFilter.subject as any;
    }
    return 'all';
  });

  // Automatically switch tab and selected note when navigated via voice agent or search
  React.useEffect(() => {
    if (activeNoteFilter) {
      if (activeNoteFilter.noteId) {
        const found = COLORFUL_NOTES.find((n) => n.id === activeNoteFilter.noteId);
        if (found) {
          setSelectedNote(found);
          setActiveTab(found.subject as any);
          return;
        }
      }
      if (activeNoteFilter.subject) {
        setActiveTab(activeNoteFilter.subject as any);
        const found = COLORFUL_NOTES.find((n) => n.subject === activeNoteFilter.subject);
        if (found) setSelectedNote(found);
      }
    }
  }, [activeNoteFilter]);

  // Ensure selected note matches active tab when tab is explicitly switched
  const handleTabChange = (tab: 'all' | 'DBMS' | 'Python Programming' | 'Operating Systems') => {
    setActiveTab(tab);
    if (tab !== 'all' && selectedNote.subject !== tab) {
      const match = COLORFUL_NOTES.find((n) => n.subject === tab);
      if (match) setSelectedNote(match);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);
  const [pdfErrorMessage, setPdfErrorMessage] = useState<string | null>(null);

  const noteContentRef = useRef<HTMLDivElement>(null);

  const filteredNotes = COLORFUL_NOTES.filter((n) => {
    if (activeTab === 'all') return true;
    return n.subject === activeTab;
  });

  const handleDownloadPdf = async () => {
    if (!noteContentRef.current) return;

    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);
    setPdfErrorMessage(null);

    const result = await generateNotePdf(
      noteContentRef.current,
      selectedNote.title,
      selectedNote.subject,
      selectedNote.level
    );

    setIsGeneratingPdf(false);

    if (result.success) {
      setPdfSuccessMessage(`"${result.filename}" (${result.fileSizeKb} KB) downloaded successfully! Cached for offline viewing.`);
      refreshDownloadedPdfs();
      setTimeout(() => setPdfSuccessMessage(null), 6000);
    } else {
      setPdfErrorMessage(result.error || 'Failed to generate PDF document.');
      setTimeout(() => setPdfErrorMessage(null), 5000);
    }
  };

  // Render educational interactive SVGs
  const renderDiagram = (type: NoteItem['diagramType']) => {
    switch (type) {
      case 'acid-flow':
        return (
          <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE5DC] overflow-x-auto">
            <svg viewBox="0 0 760 260" className="w-full min-w-[650px] text-xs font-sans">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#3D342F" />
                </marker>
              </defs>

              {/* Start State */}
              <circle cx="50" cy="130" r="22" fill="#3D342F" />
              <text x="50" y="134" fill="#FAF7F2" fontWeight="bold" textAnchor="middle" fontSize="11">Start</text>

              {/* Line to Active */}
              <line x1="75" y1="130" x2="130" y2="130" stroke="#3D342F" strokeWidth="2.5" markerEnd="url(#arrow)" />

              {/* Active State */}
              <rect x="135" y="95" width="120" height="70" rx="14" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <text x="195" y="125" fill="#292524" fontWeight="bold" textAnchor="middle" fontSize="13">ACTIVE</text>
              <text x="195" y="145" fill="#78716C" textAnchor="middle" fontSize="10">Executing read/write</text>

              {/* Active -> Partially Committed */}
              <path d="M 255 110 L 340 80" stroke="#16A34A" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
              <text x="300" y="85" fill="#16A34A" fontWeight="bold" fontSize="10">End of Operations</text>

              {/* Active -> Failed */}
              <path d="M 255 150 L 340 180" stroke="#DC2626" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
              <text x="300" y="180" fill="#DC2626" fontWeight="bold" fontSize="10">Error / Exception</text>

              {/* Partially Committed State */}
              <rect x="345" y="50" width="150" height="65" rx="14" fill="#F0FDF4" stroke="#16A34A" strokeWidth="2" />
              <text x="420" y="80" fill="#15803D" fontWeight="bold" textAnchor="middle" fontSize="12">PARTIALLY COMMITTED</text>
              <text x="420" y="98" fill="#166534" textAnchor="middle" fontSize="10">Final state check</text>

              {/* Failed State */}
              <rect x="345" y="150" width="150" height="65" rx="14" fill="#FEF2F2" stroke="#DC2626" strokeWidth="2" />
              <text x="420" y="180" fill="#B91C1C" fontWeight="bold" textAnchor="middle" fontSize="12">FAILED</text>
              <text x="420" y="198" fill="#991B1B" textAnchor="middle" fontSize="10">Rollback triggered</text>

              {/* Partially Committed -> Committed */}
              <line x1="495" y1="82" x2="575" y2="82" stroke="#16A34A" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Committed State */}
              <rect x="580" y="50" width="140" height="65" rx="14" fill="#15803D" stroke="#166534" strokeWidth="2" />
              <text x="650" y="82" fill="#FFFFFF" fontWeight="bold" textAnchor="middle" fontSize="13">COMMITTED</text>
              <text x="650" y="100" fill="#DCFCE7" textAnchor="middle" fontSize="10">Durability WAL saved</text>

              {/* Failed -> Aborted */}
              <line x1="495" y1="182" x2="575" y2="182" stroke="#DC2626" strokeWidth="2" markerEnd="url(#arrow)" />

              {/* Aborted State */}
              <rect x="580" y="150" width="140" height="65" rx="14" fill="#B91C1C" stroke="#991B1B" strokeWidth="2" />
              <text x="650" y="182" fill="#FFFFFF" fontWeight="bold" textAnchor="middle" fontSize="13">ABORTED</text>
              <text x="650" y="200" fill="#FEE2E2" textAnchor="middle" fontSize="10">Full rollback restored</text>
            </svg>
          </div>
        );

      case 'normalization-stages':
        return (
          <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE5DC] overflow-x-auto">
            <svg viewBox="0 0 760 220" className="w-full min-w-[650px] text-xs font-sans">
              {/* Stage 1NF */}
              <rect x="20" y="40" width="150" height="130" rx="16" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <circle cx="45" cy="65" r="14" fill="#3D342F" />
              <text x="45" y="70" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">1</text>
              <text x="95" y="70" fill="#292524" fontWeight="bold" fontSize="14">1NF</text>
              <text x="35" y="105" fill="#44403C" fontSize="11" fontWeight="600">• Atomic Values Only</text>
              <text x="35" y="125" fill="#78716C" fontSize="10">• No multi-valued sets</text>
              <text x="35" y="145" fill="#78716C" fontSize="10">• Defined primary key</text>

              <line x1="175" y1="105" x2="205" y2="105" stroke="#3D342F" strokeWidth="2.5" markerEnd="url(#arrow)" />

              {/* Stage 2NF */}
              <rect x="210" y="40" width="150" height="130" rx="16" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <circle cx="235" cy="65" r="14" fill="#3D342F" />
              <text x="235" y="70" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">2</text>
              <text x="285" y="70" fill="#292524" fontWeight="bold" fontSize="14">2NF</text>
              <text x="225" y="105" fill="#44403C" fontSize="11" fontWeight="600">• Must be in 1NF</text>
              <text x="225" y="125" fill="#B91C1C" fontSize="10" fontWeight="600">• NO Partial Dependency</text>
              <text x="225" y="145" fill="#78716C" fontSize="10">• Full functional dep.</text>

              <line x1="365" y1="105" x2="395" y2="105" stroke="#3D342F" strokeWidth="2.5" markerEnd="url(#arrow)" />

              {/* Stage 3NF */}
              <rect x="400" y="40" width="150" height="130" rx="16" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <circle cx="425" cy="65" r="14" fill="#3D342F" />
              <text x="425" y="70" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">3</text>
              <text x="475" y="70" fill="#292524" fontWeight="bold" fontSize="14">3NF</text>
              <text x="415" y="105" fill="#44403C" fontSize="11" fontWeight="600">• Must be in 2NF</text>
              <text x="415" y="125" fill="#B91C1C" fontSize="10" fontWeight="600">• NO Transitive Dep.</text>
              <text x="415" y="145" fill="#78716C" fontSize="10">• Non-prime independence</text>

              <line x1="555" y1="105" x2="585" y2="105" stroke="#3D342F" strokeWidth="2.5" markerEnd="url(#arrow)" />

              {/* Stage BCNF */}
              <rect x="590" y="40" width="150" height="130" rx="16" fill="#FDF6EB" stroke="#D97706" strokeWidth="2.5" />
              <circle cx="615" cy="65" r="14" fill="#D97706" />
              <text x="615" y="70" fill="#FFFFFF" fontWeight="bold" textAnchor="middle">★</text>
              <text x="665" y="70" fill="#92400E" fontWeight="bold" fontSize="14">BCNF</text>
              <text x="605" y="105" fill="#92400E" fontSize="11" fontWeight="bold">• 3.5NF Strictest</text>
              <text x="605" y="125" fill="#78716C" fontSize="10">For every X → Y,</text>
              <text x="605" y="145" fill="#B45309" fontSize="10" fontWeight="bold">X must be a SUPERKEY</text>
            </svg>
          </div>
        );

      case 'sql-joins':
        return (
          <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE5DC] overflow-x-auto">
            <svg viewBox="0 0 760 180" className="w-full min-w-[650px] text-xs font-sans">
              {/* INNER JOIN */}
              <g transform="translate(10, 20)">
                <circle cx="50" cy="60" r="45" fill="#FAF7F2" stroke="#3D342F" strokeWidth="2" />
                <circle cx="95" cy="60" r="45" fill="#FAF7F2" stroke="#3D342F" strokeWidth="2" />
                <path d="M 72.5 23 A 45 45 0 0 1 72.5 97 A 45 45 0 0 1 72.5 23" fill="#E87A5D" />
                <text x="72.5" y="130" textAnchor="middle" fontWeight="bold" fill="#292524" fontSize="12">INNER JOIN</text>
                <text x="72.5" y="148" textAnchor="middle" fill="#78716C" fontSize="10">Exact matches only</text>
              </g>

              {/* LEFT JOIN */}
              <g transform="translate(200, 20)">
                <circle cx="50" cy="60" r="45" fill="#E87A5D" stroke="#3D342F" strokeWidth="2" />
                <circle cx="95" cy="60" r="45" fill="#FAF7F2" stroke="#3D342F" strokeWidth="2" opacity="0.9" />
                <path d="M 72.5 23 A 45 45 0 0 1 72.5 97 A 45 45 0 0 1 72.5 23" fill="#E87A5D" />
                <text x="72.5" y="130" textAnchor="middle" fontWeight="bold" fill="#292524" fontSize="12">LEFT JOIN</text>
                <text x="72.5" y="148" textAnchor="middle" fill="#78716C" fontSize="10">All Left + Right NULLs</text>
              </g>

              {/* RIGHT JOIN */}
              <g transform="translate(390, 20)">
                <circle cx="50" cy="60" r="45" fill="#FAF7F2" stroke="#3D342F" strokeWidth="2" />
                <circle cx="95" cy="60" r="45" fill="#E87A5D" stroke="#3D342F" strokeWidth="2" />
                <text x="72.5" y="130" textAnchor="middle" fontWeight="bold" fill="#292524" fontSize="12">RIGHT JOIN</text>
                <text x="72.5" y="148" textAnchor="middle" fill="#78716C" fontSize="10">All Right + Left NULLs</text>
              </g>

              {/* FULL OUTER JOIN */}
              <g transform="translate(580, 20)">
                <circle cx="50" cy="60" r="45" fill="#E87A5D" stroke="#3D342F" strokeWidth="2" opacity="0.8" />
                <circle cx="95" cy="60" r="45" fill="#E87A5D" stroke="#3D342F" strokeWidth="2" opacity="0.8" />
                <text x="72.5" y="130" textAnchor="middle" fontWeight="bold" fill="#292524" fontSize="12">FULL OUTER JOIN</text>
                <text x="72.5" y="148" textAnchor="middle" fill="#78716C" fontSize="10">All records both sides</text>
              </g>
            </svg>
          </div>
        );

      case 'python-memory':
        return (
          <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE5DC] overflow-x-auto">
            <svg viewBox="0 0 760 210" className="w-full min-w-[650px] text-xs font-sans">
              <rect x="30" y="30" width="180" height="150" rx="14" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <text x="120" y="55" textAnchor="middle" fontWeight="bold" fill="#292524">STACK MEMORY</text>
              <rect x="45" y="70" width="150" height="35" rx="8" fill="#FAF7F2" stroke="#EAE5DC" />
              <text x="55" y="92" fontSize="11" fontWeight="bold">variable 'a'</text>
              <rect x="45" y="120" width="150" height="35" rx="8" fill="#FAF7F2" stroke="#EAE5DC" />
              <text x="55" y="142" fontSize="11" fontWeight="bold">variable 'b'</text>

              {/* Pointers to Heap */}
              <line x1="195" y1="87" x2="310" y2="87" stroke="#E87A5D" strokeWidth="2.5" markerEnd="url(#arrow)" />
              <path d="M 195 137 L 250 137 L 310 97" stroke="#E87A5D" strokeWidth="2.5" markerEnd="url(#arrow)" fill="none" />

              {/* HEAP */}
              <rect x="320" y="30" width="410" height="150" rx="14" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <text x="525" y="55" textAnchor="middle" fontWeight="bold" fill="#292524">HEAP MEMORY (PyObject)</text>

              <rect x="340" y="70" width="370" height="90" rx="10" fill="#F0FDF4" stroke="#16A34A" strokeWidth="1.5" />
              <text x="355" y="95" fontWeight="bold" fill="#15803D" fontSize="12">PyObject List [1, 2, 3]</text>
              <text x="355" y="115" fontSize="11" fill="#44403C">ob_refcnt = 2 (referenced by both 'a' and 'b')</text>
              <text x="355" y="135" fontSize="11" fill="#78716C">ob_type = &PyList_Type (Dynamic Type Pointer)</text>
              <text x="355" y="152" fontSize="10" fill="#166534">Automatic garbage collection frees memory when ob_refcnt == 0</text>
            </svg>
          </div>
        );

      case 'process-states':
      default:
        return (
          <div className="w-full bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAE5DC] overflow-x-auto">
            <svg viewBox="0 0 760 210" className="w-full min-w-[650px] text-xs font-sans">
              {/* New */}
              <rect x="30" y="80" width="100" height="50" rx="12" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <text x="80" y="110" textAnchor="middle" fontWeight="bold">NEW</text>

              <line x1="135" y1="105" x2="195" y2="105" stroke="#3D342F" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="165" y="98" textAnchor="middle" fill="#78716C" fontSize="9">Admitted</text>

              {/* Ready */}
              <rect x="200" y="80" width="110" height="50" rx="12" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
              <text x="255" y="110" textAnchor="middle" fontWeight="bold" fill="#0369A1">READY</text>

              {/* Dispatch to Running */}
              <line x1="315" y1="95" x2="395" y2="95" stroke="#3D342F" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="355" y="88" textAnchor="middle" fill="#15803D" fontSize="9" fontWeight="bold">Dispatch</text>

              {/* Preemption from Running to Ready */}
              <path d="M 400 120 L 320 120" stroke="#E11D48" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="360" y="135" textAnchor="middle" fill="#E11D48" fontSize="9" fontWeight="bold">Interrupt / Time Slice</text>

              {/* Running */}
              <rect x="400" y="80" width="110" height="50" rx="12" fill="#DCFCE7" stroke="#16A34A" strokeWidth="2" />
              <text x="455" y="110" textAnchor="middle" fontWeight="bold" fill="#15803D">RUNNING</text>

              {/* Running to Terminated */}
              <line x1="515" y1="105" x2="595" y2="105" stroke="#3D342F" strokeWidth="2" markerEnd="url(#arrow)" />
              <text x="555" y="98" textAnchor="middle" fill="#78716C" fontSize="9">Exit</text>

              {/* Terminated */}
              <rect x="600" y="80" width="120" height="50" rx="12" fill="#FFFFFF" stroke="#3D342F" strokeWidth="2" />
              <text x="660" y="110" textAnchor="middle" fontWeight="bold">TERMINATED</text>

              {/* Running to Waiting */}
              <path d="M 455 135 L 455 170 L 380 170" stroke="#D97706" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
              <text x="470" y="160" fill="#D97706" fontSize="9">I/O Wait</text>

              {/* Waiting */}
              <rect x="250" y="150" width="120" height="45" rx="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
              <text x="310" y="177" textAnchor="middle" fontWeight="bold" fill="#92400E">WAITING / I/O</text>

              {/* Waiting to Ready */}
              <path d="M 250 170 L 170 170 L 220 135" stroke="#0284C7" strokeWidth="2" markerEnd="url(#arrow)" fill="none" />
              <text x="180" y="160" fill="#0284C7" fontSize="9">I/O Done</text>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#292524]">
              Colorful Notes & Visual Flowcharts
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Structured learning notes with highlighted definitions, step-by-step visuals, and offline PDF generation
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <StudyMusicPlayer />
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2.5 rounded-2xl bg-[#3D342F] text-white hover:bg-[#2A2320] text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              title="Generate and download complete note as PDF"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Notes (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* PDF Status Notification Banners */}
        {pdfSuccessMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{pdfSuccessMessage}</span>
          </div>
        )}

        {pdfErrorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{pdfErrorMessage}</span>
          </div>
        )}

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {(['all', 'DBMS', 'Python Programming', 'Operating Systems'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab
                  ? 'bg-[#3D342F] text-white shadow-xs'
                  : 'bg-white border border-[#EAE5DC] text-[#78716C] hover:text-[#292524]'
              }`}
            >
              {tab === 'all' ? 'All Subjects' : tab}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Notes list & Offline Download History */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#78716C] uppercase tracking-wider px-1 mb-2">
                Concept Modules
              </h3>
              <div className="space-y-2.5">
                {filteredNotes.map((note) => {
                  const isSelected = selectedNote.id === note.id;
                  return (
                    <div
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className={`p-4 rounded-3xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#3D342F] ring-1 ring-[#3D342F] shadow-sm'
                          : 'bg-white/70 border-[#EAE5DC] hover:bg-white hover:border-[#DDD6CA]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#78716C] mb-1">
                        <span>{note.subject}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#44403C]">
                          {note.level}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#292524] leading-snug">
                        {note.title}
                      </h4>
                      <p className="text-xs text-[#57534E] line-clamp-2 mt-1 leading-relaxed">
                        {note.summary}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offline Saved / Downloaded PDFs Section */}
            {downloadedPdfs.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-[#EAE5DC] shadow-xs">
                <h4 className="text-xs font-bold text-[#292524] flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-[#3D342F]" />
                  <span>Offline Downloaded PDFs ({downloadedPdfs.length})</span>
                </h4>
                <div className="space-y-2">
                  {downloadedPdfs.slice(0, 4).map((pdf) => (
                    <div
                      key={pdf.id}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between text-[11px]"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-[#292524] truncate">{pdf.title}</div>
                        <div className="text-[10px] text-[#78716C]">{pdf.fileSizeKb} KB • Available Offline</div>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        Saved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Panel: Active Note Details (Captured into PDF) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE5DC] shadow-xs space-y-6">
            {/* The printable/exportable canvas wrapper */}
            <div ref={noteContentRef} className="space-y-6 bg-white p-2">
              {/* Note Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FAF7F2] text-[#3D342F] border border-[#EAE5DC]">
                    {selectedNote.subject}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {selectedNote.level} Level
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold text-[#292524] tracking-tight">
                  {selectedNote.title}
                </h2>
                <p className="text-sm text-[#57534E] mt-2 leading-relaxed">
                  {selectedNote.summary}
                </p>
              </div>

              {/* Educational SVG Diagram */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#292524] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#E87A5D]" />
                    <span>{selectedNote.diagramTitle}</span>
                  </h3>
                </div>
                {renderDiagram(selectedNote.diagramType)}
                <p className="text-xs text-[#78716C] italic">
                  {selectedNote.diagramDescription}
                </p>
              </div>

              {/* Key Principles & Highlights */}
              <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EAE5DC]">
                <h3 className="text-xs font-bold text-[#292524] uppercase tracking-wider mb-3">
                  Key Principles & Highlights
                </h3>
                <ul className="space-y-2">
                  {selectedNote.keyPoints.map((pt, i) => (
                    <li key={i} className="text-xs text-[#44403C] flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Glossary / Definitions */}
              <div>
                <h3 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-3">
                  Formal Definitions & Keywords
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedNote.definitions.map((def, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
                      <div className="text-xs font-bold text-[#292524] mb-1">{def.term}</div>
                      <div className="text-[11px] text-[#57534E] leading-relaxed">{def.definition}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code Snippet if applicable */}
              {selectedNote.codeSnippet && (
                <div>
                  <h3 className="text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#3D342F]" />
                    <span>Practical Code Implementation</span>
                  </h3>
                  <pre className="p-4 rounded-2xl bg-[#292524] text-[#FAF7F2] font-mono text-xs overflow-x-auto leading-relaxed">
                    {selectedNote.codeSnippet.code}
                  </pre>
                </div>
              )}
            </div>

            {/* Verified YouTube Video Card with Offline Detection */}
            <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#EAE5DC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Play className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#78716C] uppercase flex items-center gap-1.5">
                    <span>Recommended Video Lecture</span>
                    {(!isBrowserOnline || isOfflineMode) && (
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                        <WifiOff className="w-2.5 h-2.5" />
                        <span>Needs Internet</span>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[#292524]">
                    {selectedNote.relatedVideoTitle}
                  </div>
                </div>
              </div>

              {isBrowserOnline && !isOfflineMode ? (
                <a
                  href={`https://www.youtube.com/watch?v=${selectedNote.relatedVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] transition-colors flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <span>Watch Video</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl bg-[#EAE5DC] text-[#78716C] text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-not-allowed opacity-80"
                  title="Streaming requires internet connectivity"
                >
                  <span>Requires Internet</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
