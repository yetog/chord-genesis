import React, { useState, useCallback } from 'react';
import { Music, Sparkles } from 'lucide-react';
import Controls from './components/Controls';
import ChordCard from './components/ChordCard';
import PlaybackBar from './components/PlaybackBar';
import { ChordProgression, CHORD_TEMPLATES, INSTRUMENTS } from './types/music';
import { generateProgression, progressionToMidiData } from './utils/musicTheory';
import { useAudioContext } from './hooks/useAudioContext';

function App() {
  const [progression, setProgression] = useState<ChordProgression | null>(null);
  const [selectedKey, setSelectedKey] = useState('C');
  const [selectedScale, setSelectedScale] = useState('major');
  const [selectedTemplate, setSelectedTemplate] = useState('Random');
  const [selectedRhythmPattern, setSelectedRhythmPattern] = useState('Block Chord');
  const [addExtensions, setAddExtensions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const { 
    isPlaying, 
    isLooping,
    currentChordIndex, 
    tempo, 
    masterVolume,
    setTempo, 
    setMasterVolume,
    toggleLoop,
    playProgression, 
    playChordPreview,
    stopPlayback
  } = useAudioContext();

  const handleGenerate = useCallback(() => {
    // Stop current playback but preserve loop state
    if (isPlaying) {
      stopPlayback();
    }
    
    const template = CHORD_TEMPLATES.find(t => t.name === selectedTemplate);
    const newProgression = generateProgression(
      selectedKey,
      selectedScale,
      template?.degrees || [],
      4,
      addExtensions
    );
    setProgression(newProgression);
  }, [isPlaying, stopPlayback, selectedTemplate, selectedKey, selectedScale, addExtensions]);

  const handlePlay = useCallback(() => {
    if (progression) {
      playProgression(progression.chords, selectedRhythmPattern, 'sine');
    }
  }, [progression, playProgression, selectedRhythmPattern, selectedInstrument]);

  const handleExport = useCallback(async () => {
    if (!progression) return;

    setIsExporting(true);
    setExportSuccess(false);

    // Simulate export process with delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const midiData = progressionToMidiData(progression);
    const blob = new Blob([midiData], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `progression_${selectedKey}_${selectedScale}.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportSuccess(true);
    
    // Reset success state after 3 seconds
    setTimeout(() => setExportSuccess(false), 3000);
  }, [progression, selectedKey, selectedScale]);

  const handleChordHover = useCallback((chord: any) => {
    if (!isPlaying) {
      playChordPreview(chord);
    }
  }, [isPlaying, playChordPreview]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-amber-600/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.1),transparent_50%)]" />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl">
                  <Music className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Chord Genesis
              </h1>
            </div>
            <p className="text-slate-300 text-xl max-w-3xl mx-auto leading-relaxed mb-8">
              Generate beautiful chord progressions with intelligent music theory.
              <br />
              <span className="text-amber-300">Export to MIDI and use in your favorite DAW.</span>
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Real-time Audio Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Professional MIDI Export</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Rhythmic Patterns</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span>Music Theory Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Controls */}
          <Controls
            selectedKey={selectedKey}
            selectedScale={selectedScale}
            selectedTemplate={selectedTemplate}
            selectedRhythmPattern={selectedRhythmPattern}
            isPlaying={isPlaying}
            addExtensions={addExtensions}
            isExporting={isExporting}
            exportSuccess={exportSuccess}
            onKeyChange={setSelectedKey}
            onScaleChange={setSelectedScale}
            onTemplateChange={setSelectedTemplate}
            onRhythmChange={setSelectedRhythmPattern}
            onShuffle={handleGenerate}
            onPlay={handlePlay}
            onExport={handleExport}
            onExtensionsChange={setAddExtensions}
          />

          {/* Chord Progression Display */}
          {progression && (
            <div className="space-y-8 animate-slide-up">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gradient mb-3">
                  {selectedKey} {progression.scale.charAt(0).toUpperCase() + progression.scale.slice(1)} Scale
                </h2>
                <p className="text-slate-600 text-lg">
                  {selectedTemplate !== 'Random' ? selectedTemplate : 'Custom Progression'} • {selectedRhythmPattern}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {progression.chords.map((chord, index) => (
                  <ChordCard
                    key={`${chord.root}-${chord.quality}-${index}`}
                    chord={chord}
                    index={index}
                    isPlaying={currentChordIndex === index}
                    onHover={() => handleChordHover(chord)}
                  />
                ))}
              </div>

              {/* Playback Bar */}
              <PlaybackBar
                isPlaying={isPlaying}
                isLooping={isLooping}
                currentChordIndex={currentChordIndex}
                totalChords={progression.chords.length}
                onPlay={handlePlay}
                onToggleLoop={toggleLoop}
                tempo={tempo}
                onTempoChange={setTempo}
                masterVolume={masterVolume}
                onVolumeChange={setMasterVolume}
              />
            </div>
          )}

          {/* Welcome State */}
          {!progression && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Ready to create music?
                </h3>
                <p className="text-slate-600 mb-8 text-lg leading-relaxed">
                  Click "Generate" to create your first chord progression.<br />
                  <span className="text-sm text-slate-500">Choose rhythm patterns • Hover over chords to preview • Export as MIDI</span>
                </p>
                <button
                  onClick={handleGenerate}
                  className="btn-primary text-lg px-10 py-4"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Your First Progression
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 glass-panel">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-slate-500">
            <p className="font-medium">Built for musicians, producers, and creators worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;