import React, { useState } from 'react';
import {
  Play,
  ExternalLink,
  Clock,
  BookOpen,
  Filter,
  Sparkles,
  X,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { RECOMMENDED_VIDEOS } from '../data/initialData';
import { useStudent } from '../context/StudentContext';
import { VideoRecommendation } from '../types';

export const VideosView: React.FC = () => {
  const { student, isOfflineMode, isBrowserOnline } = useStudent();
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [playingVideo, setPlayingVideo] = useState<VideoRecommendation | null>(null);

  const isDisconnected = isOfflineMode || !isBrowserOnline;

  const filtered = RECOMMENDED_VIDEOS.filter((v) => {
    if (selectedSubject !== 'All' && v.subject !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#292524] py-8 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-5xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#292524]">
              Personalized Video Lectures
            </h1>
            <p className="text-xs text-[#78716C] mt-1">
              Curated high-yield video lectures matching your weak topics and semester subjects
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#78716C] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Subject:</span>
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-white border border-[#EAE5DC] rounded-xl px-3 py-1.5 text-xs text-[#292524] font-medium"
            >
              <option value="All">All Subjects</option>
              <option value="DBMS">DBMS</option>
              <option value="Python Programming">Python Programming</option>
              <option value="Operating Systems">Operating Systems</option>
            </select>
          </div>
        </div>

        {/* Offline Notice Banner if Disconnected */}
        {isDisconnected && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4.5 mb-6 flex items-start gap-3 text-xs text-amber-900">
            <WifiOff className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Offline Mode Active - Streaming Notice</div>
              <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                Video details, topics, and titles are cached for your reference. However, streaming live YouTube playback requires an active internet connection. All study notes, diagrams, and offline quizzes remain 100% accessible.
              </p>
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vid) => (
            <div
              key={vid.id}
              className="bg-white rounded-3xl border border-[#EAE5DC] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail container with play button */}
                <div
                  onClick={() => {
                    if (!isDisconnected) {
                      setPlayingVideo(vid);
                    }
                  }}
                  className={`relative aspect-video bg-stone-900 overflow-hidden ${
                    isDisconnected ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                  }`}
                >
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      disabled={isDisconnected}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-transform ${
                        isDisconnected
                          ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                          : 'bg-white/90 text-rose-600 group-hover:scale-110 cursor-pointer'
                      }`}
                    >
                      {isDisconnected ? (
                        <WifiOff className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 fill-rose-600 ml-0.5" />
                      )}
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{vid.duration}</span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#78716C] mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF7F2] text-[#44403C]">
                      {vid.subject}
                    </span>
                    <span>{vid.channel}</span>
                  </div>

                  <h3 className="text-sm font-bold text-[#292524] leading-snug line-clamp-2 mb-3">
                    {vid.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {vid.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#FAF7F2] text-[#78716C] px-2 py-0.5 rounded-md"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-[#F2ECE1]">
                {!isDisconnected ? (
                  <>
                    <button
                      onClick={() => setPlayingVideo(vid)}
                      className="text-xs font-bold text-[#3D342F] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#3D342F]" />
                      <span>Watch In App</span>
                    </button>

                    <a
                      href={vid.watchUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#78716C] hover:text-[#292524] flex items-center gap-1"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-[#78716C] italic flex items-center gap-1 py-1">
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>Playback requires internet</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* In-app Video Player Modal */}
        {playingVideo && !isDisconnected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-2xs p-4">
            <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between p-4 border-b border-[#EAE5DC] bg-white">
                <div>
                  <h3 className="text-sm font-bold text-[#292524] line-clamp-1">
                    {playingVideo.title}
                  </h3>
                  <p className="text-xs text-[#78716C]">
                    {playingVideo.channel} • {playingVideo.subject}
                  </p>
                </div>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="w-8 h-8 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#78716C] hover:text-[#292524] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                  title={playingVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <span className="text-xs text-[#78716C]">
                  Language: {playingVideo.language} • Level: {playingVideo.difficulty}
                </span>
                <a
                  href={playingVideo.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#3D342F] text-white text-xs font-bold hover:bg-[#2A2320] flex items-center gap-1.5"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
