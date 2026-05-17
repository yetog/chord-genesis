/**
 * Audio Analysis Panel Component
 * Upload audio files to extract style features and generate ElevenLabs prompts
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Upload,
  Music,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  Sparkles,
  Gauge,
  Palette,
  Heart,
  Radio
} from 'lucide-react';
import { useAudioAnalysis, AudioFeatures, PromptVariation } from '../hooks/useAudioAnalysis';

interface AudioAnalysisPanelProps {
  onPromptGenerated?: (prompt: string) => void;
  className?: string;
}

export function AudioAnalysisPanel({ onPromptGenerated, className = '' }: AudioAnalysisPanelProps) {
  const {
    isAnalyzing,
    analysisResult,
    analysisError,
    uploadProgress,
    analyzeAudio,
    clearAnalysis,
    checkApiHealth
  } = useAudioAnalysis();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [styleHints, setStyleHints] = useState('');
  const [customAdditions, setCustomAdditions] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API availability on mount
  useEffect(() => {
    checkApiHealth().then(setApiAvailable);
  }, [checkApiHealth]);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    const validExtensions = ['.mp3', '.wav', '.flac', '.ogg', '.m4a'];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      alert('Please upload an audio file (MP3, WAV, FLAC, OGG, or M4A)');
      return;
    }

    setSelectedFile(file);
    clearAnalysis();
  }, [clearAnalysis]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    const hints = styleHints.split(',').map(h => h.trim()).filter(Boolean);
    const result = await analyzeAudio(selectedFile, hints.length > 0 ? hints : undefined, customAdditions || undefined);

    if (result && onPromptGenerated) {
      onPromptGenerated(result.style_prompt);
    }
  }, [selectedFile, styleHints, customAdditions, analyzeAudio, onPromptGenerated]);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedPrompt(id);
    setTimeout(() => setCopiedPrompt(null), 2000);
  }, []);

  const usePrompt = useCallback((prompt: string) => {
    if (onPromptGenerated) {
      onPromptGenerated(prompt);
    }
  }, [onPromptGenerated]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const FeatureBar = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-500">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value * 100}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );

  return (
    <div className={`glass-panel rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Style Replicator</h3>
            <p className="text-xs text-gray-400">Upload audio → Extract style → Generate prompt</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {apiAvailable === false && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              API Offline
            </span>
          )}
          {apiAvailable === true && (
            <span className="text-xs text-green-400">Ready</span>
          )}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* API Offline Warning */}
          {apiAvailable === false && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Analysis API is offline</p>
                  <p className="text-xs text-amber-400 mt-1">
                    Start the backend: <code className="bg-black/30 px-1 rounded">cd backend && ./run.sh</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-500/10'
                : selectedFile
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.flac,.ogg,.m4a,audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {selectedFile ? (
              <div className="space-y-2">
                <Music className="w-8 h-8 text-green-400 mx-auto" />
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    clearAnalysis();
                  }}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-300">Drop an audio file here</p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                <p className="text-xs text-gray-600 mt-2">MP3, WAV, FLAC, OGG, M4A</p>
              </div>
            )}
          </div>

          {/* Style Hints */}
          {selectedFile && !analysisResult && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Style hints (optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={styleHints}
                  onChange={(e) => setStyleHints(e.target.value)}
                  placeholder="e.g., j dilla, lo-fi, jazz samples"
                  className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">
                  Custom additions (optional)
                </label>
                <input
                  type="text"
                  value={customAdditions}
                  onChange={(e) => setCustomAdditions(e.target.value)}
                  placeholder="e.g., with vinyl crackle and warm bassline"
                  className="w-full px-3 py-2 bg-black/30 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || apiAvailable === false}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze & Generate Prompt
                  </>
                )}
              </button>
            </div>
          )}

          {/* Upload Progress */}
          {isAnalyzing && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">Uploading audio...</p>
            </div>
          )}

          {/* Error Display */}
          {analysisError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {analysisError}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <div className="text-lg font-bold text-white">{Math.round(analysisResult.features.bpm)}</div>
                  <div className="text-xs text-gray-500">BPM</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <div className="text-lg font-bold text-white">{analysisResult.features.key}</div>
                  <div className="text-xs text-gray-500">{analysisResult.features.mode}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <div className="text-lg font-bold text-white capitalize">{analysisResult.features.energy_label}</div>
                  <div className="text-xs text-gray-500">Energy</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5 text-center">
                  <div className="text-lg font-bold text-white">{formatDuration(analysisResult.features.duration_seconds)}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>

              {/* Mood & Genre */}
              <div className="flex flex-wrap gap-2">
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {analysisResult.features.mood}
                </div>
                {analysisResult.features.genre_hints.slice(0, 3).map((genre) => (
                  <div key={genre} className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-sm flex items-center gap-1">
                    <Radio className="w-3 h-3" />
                    {genre}
                  </div>
                ))}
                <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-sm flex items-center gap-1">
                  <Palette className="w-3 h-3" />
                  {analysisResult.features.texture}
                </div>
              </div>

              {/* Feature Bars Toggle */}
              <button
                onClick={() => setShowFeatures(!showFeatures)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-gray-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  Detailed Features
                </span>
                {showFeatures ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {showFeatures && (
                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-black/20">
                  <FeatureBar value={analysisResult.features.energy} label="Energy" color="#22d3ee" />
                  <FeatureBar value={analysisResult.features.brightness} label="Brightness" color="#fbbf24" />
                  <FeatureBar value={analysisResult.features.warmth} label="Warmth" color="#f97316" />
                  <FeatureBar value={analysisResult.features.beat_strength} label="Beat Strength" color="#a855f7" />
                  <FeatureBar value={analysisResult.features.rhythm_complexity} label="Rhythm Complexity" color="#ec4899" />
                  <FeatureBar value={analysisResult.features.chord_complexity} label="Harmonic Richness" color="#10b981" />
                </div>
              )}

              {/* Main Generated Prompt */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-cyan-400 font-medium">Style-Matched Prompt</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => copyToClipboard(analysisResult.style_prompt, 'style')}
                      className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      title="Copy"
                    >
                      {copiedPrompt === 'style' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => usePrompt(analysisResult.style_prompt)}
                      className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs hover:bg-cyan-500/30 transition-colors"
                    >
                      Use
                    </button>
                  </div>
                </div>
                <p className="text-white text-sm leading-relaxed">{analysisResult.style_prompt}</p>
              </div>

              {/* Variations */}
              {analysisResult.variations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm text-gray-400">Variations</h4>
                  {analysisResult.variations.map((variation, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-purple-300 font-medium">{variation.name}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => copyToClipboard(variation.prompt, `var-${idx}`)}
                            className="p-1 rounded hover:bg-white/10 transition-colors"
                          >
                            {copiedPrompt === `var-${idx}` ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => usePrompt(variation.prompt)}
                            className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30 transition-colors"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">{variation.description}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{variation.prompt}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Analyze Another */}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  clearAnalysis();
                }}
                className="w-full py-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Analyze Another Track
              </button>
            </div>
          )}

          {/* Tips */}
          {!analysisResult && !isAnalyzing && (
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-xs text-cyan-300">
                <strong>How it works:</strong> Upload a reference track you want to match.
                The analyzer extracts BPM, key, mood, energy, and texture, then generates
                ElevenLabs-compatible prompts to recreate that style.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AudioAnalysisPanel;
