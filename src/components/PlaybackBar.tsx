import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat } from 'lucide-react';

interface PlaybackBarProps {
  isPlaying: boolean;
  isLooping?: boolean;
  currentChordIndex: number;
  totalChords: number;
  onPlay: () => void;
  onToggleLoop?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  masterVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

export default function PlaybackBar({
  isPlaying,
  isLooping = false,
  currentChordIndex,
  totalChords,
  onPlay,
  onToggleLoop,
  onPrevious,
  onNext,
  tempo = 120,
  onTempoChange,
  masterVolume = 0.6,
  onVolumeChange
}: PlaybackBarProps) {
  const progress = totalChords > 0 ? (currentChordIndex + 1) / totalChords : 0;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-amber-500" />
          Playback
        </h3>
        
        {/* Tempo Control */}
        {onTempoChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">BPM:</span>
            <input
              type="range"
              min="60"
              max="200"
              value={tempo}
              onChange={(e) => onTempoChange(parseInt(e.target.value))}
              className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono text-slate-700 w-8">{tempo}</span>
          </div>
        )}
        
        {/* Volume Control */}
        {onVolumeChange && (
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-slate-600" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm font-mono text-slate-700 w-8">{Math.round(masterVolume * 100)}%</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>Chord {currentChordIndex + 1}</span>
          <span>{totalChords} total</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3">
        {onPrevious && (
          <button
            onClick={onPrevious}
            className="p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors duration-200 disabled:opacity-50"
            disabled={currentChordIndex <= 0}
          >
            <SkipBack className="w-4 h-4 text-slate-700" />
          </button>
        )}

        <button
          onClick={onPlay}
          className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        {/* Loop Toggle */}
        {onToggleLoop && (
          <button
            onClick={onToggleLoop}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isLooping 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-white/60 hover:bg-white/80 text-slate-700'
            }`}
            title={isLooping ? 'Disable loop' : 'Enable loop'}
          >
            <Repeat className={`w-4 h-4 ${isLooping ? 'animate-pulse' : ''}`} />
          </button>
        )}

        {onNext && (
          <button
            onClick={onNext}
            className="p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors duration-200 disabled:opacity-50"
            disabled={currentChordIndex >= totalChords - 1}
          >
            <SkipForward className="w-4 h-4 text-slate-700" />
          </button>
        )}
      </div>

      {/* Loop Indicator */}
      {isLooping && (
        <div className="mt-3 text-center">
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-full">
            🔄 Loop Mode Active
          </span>
        </div>
      )}
    </div>
  );
}