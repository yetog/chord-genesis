import React from 'react';
import { Volume2 } from 'lucide-react';
import { Chord } from '../types/music';

interface ChordCardProps {
  chord: Chord;
  index: number;
  isPlaying?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onClick?: () => void;
}

export default function ChordCard({ 
  chord, 
  index, 
  isPlaying, 
  onHover, 
  onHoverEnd, 
  onClick 
}: ChordCardProps) {
  const getChordSymbol = () => {
    let symbol = chord.root;
    
    switch (chord.quality) {
      case 'min':
        symbol += 'm';
        break;
      case 'dim':
        symbol += '°';
        break;
      case 'aug':
        symbol += '+';
        break;
      case 'sus2':
        symbol += 'sus2';
        break;
      case 'sus4':
        symbol += 'sus4';
        break;
    }
    
    if (chord.extensions) {
      symbol += chord.extensions.join('');
    }
    
    return symbol;
  };

  const getChordNotes = () => {
    return chord.midiNotes.map(note => {
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      return noteNames[note % 12];
    }).join(' - ');
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      className={`chord-card group ${isPlaying ? 'playing' : ''}`}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-amber-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Chord index */}
      <div className="absolute top-3 left-3 text-xs font-semibold text-slate-400 bg-white/50 rounded-full w-6 h-6 flex items-center justify-center">
        {index + 1}
      </div>
      
      {/* Audio preview indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Volume2 className="w-4 h-4 text-amber-500" />
      </div>
      
      {/* Chord symbol */}
      <div className="relative z-10 text-center flex flex-col justify-center h-full">
        <div className="text-3xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors duration-300">
          {getChordSymbol()}
        </div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
          {chord.quality === 'maj' ? 'Major' : 
           chord.quality === 'min' ? 'Minor' :
           chord.quality === 'dim' ? 'Diminished' :
           chord.quality === 'aug' ? 'Augmented' :
           chord.quality}
        </div>
        <div className="text-xs text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {getChordNotes()}
        </div>
      </div>

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute bottom-3 right-3">
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}
      
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}