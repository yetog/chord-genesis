import React from 'react';
import { Shuffle, Download, Play, Pause, Settings, Music, Sliders, FolderOpen, Music2, RefreshCw } from 'lucide-react';
import { KEYS, SCALES, CHORD_TEMPLATES, INSTRUMENTS } from '../types/music';
import { RHYTHM_PATTERNS } from '../utils/rhythmPatterns';

interface ControlsProps {
  selectedKey: string;
  selectedScale: string;
  selectedTemplate: string;
  selectedRhythmPattern: string;
  isPlaying: boolean;
  addExtensions: boolean;
  melodyEnabled: boolean;
  isExporting?: boolean;
  exportSuccess?: boolean;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: string) => void;
  onTemplateChange: (template: string) => void;
  onRhythmChange: (pattern: string) => void;
  onShuffle: () => void;
  onRandomize: () => void;
  onPlay: () => void;
  onExport: () => void;
  onExtensionsChange: (value: boolean) => void;
  onMelodyChange: (value: boolean) => void;
  onSaveLoad: () => void;
}

export default function Controls({
  selectedKey,
  selectedScale,
  selectedTemplate,
  selectedRhythmPattern,
  isPlaying,
  addExtensions,
  melodyEnabled,
  isExporting = false,
  exportSuccess = false,
  onKeyChange,
  onScaleChange,
  onTemplateChange,
  onRhythmChange,
  onShuffle,
  onRandomize,
  onPlay,
  onExport,
  onExtensionsChange,
  onMelodyChange,
  onSaveLoad,
}: ControlsProps) {
  return (
    <div className="space-y-8">
      {/* Main Controls */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onShuffle}
          className="btn-secondary group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
          <span>Generate</span>
        </button>

        <button
          onClick={onRandomize}
          className="btn-ghost group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 relative z-10" />
          <span>Randomize</span>
        </button>

        <button
          onClick={onPlay}
          className="btn-primary group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          {isPlaying ? (
            <Pause className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 relative z-10" />
          ) : (
            <Play className="w-5 h-5 group-hover:scale-110 transition-transform duration-200 relative z-10" />
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

        <button
          onClick={onSaveLoad}
          className="btn-ghost group"
        >
          <FolderOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span>Save/Load</span>
        </button>
      </div>

      {/* Settings Panel */}
      <div className="glass-panel rounded-2xl p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-lg">
            <Sliders className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-semibold text-gray-200 text-lg">Progression Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Key Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Music className="w-4 h-4 text-amber-500" />
              Key
            </label>
            <select
              value={selectedKey}
              onChange={(e) => onKeyChange(e.target.value)}
              className="select-field"
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
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Scale
            </label>
            <select
              value={selectedScale}
              onChange={(e) => onScaleChange(e.target.value)}
              className="select-field"
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
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-amber-500" />
              Progression
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="select-field"
            >
              {CHORD_TEMPLATES.map(template => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instrument Selection */}
          {/* Rhythm Pattern Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-amber-500" />
              Rhythm
            </label>
            <select
              value={selectedRhythmPattern}
              onChange={(e) => onRhythmChange(e.target.value)}
              className="select-field"
            >
              {RHYTHM_PATTERNS.map(pattern => (
                <option key={pattern.name} value={pattern.name}>
                  {pattern.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-gray-600/50">
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
              <span className="ml-3 text-sm font-semibold text-gray-300">
                Add 7th Extensions
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-800/40 rounded-xl border border-gray-600/50">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={melodyEnabled}
                onChange={(e) => onMelodyChange(e.target.checked)}
                className="sr-only"
              />
              <div className={`
                relative w-12 h-6 rounded-full transition-colors duration-200
                ${melodyEnabled ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-gray-600'}
              `}>
                <div className={`
                  absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm
                  ${melodyEnabled ? 'transform translate-x-6' : ''}
                `} />
              </div>
              <span className="ml-3 text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Music2 className="w-4 h-4" />
                Generate Melody
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}