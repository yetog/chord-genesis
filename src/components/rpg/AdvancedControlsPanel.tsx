import React from 'react';
import { Zap, Music2, Drum, Sliders, Sparkles, Ban, User } from 'lucide-react';
import {
  EnergyLevel,
  GrooveType,
  DrumStyle,
  BeatDropType,
  ArtistStyleId,
  ENERGY_OPTIONS,
  GROOVE_OPTIONS,
  DRUM_OPTIONS,
  BEAT_DROP_OPTIONS,
  ARTIST_STYLES,
  INSTRUMENTS,
  Instrument
} from '../../types/music';

interface AdvancedControlsPanelProps {
  energy: EnergyLevel;
  groove: GrooveType;
  drumStyle: DrumStyle;
  instrument: string;
  beatDrop: BeatDropType;
  artistStyle: ArtistStyleId;
  skipMusicStyle: boolean;
  onEnergyChange: (energy: EnergyLevel) => void;
  onGrooveChange: (groove: GrooveType) => void;
  onDrumStyleChange: (style: DrumStyle) => void;
  onInstrumentChange: (instrument: string) => void;
  onBeatDropChange: (drop: BeatDropType) => void;
  onArtistStyleChange: (style: ArtistStyleId) => void;
  onSkipMusicStyleChange: (skip: boolean) => void;
}

export default function AdvancedControlsPanel({
  energy,
  groove,
  drumStyle,
  instrument,
  beatDrop,
  artistStyle,
  skipMusicStyle,
  onEnergyChange,
  onGrooveChange,
  onDrumStyleChange,
  onInstrumentChange,
  onBeatDropChange,
  onArtistStyleChange,
  onSkipMusicStyleChange,
}: AdvancedControlsPanelProps) {

  // When artist style changes, apply preset settings
  const handleArtistStyleChange = (styleId: ArtistStyleId) => {
    onArtistStyleChange(styleId);

    if (styleId === 'none') return;

    const style = ARTIST_STYLES.find(s => s.id === styleId);
    if (style) {
      onEnergyChange(style.energy);
      onGrooveChange(style.groove);
      onDrumStyleChange(style.drumStyle);
    }
  };

  // Group instruments by category
  const instrumentsByCategory = INSTRUMENTS.reduce((acc, inst) => {
    if (!acc[inst.category]) acc[inst.category] = [];
    acc[inst.category].push(inst);
    return acc;
  }, {} as Record<string, Instrument[]>);

  const categoryLabels: Record<string, string> = {
    keys: 'Keys',
    synths: 'Synths',
    pads: 'Pads',
    strings: 'Strings',
    brass: 'Brass',
    other: 'Other'
  };

  return (
    <div className="ff7-panel rounded-2xl p-6 space-y-6 animate-slide-up">
      {/* Panel Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-purple-500/30 to-purple-700/30 rounded-lg">
          <Sliders className="w-5 h-5 text-purple-300" />
        </div>
        <h3 className="font-semibold text-purple-100 text-lg text-glow">Advanced Controls</h3>
        <div className="materia-indicator active ml-auto" />
      </div>

      {/* Skip Music Style Toggle */}
      <div className="flex items-center gap-3 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
        <label className="flex items-center cursor-pointer w-full" aria-label="Use only custom directions">
          <input
            type="checkbox"
            checked={skipMusicStyle}
            onChange={(e) => onSkipMusicStyleChange(e.target.checked)}
            className="sr-only"
          />
          <div className={`
            relative w-12 h-6 rounded-full transition-colors duration-200
            ${skipMusicStyle ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gray-600'}
          `}>
            <div className={`
              absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm
              ${skipMusicStyle ? 'transform translate-x-6' : ''}
            `} />
          </div>
          <span className="ml-3 text-sm font-medium text-purple-200 flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Skip music style (use only custom directions)
          </span>
        </label>
      </div>

      {/* Artist Style Presets */}
      <div>
        <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" />
          Producer Style
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ARTIST_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => handleArtistStyleChange(style.id)}
              className={`p-3 rounded-lg text-left transition-all duration-200 ${
                artistStyle === style.id
                  ? `bg-gradient-to-r ${style.color} text-white shadow-lg`
                  : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 border border-purple-500/30'
              }`}
              aria-pressed={artistStyle === style.id}
              title={style.description}
            >
              <div className="font-medium text-sm">{style.name}</div>
              {style.id !== 'none' && (
                <div className={`text-xs mt-1 ${artistStyle === style.id ? 'text-white/80' : 'text-purple-400'}`}>
                  {style.bpmRange[0]}-{style.bpmRange[1]} BPM
                </div>
              )}
            </button>
          ))}
        </div>
        {artistStyle !== 'none' && (
          <p className="text-xs text-purple-400 mt-2">
            {ARTIST_STYLES.find(s => s.id === artistStyle)?.description}
          </p>
        )}
      </div>

      {/* Energy Level */}
      <div>
        <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Energy Level
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Energy level selection">
          {ENERGY_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onEnergyChange(option.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                energy === option.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 border border-purple-500/30'
              }`}
              role="radio"
              aria-checked={energy === option.id}
              aria-label={`${option.name}: ${option.description}`}
              title={option.description}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Groove Type */}
      <div>
        <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
          <Music2 className="w-4 h-4 text-amber-400" />
          Groove Type
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Groove type selection">
          {GROOVE_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onGrooveChange(option.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                groove === option.id
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 border border-purple-500/30'
              }`}
              role="radio"
              aria-checked={groove === option.id}
              aria-label={`${option.name}: ${option.description}`}
              title={option.description}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column grid for Drum Style and Instrument */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drum Style */}
        <div>
          <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
            <Drum className="w-4 h-4 text-amber-400" />
            Drum Style
          </label>
          <select
            value={drumStyle}
            onChange={(e) => onDrumStyleChange(e.target.value as DrumStyle)}
            className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-amber-500/50 transition-colors"
            aria-label="Select drum style"
          >
            {DRUM_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-purple-400 mt-1">
            {DRUM_OPTIONS.find(d => d.id === drumStyle)?.description}
          </p>
        </div>

        {/* Instrument Selection */}
        <div>
          <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Lead Instrument
          </label>
          <select
            value={instrument}
            onChange={(e) => onInstrumentChange(e.target.value)}
            className="w-full px-4 py-3 bg-purple-900/50 border border-purple-500/30 rounded-lg text-purple-100 focus:outline-none focus:border-amber-500/50 transition-colors"
            aria-label="Select lead instrument"
          >
            {Object.entries(instrumentsByCategory).map(([category, instruments]) => (
              <optgroup key={category} label={categoryLabels[category]}>
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      {/* Beat Drop */}
      <div>
        <label className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Beat Drop
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Beat drop selection">
          {BEAT_DROP_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onBeatDropChange(option.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                beatDrop === option.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-purple-800/50 text-purple-200 hover:bg-purple-700/50 border border-purple-500/30'
              }`}
              role="radio"
              aria-checked={beatDrop === option.id}
              aria-label={`${option.name}: ${option.description}`}
              title={option.description}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
