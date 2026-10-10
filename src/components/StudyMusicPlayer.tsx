import React, { useState, useEffect } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  ChevronDown,
  X,
  Sliders,
  Check,
  Disc,
} from 'lucide-react';
import {
  audioService,
  STUDY_MUSIC_TRACKS,
  StudyMusicTrack,
} from '../services/soundEffects';

interface StudyMusicPlayerProps {
  className?: string;
}

export const StudyMusicPlayer: React.FC<StudyMusicPlayerProps> = ({ className = '' }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(audioService.isMusicActive());
  const [currentTrack, setCurrentTrack] = useState<StudyMusicTrack>(audioService.getCurrentTrack());
  const [volume, setVolume] = useState<number>(audioService.getVolume());
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [prevVolume, setPrevVolume] = useState<number>(volume);

  useEffect(() => {
    const unsubscribe = audioService.subscribeMusicState((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTrack(state.track);
      setVolume(state.volume);
    });
    return () => unsubscribe();
  }, []);

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const active = audioService.toggleMusic();
    setIsPlaying(active);
  };

  const handleSelectTrack = (trackId: StudyMusicTrack) => {
    audioService.setTrack(trackId);
    setCurrentTrack(trackId);
    if (!isPlaying) {
      audioService.startMusic();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
    audioService.setVolume(newVol);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      const restored = prevVolume > 0 ? prevVolume : 0.35;
      setIsMuted(false);
      setVolume(restored);
      audioService.setVolume(restored);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      setVolume(0);
      audioService.setVolume(0);
    }
  };

  const activeTrackInfo = STUDY_MUSIC_TRACKS.find((t) => t.id === currentTrack) || STUDY_MUSIC_TRACKS[0];

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Header Pill Button */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
            isPlaying
              ? 'bg-[#3D342F] text-white border-[#3D342F] ring-2 ring-[#E87A5D]/40'
              : 'bg-white hover:bg-[#FAF7F2] text-[#44403C] border-[#EAE5DC] hover:border-[#DDD6CA]'
          }`}
          title="Turn on relaxing study background music"
        >
          {/* Animated Music Equalizer Bars */}
          <div className="flex items-end gap-0.5 h-3.5 w-3.5 justify-center">
            {isPlaying ? (
              <>
                <span className="w-1 bg-[#E87A5D] rounded-full animate-pulse h-3" />
                <span
                  className="w-1 bg-white rounded-full animate-pulse h-2"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1 bg-[#E87A5D] rounded-full animate-pulse h-3.5"
                  style={{ animationDelay: '300ms' }}
                />
              </>
            ) : (
              <Music className="w-3.5 h-3.5 text-[#E87A5D]" />
            )}
          </div>

          <span className="truncate max-w-[130px] sm:max-w-none">
            {isPlaying ? `Music: ${activeTrackInfo.title.split(' ')[0]}...` : 'Relaxing Music'}
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 text-[#A8A29E] transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Quick Play/Pause icon button next to pill */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`w-9 h-9 rounded-2xl border flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0 ${
            isPlaying
              ? 'bg-[#E87A5D] text-white border-[#E87A5D] hover:bg-[#d66b4f]'
              : 'bg-white text-[#78716C] border-[#EAE5DC] hover:text-[#292524] hover:bg-[#FAF7F2]'
          }`}
          title={isPlaying ? 'Pause background music' : 'Play relaxing background music'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>

      {/* Popover Music Player Controller */}
      {isOpen && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 z-40 sm:hidden bg-black/20"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-12 z-50 w-80 sm:w-88 bg-white rounded-3xl p-5 shadow-2xl border border-[#EAE5DC] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#E87A5D] flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#292524] flex items-center gap-1.5">
                    <span>Relaxing Study Music</span>
                    <Sparkles className="w-3 h-3 text-[#E87A5D]" />
                  </h4>
                  <p className="text-[10px] text-[#78716C]">
                    Calm, generative study ambient soundscapes
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] hover:bg-[#EAE5DC] text-[#78716C] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Currently Playing Card */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                    isPlaying ? 'bg-[#3D342F] text-white shadow-xs' : 'bg-white border border-[#DDD6CA]'
                  }`}
                >
                  {activeTrackInfo.icon}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-[#292524] truncate">
                    {activeTrackInfo.title}
                  </div>
                  <div className="text-[10px] text-[#78716C] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isPlaying ? 'Now Playing' : 'Paused'} • {activeTrackInfo.mood}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0 ${
                  isPlaying
                    ? 'bg-[#3D342F] text-white hover:bg-[#2A2320]'
                    : 'bg-[#E87A5D] text-white hover:bg-[#d66b4f]'
                }`}
                title={isPlaying ? 'Pause music' : 'Start music'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Volume Control */}
            <div className="mb-4 bg-[#FAF7F2]/60 p-3 rounded-2xl border border-[#F0EBE3]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#78716C] mb-2">
                <span className="flex items-center gap-1">
                  <span>Background Volume</span>
                </span>
                <span className="text-[#292524]">{Math.round(volume * 100)}%</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="text-[#78716C] hover:text-[#292524] cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-500" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-[#78716C]" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#3D342F]" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-[#3D342F] h-1.5 bg-[#DDD6CA] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Track Selector List */}
            <div>
              <div className="text-[10px] uppercase font-extrabold text-[#78716C] tracking-wider mb-2 px-1">
                Select Calming Ambient Style
              </div>
              <div className="space-y-1.5">
                {STUDY_MUSIC_TRACKS.map((track) => {
                  const isCurrent = currentTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => handleSelectTrack(track.id)}
                      className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-white border-[#3D342F] ring-1 ring-[#3D342F] shadow-xs'
                          : 'bg-[#FAF7F2]/70 border-[#EAE5DC] hover:bg-white hover:border-[#DDD6CA]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base shrink-0">{track.icon}</span>
                        <div className="truncate">
                          <div className={`text-xs font-bold truncate ${isCurrent ? 'text-[#292524]' : 'text-[#44403C]'}`}>
                            {track.title}
                          </div>
                          <div className="text-[10px] text-[#78716C] truncate">
                            {track.description}
                          </div>
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="w-5 h-5 rounded-full bg-[#3D342F] text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Offline Friendly Footnote */}
            <div className="mt-4 pt-3 border-t border-[#F2ECE1] text-[10px] text-[#78716C] text-center flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Synthesized with Web Audio • 100% Offline Compatible</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
