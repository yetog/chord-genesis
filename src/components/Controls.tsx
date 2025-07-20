import React from 'react';
import { Shuffle, Download, Play, Pause, Settings, Music, Sliders } from 'lucide-react';
import { KEYS, SCALES, CHORD_TEMPLATES, INSTRUMENTS } from '../types/music';
import { RHYTHM_PATTERNS } from '../utils/rhythmPatterns';

interface ControlsProps {
  selectedKey: string;
  selectedScale: string;
  selectedTemplate: string;
  selectedRhythmPattern: string;
  selectedInstrument: string;
  isPlaying: boolean;
  addExtensions: boolean;
  isExporting?: boolean;
  exportSuccess?: boolean;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: string) => void;
  onTemplateChange: (template: string) => void;
  onRhythmChange: (pattern: string) => void;
  onInstrumentChange: (instrument: string) => void;
  onShuffle: () => void;
  onPlay: () => void;
  onExport: () => void;
  onExtensionsChange: (value: boolean) => void;
}

export default function Controls({
  selectedKey,
  selectedScale,
  selectedTemplate,
  selectedRhythmPattern,
  selectedInstrument,
  isPlaying,
  addExtensions,
  isExporting = false,
  exportSuccess = false,
  onKeyChange,
  onScaleChange,
  onTemplateChange,
  onRhythmChange,
  onInstrumentChange,
  onShuffle,
  onPlay,
  onExport,
  onExtensionsChange
}: ControlsProps) {
  return (
    <div className="space-y-8">
      {/* Main Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onShuffle}
          className="btn-secondary group"
        >
          <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          <span>Generate</span>
        </button>

        <button
          onClick={onPlay}
          className="btn-primary group"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          )}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button
          onClick={onExport}
          disabled={isExporting}
          className="btn-ghost group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <div className="loading-spinner" />
          ) : exportSuccess ? (
            <div className="success-checkmark">✓</div>
          ) : (
            <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform duration-200" />
          )}
          <span>
            {isExporting ? 'Exporting...' : exportSuccess ? 'Exported!' : 'Export MIDI'}
          </span>
        </button>
      </div>

      {/* Settings Panel */}
      <div className="glass-panel rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-lg">
            <Sliders className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-slate-900 text-lg">Progression Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Key Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500" />
              Key
            </label>
            <select
              value={selectedKey}
              onChange={(e) => onKeyChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              {KEYS.map(key => (
                <option key={key.name} value={key.name}>
                  {key.name}
                </option>
              ))}
            </select>
          </div>

          {/* Scale Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Scale
            </label>
            <select
              value={selectedScale}
              onChange={(e) => onScaleChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              {Object.entries(SCALES).map(([key, scale]) => (
                <option key={key} value={key}>
                  {scale.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-amber-500" />
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              {CHORD_TEMPLATES.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instrument Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500" />
              Instrument
            </label>
            <select
              value={selectedInstrument}
              onChange={(e) => onInstrumentChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              {INSTRUMENTS.map(instrument => (
                <option key={instrument.name} value={instrument.type}>
                  {instrument.name}
                </option>
              ))}
            </select>
          </div>
        </div>
          {/* Rhythm Pattern Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Rhythm
            </label>
            <select
              value={selectedRhythmPattern}
              onChange={(e) => onRhythmChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 font-medium"
            >
              {RHYTHM_PATTERNS.map(pattern => (
                <option key={pattern.name} value={pattern.name}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>

        {/* Extensions Toggle */}
        <div className="mt-6 flex items-center gap-3 p-4 bg-white/40 rounded-xl border border-slate-200/50">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={addExtensions}
              onChange={(e) => onExtensionsChange(e.target.checked)}
              className="sr-only"
            />
            <div className={`
              relative w-12 h-6 rounded-full transition-colors duration-200
              ${addExtensions ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-slate-300'}
            `}>
              <div className={`
                absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm
                ${addExtensions ? 'transform translate-x-6' : ''}
              `} />
            </div>
            <span className="ml-3 text-sm font-semibold text-slate-700">
              Add 7th Extensions
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}