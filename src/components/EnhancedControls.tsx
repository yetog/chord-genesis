import React, { useState, useRef } from 'react';
import { Shuffle, Download, Play, Pause, Settings, Music, Sliders, FolderOpen, Music2, RefreshCw, Mic, MicOff, ChevronDown, Volume2, Check } from 'lucide-react';
import { KEYS, SCALES, CHORD_TEMPLATES, INSTRUMENTS, MUSIC_GENRES, BPM_PRESETS } from '../types/music';
import { RHYTHM_PATTERNS } from '../utils/rhythmPatterns';

interface EnhancedControlsProps {
  selectedKey: string;
  selectedScale: string;
  selectedTemplate: string;
  selectedRhythmPattern: string;
  selectedGenre?: string;
  selectedBPM?: number;
  customInput?: string;
  isPlaying: boolean;
  addExtensions: boolean;
  melodyEnabled: boolean;
  isExporting?: boolean;
  exportSuccess?: boolean;
  isAdvancedMode?: boolean;
  onKeyChange: (key: string) => void;
  onScaleChange: (scale: string) => void;
  onTemplateChange: (template: string) => void;
  onRhythmChange: (pattern: string) => void;
  onGenreChange?: (genre: string) => void;
  onBPMChange?: (bpm: number) => void;
  onCustomInputChange?: (input: string) => void;
  onShuffle: () => void;
  onRandomize: () => void;
  onPlay: () => void;
  onExport: () => void;
  onExtensionsChange: (value: boolean) => void;
  onMelodyChange: (value: boolean) => void;
  onSaveLoad: () => void;
}

export default function EnhancedControls({
  selectedKey,
  selectedScale,
  selectedTemplate,
  selectedRhythmPattern,
  selectedGenre,
  selectedBPM = 120,
  customInput = '',
  isPlaying,
  addExtensions,
  melodyEnabled,
  isExporting = false,
  exportSuccess = false,
  isAdvancedMode = true,
  onKeyChange,
  onScaleChange,
  onTemplateChange,
  onRhythmChange,
  onGenreChange,
  onBPMChange,
  onCustomInputChange,
  onShuffle,
  onRandomize,
  onPlay,
  onExport,
  onExtensionsChange,
  onMelodyChange,
  onSaveLoad,
}: EnhancedControlsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      return new SpeechRecognition();
    }
    return null;
  };

  const startRecording = () => {
    const speechRecognition = initSpeechRecognition();
    if (!speechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    speechRecognition.continuous = false;
    speechRecognition.interimResults = false;
    speechRecognition.lang = 'en-US';

    speechRecognition.onstart = () => {
      setIsRecording(true);
    };

    speechRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onCustomInputChange) {
        onCustomInputChange(customInput + ' ' + transcript);
      }
    };

    speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    speechRecognition.onend = () => {
      setIsRecording(false);
    };

    setRecognition(speechRecognition);
    speechRecognition.start();
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleGenreSelect = (genre: any) => {
    if (onGenreChange) onGenreChange(genre.name);
    if (onTemplateChange) onTemplateChange(genre.name);
    if (onScaleChange && genre.preferredScale) onScaleChange(genre.preferredScale);
    if (onBPMChange) {
      const avgBPM = Math.round((genre.bpmRange[0] + genre.bpmRange[1]) / 2);
      onBPMChange(avgBPM);
    }
  };

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
            <Check className="w-5 h-5 text-green-400" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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

          {/* BPM Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-500" />
              BPM
            </label>
            <select
              value={selectedBPM}
              onChange={(e) => onBPMChange && onBPMChange(parseInt(e.target.value))}
              className="select-field"
            >
              {BPM_PRESETS.map(bpm => (
                <option key={bpm} value={bpm}>
                  {bpm} BPM
                </option>
              ))}
            </select>
          </div>

          {/* Custom Input Toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Custom Details
            </label>
            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="w-full select-field text-left flex items-center justify-between"
            >
              <span>{showCustomInput ? 'Hide Details' : 'Add Details'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showCustomInput ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Custom Input Dropdown */}
        {showCustomInput && (
          <div className="mt-6 p-4 bg-gray-800/40 rounded-xl border border-gray-600/50 animate-slide-down">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Additional Details for AI Model
                </label>
                <textarea
                  value={customInput}
                  onChange={(e) => onCustomInputChange && onCustomInputChange(e.target.value)}
                  placeholder="Describe the mood, style, or specific elements you want in your music..."
                  className="w-full h-24 px-4 py-3 bg-gray-900/60 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isRecording 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </button>
                
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm">Listening...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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