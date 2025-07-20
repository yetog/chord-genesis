import React from 'react';
import { Music2, Volume2 } from 'lucide-react';
import { Melody } from '../types/music';

interface MelodyDisplayProps {
  melody: Melody;
  isPlaying?: boolean;
  currentNoteIndex?: number;
  onNoteHover?: (noteIndex: number) => void;
}

export default function MelodyDisplay({ 
  melody, 
  isPlaying = false, 
  currentNoteIndex = -1,
  onNoteHover 
}: MelodyDisplayProps) {
  const getNoteName = (midiNote: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    return `${noteNames[midiNote % 12]}${octave}`;
  };

  const getRelativeHeight = (midiNote: number): number => {
    const minNote = Math.min(...melody.notes.map(n => n.midiNote));
    const maxNote = Math.max(...melody.notes.map(n => n.midiNote));
    const range = maxNote - minNote || 1;
    return ((midiNote - minNote) / range) * 100;
  };

  const getRelativeWidth = (duration: number): number => {
    const maxDuration = Math.max(...melody.notes.map(n => n.duration));
    return (duration / maxDuration) * 100;
  };

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg">
          <Music2 className="w-5 h-5 text-blue-600" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">Generated Melody</h3>
        {isPlaying && (
          <div className="flex items-center gap-2 text-blue-600">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">Playing</span>
          </div>
        )}
      </div>

      {/* Melody Visualization */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-4 mb-4 overflow-x-auto">
        <div className="relative h-32 min-w-full">
          {melody.notes.map((note, index) => {
            const leftPosition = (note.startTime / melody.length) * 100;
            const width = (note.duration / melody.length) * 100;
            const bottomPosition = getRelativeHeight(note.midiNote);
            const isCurrentNote = currentNoteIndex === index;
            
            return (
              <div
                key={index}
                onMouseEnter={() => onNoteHover?.(index)}
                className={`
                  absolute rounded-md cursor-pointer transition-all duration-200 group
                  ${isCurrentNote 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg scale-110 z-10' 
                    : 'bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 hover:scale-105'
                  }
                `}
                style={{
                  left: `${leftPosition}%`,
                  bottom: `${bottomPosition}%`,
                  width: `${Math.max(width, 2)}%`,
                  height: '12px',
                }}
                title={`${getNoteName(note.midiNote)} - ${note.duration.toFixed(2)} beats`}
              >
                {/* Note label on hover */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 dark:bg-slate-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                  {getNoteName(note.midiNote)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Grid lines for reference */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map(position => (
            <div
              key={position}
              className="absolute w-px bg-slate-300/50 dark:bg-slate-500/50"
              style={{ left: `${position}%`, top: 0, bottom: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Melody Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{melody.notes.length}</div>
          <div className="text-slate-600 dark:text-slate-400">Notes</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{melody.length}</div>
          <div className="text-slate-600 dark:text-slate-400">Beats</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            {getNoteName(Math.min(...melody.notes.map(n => n.midiNote)))} - {getNoteName(Math.max(...melody.notes.map(n => n.midiNote)))}
          </div>
          <div className="text-slate-600 dark:text-slate-400">Range</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-slate-900 dark:text-slate-100">{melody.key} {melody.scale}</div>
          <div className="text-slate-600 dark:text-slate-400">Key/Scale</div>
        </div>
      </div>
    </div>
  );
}